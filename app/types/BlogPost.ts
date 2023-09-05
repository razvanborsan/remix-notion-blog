import { z } from "zod";

export const blogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  abstract: z.string(),
  url: z.string(),
  publishDate: z.string(),
  image: z
    .object({
      source: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      alt: z.string(),
    })
    .optional(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;
