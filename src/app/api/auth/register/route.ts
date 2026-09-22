import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { logApiRequest, logApiError, logWarning } from "@/lib/logger";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting: 5 registration attempts per minute per IP
    const rateLimitResult = await rateLimiters.auth(`register:${clientIp}`);
    if (!rateLimitResult.success) {
      logWarning("Rate limit exceeded for registration", { ip: clientIp });
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
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

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(validated.email);
    const sanitizedPhone = sanitizePhone(validated.phone);
    const sanitizedFullName = sanitizeText(validated.full_name);

    // 1. Create auth user via admin client
    // PRODUCTION: Email verification required (email_confirm: false)
    // For testing: Set email_confirm: true in development only
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: validated.password,
      email_confirm: process.env.NODE_ENV === 'development', // Auto-confirm in dev only
      user_metadata: {
        full_name: sanitizedFullName,
        role: validated.role,
      },
    });

    if (authError) {
      // Handle duplicate email
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        return NextResponse.json(
          { success: false, error: "EMAIL_EXISTS", message: "Email sudah terdaftar" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: "AUTH_ERROR", message: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "AUTH_ERROR", message: "Gagal membuat akun" },
        { status: 500 }
      );
    }

    // 2. Create profile (using admin client to bypass RLS)
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email: sanitizedEmail,
      full_name: sanitizedFullName,
      phone: sanitizedPhone,
      role: validated.role,
    });

    if (profileError) {
      logApiError("POST", "/api/auth/register", profileError, authData.user.id, clientIp);
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, error: "PROFILE_ERROR", message: "Gagal membuat profil" },
        { status: 500 }
      );
    }

    // 3. Create role-specific record with proper rollback
    if (validated.role === "talent") {
      const { error: talentError } = await supabaseAdmin.from("talents").insert({
        profile_id: authData.user.id,
        category: "spg", // Default category, can be updated later
      });
      if (talentError) {
        logApiError("POST", "/api/auth/register - Talent creation failed", talentError, authData.user.id, clientIp);
        // Rollback: delete profile and auth user
        await supabaseAdmin.from("profiles").delete().eq("id", authData.user.id);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { success: false, error: "TALENT_CREATION_ERROR", message: "Gagal membuat profil talent" },
          { status: 500 }
        );
      }
    } else if (validated.role === "client") {
      const { error: companyError } = await supabaseAdmin.from("companies").insert({
        profile_id: authData.user.id,
        company_name: sanitizedFullName, // Placeholder, updated in company profile
      });
      if (companyError) {
        logApiError("POST", "/api/auth/register - Company creation failed", companyError, authData.user.id, clientIp);
        // Rollback: delete profile and auth user
        await supabaseAdmin.from("profiles").delete().eq("id", authData.user.id);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { success: false, error: "COMPANY_CREATION_ERROR", message: "Gagal membuat profil perusahaan" },
          { status: 500 }
        );
      }
    }

    logApiRequest("POST", "/api/auth/register", authData.user.id, clientIp);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          profile: {
            id: authData.user.id,
            role: validated.role,
            full_name: sanitizedFullName,
          },
        },
        message: "Registrasi berhasil. Silakan login untuk melanjutkan.",
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError("POST", "/api/auth/register", error, undefined, clientIp);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
