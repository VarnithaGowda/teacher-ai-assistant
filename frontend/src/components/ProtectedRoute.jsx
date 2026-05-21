/**
 * components/ProtectedRoute.jsx - Redirect unauthenticated users to login
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader message="Checking authentication..." />
  if (!user) return <Navigate to="/login" replace />

  return children
}
