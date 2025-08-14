import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatInfo from '../components/chat/ChatInfo.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import WelcomeScreen from '../components/common/WelcomeScreen.jsx';
import { useChatStorage } from '../hooks/useChatStorage.jsx';

const initialContacts = [
  {
    id: 1,
    name: 'Maria Nelson',
    status: 'looks good',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 25,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 2,
    name: 'Ashley Harris',
    status: 'lucky you',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 3,
    name: 'Andrew Wilson',
    status: 'same here.',
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 4,
    name: 'Jennifer Brown',
    status: 'wait a second',
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 5,
    name: 'Edward Davis',
    status: "how's it going?",
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
];

function ChatPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState(initialContacts);

  // Sử dụng chat storage hook cho contact được chọn
  const { clearMessages } = useChatStorage(selectedContact?.id);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Event handlers
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

  const handleDeleteChat = (contactId) => {
    // Xóa dữ liệu chat từ storage nếu đang được chọn
    if (selectedContact?.id === contactId) {
      clearMessages();
    }

    // Remove contact from the list
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact.id !== contactId),
    );

    // If the deleted contact was selected, clear the selection
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setShowDetails(false);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 text-black dark:bg-[#303030] dark:text-white'>
      {/* Sidebar */}
      {showSidebar && (
        <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80'>
          <Sidebar
            onChatSelect={handleChatSelect}
            onCreateGroup={() => setIsCreateGroupModalOpen(true)}
            onDeleteChat={handleDeleteChat}
            contacts={contacts}
            selectedContact={selectedContact}
          />
        </div>
      )}

      {/* Sidebar Overlay for mobile */}
      {showSidebar && (
        <div
          className='fixed inset-0 z-30 bg-black/50 md:hidden'
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className='flex h-full flex-1'>
        <div
          className={`h-full flex-1 ${showSidebar ? 'hidden md:flex' : 'flex'} ${
            showDetails ? 'md:flex' : 'flex'
          }`}
        >
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

        {/* Chat Info Panel */}
        {showDetails && (
          <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80'>
            <ChatInfo
              selectedContact={selectedContact}
              onClose={() => handleToggleDetails(false)}
            />
          </div>
        )}
      </div>

      {/* Details Overlay for mobile */}
      {showDetails && (
        <div
          className='fixed inset-0 z-30 bg-black/50 md:hidden'
          onClick={() => handleToggleDetails(false)}
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        contacts={contacts}
      />
    </div>
  );
}

export default ChatPage;
