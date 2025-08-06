import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import ChatInfo from "../components/ChatInfo.jsx";
import CreateGroupModal from "../components/CreateGroupModal.jsx";
import WelcomeScreen from "../components/WelcomeScreen.jsx";

const contacts = [
  {
    id: 1,
    name: "Maria Nelson",
    status: "looks good",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
  {
    id: 2,
    name: "Ashley Harris",
    status: "lucky you",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
  {
    id: 3,
    name: "Andrew Wilson",
    status: "same here.",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 4,
    name: "Jennifer Brown",
    status: "wait a second",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 5,
    name: "Edward Davis",
    status: "how's it going?",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 6,
    name: "Karen Wilson",
    status: "i hear you",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 7,
    name: "Joseph Garcia",
    status: "at least it's friday",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 8,
    name: "Patricia Jones",
    status: "what about you?",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
];

function ChatPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const handleChatSelect = (contact) => {
    setSelectedContact(contact);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setShowDetails(false);
    setSelectedContact(null);
  };

  const handleToggleDetails = (show) => {
    setShowDetails(show);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleOpenCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black dark:bg-[#303030] dark:text-white overflow-hidden">
      <div className={`
        fixed md:relative inset-0 z-40 md:z-auto
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-full md:w-80 h-full transform transition-transform duration-300
      `}>
        <Sidebar 
          onChatSelect={handleChatSelect}
          onBackToSidebar={handleBackToSidebar}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          onCreateGroup={handleOpenCreateGroupModal}
          contacts={contacts}
        />
      </div>

      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className="flex-1 flex h-full">
        <div className={`
          flex-1 h-full
          ${showSidebar ? 'hidden md:flex' : 'flex'}
          ${showDetails ? 'md:flex' : 'flex'}
        `}>
          {selectedContact ? (
            <ChatContainer 
              selectedContact={selectedContact}
              setShowDetails={handleToggleDetails}
              onBackToSidebar={handleBackToSidebar}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>

        {showDetails && (
          <div className="
            fixed md:relative inset-0 z-40 md:z-auto
            w-full md:w-80 h-full md:block
          ">
            <ChatInfo
              selectedContact={selectedContact} 
              onClose={() => handleToggleDetails(false)}
            />
          </div>
        )}
      </div>

      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => handleToggleDetails(false)}
        />
      )}
      
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
        contacts={contacts}
      />
    </div>
  );
}

export default ChatPage;
