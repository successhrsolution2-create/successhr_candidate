import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Skeleton from './Skeleton'

const defaultPath = (role) => {
  if (['superAdmin', 'candidateAdmin'].includes(role)) return '/admin/cms/candidates'
  return '/login'
}

export default function ProtectedRoute({ roles, children }) {
  const { token, user, checking } = useSelector((state) => state.auth)

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <Skeleton rows={0} />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={defaultPath(user?.role)} replace />
  }

  return children
}
