import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import BankruptcyPopup from './components/BankruptcyPopup';
import ComingSoon from './components/ComingSoon';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import OfflineDetector from './components/OfflineDetector';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages for better performance and code splitting
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/legal/CookiesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));

// FE-003 — the following pages stay vendored but aren't routed until
// their backing endpoints land in the Python API. Routes point to
// ComingSoon instead. Re-enable each route (import + <Route element>)
// once the corresponding BE-* task merges:
//   ShopPage          → BE-013/014
//   GameHistoryPage   → BE-021+
//   CasinoStatsPage   → BE-027
//   CreditPage        → BE-020
//   SlotsPage         → BE-023
//   RoulettePage      → BE-022
//   ContactPage       → (not tracked yet — low priority)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Public pages */}
            <Route path="/contact" element={<ComingSoon feature="Contact form" />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Error pages */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/error/:statusCode" element={<ErrorPage />} />

            {/* Legal Pages - Public */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* FE-003 — routes below show ComingSoon until BE lands. */}
                <Route path="/history" element={<ComingSoon feature="Game history" />} />
                <Route path="/shop" element={<ComingSoon feature="Shop" />} />
                <Route path="/casino-stats" element={<ComingSoon feature="Casino stats" />} />
                <Route path="/credit" element={<ComingSoon feature="Loans" />} />
              </Route>
              {/* Game pages — full screen when re-enabled */}
              <Route path="/games/slots" element={<ComingSoon feature="Slots" />} />
              <Route path="/games/roulette" element={<ComingSoon feature="Roulette" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Cookie Consent Banner - shown on first visit */}
        <CookieConsent />

        {/* Offline Detection */}
        <OfflineDetector />

        {/* Bankruptcy Popup */}
        <BankruptcyPopup />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '8px',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
