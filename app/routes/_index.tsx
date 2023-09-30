import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";

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
    <div
      className="p-4 pt-0 w-full xl:w-[1080px] flex flex-col justify-center items-start gap-6"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <main className="flex flex-col justify-center items-start xl:items-center w-full">
        <article className="flex flex-col justify-center items-start gap-5 p-6 xl:p-8 pt-0 xl:pt-0">
          <div className="bg-slate-50 border p-5 rounded-xl">
            <h2 className="text-3xl font-bold">Nice to meet you! 🤙</h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div className="flex gap-2">
              <GithubLogo size={32} />
              <LinkedinLogo size={32} />
              <TwitterLogo size={32} />
              <EnvelopeSimple size={32} />
            </div>
          </div>
        </article>

        <div className="w-full flex flex-col gap-4">
          {posts.map((post) => {
            return (
              <a key={post.id} href={post.url}>
                <Card>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.abstract}</CardDescription>
                  </CardHeader>
                </Card>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
