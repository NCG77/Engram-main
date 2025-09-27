import React, { useState, useEffect } from "react";
import { getDiaryEntries, createDiaryEntry } from "../../api/index";
import { Moon, Sun, ArrowLeft, Menu, X } from "lucide-react";
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

const DiaryForm = ({ onSave, selectedEntry, onBack, isDarkMode }) => {
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

  if (isViewing && selectedEntry) {
    return (
      <div className={`journal-display ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <button
          onClick={handleBackClick}
          className="back-button"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="entry-title">
          {selectedEntry.title || "Untitled"}
        </h1>

        <div className="entry-date">
          {formatDateTime(selectedEntry.createdAt)}
        </div>

        <div className="entry-content">
          {selectedEntry.content}
        </div>
      </div>
    );
  }

  return (
    <form
      className={`diary-form ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your title here..."
        className="diary-title-input"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your diary entry here..."
        className="diary-content-input"
        required
      />

      <button
        type="submit"
        className="submit-button"
      >
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
    <div className={`diary-entries-list ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h1 className="entries-title">
        My Diary Entries
      </h1>

      {entries.length === 0 ? (
        <p className="no-entries-message">
          No entries yet. Start writing!
        </p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="journal-entry"
            onClick={() => onSelectEntry(entry)}
          >
            <h3 className="entry-item-title">
              {entry.title || "Untitled"}
            </h3>
            <p className="entry-item-date">
              {formatDateTime(entry.createdAt)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

const DiaryApp = () => {
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
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('diary-theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    }

    (async () => {
      try {
        const data = await getDiaryEntries();
        setEntries(data);
      } catch (err) {
        console.error("Failed to load diary entries", err);
        alert(
          "Could not load diary entries. Please make sure you're logged in."
        );
      }
    })();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      localStorage.setItem('diary-theme', 'light');
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      localStorage.setItem('diary-theme', 'dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
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
        }
      );
      const auraData = await auraRes.json();
      console.log("🧠 Updated aura/personality:", auraData.personality);
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

  return (
    <div className={`diary-app-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isMobileView ? 'mobile-view' : ''}`}>
      <ThemeToggle
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {isMobileView && (
        <MobileSidebarToggle
          isSidebarVisible={isSidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      )}

      {isMobileView ? (
        <>
          <div className={`diary-sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
            <DiarySidebar
              entries={entries}
              onSelectEntry={handleSelectEntry}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className={`diary-main-content ${!isSidebarVisible ? 'visible' : 'hidden'}`}>
            <DiaryForm
              onSave={handleSaveEntry}
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
