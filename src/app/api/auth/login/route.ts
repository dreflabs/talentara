import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { logApiRequest, logApiError, logWarning } from "@/lib/logger";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting: 5 login attempts per minute per IP
    const rateLimitResult = await rateLimiters.auth(`login:${clientIp}`);
    if (!rateLimitResult.success) {
      logWarning("Rate limit exceeded for login", { ip: clientIp });
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak percobaan login. Silakan coba lagi nanti.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Data tidak valid", errors },
        { status: 422 }
      );
    }

    const validated = result.data;

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(validated.email);

    const supabase = await createClient();

    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: validated.password,
    });

    if (authError) {
      logWarning("Failed login attempt", { email: sanitizedEmail, ip: clientIp });
      return NextResponse.json(
        { success: false, error: "INVALID_CREDENTIALS", message: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "AUTH_ERROR", message: "Gagal login" },
        { status: 500 }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    logApiRequest("POST", "/api/auth/login", authData.user.id, clientIp);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile?.role || "talent",
          full_name: profile?.full_name || "",
          avatar_url: profile?.avatar_url || null,
          is_verified: profile?.is_verified || false,
        },
      },
      message: "Login berhasil",
    });
  } catch (error) {
    logApiError("POST", "/api/auth/login", error, undefined, clientIp);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
