export default function NotificationBadge({ count, className = '' }) {
  if (!count || count === 0) return null

  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none 
                  text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg 
                  border-2 border-white animate-pulse-subtle hover:from-red-600 hover:to-red-700 
                  transition-all duration-200 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
