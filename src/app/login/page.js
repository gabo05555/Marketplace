'use client'
import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {user ? (
        <div className="bg-green-100 p-4 rounded mb-4">
          Logged in as: <strong>{user.email}</strong>

          {/* ✅ Logout button goes here */}
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2"
            onClick={async () => {
              await supabase.auth.signOut()
              setUser(null)
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <input
            className="border p-2 w-full mb-4"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2"
            onClick={handleLogin}
          >
            Send Magic Link
          </button>
        </>
      )}

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
