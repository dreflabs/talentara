"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  onUploadError,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUploadError?.("File harus berupa gambar (JPG, PNG, atau GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.("Ukuran file maksimal 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      // Simulate upload progress (in real implementation, use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API (you'll need to create this endpoint)
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Upload gagal");
      }

      const result = await response.json();

      if (result.success && result.data?.url) {
        onUploadComplete(result.data.url);
      } else {
        throw new Error(result.message || "Upload gagal");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error instanceof Error ? error.message : "Gagal upload foto");
      // Revert preview on error
      setPreview(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // In real implementation, you might want to call an API to remove the avatar
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
          {preview ? (
            <Image
              src={preview}
              alt="Avatar"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600">
              <Camera className="h-12 w-12 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
              <p className="mt-1 text-xs text-white">{uploadProgress}%</p>
            </div>
          </div>
        )}

        {/* Remove Button */}
        {preview && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600"
            aria-label="Remove avatar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {preview ? "Ganti Foto" : "Upload Foto"}
        </Button>

        <p className="text-xs text-muted-foreground">
          JPG, PNG atau GIF. Maks. 5MB
        </p>
      </div>
    </div>
  );
}
