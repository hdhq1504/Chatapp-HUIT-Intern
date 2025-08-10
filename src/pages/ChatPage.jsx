import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ChatContainer from '../components/ChatContainer.jsx';
import ChatInfo from '../components/ChatInfo.jsx';
import CreateGroupModal from '../components/CreateGroupModal.jsx';
import WelcomeScreen from '../components/WelcomeScreen.jsx';

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
  {
    id: 6,
    name: 'Karen Wilson',
    status: 'i hear you',
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 7,
    name: 'Joseph Garcia',
    status: "at least it's friday",
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
  },
  {
    id: 8,
    name: 'Patricia Jones',
    status: 'what about you?',
    avatar: '/api/placeholder/32/32',
    active: true,
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

  const handleDeleteChat = (contactId) => {
    // Remove contact from the list
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact.id !== contactId),
    );

    // If the deleted contact was selected, clear the selection
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(null);
      setShowDetails(false);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }

    console.log(`Chat with contact ID ${contactId} has been deleted`);
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 text-black dark:bg-[#303030] dark:text-white'>
      {showSidebar && (
        <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80'>
          <Sidebar
            onChatSelect={handleChatSelect}
            onBackToSidebar={handleBackToSidebar}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            onCreateGroup={handleOpenCreateGroupModal}
            onDeleteChat={handleDeleteChat}
            contacts={contacts}
            selectedContact={selectedContact}
          />
        </div>
      )}

      {showSidebar && (
        <div
          className='fixed inset-0 z-30 bg-black/50 md:hidden'
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className='flex h-full flex-1'>
        <div
          className={`h-full flex-1 ${showSidebar ? 'hidden md:flex' : 'flex'} ${showDetails ? 'md:flex' : 'flex'} `}
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

        {showDetails && (
          <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80'>
            <ChatInfo
              selectedContact={selectedContact}
              onClose={() => handleToggleDetails(false)}
            />
          </div>
        )}
      </div>

      {showDetails && (
        <div
          className='fixed inset-0 z-30 bg-black/50 md:hidden'
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
