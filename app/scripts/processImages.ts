import type { MdBlock } from "notion-to-md/build/types";

import type { PutObjectCommandOutput } from "@aws-sdk/client-s3";

import { type BlogPost } from "~/types/BlogPost";
import { n2m } from "~/lib/n2m";
import type { ImageUpload } from "~/lib/r2.server";
import { uploadFile, uploadImage } from "~/lib/r2.server";
import { getPublicPosts } from "~/models/post.server";
import invariant from "tiny-invariant";
import notion from "~/lib/notion";
import type { UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";

function extractImageKey(imageUrl: string): string {
  const url = new URL(imageUrl);
  const parts = url.pathname.split("/");
  return parts[parts.length - 2];
}

function extractHttpsLink(input: string) {
  const regex = /https:\/\/[^ )>]+/gi;
  const matches = input.match(regex);

  if (matches) {
    return matches[0];
  }

  return null;
}

export async function createPostsMarkdown(posts: BlogPost[]) {
  for (const post of posts) {
    const mdBlocks = await n2m.pageToMarkdown(post.id);

    const promises: Promise<
      PutObjectCommandOutput | UpdatePageResponse | void
    >[] = [];
    const updatedBlocks: MdBlock[] = mdBlocks.map((block) => {
      if (block.type === "image") {
        const imageUrl = extractHttpsLink(block.parent);
        invariant(imageUrl, "image url is null");

        const key = extractImageKey(imageUrl);
        const input: ImageUpload = { imageUrl, key };
        promises.push(uploadImage(input));

        const newBlock = {
          ...block,
          parent: block.parent.replace(
            /!\[(.*?)\]\(.*\)/,
            `![$1](${process.env.CLOUDFLARE_WORKER}/proxy/${key})`
          ),
        };

        return newBlock;
      }

      return block;
    });

    const mdString = n2m.toMarkdownString(updatedBlocks);

    if (typeof mdString?.parent === "string") {
      const words = mdString.parent.split(/\s+/).length;
      const promiseUpdateCount = notion.pages.update({
        page_id: post.id,
        properties: {
          "word-count": {
            number: words,
          },
        },
      });
      const promiseUploadFile = uploadFile({
        filename: mdString.parent,
        key: `${post.slug}.mdx`,
      });

      promises.push(promiseUpdateCount);
      promises.push(promiseUploadFile);
    }

    await Promise.all(promises);
  }
}

getPublicPosts().then(async (posts) => {
  try {
    createPostsMarkdown(posts).then(() => {
      console.log("Done! All pages have been created. 🎉");
    });
  } catch (err) {
    console.error(err);
  }
});
