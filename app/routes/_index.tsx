import { useState } from "react";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { BadgeVariant } from "~/components/ui/badge";
import { Badge } from "~/components/ui/badge";
import { getPublicPosts, getTags } from "~/models/post.server";
import type { BlogPost, Tag } from "~/types/BlogPost";

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
  const tags = await getTags();

  return json({ posts, tags });
}

export default function Index() {
  const { posts, tags } = useLoaderData<typeof loader>();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function filterByTags(posts: BlogPost[]): BlogPost[] {
    if (selectedTags.length === 0) {
      return posts;
    }

    return posts.filter((post) => {
      return post.tags.some((tag) => selectedTags.includes(tag.name));
    });
  }

  const handleBadgeClick = (tag: Tag) => () => {
    if (selectedTags.includes(tag.name)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag.name));
      return;
    }
    setSelectedTags([...selectedTags, tag.name]);
  };

  return (
    <div
      className="p-4 pt-0 w-full xl:w-[1080px] flex flex-col justify-center items-start gap-6"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <main className="flex flex-col justify-center items-start xl:items-center w-full">
        <article className="flex flex-col justify-center items-start gap-5 p-6 xl:p-8 pt-0 xl:pt-0">
          <div className="bg-slate-50 border p-8 rounded-xl">
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
          <div className="flex gap-2">
            {tags.map((tag) => (
              <Badge
                variant={
                  `${tag.color}${
                    selectedTags.includes(tag.name) ? "-active" : ""
                  }` as BadgeVariant
                }
                key={tag.name}
                onClick={handleBadgeClick(tag)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          {filterByTags(posts).map((post) => (
            <a key={post.id} href={post.url}>
              <Card>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.abstract}</CardDescription>
                </CardHeader>
                <CardFooter>
                  {post.publishDate} • {post.readingTime}{" "}
                  {post.readingTime === 1 ? "min" : "mins"} • {post.wordCount}{" "}
                  words
                </CardFooter>
              </Card>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
