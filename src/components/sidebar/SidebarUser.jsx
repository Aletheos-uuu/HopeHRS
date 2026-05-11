import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function getInitials(user) {
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return user?.email?.[0]?.toUpperCase() ?? '?'
}

export default function SidebarUser({ user }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = getInitials(user)
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'User'

  return (
    <div className="px-3 py-3 border-t border-gray-100">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-semibold text-indigo-700">{initials}</span>
          )}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{displayName}</p>
          <p className="text-[10px] text-gray-400 truncate">{user?.email ?? ''}</p>
        </div>

        {/* Sign-out button */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-all"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}