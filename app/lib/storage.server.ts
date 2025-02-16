import { createClient } from "@supabase/supabase-js";
import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import sharp from "sharp";
import type { NodeOnDiskFile } from "@remix-run/node";

export const supabase = createClient(
  process.env.SUPABASE_URL || "https://URL.supabase.co",
  process.env.SUPABASE_SECRET_KEY || "SUPABASE_SECRET_KEY"
);

export const imageToWebp = async (input: NodeOnDiskFile) => {
  const arrayBuffer = (await input.arrayBuffer()) as Buffer;
  return sharp(arrayBuffer).webp().toBuffer();
};

export const uploadNodeScreenshot = async (
  filename: string,
  buffer: Buffer
) => {
  const bucket = supabase.storage.from("nodes");
  const { error } = await bucket.upload(filename, buffer);
  if (error) {
    throw error;
  }
  return bucket.getPublicUrl(filename).data.publicUrl;
};

export const deleteNodeScreenshot = async (publicUrl: string) => {
  const bucket = supabase.storage.from("nodes");
  const path = publicUrl.split("nodes/").at(-1);
  if (!path) {
    console.warn(`Could not delete ${publicUrl}`);
    return;
  }
  return bucket.remove([path]);
};

export const uploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    maxPartSize: 60000000,
    file: ({ filename }) => filename,
  }),
  unstable_createMemoryUploadHandler()
);
