import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, rateLimiters } from "@/lib/rate-limit";
import { logApiError, logApiRequest } from "@/lib/logger";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);

  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.api(`bookings:${clientIp}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
        },
        { status: 429 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "PROFILE_NOT_FOUND", message: "Profil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query based on role
    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        job:jobs(
          id,
          title,
          category,
          location_city,
          location_address,
          start_time,
          end_time
        ),
        company:companies(
          company_name,
          industry,
          city
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by talent_id for talent role
    if (profile.role === "talent") {
      query = query.eq("talent_id", user.id);
    }
    // Filter by company_id for client role
    else if (profile.role === "client") {
      query = query.eq("company_id", user.id);
    }
    // Admin can see all bookings
    // No additional filter needed

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error: fetchError, count } = await query;

    if (fetchError) {
      logApiError("GET", "/api/bookings", fetchError, user.id);
      return NextResponse.json(
        { success: false, error: "FETCH_ERROR", message: "Gagal mengambil data booking" },
        { status: 500 }
      );
    }

    logApiRequest("GET", "/api/bookings", user.id);

    return NextResponse.json({
      success: true,
      data: bookings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logApiError("GET", "/api/bookings", error, undefined, clientIp);

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
