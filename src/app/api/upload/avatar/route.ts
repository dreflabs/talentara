import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, rateLimiters } from "@/lib/rate-limit";
import { logApiError, logApiRequest } from "@/lib/logger";
import { withAuth } from "@/lib/api-middleware";
import { validateAvatarFileServer } from "@/lib/file-validation";
import { UPLOAD_LIMITS } from "@/lib/constants";

export const POST = withAuth(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.upload(`upload-avatar:${clientIp}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak percobaan upload. Silakan coba lagi nanti.",
        },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer for validation
    const arrayBuffer = await file.arrayBuffer();

    // Comprehensive file validation (MIME type, size, file signature/magic numbers)
    const validationResult = await validateAvatarFileServer(
      arrayBuffer,
      file.type,
      file.size
    );

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: validationResult.error || "File tidak valid",
        },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Ekstensi file tidak valid",
        },
        { status: 400 }
      );
    }

    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert to Uint8Array for upload
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const supabase = await createClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("talentara-uploads") // Make sure this bucket exists
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logApiError("POST", "/api/upload/avatar", uploadError, user.id, clientIp);

      return NextResponse.json(
        {
          success: false,
          error: "UPLOAD_ERROR",
          message: "Gagal upload file: " + uploadError.message,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("talentara-uploads").getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { success: false, error: "UPLOAD_ERROR", message: "Gagal mendapatkan URL file" },
        { status: 500 }
      );
    }

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      logApiError("POST", "/api/upload/avatar", updateError, user.id, clientIp);

      return NextResponse.json(
        {
          success: false,
          error: "UPDATE_ERROR",
          message: "File uploaded tapi gagal update profil",
        },
        { status: 500 }
      );
    }

    logApiRequest("POST", "/api/upload/avatar", user.id, clientIp);

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil diupload",
      data: {
        url: urlData.publicUrl,
        path: filePath,
      },
    });
  } catch (error) {
    logApiError("POST", "/api/upload/avatar", error, user.id, clientIp);

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
});
