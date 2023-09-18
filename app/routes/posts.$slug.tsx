import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { marked } from "marked";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";

export function headers() {
  return {
    "Cache-Control": `public, max-age=600, s-maxage=600 stale-while-revalidate=604800`,
  };
}

export async function loader({ params }: LoaderArgs) {
  invariant(params?.slug, "No slug provided");

  const post = await getPost(params.slug);

  const html = marked(post);
  return json({ html });
}

export default function PostRoute() {
  const { html } = useLoaderData<typeof loader>();

  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
