import React, { useState, useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatInfo from '../components/chat/ChatInfo.jsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.jsx';
import WelcomeScreen from '../components/common/WelcomeScreen.jsx';
import { useChatStorage } from '../hooks/useChatStorage.jsx';
import { useRealtime } from '../hooks/useRealtime.jsx';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { groupStorage } from '../utils/groupStorage.jsx';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_CONTACTS = [
  {
    id: 'contact_1',
    name: 'Maria Nelson',
    status: 'looks good',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 0,
    lastMessageTime: '2:30 PM',
    type: 'contact',
    lastMessageTimestamp: 0,
  },
  {
    id: 'contact_2',
    name: 'Ashley Harris',
    status: 'lucky you',
    avatar: '/api/placeholder/32/32',
    active: true,
    unreadCount: 0,
    lastMessageTime: '2:30 PM',
    type: 'contact',
    lastMessageTimestamp: 0,
  },
  {
    id: 'contact_3',
    name: 'Andrew Wilson',
    status: 'same here.',
    avatar: '/api/placeholder/32/32',
    unreadCount: 0,
    lastMessageTime: '2:30 PM',
    type: 'contact',
    lastMessageTimestamp: 0,
  },
];

function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isConnected, sendTyping, sendReadReceipt } = useRealtime();

  const [legacyContacts, setLegacyContacts] = useState(() => {
    try {
      const raw = localStorage.getItem('legacy_contacts');
      return raw ? JSON.parse(raw) : DEFAULT_CONTACTS;
    } catch (e) {
      console.error('Error loading legacy contacts:', e);
      return DEFAULT_CONTACTS;
    }
  });

  const [otherUsers, setOtherUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allChats, setAllChats] = useState([]);

  const { clearMessages } = useChatStorage(
    selectedContact?.id,
    selectedContact?.type,
  );

  const loadOtherUsers = async () => {
    if (!user || !isAuthenticated) {
      setOtherUsers([]);
      return;
    }

    try {
      setLoading(true);
      const users = await userService.getOtherUsers(user.id);

      const userChats = await Promise.all(
        users.map(async (otherUser) => {
          try {
            const conversation = await messageService.getConversationMessages(
              user.id,
              otherUser.id,
              1,
              1,
            );

            const messages = conversation.messages || [];
            const lastMessage = messages[messages.length - 1];
            const allMessages = await messageService.getConversationMessages(
              user.id,
              otherUser.id,
              1,
              50,
            );
            const unreadCount = messageService.getUnreadCount(
              allMessages.messages || [],
              user.id,
            );

            return {
              id: otherUser.id,
              name: otherUser.name || otherUser.username,
              email: otherUser.email,
              username: otherUser.username,
              status: lastMessage
                ? lastMessage.content || lastMessage.text || 'New message'
                : 'Start a conversation',
              avatar: otherUser.avatar || '/api/placeholder/32/32',
              active: false,
              unreadCount: unreadCount,
              lastMessageTime: lastMessage
                ? new Date(
                    lastMessage.timestampMs || lastMessage.timestamp,
                  ).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : '',
              lastMessageTimestamp: lastMessage
                ? lastMessage.timestampMs ||
                  new Date(lastMessage.timestamp).getTime()
                : 0,
              type: 'user',
            };
          } catch (error) {
            console.error(
              `Error loading conversation for user ${otherUser.id}:`,
              error,
            );
            return {
              id: otherUser.id,
              name: otherUser.name || otherUser.username,
              email: otherUser.email,
              username: otherUser.username,
              status: 'Start a conversation',
              avatar: otherUser.avatar || '/api/placeholder/32/32',
              active: false,
              unreadCount: 0,
              lastMessageTime: '',
              lastMessageTimestamp: 0,
              type: 'user',
            };
          }
        }),
      );

      setOtherUsers(userChats);
    } catch (error) {
      console.error('Error loading other users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = groupStorage.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      loadOtherUsers();
      loadGroups();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const combined = [...groups, ...legacyContacts, ...otherUsers];
    combined.sort(
      (a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0),
    );
    setAllChats(combined);
  }, [legacyContacts, otherUsers, groups]);

  useEffect(() => {
    try {
      localStorage.setItem('legacy_contacts', JSON.stringify(legacyContacts));
    } catch (e) {
      console.error('Error saving legacy contacts:', e);
    }
  }, [legacyContacts]);

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

  const handleChatSelect = async (chat) => {
    setSelectedContact(chat);

    if (chat.type === 'user' && user) {
      try {
        await messageService.markMessagesAsRead(user.id, chat.id);

        setOtherUsers((prev) =>
          prev.map((u) => (u.id === chat.id ? { ...u, unreadCount: 0 } : u)),
        );

        sendReadReceipt?.(null, chat.id);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
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

  const handleDeleteChat = async (chatId) => {
    if (selectedContact?.id === chatId) {
      clearMessages();
    }

    const chat = allChats.find((c) => c.id === chatId);

    if (chat?.type === 'group') {
      groupStorage.deleteGroup(chatId);
      loadGroups();
    } else if (chat?.type === 'user') {
      if (user) {
        try {
          await messageService.clearConversation?.(user.id, chatId);

          await loadOtherUsers();
        } catch (error) {
          console.error('Error clearing conversation:', error);
        }
      }
    } else {
      setLegacyContacts((prev) =>
        prev.filter((contact) => contact.id !== chatId),
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

  const handleMessageSent = async (chatId, message) => {
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
      loadGroups();
    } else if (chat?.type === 'user') {
      setOtherUsers((prev) =>
        prev.map((u) => {
          if (u.id === chatId) {
            return {
              ...u,
              status: preview,
              lastMessageTime: timeString,
              lastMessageTimestamp: ts,
              unreadCount: 0,
            };
          }
          return u;
        }),
      );
    } else {
      setLegacyContacts((prev) =>
        prev.map((c) => {
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
        }),
      );
    }
  };

  const handleGroupCreated = () => {
    loadGroups();
  };

  const handleTyping = (isTyping) => {
    if (selectedContact?.type === 'user' && sendTyping) {
      sendTyping(selectedContact.id, isTyping);
    }
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 text-black dark:bg-[#303030] dark:text-white'>
      {/* Connection Status */}
      {!isConnected && isAuthenticated && (
        <div className='fixed top-0 right-0 left-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm text-white'>
          Reconnecting to chat...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className='fixed top-0 right-0 left-0 z-50 bg-red-500 px-4 py-2 text-center text-sm text-white'>
          {error}
          <button
            onClick={() => setError(null)}
            className='ml-2 underline hover:no-underline'
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className='fixed inset-0 z-40 h-full w-full md:relative md:z-auto md:block md:w-80 lg:w-90'>
          <Sidebar
            onChatSelect={handleChatSelect}
            onCreateGroup={() => setIsCreateGroupModalOpen(true)}
            onDeleteChat={handleDeleteChat}
            contacts={allChats}
            selectedContact={selectedContact}
            loading={loading}
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
              onTyping={handleTyping}
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
        contacts={legacyContacts.filter((c) => c.type === 'contact')}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}

export default ChatPage;
