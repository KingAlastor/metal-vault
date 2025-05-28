"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validate each file before adding to the list
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
          
          // Start upload
          uploadToPublic(file, files.length)
        }
      }
    },
    [files.length],
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
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    }
  })

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Image Upload</h2>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
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
          <CardContent className="p-6">
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
