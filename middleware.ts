import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Edge middleware to keep Supabase session cookies in sync.
 *
 * This middleware delegates to `updateSession` which should return a
 * `Response`/`NextResponse`. If it returns `null`/`undefined`, we fall
 * back to `NextResponse.next()`.
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  return response ?? NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (The login page itself!)
     * - /auth (Auth callback routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|auth).*)',
  ],
}
