import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLoadingScreen from './components/auth/AuthLoadingScreen';
import { useAuthSession } from './lib/auth-context';

const AppShell = lazy(() => import('./components/app/AppShell'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CategoriesPage = lazy(() => import('./pages/app/CategoriesPage'));
const BillsPage = lazy(() => import('./pages/app/BillsPage'));
const HomePage = lazy(() => import('./pages/app/HomePage'));
const IncomePage = lazy(() => import('./pages/app/IncomePage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));
const TransactionsPage = lazy(() => import('./pages/app/TransactionsPage'));

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

function AppRouteLoading() {
  return (
    <div className="flex min-h-[14rem] items-center justify-center rounded-[2rem] border border-[rgba(var(--fundly-primary-rgb),0.10)] bg-white/75 px-6 py-10 text-center shadow-[0_18px_50px_rgba(var(--fundly-deep-rgb),0.08)]">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--fundly-accent)]">Loading</p>
        <p className="mt-3 text-base font-bold text-[var(--fundly-primary)]">Bringing this page in now...</p>
        <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.68)]">
          We&apos;re loading only the section you need to keep the initial app bundle lighter.
        </p>
      </div>
    </div>
  );
}

function withAuthPageFallback(element) {
  return <Suspense fallback={<AuthLoadingScreen />}>{element}</Suspense>;
}

function withAppPageFallback(element) {
  return <Suspense fallback={<AppRouteLoading />}>{element}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SessionRedirect />} />
      <Route
        path="/login"
        element={
          <LoginRoute>
            {withAuthPageFallback(<LoginPage />)}
          </LoginRoute>
        }
      />
      <Route path="/forgot-password" element={withAuthPageFallback(<ForgotPasswordPage />)} />
      <Route path="/reset-password" element={withAuthPageFallback(<ResetPasswordPage />)} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            {withAuthPageFallback(<AppShell />)}
          </ProtectedRoute>
        }
      >
        <Route index element={withAppPageFallback(<HomePage />)} />
        <Route path="income" element={withAppPageFallback(<IncomePage />)} />
        <Route path="bills" element={withAppPageFallback(<BillsPage />)} />
        <Route path="transactions" element={withAppPageFallback(<TransactionsPage />)} />
        <Route path="categories" element={withAppPageFallback(<CategoriesPage />)} />
        <Route path="settings" element={withAppPageFallback(<SettingsPage />)} />
      </Route>
      <Route path="*" element={<SessionRedirect />} />
    </Routes>
  );
}
