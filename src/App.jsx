import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppShell from './components/app/AppShell.jsx';
import AuthLayout from './components/auth/AuthLayout.jsx';
import LoadingScreen from './components/auth/LoadingScreen.jsx';
import { useAuth } from './lib/auth-context.jsx';
import { isSupabaseConfigured } from './lib/supabase.js';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import CategoriesPage from './pages/app/CategoriesPage.jsx';
import HomePage from './pages/app/HomePage.jsx';
import SettingsPage from './pages/app/SettingsPage.jsx';

function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Settling things softly..." />;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Opening your quiet space..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function SetupPage() {
  return (
    <AuthLayout
      eyebrow="Setup"
      title="Fundly is ready for Supabase."
      subtitle="Add your project URL and anon key to start the calm flow."
    >
      <div className="space-y-4 text-sm text-ocean/80">
        <p className="rounded-3xl border border-ink/10 bg-surface px-5 py-4 shadow-quiet">
          Create a <code className="rounded bg-paper px-1.5 py-0.5 text-xs">.env</code> file
          using <code className="rounded bg-paper px-1.5 py-0.5 text-xs">.env.example</code> and
          restart the dev server.
        </p>
        <pre className="overflow-x-auto rounded-3xl border border-ink/10 bg-ink px-5 py-4 text-xs text-paper">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    </AuthLayout>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/app' : '/login'} replace />;
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupPage />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </HashRouter>
  );
}
