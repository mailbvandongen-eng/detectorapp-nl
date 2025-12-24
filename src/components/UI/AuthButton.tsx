import { useAuth } from '../../hooks/useAuth'

export function AuthButton() {
  const { isAuthenticated, user, loginAnonymous, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <button
        onClick={loginAnonymous}
        className="fixed top-2.5 left-[270px] z-[900] px-3 py-1.5 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
      >
        Inloggen
      </button>
    )
  }

  return (
    <button
      onClick={logout}
      className="fixed top-2.5 left-[270px] z-[900] px-3 py-1.5 bg-gray-600 text-white text-sm rounded shadow hover:bg-gray-700"
      title={user?.uid || 'User'}
    >
      Uitloggen
    </button>
  )
}
