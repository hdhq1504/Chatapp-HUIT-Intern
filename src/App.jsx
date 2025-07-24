import React from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
