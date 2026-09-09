// ProtectedRoute.jsx
// This component checks if the user is logged in before allowing access to a page
// If not logged in, it redirects to /login

import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  // Check localStorage for saved user info
  const user = localStorage.getItem('medistock_user')

  if (!user) {
    // Not logged in → send to login page
    return <Navigate to="/login" replace />
  }

  // Logged in → show the actual page
  return children
}

export default ProtectedRoute
