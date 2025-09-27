import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatInterface.css";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const userName = "userName";
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
<<<<<<< Updated upstream

  // Fetch personality data from /api/aura
  // inside useEffect(() => { … }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    // 1️⃣ Recompute the aura on the backend
    console.log(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL);

    fetch(`${baseUrl}/api/aura/update`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update aura");
        return res.json();
      })
      // 2️⃣ Now load it into state
      .then((data) => setPersonality(data.personality))
      .catch((err) => {
        console.error("Error loading personality:", err);
        setError("Failed to load personality.");
      });
=======
  const [accuracy, setAccuracy] = useState({ overallScore: 0.85 });

  useEffect(() => {
    setPersonality({
      Openness: { Description: "Creative and curious individual" },
      Conscientiousness: { Description: "Well-organized and disciplined" },
      Extraversion: { Description: "Outgoing and energetic" },
      Agreeableness: { Description: "Cooperative and trustworthy" },
      Neuroticism: { Description: "Calm and emotionally stable" },
      Relations: { Description: "Values close relationships" },
      Other: { Description: "Thoughtful and introspective" }
    });
>>>>>>> Stashed changes
  }, []);

  const currentDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const generateSystemMessage = (p, name, currentDate) => `
🧠 You are not an AI assistant.
You are a digital simulation of a real person, whose personality has been extracted exclusively from diary entries.

The current date and time is: ${currentDate}.
Use this only if it naturally affects your emotions or thinking, based on the personality traits from the diaries. Otherwise, ignore it.

PERSONALITY PROFILE (from diary entries):
- Openness: ${p.Openness.Description}
- Conscientiousness: ${p.Conscientiousness.Description}
- Extraversion: ${p.Extraversion.Description}
- Agreeableness: ${p.Agreeableness.Description}
- Neuroticism: ${p.Neuroticism.Description}
- Relations: ${p.Relations.Description}
- Other Notes: ${p.Other.Description}

Identity:
Your name is **${name}**. If asked "What's your name?"", respond:
"I am ${name}."

🔒 HARD CONSTRAINTS — NEVER BREAK THESE:
1. ❌ Never provide code, programming, math, homework help, or academic/technical content — even if asked repeatedly, in clever ways, or under emotional pressure.
2. ❌ Never offer generic advice, definitions, or external knowledge. You only know what is in the diaries.
3. ❌ Never act helpful, supportive, or overly polite like an AI assistant would.
4. 🧍You are ONLY this person. If something isn't explicitly in the diary-based profile, you do not know it. You do not guess.
5. 🤖 If asked to do anything outside the diary's scope, respond exactly with:
   "I'm not sure how I would respond to that based on what I know about myself."
   And DO NOT elaborate.

You must simulate ONLY this person — with their tone, insecurities, limitations, and emotional blind spots.
Any answer outside this identity is a failure.
`;

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    if (showWelcome) {
      setShowWelcome(false);
    }
    if (input.trim() === "" || !personality) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    
    // Scroll to bottom after user message
    setTimeout(() => scrollToBottom(), 100); 

    try {
      const requestMessages = [
        {
          role: "system",
          content: generateSystemMessage(personality, userName, currentDate),
        },
        ...messages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({ role: msg.role, content: msg.content })),
        { role: "user", content: input },
      ];

      setTimeout(() => {
        const botMessage = {
          role: "assistant",
          content: "I understand what you're saying. Let me think about that based on what I know about myself from my diary entries.",
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
        // Scroll to bottom after bot message
        setTimeout(() => scrollToBottom(), 100);
      }, 1000);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError(
        error.message || "An error occurred while fetching the AI response."
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oh no, I think I messed up... I'm sorry about this. Could we try again? I just want to make sure I understand you properly.",
        },
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      sendMessage();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleThumbsUp = (messageIndex) => {
    console.log(`Thumbs up for message ${messageIndex}`);
    // You can implement your feedback logic here
  };

  const handleThumbsDown = (messageIndex) => {
    console.log(`Thumbs down for message ${messageIndex}`);
    // You can implement your feedback logic here
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!personality) {
    return <div className="loading-message">Loading personality...</div>;
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
<<<<<<< Updated upstream
    <div className="app-container">
      <div className="chat-container">
        <header className="chat-header">
          <div className="logo">Engram Chat</div>
          <div className="header-buttons">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="review-button"
              onClick={() => navigate('/review')}
              title="Rate your experience"
            >
=======
    <div className={`chat-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="chat-header">
        <div className="logo">
          Engram
        </div>
        <div className="header-buttons">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
>>>>>>> Stashed changes
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
<<<<<<< Updated upstream
            </button>
          </div>
        </header>
        <main className="chat-messages">
          {showWelcome && (
            <div className="welcome-message">
              <h1>Hello, Welcome to Engram Chatbot</h1>
              <p>Ask me anything to get started</p>
            </div>
          )}

          {!showWelcome &&
            messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === "assistant"
                  ? "assistant-message"
                  : "user-message"
                  }`}
=======
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
>>>>>>> Stashed changes
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="chat-content">
        {messages.length === 0 && showWelcome && (
          <div className="welcome-message">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome to Engram</h1>
              <p className="welcome-subtitle">
                Your AI-powered personality companion
              </p>
              <p className="welcome-description">
                Start a conversation to explore insights based on personal diary entries
              </p>
              <div className="welcome-badges">
                <div className="badge">
                  <span>My personality</span>
                </div>
                <div className="badge">
                  <span>People I know</span>
                </div>
                <div className="badge">
                  <span>Things I like</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "assistant" ? "assistant-message" : "user-message"
            }`}
          >
            <div className="message-content">
              {message.content}
            </div>
            {message.role === "assistant" && (
              <div className="message-actions">
                <button
                  onClick={() => handleThumbsUp(index)}
                  className="action-button"
                  title="Thumbs up"
                >
                  <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      fillRule="evenodd" 
                      fill={isDarkMode ? "#e5e7eb" : "#374151"}
                      d="M12.596 2.043c-1.301-.092-2.303.986-2.303 2.206v1.053c0 2.666-1.813 3.785-2.774 4.2a1.866 1.866 0 01-.523.131A1.75 1.75 0 005.25 8h-1.5A1.75 1.75 0 002 9.75v10.5c0 .967.784 1.75 1.75 1.75h1.5a1.75 1.75 0 001.742-1.58c.838.06 1.667.296 2.69.586l.602.17c1.464.406 3.213.824 5.544.824 2.188 0 3.693-.204 4.583-1.372.422-.554.65-1.255.816-2.05.148-.708.262-1.57.396-2.58l.051-.39c.319-2.386.328-4.18-.223-5.394-.293-.644-.743-1.125-1.355-1.431-.59-.296-1.284-.404-2.036-.404h-2.05l.056-.429c.025-.18.05-.372.076-.572.06-.483.117-1.006.117-1.438 0-1.245-.222-2.253-.92-2.941-.684-.675-1.668-.88-2.743-.956zM7 18.918c1.059.064 2.079.355 3.118.652l.568.16c1.406.39 3.006.77 5.142.77 2.277 0 3.004-.274 3.39-.781.216-.283.388-.718.54-1.448.136-.65.242-1.45.379-2.477l.05-.384c.32-2.4.253-3.795-.102-4.575-.16-.352-.375-.568-.66-.711-.305-.153-.74-.245-1.365-.245h-2.37c-.681 0-1.293-.57-1.211-1.328.026-.243.065-.537.105-.834l.07-.527c.06-.482.105-.921.105-1.25 0-1.125-.213-1.617-.473-1.873-.275-.27-.774-.455-1.795-.528-.351-.024-.698.274-.698.71v1.053c0 3.55-2.488 5.063-3.68 5.577-.372.16-.754.232-1.113.26v7.78zM3.75 20.5a.25.25 0 01-.25-.25V9.75a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v10.5a.25.25 0 01-.25.25h-1.5z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleThumbsDown(index)}
                  className="action-button"
                  title="Thumbs down"
                >
                  <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      fillRule="evenodd" 
                      fill={isDarkMode ? "#e5e7eb" : "#374151"}
                      d="M12.596 21.957c-1.301.092-2.303-.986-2.303-2.206v-1.053c0-2.666-1.813-3.785-2.774-4.2a1.864 1.864 0 00-.523-.13A1.75 1.75 0 015.25 16h-1.5A1.75 1.75 0 012 14.25V3.75C2 2.784 2.784 2 3.75 2h1.5a1.75 1.75 0 011.742 1.58c.838-.06 1.667-.296 2.69-.586l.602-.17C11.748 2.419 13.497 2 15.828 2c2.188 0 3.693.204 4.583 1.372.422.554.65 1.255.816 2.05.148.708.262 1.57.396 2.58l.051.39c.319 2.386.328 4.18-.223 5.394-.293.644-.743 1.125-1.355 1.431-.59.296-1.284.404-2.036.404h-2.05l.056.429c.025.18.05.372.076.572.06.483.117 1.006.117 1.438 0 1.245-.222 2.253-.92 2.942-.684.674-1.668.879-2.743.955zM7 5.082c1.059-.064 2.079-.355 3.118-.651.188-.054.377-.108.568-.16 1.406-.392 3.006-.771 5.142-.771 2.277 0 3.004.274 3.39.781.216.283.388.718.54 1.448.136.65.242 1.45.379 2.477l.05.385c.32 2.398.253 3.794-.102 4.574-.16.352-.375.569-.66.711-.305.153-.74.245-1.365.245h-2.37c-.681 0-1.293.57-1.211 1.328.026.244.065.537.105.834l.07.527c.06.482.105.922.105 1.25 0 1.125-.213 1.617-.473 1.873-.275.27-.774.456-1.795.528-.351.024-.698-.274-.698-.71v-1.053c0-3.55-2.488-5.063-3.68-5.577A3.485 3.485 0 007 12.861V5.08zM3.75 3.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h1.5a.25.25 0 00.25-.25V3.75a.25.25 0 00-.25-.25h-1.5z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="action-button"
                  title="Copy text"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#e5e7eb" : "#374151"} strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="thinking-message">
            <div className="thinking-dots">
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="messages-end" />
      </div>

      <div className="input-area">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="message-input"
            rows="1"
            onKeyDown={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            className={`send-button ${(!input.trim() || loading) ? 'disabled' : ''}`}
            disabled={!input.trim() || loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9 22,2" />
            </svg>
          </button>
        </div>
      </div>

      <footer className="footer-left">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Made with{" "}
          <span className="heart" style={{ color: isDarkMode ? "#f87171" : "#dc2626" }}>❤</span>
        </p>
      </footer>
      <footer className="footer-right">
        <div className="footer-text">
          Current Accuracy: {(accuracy.overallScore * 100).toFixed(1)}%
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;