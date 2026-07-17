import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured(): void {
  if (configured) return;

  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables are required but were not provided.",
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
}

export async function uploadFileBuffer(buffer: Buffer, filename: string): Promise<string> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "tera-exam", public_id: filename.replace(/\.[^.]+$/, "") },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
}
