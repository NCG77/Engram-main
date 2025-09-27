import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Auth = () => {
  const [signIn, toggle] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="page-wrapper">
      <div className="container">
        {/* SIGN UP PANEL */}
        <div className={`sign-up-container ${!signIn ? "active" : ""}`}>
          <form onSubmit={handleSignUp}>
            {message && <div className={`message-box ${messageType}`}>{message}</div>}
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn">Sign Up</button>
          </form>
        </div>

        {/* SIGN IN PANEL */}
        <div className={`sign-in-container ${signIn ? "active" : ""}`}>
          <form onSubmit={handleSignIn}>
            {message && <div className={`message-box ${messageType}`}>{message}</div>}
            <h1>Sign in</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="#" className="anchor">Forgot your password?</a>
            <button type="submit" className="btn">Sign In</button>
          </form>
        </div>

        {/* OVERLAY PANELS */}
        <div className={`overlay-container ${!signIn ? "right-panel-active" : ""}`}>
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="white">Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button
                className="ghost btn"
                onClick={() => { clearMessage(); toggle(true); }}
=======
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
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-btn">Sign Up</button>
            <div className="mobile-toggle">
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={() => { clearMessage(); toggle(true); }}
                className="toggle-link"
>>>>>>> Stashed changes
              >
                Sign In
              </button>
            </div>
<<<<<<< Updated upstream

            <div className="overlay-panel overlay-right">
              <h1 className="white">Welcome!</h1>
              <p>Enter your details and start your journey with us</p>
              <button
                className="ghost btn"
                onClick={() => { clearMessage(); toggle(false); }}
=======
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
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <a href="#" className="forgot-password">Forgot your password?</a>
            <button type="submit" className="auth-btn">Sign In</button>
            <div className="mobile-toggle">
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={() => { clearMessage(); toggle(false); }}
                className="toggle-link"
>>>>>>> Stashed changes
              >
                Sign Up
              </button>
            </div>
<<<<<<< Updated upstream
=======
          </form>
        </div>

        <div className={`overlay-container ${!signIn ? "right-panel-active" : ""}`}>
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="overlay-title">Welcome Back</h1>
              <p>Access your Engram account and continue your journey</p>
              <button
                className="auth-btn ghost"
                onClick={() => { clearMessage(); toggle(true); }}
              >
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Hello, Friend!</h1>
              <p>Enter your details and start your journey with Engram</p>
              <button
                className="auth-btn ghost"
                onClick={() => { clearMessage(); toggle(false); }}
              >
                Sign Up
              </button>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;