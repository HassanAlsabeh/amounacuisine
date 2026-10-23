import { adminRoute, HttpError, json } from "@/server/api";
import { saveImage } from "@/server/storage";

export const POST = adminRoute(async (req) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Choose an image to upload.");
  return json({ url: await saveImage(file) }, 201);
});
