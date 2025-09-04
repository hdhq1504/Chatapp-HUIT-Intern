import React, { useState, useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatInfo from '../components/chat/ChatInfo.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import WelcomeScreen from '../components/common/WelcomeScreen.jsx';
import { ChatProvider } from '../contexts/ChatContext.jsx';
import { useChatStorage } from '../hooks/useChatStorage.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { groupStorage } from '../utils/groupStorage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const DEFAULT_CONTACTS = [];

function ChatPage() {
  useTheme();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [contacts, setContacts] = useState(() => {
    if (!user) return [];

    try {
      const userContactsKey = `contacts_${user.id}`;
      const raw = localStorage.getItem(userContactsKey);
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
    if (!user) return;

    try {
      const userContactsKey = `contacts_${user.id}`;
      const contactsOnly = contacts.filter((c) => c.type === 'contact');
      localStorage.setItem(userContactsKey, JSON.stringify(contactsOnly));
    } catch (e) {
      console.error('save contacts error', e);
    }
  }, [contacts, user]);

  useEffect(() => {
    const combined = [...groups, ...contacts];
    combined.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    setAllChats(combined);
  }, [contacts, groups]);

  // useEffect(() => {
  //   try {
  //     const contactsOnly = contacts.filter((c) => c.type === 'contact');
  //     localStorage.setItem('contacts', JSON.stringify(contactsOnly));
  //   } catch (e) {
  //     console.error('save contacts error', e);
  //   }
  // }, [contacts]);

  useEffect(() => {
    const handleMessageReceived = (event) => {
      const { senderId, message } = event.detail;

      setContacts((prevContacts) => {
        return prevContacts.map((contact) => {
          if (contact.id === senderId) {
            const preview =
              message.type === 'text'
                ? message.content
                : message.type === 'files'
                  ? `Sent ${message.files ? message.files.length : 1} files`
                  : message.content || 'New message';

            const timeString = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return {
              ...contact,
              lastMessageTime: timeString,
              status: preview,
              unreadCount: (contact.unreadCount || 0) + 1,
              lastMessageTimestamp: message.timestamp,
            };
          }
          return contact;
        });
      });
    };

    window.addEventListener('message-received', handleMessageReceived);

    return () => {
      window.removeEventListener('message-received', handleMessageReceived);
    };
  }, []);

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

  const handleChatSelect = (chat) => {
    setSelectedContact(chat);

    // Mark as read when opening chat
    if (chat.unreadCount > 0) {
      setContacts((prevContacts) => {
        return prevContacts.map((contact) => {
          if (contact.id === chat.id) {
            return { ...contact, unreadCount: 0 };
          }
          return contact;
        });
      });
    }

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
      setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== chatId));

      // Also clear chat history
      if (user) {
        const getChatKey = (userId1, userId2) => {
          const sortedIds = [userId1, userId2].sort();
          return `chat_${sortedIds[0]}_${sortedIds[1]}`;
        };

        const chatKey = getChatKey(user.id, chatId);
        localStorage.removeItem(chatKey);
      }
    }

    if (selectedContact?.id === chatId) {
      setSelectedContact(null);
      setShowDetails(false);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }
  };

  const handleContactAdded = (newContact) => {
    setContacts((prevContacts) => {
      // Check if contact already exists
      if (prevContacts.find((c) => c.id === newContact.id)) {
        return prevContacts;
      }
      return [...prevContacts, newContact];
    });
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
    <ChatProvider>
      <div className='flex h-screen overflow-hidden bg-gray-100 text-black dark:bg-[#303030] dark:text-white'>
        {/* Sidebar */}
        {showSidebar && (
          <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80 lg:w-90'>
            <Sidebar
              onChatSelect={handleChatSelect}
              onCreateGroup={() => setIsCreateGroupModalOpen(true)}
              onDeleteChat={handleDeleteChat}
              onContactAdded={handleContactAdded}
              contacts={allChats}
              selectedContact={selectedContact}
            />
          </div>
        )}

        {/* Sidebar Overlay for mobile */}
        {showSidebar && (
          <div className='fixed inset-0 z-30 bg-black/50 md:hidden' onClick={() => setShowSidebar(false)} />
        )}

        {/* Main Chat Area */}
        <div className='flex h-full flex-1'>
          <div
            className={`h-full flex-1 ${showSidebar ? 'hidden md:flex' : 'flex'} ${showDetails ? 'md:flex' : 'flex'}`}
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
              <ChatInfo selectedContact={selectedContact} onClose={() => handleToggleDetails(false)} />
            </div>
          )}
        </div>

        {/* Details Overlay for mobile */}
        {showDetails && (
          <div className='fixed inset-0 z-30 bg-black/50 md:hidden' onClick={() => handleToggleDetails(false)} />
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
          contacts={contacts.filter((c) => c.type === 'contact')}
          onGroupCreated={handleGroupCreated}
        />
      </div>
    </ChatProvider>
  );
}

export default ChatPage;
