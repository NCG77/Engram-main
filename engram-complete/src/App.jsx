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

const PageLoader = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" }}>
    Loading...
  </div>
);

const App = () => {
  return (
    <div className="main-app-container">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new_page" element={<NewPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/diary" element={<DiaryApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;