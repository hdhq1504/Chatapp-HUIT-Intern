export class GlobalMessageStorage {
  constructor() {
    this.storageKey = 'global_messages';
  }

  // Save a message between two users
  saveMessage(fromUserId, toUserId, message) {
    try {
      const allMessages = this.getAllMessages();
      const conversationKey = this.getConversationKey(fromUserId, toUserId);

      if (!allMessages[conversationKey]) {
        allMessages[conversationKey] = [];
      }

      const newMessage = {
        ...message,
        id: message.id || this.generateMessageId(),
        fromUserId,
        toUserId,
        timestamp: message.timestamp || new Date().toISOString(),
        timestampMs: message.timestampMs || Date.now(),
      };

      allMessages[conversationKey].push(newMessage);

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(allMessages));
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('LocalStorage full, clearing old messages...');
          Object.keys(allMessages).forEach((key) => {
            allMessages[key] = allMessages[key].slice(-50);
          });
          localStorage.setItem(this.storageKey, JSON.stringify(allMessages));
        } else {
          throw quotaError;
        }
      }

      return newMessage;
    } catch (error) {
      console.error('Error saving global message:', error);
      return message;
    }
  }

  // Get messages of a conversation between two users
  getConversationMessages(userId1, userId2) {
    try {
      const allMessages = this.getAllMessages();
      const conversationKey = this.getConversationKey(userId1, userId2);
      return allMessages[conversationKey] || [];
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      return [];
    }
  }

  // Get all messages from localStorage
  getAllMessages() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading all messages:', error);
      return {};
    }
  }

  getConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  // Clear a conversation between two users
  clearConversation(userId1, userId2) {
    try {
      const allMessages = this.getAllMessages();
      const conversationKey = this.getConversationKey(userId1, userId2);
      delete allMessages[conversationKey];
      localStorage.setItem(this.storageKey, JSON.stringify(allMessages));
      return true;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      return false;
    }
  }

  // Get the last message of a conversation
  getLastMessage(userId1, userId2) {
    const messages = this.getConversationMessages(userId1, userId2);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  // Generate a unique message ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mark messages as read in a conversation
  markMessagesAsRead(userId1, userId2, currentUserId) {
    try {
      const allMessages = this.getAllMessages();
      const conversationKey = this.getConversationKey(userId1, userId2);

      if (allMessages[conversationKey]) {
        allMessages[conversationKey] = allMessages[conversationKey].map((msg) => {
          // Mark as read only if the message is to the current user and is unread
          if (msg.toUserId === currentUserId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(allMessages));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Count unread messages in a conversation
  getUnreadCount(userId1, userId2, currentUserId) {
    const messages = this.getConversationMessages(userId1, userId2);
    return messages.filter((msg) => msg.toUserId === currentUserId && !msg.read).length;
  }
}

export const globalMessageStorage = new GlobalMessageStorage();
