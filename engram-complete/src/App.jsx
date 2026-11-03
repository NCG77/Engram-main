import React, { Suspense, lazy } from "react";
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";

const Auth = lazy(() => import("./components/auth/Auth"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const NewPage = lazy(() => import("./components/new_page/new_page"));
const ChatInterface = lazy(() => import("./components/chat_page/ChatInterface"));
const DiaryApp = lazy(() => import("./components/diary_page/DiaryApp"));
const LandingPage = lazy(() => import("./components/LandingPage/landing"));
const PrivacyPolicy = lazy(() => import("./components/policies/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/policies/TermsOfService"));

const PageLoader = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--font-claude-sans, system-ui, sans-serif)", color: "#111" }}>
    Loading...
  </div>
);

// Check if user has an active token
const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

// Route for authenticated users only (/new_page, /chat, /diary)
// If logged out: disabled -> redirects to "/" (landing page)
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

// Route for guests / logged-out users only ("/", "/auth")
// If logged in: disabled -> redirects to "/new_page"
const GuestOnlyRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/new_page" replace /> : children;
};

const App = () => {
  return (
    <div className="main-app-container">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page: disabled if logged in -> goes to /new_page */}
          <Route
            path="/"
            element={
              <GuestOnlyRoute>
                <LandingPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <GuestOnlyRoute>
                <Auth />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestOnlyRoute>
                <ForgotPassword />
              </GuestOnlyRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Workspace & apps: disabled if logged out -> goes to / */}
          <Route
            path="/new_page"
            element={
              <ProtectedRoute>
                <NewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diary"
            element={
              <ProtectedRoute>
                <DiaryApp />
              </ProtectedRoute>
            }
          />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Catch-all: take user to /new_page if logged in, or / if logged out */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated() ? "/new_page" : "/"} replace />
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
