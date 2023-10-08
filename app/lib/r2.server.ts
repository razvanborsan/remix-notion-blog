import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import invariant from "tiny-invariant";

export const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: `${process.env.CLOUDFLARE_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.CLOUDFLARE_SECRET_ACCESS_KEY}`,
  },
});

const BUCKET_NAME = "remix-notion-blog";

async function optimizeImageBlob(blob: Buffer, isGif: boolean) {
  if (isGif) {
    return sharp(blob, { animated: true }).gif().toBuffer();
  }

  return sharp(blob).resize({ width: 900 }).webp({ quality: 100 }).toBuffer();
}

export async function uploadFile({
  filename,
  key,
}: {
  filename: string;
  key: string;
}) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: filename,
    ContentType: "text/html",
  });

  try {
    const response = await S3.send(command);
    console.log(`upload file ${key} attempt: `, response);
  } catch (err) {
    console.error(err);
  }
}

export type ImageUpload = {
  imageUrl: string;
  key: string;
};

export async function uploadImage({ imageUrl, key }: ImageUpload) {
  const res = await fetch(imageUrl);
  const blob = await res.arrayBuffer();
  const contentType = res.headers.get("content-type");

  invariant(contentType, "Missing content-type header");

  const isGif = contentType.includes("image/gif");
  const imageBuffer = await optimizeImageBlob(Buffer.from(blob), isGif);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: isGif ? "image/gif" : "image/webp",
  });

  try {
    const response = await S3.send(command);
    return response;
  } catch (err) {
    console.error(err);
  }
}
