"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SES_ACCESS_SECRET!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

interface UploadConfig {
  directory: string;
  filenamePrefix: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const uploadConfigs: Record<string, UploadConfig> = {
  promotion: {
    directory: path.join(process.cwd(), "src", "images"),
    filenamePrefix: "promotion",
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  },
  event: {
    directory: path.join(process.cwd(), "public", "images", "event_posters"),
    filenamePrefix: "event",
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  },
};

async function uploadFile(
  formData: FormData,
  type: keyof typeof uploadConfigs
) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file received");
    }

    const config = uploadConfigs[type];
    if (!config) {
      throw new Error(`Invalid upload type: ${type}`);
    }

    // Server-Side File Size Validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Server-Side MIME Type and Magic Byte Validation
    const fileType = await fileTypeFromBuffer(buffer);

    // Whitelist of allowed MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Use the detected extension from file-type
    const detectedExtension = fileType.ext;

    // Image Processing (Re-encoding/Transcoding and Resizing)
    let processedBuffer;

    try {
      // Process image through sharp for safety and optimization
      processedBuffer = await sharp(buffer)
        .resize(config.maxWidth, config.maxHeight, {
          fit: sharp.fit.inside, // Keep aspect ratio, fit within bounds
          withoutEnlargement: true, // Don't enlarge if smaller than dimensions
        })
        .toFormat(
          detectedExtension === "jpeg" ? "jpeg" : (detectedExtension as any),
          { quality: config.quality }
        )
        .toBuffer();
    } catch (sharpError) {
      console.error("Image processing error:", sharpError);
      throw new Error("Failed to process image");
    }

    // Generate unique filename using timestamp and random string
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${config.filenamePrefix}_${timestamp}_${randomSuffix}.${detectedExtension}`;
    const s3Key = `${config.directory}/${filename}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: processedBuffer,
      ContentType: fileType.mime,
      CacheControl: "max-age=31536000",
    });

    await s3Client.send(uploadCommand);

    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
      size: processedBuffer.length,
    };
  } catch (error) {
    console.error(`${type} upload error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

export async function uploadPromotionFile(formData: FormData) {
  return uploadFile(formData, "promotion");
}

export async function uploadEventImage(formData: FormData) {
  return uploadFile(formData, "event");
}
