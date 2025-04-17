import React from "react";
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/auth/Auth";
import NewPage from './components/new_page/new_page';
import ChatInterface from "./components/chat_page/ChatInterface";
import DiaryApp from "./components/diary_page/DiaryApp";
import LandingPage from "./components/LandingPage/landing";
import ReviewPage from "./components/review_page/ReviewPage";

const App = () => {
  return (
    <div className="main-app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/new_page" element={<NewPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/diary" element={<DiaryApp />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;