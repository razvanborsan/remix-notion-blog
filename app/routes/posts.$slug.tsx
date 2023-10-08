import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { marked } from "marked";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";

export function headers() {
  return {
    "Cache-Control": `public, max-age=600, s-maxage=600 stale-while-revalidate=604800`,
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params?.slug, "No slug provided");

  const post = await getPost(params.slug);
  invariant(post, "Post not found");
  invariant(post.content, "Post content is empty");

  const html = marked(post.content);
  const updatedPost = { ...post, content: html };

  return json({ post: updatedPost });
}

export default function PostRoute() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-[960px] p-10 prose prose-lg">
      <h1 className="mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        {post.publishDate} • {post.readingTime}{" "}
        {post.readingTime === 1 ? "min" : "mins"} • {post.wordCount} words
      </p>
      <p className="text-sm text-gray-500 italic">
        Last edited: {post.lastEdited}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </main>
  );
}
