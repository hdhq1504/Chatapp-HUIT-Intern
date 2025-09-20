import React, { useState, useEffect } from 'react';
import ChatContainer from '../components/ChatContainer';
import ChatInfo from '../components/ChatInfo';
import CreateRoomModal from '../components/CreateRoomModal';
import Sidebar from '../components/Sidebar';
import WelcomeScreen from '../components/WelcomeScreen';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import { useChatStorage } from '../hooks/useChatStorage';
import { useTheme } from '../hooks/useTheme';
import { groupStorage, safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';
import { getConversationKey } from '../storage/helpers';

const DEFAULT_CONTACTS = [];

function ChatPage() {
  useTheme();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [contacts, setContacts] = useState(() => {
    if (!user) return [];

    try {
      const userContactsKey = `contacts_${user.id}`;
      const parsed = safeGetItem(userContactsKey, DEFAULT_CONTACTS);
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
      safeSetItem(userContactsKey, contactsOnly);
    } catch (e) {
      console.error('save contacts error', e);
    }
  }, [contacts, user]);

  useEffect(() => {
    const combined = [...groups, ...contacts];
    combined.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    setAllChats(combined);
  }, [contacts, groups]);

  useEffect(() => {
    const handleMessageReceived = (event) => {
      const { senderId, message } = event.detail;

      setContacts((prevContacts) => {
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

        const isActiveChat = selectedContact?.id === senderId;
        const existingContact = prevContacts.find((contact) => contact.id === senderId);

        if (existingContact) {
          return prevContacts.map((contact) => {
            if (contact.id !== senderId) {
              return contact;
            }

            return {
              ...contact,
              lastMessageTime: timeString,
              status: preview,
              unreadCount: isActiveChat ? 0 : (contact.unreadCount || 0) + 1,
              lastMessageTimestamp: message.timestamp,
            };
          });
        }

        const newContact = {
          id: senderId,
          name: message.senderName || `User ${senderId}`,
          avatar: message.senderAvatar || '',
          type: 'contact',
          status: preview,
          lastMessageTime: timeString,
          unreadCount: isActiveChat ? 0 : 1,
          lastMessageTimestamp: message.timestamp,
          active: true,
        };

        return [...prevContacts, newContact];
      });
    };

    window.addEventListener('message-received', handleMessageReceived);

    return () => {
      window.removeEventListener('message-received', handleMessageReceived);
    };
  }, [selectedContact]);

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
        const chatKey = `chat_${getConversationKey(user.id, chatId)}`;
        try {
          safeRemoveItem(chatKey);
        } catch (err) {
          console.warn('Failed to remove chat key', chatKey, err);
        }
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
      if (prevContacts.find((c) => c.id === newContact.id)) {
        return prevContacts;
      }
      return [...prevContacts, newContact];
    });
  };

  const handleMessageSent = (chatId, message) => {
    if (!chatId || !message) return;

    const preview = message.content || message.text || '';

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
              onOpenCreateRoom={() => setIsCreateRoomModalOpen(true)}
              onDeleteChat={handleDeleteChat}
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

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={isCreateRoomModalOpen}
          onClose={() => setIsCreateRoomModalOpen(false)}
          onDirectChatCreated={handleContactAdded}
          contacts={contacts.filter((c) => c.type === 'contact')}
          onGroupCreated={handleGroupCreated}
          existingContactIds={contacts.map((contact) => contact.id)}
        />
      </div>
    </ChatProvider>
  );
}

export default ChatPage;
