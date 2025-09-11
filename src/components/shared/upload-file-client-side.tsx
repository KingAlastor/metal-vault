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

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  compact?: boolean; // New prop for compact mode
}

export function FileUpload({ onFileSelect, compact = false }: FileUploadProps = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      setIsProcessing(true);
      
      // In compact mode with callback, only handle the first file
      if (compact && onFileSelect) {
        const file = acceptedFiles[0];
        const validation = await validateImage(file);
        
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
          status: "success" as const,
          progress: 100,
        }]);
        onFileSelect(file);
        setIsProcessing(false);
        return;
      }
      
      // Original logic for non-compact mode
      for (const file of acceptedFiles) {
        const validation = await validateImage(file)
        
        if (!validation.valid) {
          // Add file with error status
          setFiles((prev) => [...prev, {
            file,
            status: "error" as const,
            progress: 0,
            error: validation.error
          }])
        } else {
          // Add file for upload
          const newFile = {
            file,
            status: "uploading" as const,
            progress: 0,
          }
          
          setFiles((prev) => [...prev, newFile])
          
          // Call the callback if provided (for external handling)
          if (onFileSelect) {
            onFileSelect(file);
          } else {
            // Start upload (default behavior)
            uploadToPublic(file, files.length)
          }
        }
      }
      setIsProcessing(false);
    },
    [files.length, onFileSelect, compact],
  )

  const uploadToPublic = async (file: File, index: number) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index && f.status === "uploading" ? { ...f, progress: Math.min(f.progress + 10, 90) } : f,
          ),
        )
      }, 100)

      const response = await fetch("/api/promote/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "success" as const,
                progress: 100,
                url: result.url,
              }
            : f,
        ),
      )
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error" as const,
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      )
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: !compact, // Single file in compact mode
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    }
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
              <p className="text-sm mb-1">Click to select or drag & drop an image</p>
              <p className="text-xs text-muted-foreground">Max 10MB • JPG, PNG, WebP, GIF</p>
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
                <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
                <p className="text-sm text-muted-foreground">Supported formats: .jpeg, .jpg, .png, .webp, .gif</p>
                <p className="text-sm text-muted-foreground">Minimum dimensions: 300x300 pixels</p>
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
