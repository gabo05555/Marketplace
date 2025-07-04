export default function NotificationBadge({ count, className = '' }) {
  if (!count || count === 0) return null

  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
