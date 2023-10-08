import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "~/lib/r2.server";
import type { BlogPost, Tag } from "~/types/BlogPost";
import { blogPostSchema } from "~/types/BlogPost";
import notion from "~/lib/notion";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import invariant from "tiny-invariant";

export async function sanitizePosts(
  response: QueryDatabaseResponse
): Promise<BlogPost[]> {
  const posts: BlogPost[] = await Promise.all(
    response.results.map(async (item: any) => {
      const tags = item.properties?.tags?.multi_select.map((tag: any) => ({
        name: tag.name,
        color: tag.color,
      }));
      const title = item.properties?.page?.title?.[0]?.plain_text;
      const slug = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const abstract = item.properties?.abstract?.rich_text?.[0].plain_text;
      const url = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const publishDate = item.properties?.date?.date?.start;
      const lastEdited = item.last_edited_time;
      const readingTime = item.properties?.["time-to-read"]?.formula?.number;
      const wordCount = item.properties?.["word-count"]?.number;

      return blogPostSchema.parse({
        id: item.id,
        title: title,
        slug: slug,
        tags: tags,
        abstract: abstract,
        wordCount: wordCount,
        readingTime: readingTime,
        url: `/posts/${url}`,
        publishDate: publishDate,
        lastEdited: lastEdited,
      });
    })
  );

  return posts;
}

export async function getPublicPosts(): Promise<BlogPost[]> {
  const rawPosts = await notion.databases.query({
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

  const posts = await sanitizePosts(rawPosts);
  return posts;
}

export async function getTags(): Promise<Tag[]> {
  const raws = await notion.databases.query({
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

  const tags = new Map();

  raws.results.forEach((page: any) =>
    page.properties.tags.multi_select.forEach((tag: Tag) =>
      tags.set(tag.name, tag)
    )
  );

  return Array.from(tags.values());
}

export const getPost = async (slug: string): Promise<BlogPost> => {
  const command = new GetObjectCommand({
    Bucket: "remix-notion-blog",
    Key: `${slug}.mdx`,
  });

  try {
    const response = await S3.send(command);
    const str = await response.Body?.transformToString();

    const rawPost = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID || "",
      filter: {
        property: "slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    const post = await sanitizePosts(rawPost);
    invariant(post.length === 1, "post.length !== 1");
    return {
      ...post[0],
      content: str,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
