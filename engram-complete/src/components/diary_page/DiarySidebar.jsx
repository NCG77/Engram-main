import React from "react";

const DiarySidebar = ({ entries, onSelectEntry }) => {
  // Time format with date + time
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
      className="diary-entries-list"
      style={{
        padding: "1.5rem",
        fontFamily: "'Times New Roman', Times, serif",
        textAlign: "left",
      }}
    >
      <h1
        style={{
          fontSize: "1.785rem",
          color: "#fff",
          marginBottom: "2rem",
          fontWeight: 520,
          fontFamily: "'Times New Roman', Times, serif",
          textAlign: "left",
        }}
      >
        My Diary Entries
      </h1>
      {entries.length === 0 ? (
        <p
          style={{
            color: "#8e9aaf",
            fontSize: "1.02rem",
            opacity: 0.8,
            letterSpacing: "0.05em",
            fontWeight: 520,
            fontFamily: "'Times New Roman', Times, serif",
            textAlign: "left",
          }}
        >
          No entries yet. Start writing!
        </p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="journal-entry"
            onClick={() => onSelectEntry(entry)}
            style={{
              padding: "1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
              fontFamily: "'Times New Roman', Times, serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "1.122rem",
                marginBottom: "0.5rem",
                fontWeight: 520,
                fontFamily: "'Times New Roman', Times, serif",
                textAlign: "left",
                width: "100%",
              }}
            >
              {entry.title || "Untitled"}
            </h3>
            <p
              style={{
                color: "#8e9aaf",
                fontSize: "0.867rem",
                margin: 0,
                fontWeight: 520,
                fontFamily: "'Times New Roman', Times, serif",
                textAlign: "left",
                width: "100%",
              }}
            >
              {formatDateTime(entry.createdAt)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default DiarySidebar;
