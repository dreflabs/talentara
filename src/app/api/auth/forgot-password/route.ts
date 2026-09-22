import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeEmail } from '@/lib/sanitize'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logWarning } from '@/lib/logger'

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})

export async function POST(request: Request) {
  const clientIp = getClientIp(request)

  try {
    // Rate limiting: 3 attempts per hour per IP
    const rateLimitResult = await rateLimiters.auth(`forgot-password:${clientIp}`)
    if (!rateLimitResult.success) {
      logWarning('Rate limit exceeded for forgot password', { ip: clientIp })
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email tidak valid',
        },
        { status: 422 }
      )
    }

    const sanitizedEmail = sanitizeEmail(result.data.email)

    // Use Supabase to send password reset email
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    // Always return success to prevent email enumeration
    // Even if email doesn't exist, we return success
    if (error) {
      logWarning('Password reset email error (might be non-existent email)', {
        email: sanitizedEmail,
        error: error.message,
      })
    } else {
      logApiRequest('POST', '/api/auth/forgot-password', undefined, clientIp)
    }

    // Generic success message (security: don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password telah dikirim',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
