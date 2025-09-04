export class ChatStorage {
  constructor(chatId = 'default') {
    this.chatId = chatId;
    this.storageKey = `chat_messages_${chatId}`;
  }

  saveMessage(message) {
    try {
      const messages = this.getMessages();
      const newMessage = {
        ...message,
        id: message.id || this.generateMessageId(),
        timestamp: message.timestamp || new Date().toISOString(),
        timestampMs: message.timestampMs || Date.now(),
      };

      messages.push(newMessage);

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('LocalStorage full, clearing old messages...');
          const recentMessages = messages.slice(-50);
          localStorage.setItem(this.storageKey, JSON.stringify(recentMessages));

          // Notify the user about the cleanup
          alert('Storage full, old messages cleared.');
        } else {
          throw quotaError;
        }
      }

      return newMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      return message;
    }
  }

  getMessages() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  updateMessage(messageId, updates) {
    try {
      const messages = this.getMessages();
      const index = messages.findIndex((msg) => msg.id === messageId);

      if (index !== -1) {
        messages[index] = { ...messages[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
        return messages[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating message:', error);
      return null;
    }
  }

  deleteMessage(messageId) {
    try {
      const messages = this.getMessages();
      const filtered = messages.filter((msg) => msg.id !== messageId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  clearMessages() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
