import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLoadingScreen from './components/auth/AuthLoadingScreen';
import { useAuthSession } from './lib/auth-context';
import AppPage from './pages/AppPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function SessionRedirect() {
  const { isAuthenticated, isAuthLoading } = useAuthSession();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
}

function LoginRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuthSession();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/app" replace /> : children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuthSession();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SessionRedirect />} />
      <Route
        path="/login"
        element={
          <LoginRoute>
            <LoginPage />
          </LoginRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<SessionRedirect />} />
    </Routes>
  );
}
