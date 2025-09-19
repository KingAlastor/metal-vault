"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
  file: File
  status: "uploading" | "success" | "error"
  progress: number
  url?: string
  error?: string
}

// Default image validation function
const validateImage = (file: File): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
  return new Promise((resolve) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      resolve({ valid: false, error: 'File must be an image' })
      return
    }

    // Check image dimensions
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      // Set your pixel requirements here
      const maxWidth = 1920
      const maxHeight = 1080
      const minWidth = 300
      const minHeight = 300
      
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({ 
          valid: false, 
          error: `Image too large. Maximum size: ${maxWidth}x${maxHeight}px`,
          dimensions: { width: img.width, height: img.height }
        })
      } else if (img.width < minWidth || img.height < minHeight) {
        resolve({ 
          valid: false, 
          error: `Image too small. Minimum size: ${minWidth}x${minHeight}px`,
          dimensions: { width: img.width, height: img.height }
        })
      } else {
        resolve({ 
          valid: true, 
          dimensions: { width: img.width, height: img.height }
        })
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ valid: false, error: 'Invalid image file' })
    }
    
    img.src = objectUrl
  })
}

// Default text file validation function
const validateTextFile = (file: File): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    // Check file type
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      resolve({ valid: false, error: 'File must be a text file (.txt or .csv)' })
      return
    }

    // Check file size (max 10MB for text files)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      resolve({ valid: false, error: 'File too large. Maximum size: 10MB' })
      return
    }

    resolve({ valid: true })
  })
}

interface FileUploadProps {
  onFileSelect?: (file: File | File[]) => void;
  compact?: boolean;
  accept?: Record<string, string[]>; // File type configuration
  maxSize?: number; // Max file size in bytes
  validator?: (file: File) => Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }>; // Custom validation function
  multiple?: boolean; // Allow multiple files
  uploadFunction?: (formData: FormData) => Promise<{ success: boolean; url?: string; filename?: string; error?: string }>; // Custom upload function
  noUpload?: boolean; // Skip upload, just validate and select files
  maxFiles?: number; // Maximum number of files to accept
}

export function FileUpload({
  onFileSelect,
  compact = false,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
  },
  maxSize = 10 * 1024 * 1024, // 10MB default
  validator = validateImage, // Default to image validation
  multiple = !compact, // Single file in compact mode by default
  uploadFunction,
  noUpload = false,
  maxFiles = multiple ? 10 : 1
}: FileUploadProps = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      setIsProcessing(true);
      
      // In compact mode with callback, only handle the first file
      if (compact && onFileSelect) {
        const file = acceptedFiles[0];
        const validation = await validator(file);
        
        if (!validation.valid) {
          setFiles([{
            file,
            status: "error" as const,
            progress: 0,
            error: validation.error
          }]);
          setIsProcessing(false);
          return;
        }
        
        // Set processing state and call callback
        setFiles([{
          file,
          status: (noUpload ? "success" : "uploading") as "uploading" | "success",
          progress: noUpload ? 100 : 0,
        }]);
        onFileSelect(file);
        setIsProcessing(false);
        return;
      }
      
      // Original logic for non-compact mode
      for (const file of acceptedFiles) {
        const validation = await validator(file)
        
        if (!validation.valid) {
          // Add file with error status
          setFiles((prev) => [...prev, {
            file,
            status: "error" as const,
            progress: 0,
            error: validation.error
          }])
        } else {
          // Add file for processing
          const newFile = {
            file,
            status: (noUpload ? "success" : "uploading") as "uploading" | "success",
            progress: noUpload ? 100 : 0,
          }
          
          setFiles((prev) => [...prev, newFile])
          
          // Call the callback if provided (for external handling)
          if (onFileSelect) {
            onFileSelect(file);
          }
        }
      }
      setIsProcessing(false);
    },
    [files.length, onFileSelect, compact, validator, noUpload],
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: multiple,
    maxSize: maxSize,
    accept: accept,
    maxFiles: maxFiles
  })

  // Compact mode for forms
  if (compact) {
    return (
      <div className="w-full">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          {isProcessing ? (
            <p className="text-sm text-muted-foreground">Processing...</p>
          ) : isDragActive ? (
            <p className="text-sm">Drop the image here...</p>
          ) : (
            <div>
              <p className="text-sm mb-1">Click to select or drag & drop files</p>
              <p className="text-xs text-muted-foreground">Max {Math.round(maxSize / (1024 * 1024))}MB • {Object.values(accept).flat().join(', ')}</p>
            </div>
          )}
        </div>
        
        {/* Show file status below the dropzone */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((uploadFile, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
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
                
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {files.length > 0 && files[0].status === "error" && files[0].error && (
              <p className="text-xs text-red-600 mt-1">{files[0].error}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardContent className="p-1">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
                <p className="text-sm text-muted-foreground">Supported formats: {Object.values(accept).flat().join(', ')}</p>
                <p className="text-sm text-muted-foreground">Maximum files: {maxFiles}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-1">
            <h3 className="font-semibold mb-4">Uploaded Files</h3>
            <div className="space-y-4">
              {files.map((uploadFile, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {uploadFile.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadFile.progress}%</p>
                      </div>
                    )}

                    {uploadFile.status === "success" && uploadFile.url && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Upload successful</span>
                        </div>
                        <a
                          href={uploadFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View file: {uploadFile.url}
                        </a>
                      </div>
                    )}

                    {uploadFile.status === "error" && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">{uploadFile.error || "Upload failed"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export validation functions for reuse
export { validateImage, validateTextFile }
