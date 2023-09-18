import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
      <h2 className="text-3xl font-bold p-4">My blog</h2>
      {posts.map((post) => {
        return (
          <a key={post.id} href={post.url}>
            <Card className="m-4">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.abstract}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
