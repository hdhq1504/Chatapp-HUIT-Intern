import React, { useState, useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatInfo from '../components/chat/ChatInfo.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import WelcomeScreen from '../components/common/WelcomeScreen.jsx';
import { useChatStorage } from '../hooks/useChatStorage.jsx';

const DEFAULT_CONTACTS = [
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
  const [contacts, setContacts] = useState(() => {
    try {
      const raw = localStorage.getItem('contacts');
      const parsed = raw ? JSON.parse(raw) : DEFAULT_CONTACTS;
      const normalized = parsed.map((c) => ({
        ...c,
        lastMessageTimestamp: c.lastMessageTimestamp || 0,
      }));
      normalized.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
      return normalized;
    } catch (e) {
      console.error('load contacts error', e);
      return DEFAULT_CONTACTS;
    }
  });

  const { clearMessages } = useChatStorage(selectedContact?.id);

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

  const handleDeleteChat = (contactId) => {
    if (selectedContact?.id === contactId) {
      clearMessages();
    }

    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact.id !== contactId),
    );

    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setShowDetails(false);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }
  };

  const handleMessageSent = (contactId, message) => {
    if (!contactId || !message) return;

    const preview = message.type === 'text'
      ? (message.content || message.text || '')
      : message.type === 'files'
        ? (message.text && message.text.trim() ? message.text : `Đã gửi ${message.files ? message.files.length : 1} tập tin`)
        : (message.content || message.text || '');

    const ts = message.timestampMs || Date.now();

    setContacts((prevContacts) => {
      const updated = prevContacts.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            lastMessageTime: new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: preview,
            unreadCount: 0,
            lastMessageTimestamp: ts,
          };
        }
        return c;
      });

      const idx = updated.findIndex((c) => c.id === contactId);
      if (idx > -1) {
        const [chat] = updated.splice(idx, 1);
        updated.unshift(chat);
      }

      try {
        localStorage.setItem('contacts', JSON.stringify(updated));
      } catch (e) {
        console.error('save contacts error', e);
      }

      return updated;
    });
  };


  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 text-black dark:bg-[#303030] dark:text-white'>
      {/* Sidebar */}
      {showSidebar && (
        <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80 lg:w-90'>
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
          className={`h-full flex-1 ${showSidebar ? 'hidden md:flex' : 'flex'} ${showDetails ? 'md:flex' : 'flex'
            }`}
        >
          {selectedContact ? (
            <ChatContainer
              selectedContact={selectedContact}
              setShowDetails={handleToggleDetails}
              onBackToSidebar={handleBackToSidebar}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>

        {/* Chat Info Panel */}
        {showDetails && (
          <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80 lg:w-90'>
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
