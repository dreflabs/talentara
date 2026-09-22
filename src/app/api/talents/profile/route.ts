import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { logApiRequest, logApiError } from "@/lib/logger";
import { sanitizeText, sanitizePhone, sanitizeBio, sanitizeNumber } from "@/lib/sanitize";

// Validation schema for talent profile update
const updateTalentSchema = z.object({
  // Profile fields
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  // Talent fields
  category: z.enum(["spg", "usher", "both"]).optional(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  height_cm: z.number().min(100).max(250).optional().nullable(),
  weight_kg: z.number().min(30).max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  address: z.string().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  daily_rate: z.number().min(0).optional().nullable(),
  is_available: z.boolean().optional(),
});

/**
 * GET /api/talents/profile — Get current talent's full profile
 * OPTIMIZED: Single query with joins to avoid N+1 pattern
 */
export async function GET(request: Request) {
  const clientIp = getClientIp(request);

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // OPTIMIZED: Single query with joins instead of 4 separate queries
    const { data: talent, error } = await supabase
      .from("talents")
      .select(`
        *,
        profile:profiles!talents_profile_id_fkey (
          id,
          email,
          full_name,
          phone,
          avatar_url,
          is_verified,
          is_active,
          created_at
        ),
        portfolios:talent_portfolios (
          id,
          media_type,
          media_url,
          thumbnail_url,
          caption,
          event_name,
          sort_order
        ),
        experiences:talent_experiences (
          id,
          company_name,
          event_name,
          role,
          description,
          start_date,
          end_date
        )
      `)
      .eq("profile_id", user.id)
      .order("sort_order", { foreignTable: "talent_portfolios", ascending: true })
      .order("start_date", { foreignTable: "talent_experiences", ascending: false })
      .single();

    if (error || !talent) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Data talent tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if user is actually a talent
    if (talent.profile && (talent.profile as any).role !== "talent") {
      return NextResponse.json(
        { success: false, error: "NOT_TALENT", message: "Akun bukan talent" },
        { status: 403 }
      );
    }

    logApiRequest("GET", "/api/talents/profile", user.id, clientIp);

    return NextResponse.json({
      success: true,
      data: {
        profile: talent.profile,
        talent: {
          id: talent.id,
          profile_id: talent.profile_id,
          category: talent.category,
          gender: talent.gender,
          date_of_birth: talent.date_of_birth,
          height_cm: talent.height_cm,
          weight_kg: talent.weight_kg,
          city: talent.city,
          province: talent.province,
          address: talent.address,
          bio: talent.bio,
          ratings_avg: talent.ratings_avg,
          ratings_count: talent.ratings_count,
          wallet_balance: talent.wallet_balance,
          daily_rate: talent.daily_rate,
          is_available: talent.is_available,
          verification_status: talent.verification_status,
          jobs_completed: talent.jobs_completed,
          created_at: talent.created_at,
        },
        portfolios: talent.portfolios || [],
        experiences: talent.experiences || [],
      },
    });
  } catch (error) {
    logApiError("GET", "/api/talents/profile", error, undefined, clientIp);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/talents/profile — Update current talent's profile
 */
export async function PUT(request: Request) {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting for profile updates
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const rateLimitResult = await rateLimiters.api(`profile-update:${user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak update. Silakan coba lagi nanti.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = updateTalentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Data tidak valid" },
        { status: 422 }
      );
    }

    const validated = result.data;

    // Sanitize inputs
    const sanitizedData: any = {};
    if (validated.full_name) sanitizedData.full_name = sanitizeText(validated.full_name);
    if (validated.phone) sanitizedData.phone = sanitizePhone(validated.phone);
    if (validated.bio) sanitizedData.bio = sanitizeBio(validated.bio, 1000);
    if (validated.city) sanitizedData.city = sanitizeText(validated.city);
    if (validated.province) sanitizedData.province = sanitizeText(validated.province);
    if (validated.address) sanitizedData.address = sanitizeText(validated.address);
    if (validated.height_cm !== undefined) sanitizedData.height_cm = sanitizeNumber(validated.height_cm, 100, 250);
    if (validated.weight_kg !== undefined) sanitizedData.weight_kg = sanitizeNumber(validated.weight_kg, 30, 200);
    if (validated.daily_rate !== undefined) sanitizedData.daily_rate = sanitizeNumber(validated.daily_rate, 0);

    // Update profile (full_name, phone, avatar_url)
    const profileUpdate: Record<string, unknown> = {};
    if (sanitizedData.full_name) profileUpdate.full_name = sanitizedData.full_name;
    if (sanitizedData.phone) profileUpdate.phone = sanitizedData.phone;
    if (validated.avatar_url !== undefined) profileUpdate.avatar_url = validated.avatar_url;

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) {
        logApiError("PUT", "/api/talents/profile", profileError, user.id, clientIp);
        return NextResponse.json(
          { success: false, error: "UPDATE_ERROR", message: "Gagal update profil" },
          { status: 500 }
        );
      }
    }

    // Update talent data
    const talentUpdate: Record<string, unknown> = {};

    // Add sanitized fields
    if (sanitizedData.bio) talentUpdate.bio = sanitizedData.bio;
    if (sanitizedData.city) talentUpdate.city = sanitizedData.city;
    if (sanitizedData.province) talentUpdate.province = sanitizedData.province;
    if (sanitizedData.address) talentUpdate.address = sanitizedData.address;
    if (sanitizedData.height_cm !== undefined) talentUpdate.height_cm = sanitizedData.height_cm;
    if (sanitizedData.weight_kg !== undefined) talentUpdate.weight_kg = sanitizedData.weight_kg;
    if (sanitizedData.daily_rate !== undefined) talentUpdate.daily_rate = sanitizedData.daily_rate;

    // Add non-text fields that don't need sanitization
    if (validated.category) talentUpdate.category = validated.category;
    if (validated.gender !== undefined) talentUpdate.gender = validated.gender;
    if (validated.date_of_birth !== undefined) talentUpdate.date_of_birth = validated.date_of_birth;
    if (validated.is_available !== undefined) talentUpdate.is_available = validated.is_available;

    if (Object.keys(talentUpdate).length > 0) {
      const { error: talentError } = await supabaseAdmin
        .from("talents")
        .update(talentUpdate)
        .eq("profile_id", user.id);

      if (talentError) {
        logApiError("PUT", "/api/talents/profile", talentError, user.id, clientIp);
        return NextResponse.json(
          { success: false, error: "UPDATE_ERROR", message: "Gagal update data talent" },
          { status: 500 }
        );
      }
    }

    logApiRequest("PUT", "/api/talents/profile", user.id, clientIp);

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
    });
  } catch (error) {
    logApiError("PUT", "/api/talents/profile", error, undefined, clientIp);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
