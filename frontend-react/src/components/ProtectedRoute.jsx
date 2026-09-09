import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/storage';

// Only allows access if user is logged in (session in localStorage)
export default function ProtectedRoute({ children }) {
  const session = getSession();
  return session ? children : <Navigate to="/login" replace />;
}
