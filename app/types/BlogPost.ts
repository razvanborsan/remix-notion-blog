import { z } from "zod";

const tagSchema = z.object({ name: z.string(), color: z.string() });
const dateFormat: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "2-digit",
  year: "numeric",
};

export const blogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  abstract: z.string(),
  url: z.string(),
  publishDate: z
    .string()
    .transform((d) => new Date(d).toLocaleDateString("en-US", dateFormat)),
  lastEdited: z
    .string()
    .transform((d) => new Date(d).toLocaleDateString("en-US", dateFormat)),
  readingTime: z.number().optional(),
  wordCount: z.number().optional(),
  tags: z.array(tagSchema),
  content: z.string().optional(),
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
export type Tag = z.infer<typeof tagSchema>;
