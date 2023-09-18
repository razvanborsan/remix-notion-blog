import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "~/lib/r2.server";
import type { BlogPost } from "~/types/BlogPost";
import { blogPostSchema } from "~/types/BlogPost";
import notion from "~/lib/notion";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

export async function sanitizePosts(
  response: QueryDatabaseResponse
): Promise<BlogPost[]> {
  const posts: BlogPost[] = await Promise.all(
    response.results.map(async (item: any) => {
      const title = item.properties?.page?.title?.[0]?.plain_text;
      const slug = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const abstract = item.properties?.abstract?.rich_text?.[0].plain_text;
      const url = item.properties?.slug?.rich_text?.[0]?.plain_text;
      const publishDate = item.properties?.date?.date?.start;

      return blogPostSchema.parse({
        id: item.id,
        title: title,
        slug: slug,
        abstract: abstract,
        url: `/posts/${url}`,
        publishDate: publishDate,
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

export const getPost = async (slug: string) => {
  const command = new GetObjectCommand({
    Bucket: "remix-notion-blog",
    Key: `${slug}.mdx`,
  });

  try {
    const response = await S3.send(command);
    const str = await response.Body?.transformToString();
    console.log(str);

    return str;
  } catch (err) {
    console.error(err);
    return "";
  }
};
