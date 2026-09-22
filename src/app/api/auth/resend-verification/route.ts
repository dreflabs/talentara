import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { logApiRequest, logApiError, logWarning } from "@/lib/logger";
import { sanitizeEmail } from "@/lib/sanitize";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting: 3 resend attempts per hour per IP
    const rateLimitResult = await rateLimiters.strict(`resend-verification:${clientIp}`);
    if (!rateLimitResult.success) {
      logWarning("Rate limit exceeded for resend verification", { ip: clientIp });
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = resendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Email tidak valid",
        },
        { status: 422 }
      );
    }

    const sanitizedEmail = sanitizeEmail(result.data.email);

    // Check if user exists
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      throw getUserError;
    }

    const user = users.users.find((u) => u.email === sanitizedEmail);

    if (!user) {
      // Generic response to prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          message: "Jika email terdaftar, kami telah mengirim link verifikasi.",
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.email_confirmed_at) {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_VERIFIED",
          message: "Email sudah terverifikasi. Silakan login.",
        },
        { status: 400 }
      );
    }

    // Resend verification email using Supabase
    // Use resend method to trigger email confirmation
    const { error: resendError } = await supabaseAdmin.auth.resend({
      type: "signup",
      email: sanitizedEmail,
    });

    if (resendError) {
      // Log error but don't reveal to user (prevent email enumeration)
      logApiError("POST", "/api/auth/resend-verification", resendError, user?.id, clientIp);
    }

    // In production, send the verification link via email service
    // For now, Supabase handles this automatically
    logApiRequest("POST", "/api/auth/resend-verification", user.id, clientIp);

    return NextResponse.json(
      {
        success: true,
        message: "Link verifikasi telah dikirim ke email Anda. Silakan cek inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError("POST", "/api/auth/resend-verification", error, undefined, clientIp);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
