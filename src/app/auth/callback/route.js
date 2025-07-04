import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Log all parameters for debugging
  console.log('Auth callback URL:', request.url)
  console.log('Search params:', Object.fromEntries(searchParams.entries()))
  
  // Simply redirect to home - let the client handle the auth
  return NextResponse.redirect(`${origin}/`)
}
