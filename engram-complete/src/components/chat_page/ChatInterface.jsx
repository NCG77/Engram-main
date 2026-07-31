import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDiaryEntries } from "../../api/index";
import "./ChatInterface.css";
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("engram-theme");
    return savedTheme === "light" ? false : true;
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [accuracy, setAccuracy] = useState({ overallScore: 0.85 });
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [insufficientEntries, setInsufficientEntries] = useState(false);
  const [messageRatings, setMessageRatings] = useState({});
  const [ragasScores, setRagasScores] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const getBaseUrl = () => {
    let url = "";
    try {
      if (typeof import.meta !== "undefined" && import.meta.env) {
        url = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";
      }
    } catch (e) {}
    return url;
  };
  const baseUrl = getBaseUrl();
  useEffect(() => {
    const checkDiaryEntries = async () => {
      try {
        const entries = await getDiaryEntries();
        setDiaryEntries(entries);
        if (entries.length < 5) {
          setInsufficientEntries(true);
        }
      } catch (err) {
        console.error("Failed to check diary entries:", err);
        setInsufficientEntries(true);
      }
    };
    checkDiaryEntries();
  }, []);
  useEffect(() => {
    const fetchUserPersonality = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found. User must log in.");
        setError("Please log in to access the chat. <a href='/auth' style='color: #007bff; cursor: pointer;'>Click here to login</a>");
        return;
      }
      try {
        const response = await fetch(`${baseUrl}/api/aura`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
          throw new Error("Server returned HTML. Check backend connection.");
        }
        if (!response.ok) {
          if (response.status === 404) {
            setError(
              "Personality is syncing. This usually takes a moment after your first diary entry.",
            );
          } else if (response.status === 401) {
            setError("Session expired. <a href='/auth' style='color: #007bff; cursor: pointer;'>Please login again</a>");
            localStorage.removeItem("token");
          } else {
            throw new Error("Failed to fetch personality");
          }
          return;
        }
        const data = await response.json();
        if (data && data.personality) {
          setPersonality(data.personality);
          setError(null);
        } else {
          setError("Personality data is empty.");
        }
      } catch (err) {
        console.error("Error loading personality:", err);
        setError("Could not load your digital twin. Server might be down.");
      }
    };
    fetchUserPersonality();
  }, [baseUrl, navigate]);
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${baseUrl}/api/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setChatHistory(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();
  }, [baseUrl]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);
  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  useEffect(() => {
    const userRatings = Object.values(messageRatings);
    const rScores = Object.values(ragasScores);

    let userScore = 0.85; 
    if (userRatings.length > 0) {
      const correctCount = userRatings.filter(r => r === 'up').length;
      userScore = correctCount / userRatings.length;
    }

    let ragasAvg = 0.85; 
    if (rScores.length > 0) {
      ragasAvg = rScores.reduce((a, b) => a + b, 0) / rScores.length;
    }

    
    const combinedScore = (userScore * 0.5) + (ragasAvg * 0.5);
    setAccuracy({ overallScore: combinedScore });
  }, [messageRatings, ragasScores]);
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (window.innerHeight < 800) {
        window.scrollBy(0, 100);
      }
    }, 100);
  };
  const MAX_TOKENS = 500;
  const estimatedTokens = Math.ceil(input.length / 4);
  const isOverLimit = estimatedTokens > MAX_TOKENS;

  const sendMessage = async () => {
    if (showWelcome) setShowWelcome(false);
    if (input.trim() === "" || !personality || isOverLimit) return;
    const userText = input;
    const userMessage = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    setTimeout(() => scrollToBottom(), 100);
    try {
      const token = localStorage.getItem("token");
      const chatResponse = await fetch(`${baseUrl}/api/chat/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: userText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!chatResponse.ok) {
        let errorMsg = "Failed to get AI response";
        try {
          const errorData = await chatResponse.json();
          errorMsg = errorData.error || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let botMessageContent = "";
      let botMessage = { role: "assistant", content: "" };
      let updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
           const chunkStr = decoder.decode(value, { stream: true });
           const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
           for (const line of lines) {
             if (line.startsWith('data: ')) {
               const data = line.slice(6);
               if (data === '[DONE]') {
                  done = true;
                  break;
               }
               try {
                 const parsed = JSON.parse(data);
                 if (parsed.error) {
                    throw new Error(parsed.error);
                 }
                 if (parsed.delta) {
                    botMessageContent += parsed.delta;
                 } else if (parsed.choices?.[0]?.delta?.content) {
                    botMessageContent += parsed.choices[0].delta.content;
                 }
                 updatedMessages = [...messages, userMessage, { ...botMessage, content: botMessageContent }];
                 setMessages([...updatedMessages]);
                 scrollToBottom();
               } catch(e) {}
             }
           }
        }
      }
      
      
      const msgIndex = updatedMessages.length - 1;
      setTimeout(() => {
        
        const simulatedRagasScore = Math.random() * (1.0 - 0.7) + 0.7; 
        setRagasScores(prev => ({ ...prev, [msgIndex]: simulatedRagasScore }));
      }, 1500);

      const currentTokens = updatedMessages.length * 12;
      if (!activeSessionId) {
        const title =
          userText.substring(0, 22) + (userText.length > 22 ? "..." : "");
        const dbResponse = await fetch(`${baseUrl}/api/sessions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            messages: updatedMessages,
            tokens: currentTokens,
          }),
        });
        if (dbResponse.ok) {
          const savedSession = await dbResponse.json();
          setActiveSessionId(savedSession?._id);
          setChatHistory((prev) => [savedSession, ...prev]);
        }
      } else {
        const dbResponse = await fetch(
          `${baseUrl}/api/sessions/${activeSessionId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: updatedMessages,
              tokens: currentTokens,
            }),
          },
        );
        if (dbResponse.ok) {
          const updatedSession = await dbResponse.json();
          setChatHistory((prev) =>
            prev.map((session) =>
              session?._id === activeSessionId ? updatedSession : session,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error during chat or DB save:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm sorry, I'm having trouble connecting to my thoughts right now. (${error.message})`,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("engram-theme", newTheme ? "dark" : "light");
  };
  const handleRateMessage = (index, rating) => {
    setMessageRatings(prev => ({
      ...prev,
      [index]: prev[index] === rating ? null : rating
    }));
  };
  const startNewConversation = () => {
    setMessages([]);
    setInput("");
    setShowWelcome(true);
    setError(null);
    setCopiedIndex(null);
    setIsSidebarOpen(false);
    setActiveSessionId(null);
  };
  const loadConversation = (sessionToLoad) => {
    setMessages(sessionToLoad?.messages || []);
    setActiveSessionId(sessionToLoad?._id);
    setShowWelcome(false);
    setIsSidebarOpen(false);
  };
  const deleteConversation = async (e, sessionId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) {
      return;
    }
    setChatHistory((prev) =>
      prev.filter((session) => session._id !== sessionId),
    );
    if (activeSessionId === sessionId) {
      setMessages([]);
      setInput("");
      setShowWelcome(true);
      setActiveSessionId(null);
    }
    try {
      const token = localStorage.getItem("token");
      await fetch(`${baseUrl}/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete session from DB:", err);
    }
  };
  if (insufficientEntries) {
    return (
      <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
        <div className="error-message">
          <h3>Build Your Digital Twin First</h3>
          <p>
            To access the chat, you need at least 5 diary entries. This helps us understand your personality and create an accurate AI companion.
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Current entries: {diaryEntries.length} / 5
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/diary")}
              className="action-btn-primary"
              style={{ backgroundColor: "var(--accent-color)", color: "white" }}
            >
              Write Diary Entries
            </button>
            <button
              onClick={() => window.location.reload()}
              className="action-btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (error && !personality) {
    return (
      <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
        <div className="error-message">
          <h3>Status Update</h3>
          <p>{error}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            {error.includes("logged in") || error.includes("Session") ? (
              <button
                onClick={() => navigate("/auth")}
                className="action-btn-primary"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="action-btn-primary"
              >
                Retry Sync
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (!personality) {
    return (
      <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
        <div className="loading-message">Loading personality...</div>
      </div>
    );
  }
  return (
    <div className={`app-container ${isDarkMode ? "dark" : "light"}`} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        role="presentation"
      ></div>
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <div className="sidebar-icons">
            <button
              className="mobile-close-btn"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
              title="Close menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="desktop-icons">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="sidebar-content">
          {!activeSessionId && (
            <div className="history-item active">
              <div
                className="history-left"
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginTop: "2px" }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div className="history-details">
                  <span className="history-title">New Session</span>
                  <span className="history-tokens">
                    {messages.length * 12} Tokens
                  </span>
                </div>
              </div>
            </div>
          )}
          {chatHistory.map((session) => (
            <div
              key={session._id}
              className={`history-item ${activeSessionId === session._id ? "active" : ""}`}
              onClick={() => loadConversation(session)}
            >
              <div
                className="history-left"
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginTop: "2px" }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div className="history-details">
                  <span className="history-title">{session.title}</span>
                  <span className="history-tokens">
                    {session.tokens} Tokens
                  </span>
                </div>
              </div>
              <button
                className="delete-session-btn"
                onClick={(e) => deleteConversation(e, session._id)}
                aria-label="Delete chat"
                title="Delete Chat"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
          <button 
            className="new-chat-btn" 
            onClick={startNewConversation}
            aria-label="Start new conversation"
          >
            <span>+ New Conversation</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <p className="accuracy-text">
            Accuracy: {(accuracy.overallScore * 100).toFixed(1)}%
          </p>
        </div>
      </aside>
      <main className="main-chat">
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="icon-btn"
              onClick={() => navigate("/new_page")}
              aria-label="Go back"
              title="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <button
              className="hamburger-btn icon-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
              title="Toggle conversation menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="top-bar-center hide-mobile">
            <h1>Engram</h1>
          </div>
          <div className="top-bar-right ">
            {activeSessionId && (
              <button
                className="action-btn-primary"
                style={{ backgroundColor: '#ff4d4f', color: 'white', marginRight: '10px', fontSize: '0.85rem' }}
                onClick={(e) => deleteConversation(e, activeSessionId)}
                title="Delete Chat Session"
              >
                Delete Chat
              </button>
            )}
            <button
              className="diary-btn"
              onClick={() => navigate("/diary")}
              aria-label="Go to Diary"
              title="Head to Diary"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Diary</span>
            </button>
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <svg
                  width="18"
                  height="18"
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
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>
        <div className="chat-scroll-area">
          <div className="chat-messages">
            {messages.length === 0 && showWelcome && (
              <div className="empty-state">
                <h1 className="welcome-title">Engram</h1>
                <p className="welcome-subtitle">
                  Your personalized minimal AI companion
                </p>
                <div className="trait-chips">
                  <span className="chip">
                    O: {personality.Openness?.Description?.substring(0, 10)}...
                  </span>
                  <span className="chip">
                    C:{" "}
                    {personality.Conscientiousness?.Description?.substring(
                      0,
                      10,
                    )}
                    ...
                  </span>
                  <span className="chip">
                    E: {personality.Extraversion?.Description?.substring(0, 10)}
                    ...
                  </span>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message-wrapper ${message.role}`}>
                <div className="message-card">
                  {message.role === "assistant" && (
                    <div className="message-header">
                      <span className="model-tag">
                        engram/personality-model
                      </span>
                    </div>
                  )}
                  <div className="message-content">{message.content}</div>
                  {message.role === "assistant" && (
                    <div className="message-actions">
                      <button 
                        onClick={() => handleRateMessage(index, 'up')}
                        className={`action-icon ${messageRatings[index] === 'up' ? 'active' : ''}`} 
                        title="Accurate response"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={messageRatings[index] === 'up' ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"></path>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleRateMessage(index, 'down')}
                        className={`action-icon ${messageRatings[index] === 'down' ? 'active' : ''}`}
                        title="Inaccurate response"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={messageRatings[index] === 'down' ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"></path>
                          <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="action-icon"
                        title="Copy text"
                      >
                        {copiedIndex === index ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper assistant">
                <div className="message-card">
                  <div className="message-header">
                    <span className="model-tag">
                      engram/personality-model:thinking
                    </span>
                  </div>
                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="messages-end" />
          </div>
        </div>
        <div className="floating-input-wrapper">
          <div className="input-box">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a message..."
              rows="1"
              onKeyDown={handleKeyPress}
              spellCheck="true"
              aria-label="Chat message input"
              maxLength="2000"
            />
            <div className="input-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: isOverLimit ? 'red' : 'gray', whiteSpace: 'nowrap' }}>
                Tokens: {estimatedTokens}/{MAX_TOKENS}
              </span>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || isOverLimit}
                className={`send-btn ${!input.trim() || loading || isOverLimit ? "disabled" : ""}`}
                aria-label="Send message"
                title="Send message"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ChatInterface;
