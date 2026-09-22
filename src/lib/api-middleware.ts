/**
 * Reusable API Middleware Functions
 * Reduces code duplication across API routes
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export type AuthenticatedHandler<T = any> = (
  request: NextRequest,
  user: User,
  context?: T
) => Promise<NextResponse>

export type RoleProtectedHandler<T = any> = (
  request: NextRequest,
  user: User,
  context?: T
) => Promise<NextResponse>

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function withAuth<T = any>(handler: AuthenticatedHandler<T>) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const supabase = await createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "Anda harus login terlebih dahulu",
          },
          { status: 401 }
        )
      }

      return handler(request, user, context)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        {
          error: "Internal server error",
          message: "Terjadi kesalahan pada server",
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to require specific role
 * Returns 403 if user doesn't have the required role
 */
export function withRole<T = any>(
  role: "talent" | "client" | "admin",
  handler: RoleProtectedHandler<T>
) {
  return withAuth(async (request: NextRequest, user: User, context?: T) => {
    try {
      const supabase = await createClient()
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        return NextResponse.json(
          {
            error: "Profile not found",
            message: "Profil pengguna tidak ditemukan",
          },
          { status: 404 }
        )
      }

      if (profile.role !== role) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: `Akses ditolak. Hanya ${role} yang dapat mengakses endpoint ini`,
          },
          { status: 403 }
        )
      }

      return handler(request, user, context)
    } catch (error) {
      console.error("Role middleware error:", error)
      return NextResponse.json(
        {
          error: "Internal server error",
          message: "Terjadi kesalahan pada server",
        },
        { status: 500 }
      )
    }
  })
}

/**
 * Middleware for talent-only endpoints
 */
export function withTalent<T = any>(handler: RoleProtectedHandler<T>) {
  return withRole("talent", handler)
}

/**
 * Middleware for client-only endpoints
 */
export function withClient<T = any>(handler: RoleProtectedHandler<T>) {
  return withRole("client", handler)
}

/**
 * Middleware for admin-only endpoints
 */
export function withAdmin<T = any>(handler: RoleProtectedHandler<T>) {
  return withRole("admin", handler)
}

/**
 * Get talent profile from authenticated user
 * Returns null if user is not a talent or profile doesn't exist
 */
export async function getTalentProfile(userId: string) {
  const supabase = await createClient()
  const { data: talent, error } = await supabase
    .from("talents")
    .select("*")
    .eq("profile_id", userId)
    .single()

  if (error || !talent) {
    return null
  }

  return talent
}

/**
 * Get client/company profile from authenticated user
 * Returns null if user is not a client or profile doesn't exist
 */
export async function getCompanyProfile(userId: string) {
  const supabase = await createClient()
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("profile_id", userId)
    .single()

  if (error || !company) {
    return null
  }

  return company
}
