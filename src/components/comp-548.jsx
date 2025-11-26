"use client"

import { AlertCircleIcon, PaperclipIcon, UploadIcon, XIcon } from "lucide-react"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const initialFiles = [
  {
    name: "document.pdf",
    size: 1528737,
    type: "application/pdf",
    url: "https://picsum.photos/1000/800?grayscale&random=1",
    id: "document.pdf-1744638436563-8u5xuls",
  },
]

export default function Component() {
  const maxSize = 10 * 1024 * 1024 // 10MB

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    maxSize,
    initialFiles,
  })

  const file = files[0]

  return (
    <Card className="w-full max-w-md mx-auto space-y-4">
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
        <CardDescription>
          Drag & drop or click to upload a single file (max {formatBytes(maxSize)})
        </CardDescription>
      </CardHeader>

      {/* Drop area */}
      <CardContent>
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className={`relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 min-h-[180px] w-full transition-all cursor-pointer 
            hover:bg-accent/20 data-[dragging=true]:bg-accent/30`}
        >
          <input {...getInputProps()} className="sr-only" aria-label="Upload file" disabled={Boolean(file)} />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background">
              <UploadIcon className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-sm font-medium">Upload file</p>
          </div>
          {isDragging && (
            <div className="absolute inset-0 rounded-lg border-2 border-accent border-dashed animate-pulse pointer-events-none"></div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-destructive" role="alert">
            <AlertCircleIcon className="h-4 w-4" />
            <span>{errors[0]}</span>
          </div>
        )}

        {/* File preview */}
        {file && (
          <div className="mt-4 space-y-2 w-full">
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="flex items-center gap-3 overflow-hidden">
                <PaperclipIcon className="h-5 w-5 text-muted-foreground/60" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.file.name}</p>
                  <Badge className="mt-1">{formatBytes(file.file.size)}</Badge>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-destructive hover:bg-transparent"
                onClick={() => removeFile(file.id)}
                aria-label="Remove file"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Image preview */}
            {file.file.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(file.file)}
                alt={file.file.name}
                className="mt-2 w-full max-h-64 rounded-lg border object-cover"
              />
            )}
          </div>
        )}
      </CardContent>

      <CardContent>
        <p className="text-center text-xs text-muted-foreground" aria-live="polite" role="region">
          Single file uploader ∙{" "}
          <a
            href="https://github.com/origin-space/originui/tree/main/docs/use-file-upload.md"
            className="underline hover:text-foreground"
          >
            API
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
