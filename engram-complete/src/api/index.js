// src/api/index.js
const BASE_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/diary`;

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getDiaryEntries = async () => {
  const res = await fetch(`${BASE_URL}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch diary entries");
  return res.json(); // returns an array of entries
};

export const createDiaryEntry = async ({ title, content }) => {
  const res = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create diary entry");
  }
  return res.json(); // returns { diaryEntry: {...} }
};
