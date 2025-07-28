import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import Details from "../components/Details.jsx";

function ChatPage() {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <>
      <div className="flex min-h-screen bg-gray-100 text-black dark:bg-[#303030] dark:text-white">
        <Sidebar />
        <div className={`flex-1 ml-80 flex ${showDetails ? "mr-80" : ""}`}>
          <ChatContainer setShowDetails={setShowDetails} />
          {showDetails && <Details />}
        </div>
      </div>
    </>
  );
}

export default ChatPage;
