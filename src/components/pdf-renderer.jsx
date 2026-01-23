"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error) {
    setError("Failed to load PDF. Please check the file URL.");
    setLoading(false);
    console.error("PDF load error:", error);
  }

  return (
    <Card className="w-full max-w-4xl mx-0">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {numPages ? `Page ${pageNumber} of ${numPages}` : "Loading..."}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newScale = Math.max(0.5, scale - 0.2);
                setScale(newScale);
                setContainerWidth(0); // Reset to recalculate
              }}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-12 text-center">
              {containerWidth ? "Fit" : `${Math.round(scale * 100)}%`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newScale = Math.min(2.0, scale + 0.2);
                setScale(newScale);
                setContainerWidth(0); // Reset to recalculate
              }}
              disabled={scale >= 2.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="bg-muted/30 relative">
          {error ? (
            <div className="flex items-center justify-center p-8 w-full min-h-150">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <div
              className="w-full"
              ref={(node) => {
                if (node && containerWidth === 0) {
                  setContainerWidth(node.offsetWidth);
                }
              }}
            >
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Skeleton className="h-auto w-full overflow-auto rounded-lg" />
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth || undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageNumber(pageNumber - 1)}
          disabled={pageNumber <= 1 || !numPages}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageNumber(pageNumber + 1)}
          disabled={pageNumber >= numPages || !numPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
