import { NotionToMarkdown } from "notion-to-md";

import notion from "./notion";

const n2m = new NotionToMarkdown({ notionClient: notion });

export { n2m };
