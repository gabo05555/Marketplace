import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback received:', { code, token_hash, type, next })

  if (code) {
    // Handle OAuth code flow
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('OAuth authentication successful')
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      console.error('OAuth error:', error)
    } catch (error) {
      console.error('OAuth callback error:', error)
    }
  }

  if (token_hash && type) {
    // Handle email/OTP verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      })
      
      if (!error) {
        console.log('Email verification successful')
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      console.error('Email verification error:', error)
    } catch (error) {
      console.error('Email verification callback error:', error)
    }
  }

  // If no valid auth parameters, just redirect to home
  console.log('No valid auth parameters, redirecting to home')
  return NextResponse.redirect(`${origin}/`)
}
