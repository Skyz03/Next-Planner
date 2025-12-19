import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // 1. Create a response object that we can modify (cookies, redirects)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase Client
  // We do this here to access the latest cookies and user state
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // 3. Check the User
  // This refreshes the session if expired - crucial for security
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Define Paths
  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isReflection = path.startsWith('/reflection')
  const isAuthPage = path === '/login' || path === '/auth'
  const isRoot = path === '/'

  // 5. REDIRECT LOGIC

  // Scenario A: Unauthenticated User tries to access App Pages
  // -> Kick them to Login
  if ((isDashboard || isReflection) && !user) {
    const loginUrl = new URL('/login', request.url)
    // Optional: Add ?next=... param to redirect back after login
    // loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Scenario B: Logged-in User tries to access Landing or Login
  // -> Send them straight to the Dashboard (The Studio)
  if ((isRoot || isAuthPage) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 6. Return the response (with any updated cookies)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images (.svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
