"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting = false,
  title = "Delete Item",
  description = "Are you sure you want to delete this item?",
  itemName,
  itemDetails,
  itemType = "job post",
  confirmButtonText = "Delete Permanently",
  cancelButtonText = "Cancel",
  showDetails = true,
}) {
  // Default item details structure for job posts
  const defaultItemDetails = {
    companyLogo: null,
    companyName: "",
    title: "",
    location: "",
    employmentType: "",
    applicationsCount: 0,
    status: "",
  };

  const details = { ...defaultItemDetails, ...itemDetails };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {showDetails && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                {itemName && (
                  <div className="flex items-center gap-3">
                    {details.companyLogo ? (
                      <img
                        src={details.companyLogo}
                        alt={details.companyName}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {itemName || details.title}
                      </h3>
                      {details.companyName && (
                        <p className="text-sm text-muted-foreground">
                          {details.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {details && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {details.location && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Location:</span>
                        <p>{details.location}</p>
                      </div>
                    )}
                    {details.employmentType && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Type:</span>
                        <p>{details.employmentType}</p>
                      </div>
                    )}
                    {details.applicationsCount !== undefined && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">
                          Applications:
                        </span>
                        <p>{details.applicationsCount}</p>
                      </div>
                    )}
                    {details.status && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={
                            details.status === "active"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {details.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm mt-1">{description}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {confirmButtonText}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}