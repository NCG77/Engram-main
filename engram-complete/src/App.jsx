import React, { Suspense, lazy, Component } from "react";
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
const Auth = lazy(() => import("./components/auth/Auth"));
const NewPage = lazy(() => import("./components/new_page/new_page"));
const ChatInterface = lazy(() => import("./components/chat_page/ChatInterface"));
const DiaryApp = lazy(() => import("./components/diary_page/DiaryApp"));
const LandingPage = lazy(() => import("./components/LandingPage/landing"));
const PageLoader = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" }}>
    Loading...
  </div>
);
const ErrorFallback = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
    <div>
      <h2>Failed to load page</h2>
      <p>Please try refreshing or go back to the <a href="/">home page</a></p>
    </div>
  </div>
);
class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("Lazy loading error:", error);
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
const PublicRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/new_page" replace /> : element;
};
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return !token ? <Navigate to="/auth" replace /> : element;
};
const App = () => {
  return (
    <div className="main-app-container">
      <Suspense fallback={<PageLoader />}>
        <LazyErrorBoundary>
          <Routes>
            <Route path="/" element={<PublicRoute element={<LandingPage />} />} />
            <Route path="/auth" element={<PublicRoute element={<Auth />} />} />
            <Route path="/new_page" element={<ProtectedRoute element={<NewPage />} />} />
            <Route path="/chat" element={<ProtectedRoute element={<ChatInterface />} />} />
            <Route path="/diary" element={<ProtectedRoute element={<DiaryApp />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LazyErrorBoundary>
      </Suspense>
    </div>
  );
};
export default App;