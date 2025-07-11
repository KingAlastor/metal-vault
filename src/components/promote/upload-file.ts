"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

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

async function uploadFile(formData: FormData, type: keyof typeof uploadConfigs) {
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

    // Create directory
    try {
      await mkdir(config.directory, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename using timestamp and random string
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${config.filenamePrefix}_${timestamp}_${randomSuffix}.${detectedExtension}`;
    const filepath = path.join(config.directory, filename);

    // Write processed file to directory
    await writeFile(filepath, processedBuffer);

    // Generate appropriate public URL based on type
    let publicUrl: string;
    if (type === "promotion") {
      publicUrl = `/uploads/${filename}`;
    } else if (type === "event") {
      publicUrl = `/images/event_posters/${filename}`;
    } else {
      publicUrl = `/${filename}`;
    }

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
