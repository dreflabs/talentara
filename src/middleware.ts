import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { validateCSRF } from "@/lib/csrf";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/resend-verification",
  "/api/auth/callback",
  "/api/payments/webhook",
];

// Routes only for talent role
const TALENT_ROUTES = ["/dashboard", "/profile", "/wallet", "/verification"];

// Routes only for client role
const CLIENT_ROUTES = ["/company"];

// Routes only for admin role
const ADMIN_ROUTES = ["/admin"];

// Allowed redirect paths (whitelist for security)
const ALLOWED_REDIRECTS = [
  "/dashboard",
  "/company/dashboard",
  "/admin/dashboard",
  "/profile",
  "/company",
  "/jobs",
  "/applications",
  "/bookings",
];

/**
 * Validates and sanitizes redirect URL to prevent open redirect attacks
 */
function validateRedirectUrl(pathname: string): string {
  // Check if pathname is in allowed list
  const isAllowed = ALLOWED_REDIRECTS.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (!isAllowed) {
    // Default redirect based on common patterns
    if (pathname.startsWith("/company")) return "/company/dashboard";
    if (pathname.startsWith("/admin")) return "/admin/dashboard";
    return "/dashboard"; // Default for talent
  }

  return pathname;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF Protection for API routes (except auth callbacks and webhooks)
  if (
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth/callback") &&
    !pathname.startsWith("/api/payments/webhook")
  ) {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { error: "CSRF validation failed", message: "Invalid request origin" },
        { status: 403 }
      );
    }
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return updateSession(request);
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // static files
  ) {
    return updateSession(request);
  }

  // Create Supabase client for auth check
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated — redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    // Validate redirect URL to prevent open redirect attacks
    const safeRedirect = validateRedirectUrl(pathname);
    loginUrl.searchParams.set("redirect", safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  // Fetch profile role for route protection
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = profile.role;

  // Admin route protection
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && userRole !== "admin") {
    const redirectPath = userRole === "client" ? "/company/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Talent trying to access client routes
  if (CLIENT_ROUTES.some((route) => pathname.startsWith(route)) && userRole === "talent") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Client trying to access talent-only routes
  if (TALENT_ROUTES.some((route) => pathname.startsWith(route)) && userRole === "client") {
    return NextResponse.redirect(new URL("/company/dashboard", request.url));
  }

  return response;
}

/**
 * Refresh the session cookie to keep user logged in
 */
async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes the session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
