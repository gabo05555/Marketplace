import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Handle auth callback
  if (req.nextUrl.pathname === '/auth/callback') {
    const supabase = createMiddlewareClient({ req, res })
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    
    if (code) {
      try {
        await supabase.auth.exchangeCodeForSession(code)
      } catch (error) {
        console.error('Auth error:', error)
      }
    }
    
    // Redirect to home
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

export const config = {
  matcher: '/auth/callback'
}
