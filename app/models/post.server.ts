import * as path from "path";
import fs from "fs-extra";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "~/lib/notion";
import { blogPostSchema, type BlogPost } from "~/types/BlogPost";
import { n2m } from "~/lib/n2m";

const POSTS_DIR = path.join(process.cwd(), "posts");

export async function getPost(slug: string) {
  const filename = path.join(POSTS_DIR, `${slug}.mdx`);

  const file = fs.readFileSync(filename, "utf8");
  return file;
}

// export function getPostIds() {
//   if (!fs.existsSync(POSTS_DIR)) {
//     fs.mkdirSync(POSTS_DIR);
//   }

//   const filenames = fs.readdirSync(POSTS_DIR);

//   return filenames.map((filename: any) => {
//     return {
//       params: {
//         id: filename.replace(/\.mdx$/, ""),
//       },
//     };
//   });
// }

export async function extractPosts(
  response: QueryDatabaseResponse
): Promise<BlogPost[]> {
  const posts: BlogPost[] = await Promise.all(
    response.results.map(async (item: any) => {
      const title = item.properties?.page?.title?.[0]?.plain_text;
      const slug = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const abstract = item.properties?.abstract?.rich_text?.[0].plain_text;
      const url = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const publishDate = item.properties?.date?.date?.start;
      const image = Object.keys(item.properties?.image?.files || {}).length
        ? {
            source: item.properties?.image?.files[0]?.file as {
              url: string;
              expiry_time: string;
            },
            alt: item.properties?.image?.files[0]?.name as string,
          }
        : undefined;

      return blogPostSchema.parse({
        id: item.id,
        title: title,
        slug: slug,
        abstract: abstract,
        image: image,
        url: `/posts/${url}`,
        publishDate: publishDate,
      });
    })
  );

  return posts;
}

export async function getPublicPosts(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID || "",
    filter: {
      property: "public",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "date",
        direction: "descending",
      },
    ],
  });

  const posts = await extractPosts(response);
  return posts;
}

export async function createPostsMarkdown(posts: BlogPost[]) {
  for (const post of posts) {
    const mdBlocks = await n2m.pageToMarkdown(post.id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    const filename = path.join(POSTS_DIR, `${post.slug}.mdx`);

    if (typeof mdString.parent === "string") {
      fs.writeFile(filename, mdString.parent, (err) => {
        err !== null ? console.log(err) : console.log("Success");
      });
    }
  }
}
