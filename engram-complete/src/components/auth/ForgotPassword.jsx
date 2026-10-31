import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setResetUrl("");

    if (!email) {
      setMessage("Please enter your email.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || data.error || "Could not send reset link.");
        setMessageType("error");
        return;
      }
      setMessage(data.message || "If an account exists, you can reset the password.");
      setMessageType("success");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
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
            <h1 className="auth-title">Forgot password</h1>
            <p className="auth-copy">
              Enter the email on your Engram account. We will open a one-hour reset link.
            </p>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`auth-btn ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
            {resetUrl && (
              <button
                type="button"
                className="auth-btn"
                onClick={() => {
                  try {
                    const url = new URL(resetUrl, window.location.origin);
                    navigate(`${url.pathname}${url.search}`);
                  } catch (err) {
                    navigate("/reset-password");
                  }
                }}
              >
                Continue to reset
              </button>
            )}
            <div className="mobile-toggle">
              <p>Remembered it?</p>
              <Link to="/auth" className="toggle-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Welcome back</h1>
              <p>If you remember your password, sign in and keep going.</p>
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

export default ForgotPassword;
