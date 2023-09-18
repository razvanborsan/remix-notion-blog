import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getPublicPosts } from "~/models/post.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export function headers() {
  return {
    "Cache-Control": `public, max-age=600, s-maxage=600, stale-while-revalidate=604800`,
  };
}

export async function loader() {
  const posts = await getPublicPosts();

  return json({ posts });
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h2 className="text-3xl font-bold underline">Blog posts</h2>
      {posts.map((post) => {
        return (
          <article className="p-4 border-2" key={post.id}>
            <a href={post.url}>
              <h3>{post.title}</h3>
            </a>

            <p>{post.abstract}</p>
            {post?.image && (
              <img
                className="w-20 h-20"
                src={post.image?.source?.url}
                alt={post.image?.alt}
              />
            )}
            <ul>
              <li>Published: {post.publishDate}</li>
            </ul>
          </article>
        );
      })}
    </div>
  );
}
