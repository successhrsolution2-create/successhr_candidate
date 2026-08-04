import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCandidateSession } from '../store/candidateAuthSlice'
import Skeleton from './Skeleton'

/**
 * Guards candidate-facing routes (ApplyPage).
 * Unauthenticated visitors are redirected to /candidate-login
 * with the original path saved in location.state so we can
 * return them after login.
 */
export default function CandidateProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { authenticated, checking } = useSelector((s) => s.candidateAuth)

  // Verify cookie-based session once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { dispatch(fetchCandidateSession()) }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <Skeleton rows={0} />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/candidate-login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}

