import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const EyeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Auth = () => {
  const [signIn, toggle] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!name || !email || !password) {
      setMessage("Please fill out all fields.");
      setMessageType("error");
      return;
    }
    setIsSigningUp(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please sign in.");
        setMessageType("success");
        toggle(true);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setMessage(data.error || data.message || "Registration failed.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setMessage("An error occurred during registration.");
      setMessageType("error");
    } finally {
      setIsSigningUp(false);
    }
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      setMessageType("error");
      return;
    }
    setIsSigningIn(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        navigate("/new_page");
      } else {
        setMessage(data.message || "Login failed.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("An error occurred while logging in.");
      setMessageType("error");
    } finally {
      setIsSigningIn(false);
    }
  };
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className={`panel sign-up-container ${!signIn ? "active" : ""}`}>
          <form onSubmit={handleSignUp}>
            {message && <div className={`message-box ${messageType}`}>{message}</div>}
            <h1 className="auth-title">Create Account</h1>
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className={`auth-btn ${isSigningUp ? "loading" : ""}`}
              disabled={isSigningUp}
              aria-busy={isSigningUp}
            >
              {isSigningUp && <span className="btn-spinner" aria-hidden="true" />}
              {isSigningUp ? "Signing Up..." : "Sign Up"}
            </button>
            <div className="mobile-toggle">
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={() => { clearMessage(); toggle(true); }}
                className="toggle-link"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
        <div className={`panel sign-in-container ${signIn ? "active" : ""}`}>
          <form onSubmit={handleSignIn}>
            {message && <div className={`message-box ${messageType}`}>{message}</div>}
            <h1 className="auth-title">Sign In</h1>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className={`auth-btn ${isSigningIn ? "loading" : ""}`}
              disabled={isSigningIn}
              aria-busy={isSigningIn}
            >
              {isSigningIn && <span className="btn-spinner" aria-hidden="true" />}
              {isSigningIn ? "Signing In..." : "Sign In"}
            </button>
            <div className="mobile-toggle">
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={() => { clearMessage(); toggle(false); }}
                className="toggle-link"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <div className={`overlay-container ${!signIn ? "right-panel-active" : ""}`}>
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="overlay-title">Hello!</h1>
              <p>Enter your details and start your journey with Engram</p>
              <button
                className="auth-btn ghost"
                onClick={() => { clearMessage(); toggle(true); }}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Welcome Back</h1>
              <p>Access your Engram account and continue your journey</p>
              <button
                className="auth-btn ghost"
                onClick={() => { clearMessage(); toggle(false); }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Auth;