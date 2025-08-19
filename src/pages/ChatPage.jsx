import React, { useState, useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatInfo from '../components/chat/ChatInfo.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import WelcomeScreen from '../components/common/WelcomeScreen.jsx';
import { useChatStorage } from '../hooks/useChatStorage.jsx';
import { groupStorage } from '../utils/groupStorage.jsx';

const DEFAULT_CONTACTS = [  
  {
    id: 1,
    name: 'Maria Nelson',
    status: 'looks good',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 25,
    lastMessageTime: '2:30 PM',
    type: 'contact',
  },
  {
    id: 2,
    name: 'Ashley Harris',
    status: 'lucky you',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
    type: 'contact',
  },
  {
    id: 3,
    name: 'Andrew Wilson',
    status: 'same here.',
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
    type: 'contact',
  },
  {
    id: 4,
    name: 'Jennifer Brown',
    status: 'wait a second',
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
    type: 'contact',
  },
  {
    id: 5,
    name: 'Edward Davis',
    status: "how's it going?",
    avatar: '/api/placeholder/32/32',
    unreadCount: 3,
    lastMessageTime: '2:30 PM',
    type: 'contact',
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
        type: c.type || 'contact',
        lastMessageTimestamp: c.lastMessageTimestamp || 0,
      }));
      return normalized;
    } catch (e) {
      console.error('load contacts error', e);
      return DEFAULT_CONTACTS;
    }
  });

  const [groups, setGroups] = useState(() => {
    return groupStorage.getGroups();
  });

  const [allChats, setAllChats] = useState([]);

  const { clearMessages } = useChatStorage(selectedContact?.id);

  useEffect(() => {
    const combined = [...groups, ...contacts];
    combined.sort(
      (a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0),
    );
    setAllChats(combined);
  }, [contacts, groups]);

  useEffect(() => {
    try {
      const contactsOnly = contacts.filter((c) => c.type === 'contact');
      localStorage.setItem('contacts', JSON.stringify(contactsOnly));
    } catch (e) {
      console.error('save contacts error', e);
    }
  }, [contacts]);

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
  const handleChatSelect = (chat) => {
    setSelectedContact(chat);
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

  const handleDeleteChat = (chatId) => {
    if (selectedContact?.id === chatId) {
      clearMessages();
    }

    const chat = allChats.find((c) => c.id === chatId);

    if (chat?.type === 'group') {
      groupStorage.deleteGroup(chatId);
      setGroups(groupStorage.getGroups());
    } else {
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== chatId),
      );
    }

    if (selectedContact?.id === chatId) {
      setSelectedContact(null);
      setShowDetails(false);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }
  };

  const handleMessageSent = (chatId, message) => {
    if (!chatId || !message) return;

    const preview =
      message.type === 'text'
        ? message.content || message.text || ''
        : message.type === 'files'
          ? message.text && message.text.trim()
            ? message.text
            : `Sent ${message.files ? message.files.length : 1} files`
          : message.content || message.text || '';

    const ts = message.timestampMs || Date.now();
    const timeString = new Date(ts).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const chat = allChats.find((c) => c.id === chatId);

    if (chat?.type === 'group') {
      groupStorage.updateGroup(chatId, {
        lastMessageTime: timeString,
        status: preview,
        unreadCount: 0,
        lastMessageTimestamp: ts,
      });
      setGroups(groupStorage.getGroups());
    } else {
      setContacts((prevContacts) => {
        const updated = prevContacts.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessageTime: timeString,
              status: preview,
              unreadCount: 0,
              lastMessageTimestamp: ts,
            };
          }
          return c;
        });
        return updated;
      });
    }
  };

  const handleGroupCreated = () => {
    setGroups(groupStorage.getGroups());
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
            contacts={allChats}
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
        contacts={contacts.filter((c) => c.type === 'contact')}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}

export default ChatPage;
