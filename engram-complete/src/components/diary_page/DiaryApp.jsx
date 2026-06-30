import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDiaryEntries, createDiaryEntry, deleteDiaryEntry } from "../../api/index";
const Moon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const Sun = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const ArrowLeft = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);
const Menu = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12h18" />
    <path d="M3 6h18" />
    <path d="M3 18h18" />
  </svg>
);
const X = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);
import "./DiaryApp.css";
const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
const MobileSidebarToggle = ({ isSidebarVisible, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className="mobile-sidebar-toggle"
      aria-label={isSidebarVisible ? "Hide entries" : "Show entries"}
    >
      {isSidebarVisible ? <X size={18} /> : <Menu size={18} />}
    </button>
  );
};
const DiaryForm = ({ onSave, onDelete, selectedEntry, onBack, isDarkMode }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };
  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content || "");
      setIsViewing(true);
    } else {
      setIsViewing(false);
      setTitle("");
      setContent("");
    }
  }, [selectedEntry]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ title, content });
    setTitle("");
    setContent("");
  };
  const handleBackClick = () => {
    onBack();
  };
  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this diary entry? This will also remove its data from your AI's memory.")) {
      onDelete(selectedEntry._id);
    }
  };
  if (isViewing && selectedEntry) {
    return (
      <div
        className={`journal-display ${isDarkMode ? "dark-mode" : "light-mode"}`}
      >
        <button onClick={handleBackClick} className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 className="entry-title">{selectedEntry.title || "Untitled"}</h1>
        <div className="entry-date">
          {formatDateTime(selectedEntry.createdAt)}
        </div>
        <div className="entry-content">{selectedEntry.content}</div>
        <button 
          onClick={handleDeleteClick} 
          className="submit-button" 
          style={{ backgroundColor: '#ff4d4f', marginTop: '20px' }} 
          title="Delete diary entry"
        >
          Delete Entry
        </button>
      </div>
    );
  }
  return (
    <form
      className={`diary-form ${isDarkMode ? "dark-mode" : "light-mode"}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your title here..."
        className="diary-title-input"
        maxLength="100"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your diary entry here..."
        className="diary-content-input"
        maxLength="5000"
        spellCheck="true"
        required
      />
      <button type="submit" className="submit-button" title="Submit diary entry">
        Submit Entry
      </button>
    </form>
  );
};
const DiarySidebar = ({ entries, onSelectEntry, isDarkMode }) => {
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };
  return (
    <div
      className={`diary-entries-list ${isDarkMode ? "dark-mode" : "light-mode"}`}
    >
      <h1 className="entries-title">My Diary Entries</h1>
      {entries.length === 0 ? (
        <p className="no-entries-message">No entries yet. Start writing!</p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="journal-entry"
            onClick={() => onSelectEntry(entry)}
          >
            <h3 className="entry-item-title">{entry.title || "Untitled"}</h3>
            <p className="entry-item-date">{formatDateTime(entry.createdAt)}</p>
          </div>
        ))
      )}
    </div>
  );
};
const DiaryApp = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      if (!isMobile) {
        setIsSidebarVisible(false);
      }
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("engram-theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    } else {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    }
    (async () => {
      try {
        const data = await getDiaryEntries();
        setEntries(data);
      } catch (err) {
        console.error("Failed to load diary entries", err);
        alert(
          "Could not load diary entries. Please make sure you're logged in.",
        );
      }
    })();
  }, []);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      localStorage.setItem("engram-theme", "light");
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    } else {
      localStorage.setItem("engram-theme", "dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    }
  };
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  const handleSaveEntry = async ({ title, content }) => {
    try {
      const token = localStorage.getItem("token");
      const data = await createDiaryEntry({ title, content });
      setEntries([data.diaryEntry, ...entries]);
      setSelectedEntry(null);
      if (isMobileView) {
        setIsSidebarVisible(false);
      }
      const auraRes = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/aura/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const auraData = await auraRes.json();
    } catch (err) {
      console.error("Failed to create entry or update aura", err);
      alert("Something went wrong. Please try again.");
    }
  };
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    if (isMobileView) {
      setIsSidebarVisible(false);
    }
  };
  const handleBack = () => {
    setSelectedEntry(null);
  };
  const handleDeleteEntry = async (id) => {
    try {
      await deleteDiaryEntry(id);
      setEntries(entries.filter(e => e._id !== id));
      setSelectedEntry(null);
      if (isMobileView) {
        setIsSidebarVisible(false);
      }
      const token = localStorage.getItem("token");
      fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/aura/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    } catch (err) {
      console.error("Failed to delete entry", err);
      alert("Failed to delete entry. Please try again.");
    }
  };
  return (
    <div
      className={`diary-app-container ${isDarkMode ? "dark-mode" : "light-mode"} ${isMobileView ? "mobile-view" : ""}`}
    >
      <button
        className="page-back-button"
        onClick={() => navigate("/new_page")}
        title="Go back"
        aria-label="Go back"
      >
        <ArrowLeft size={18} />
      </button>
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      {isMobileView && (
        <MobileSidebarToggle
          isSidebarVisible={isSidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      )}
      {isMobileView ? (
        <>
          <div
            className={`diary-sidebar ${isSidebarVisible ? "visible" : "hidden"}`}
          >
            <DiarySidebar
              entries={entries}
              onSelectEntry={handleSelectEntry}
              isDarkMode={isDarkMode}
            />
          </div>
          <div
            className={`diary-main-content ${!isSidebarVisible ? "visible" : "hidden"}`}
          >
            <DiaryForm
              onSave={handleSaveEntry}
              onDelete={handleDeleteEntry}
              selectedEntry={selectedEntry}
              onBack={handleBack}
              isDarkMode={isDarkMode}
            />
          </div>
        </>
      ) : (
        <>
          <div className="diary-sidebar">
            <DiarySidebar
              entries={entries}
              onSelectEntry={handleSelectEntry}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="diary-main-content">
            <DiaryForm
              onSave={handleSaveEntry}
              onDelete={handleDeleteEntry}
              selectedEntry={selectedEntry}
              onBack={handleBack}
              isDarkMode={isDarkMode}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default DiaryApp;
