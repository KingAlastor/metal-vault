"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UploadedFile = {
  file: File;
  dimensions?: { width: number; height: number };
  status: "uploading" | "success" | "error";
  progress: number;
  url?: string;
  error?: string;
}

// Default image validation function
const validateImage = (
  file: File
): Promise<{
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}> => {
  return new Promise((resolve) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      resolve({ valid: false, error: "File must be an image" });
      return;
    }

    // Check image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Set your pixel requirements here
      const maxWidth = 350;
      const maxHeight = 350;
      const minWidth = 20;
      const minHeight = 20;

      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image too large. Maximum size: ${maxWidth}x${maxHeight}px`,
          dimensions: { width: img.width, height: img.height },
        });
      } else if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image too small. Minimum size: ${minWidth}x${minHeight}px`,
          dimensions: { width: img.width, height: img.height },
        });
      } else {
        resolve({
          valid: true,
          dimensions: { width: img.width, height: img.height },
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: "Invalid image file" });
    };

    img.src = objectUrl;
  });
};

// Default text file validation function
const validateTextFile = (
  file: File
): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    // Check file type
    if (
      !file.type.startsWith("text/") &&
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".csv")
    ) {
      resolve({
        valid: false,
        error: "File must be a text file (.txt or .csv)",
      });
      return;
    }

    // Check file size (max 10MB for text files)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      resolve({ valid: false, error: "File too large. Maximum size: 10MB" });
      return;
    }

    resolve({ valid: true });
  });
};

interface FileUploadProps {
  onFileSelect?: (files: UploadedFile[]) => void;
  accept?: Record<string, string[]>; // File type configuration
  maxSize?: number; // Max file size in bytes
  validator?: (
    file: File
  ) => Promise<{
    valid: boolean;
    error?: string;
    dimensions?: { width: number; height: number };
  }>; // Custom validation function
  maxFiles?: number; // Maximum number of files to accept
  noUpload?: boolean; // Skip upload, just validate and select files
}

export function FileUpload({
  onFileSelect,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB 
  validator = validateImage, 
  maxFiles,
  noUpload = false,
}: FileUploadProps = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const resolvedMaxFiles = maxFiles ?? 1;
  const allowMultiple = resolvedMaxFiles !== 1;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      const nextEntries: UploadedFile[] = [];

      for (const file of acceptedFiles) {
        const validation = await validator(file);

        if (!validation.valid) {
          nextEntries.push({
            file,
            status: "error",
            progress: 0,
            error: validation.error,
          });
        } else {
          nextEntries.push({
            file,
            dimensions: validation.dimensions,
            status: noUpload ? "success" : "uploading",
            progress: noUpload ? 100 : 0,
          });
        }
      }

      setFiles((prev) => {
        const slotsRemaining = resolvedMaxFiles
          ? Math.max(resolvedMaxFiles - prev.length, 0)
          : nextEntries.length;
        const entriesToAdd =
          resolvedMaxFiles && resolvedMaxFiles !== Infinity
            ? nextEntries.slice(0, slotsRemaining)
            : nextEntries;

        if (entriesToAdd.length === 0) {
          return prev;
        }

        return [...prev, ...entriesToAdd];
      });
      setIsProcessing(false);
    },
    [noUpload, resolvedMaxFiles, validator]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: allowMultiple,
    maxSize,
    accept,
    maxFiles: resolvedMaxFiles,
  });

  useEffect(() => {
    if (!onFileSelect) return;

    const successfulEntries = files.filter((item) => item.status !== "error");
    onFileSelect(successfulEntries);
  }, [files, onFileSelect]);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }
          ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        {isProcessing ? (
          <p className="text-sm text-muted-foreground">Processing...</p>
        ) : isDragActive ? (
          <p className="text-sm">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-sm mb-1">Click to select or drag & drop files</p>
            <p className="text-xs text-muted-foreground">
              Max {Math.round(maxSize / (1024 * 1024))}MB •{" "}
              {Object.values(accept).flat().join(", ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Up to {resolvedMaxFiles} file{resolvedMaxFiles > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((uploadFile, index) => (
            <div
              key={`${uploadFile.file.name}-${index}`}
              className="flex items-center space-x-2 text-sm"
            >
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate">{uploadFile.file.name}</span>

              {uploadFile.status === "success" && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Ready</span>
                </div>
              )}

              {uploadFile.status === "error" && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">Error</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {files.map((uploadFile, index) =>
            uploadFile.status === "error" && uploadFile.error ? (
              <p
                key={`error-${uploadFile.file.name}-${index}`}
                className="text-xs text-red-600"
              >
                {uploadFile.error}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

// Export validation functions for reuse
export { validateImage, validateTextFile };
