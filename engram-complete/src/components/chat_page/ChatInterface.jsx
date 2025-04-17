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
  const userName = localStorage.getItem("userName");
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

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
  }, [messages]);

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setError(null); // Clear any previous errors

    try {
      const requestMessages = [
        {
          role: "system",
          content: generateSystemMessage(personality, userName),
        },
        ...messages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({ role: msg.role, content: msg.content })),
        { role: "user", content: input },
      ];

      console.log(
        "Request Payload:",
        JSON.stringify(
          {
            model: "llama3-8b-8192",
            messages: requestMessages,
            temperature: 0.7,
            max_tokens: 150,
          },
          null,
          2
        )
      );

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: requestMessages,
            temperature: 0.7,
            max_tokens: 150,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from API:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0].message) {
        const botMessage = {
          role: "assistant",
          content: data.choices[0].message.content.replace(/[*_~]/g, ""),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Invalid response format from API");
      }
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
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter key press
      sendMessage();
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!personality) {
    return <div>Loading personality...</div>;
  }

  const handleBack = () => {
    navigate("/");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
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
              >
                <div className="message-content">{message.content}</div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="chat-input-area">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
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
                type="submit"
                className="send-button"
                disabled={!input.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatInterface;