'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'

export default function Marketplace() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (!sessionUser) setShowModal(true)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        setShowModal(false)
      } else {
        setShowModal(true)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowModal(true)
  }

  return (
    <main className="p-8 max-w-6xl mx-auto relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🛍️ My Marketplace</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hello, {user.email}</span>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Products */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-xl shadow-md p-4 flex flex-col items-center"
          >
            <div className="w-full h-40 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500">
              Image
            </div>
            <h2 className="text-lg font-semibold">Product {i + 1}</h2>
            <p className="text-sm text-gray-600 mb-2">This is a cool item.</p>
            <span className="font-bold text-blue-500 mb-2">₱{(i + 1) * 100}</span>
            <button className="bg-blue-500 text-white px-4 py-1 rounded">
              Buy Now
            </button>
          </div>
        ))}
      </section>

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <input
              type="email"
              className="border p-2 w-full mb-4"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 w-full rounded"
              onClick={handleLogin}
            >
              Send Magic Link
            </button>
            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
          </div>
        </div>
      )}
    </main>
  )
}
