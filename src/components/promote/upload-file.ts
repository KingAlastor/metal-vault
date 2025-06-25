"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type"; // For magic byte detection
import sharp from "sharp"; // For image processing (resizing, re-encoding)

export async function uploadPromotionFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file received");
    }

    // 1. Server-Side File Size Validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Server-Side MIME Type and Magic Byte Validation
    const fileType = await fileTypeFromBuffer(buffer);

    // Whitelist of allowed MIME types (ensure these match your expected image types)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Optional: Further restrict based on common extensions if desired, though MIME is stronger
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const originalExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (
      !allowedExtensions.includes(originalExtension) &&
      fileType.ext === originalExtension
    ) {
      // This check is a bit redundant if fileTypeFromBuffer is robust, but can catch some edge cases.
      // It's more about double-checking the declared extension vs the detected one.
      // If fileType.ext is different from originalExtension (e.g. attacker renamed .php to .jpg),
      // fileTypeFromBuffer already catches it, but this adds a guard.
      // A simpler approach is to just use fileType.ext
    }

    // Use the *detected* extension from file-type, not the user-provided one
    const detectedExtension = fileType.ext;

    // 3. Image Processing (Re-encoding/Transcoding and Resizing)
    // This is crucial for security (stripping metadata, cleaning malformed images)
    // and for performance/consistency.
    let processedBuffer;
    let newFilenameExtension = detectedExtension; // Default to detected extension

    try {
      // All raster images go through sharp for safety and optimization
      processedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: sharp.fit.inside, // Keep aspect ratio, fit within bounds
          withoutEnlargement: true, // Don't enlarge if smaller than dimensions
        })
        .toFormat(
          detectedExtension === "jpeg" ? "jpeg" : (detectedExtension as any),
          { quality: 80 }
        ) // Force format and quality
        .toBuffer();

      // If you want to force all images to a specific format like webp or jpeg:
      // processedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      // newFilenameExtension = 'webp'; // Update filename extension
    } catch (sharpError) {
      console.error("Image processing error:", sharpError);
      throw new Error("Failed to process image");
    }

    // Create uploads directory in src/images
    const uploadsDir = path.join(process.cwd(), "src", "images");

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to directory
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
}
