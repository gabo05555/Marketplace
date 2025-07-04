import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

export const useUnreadMessages = (user) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Function to fetch unread messages count
    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('seller_id', user.id)
          .eq('read_by_seller', false)

        if (error) {
          console.error('Error fetching unread messages:', error)
          setUnreadCount(0)
        } else {
          setUnreadCount(data?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching unread messages:', error)
        setUnreadCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `seller_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload)
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `seller_id=eq.${user.id}`
        },
        (payload) => {
          // If message was marked as read, decrease count
          if (payload.new.read_by_seller && !payload.old.read_by_seller) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return { unreadCount, loading }
}
