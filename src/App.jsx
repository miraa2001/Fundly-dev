import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/app/AppShell';
import AuthLoadingScreen from './components/auth/AuthLoadingScreen';
import { useAuthSession } from './lib/auth-context';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CategoriesPage from './pages/app/CategoriesPage';
import BillsPage from './pages/app/BillsPage';
import HomePage from './pages/app/HomePage';
import SettingsPage from './pages/app/SettingsPage';
import TransactionsPage from './pages/app/TransactionsPage';

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
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="bills" element={<BillsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<SessionRedirect />} />
    </Routes>
  );
}
