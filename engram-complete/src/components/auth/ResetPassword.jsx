import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./styles.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!token || token === "invalid") {
      setMessage("This reset link is invalid or has expired.");
      setMessageType("error");
      return;
    }
    if (!password || password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setMessageType("error");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || data.error || "Could not reset password.");
        setMessageType("error");
        return;
      }
      setMessage(data.message || "Password updated. You can sign in now.");
      setMessageType("success");
      setTimeout(() => navigate("/auth"), 1200);
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container auth-simple">
        <div className="panel auth-form-pane">
          <form onSubmit={handleSubmit}>
            {message && <div className={`message-box ${messageType}`}>{message}</div>}
            <h1 className="auth-title">Set a new password</h1>
            <p className="auth-copy">
              Choose a new password for your Engram account. This link expires in one hour.
            </p>
            <div className="input-group">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`auth-btn ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
            <div className="mobile-toggle">
              <p>Back to</p>
              <Link to="/auth" className="toggle-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Almost there</h1>
              <p>After you save a new password, sign in and continue your diary.</p>
              <button className="auth-btn ghost" onClick={() => navigate("/auth")}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
