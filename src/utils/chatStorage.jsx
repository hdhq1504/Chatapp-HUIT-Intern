export class ChatStorage {
  constructor(chatId = 'default') {
    this.chatId = chatId;
    this.storageKey = `chat_messages_${chatId}`;
  }

  // Lưu tin nhắn vào localStorage
  saveMessage(message) {
    try {
      const messages = this.getMessages();
      const newMessage = {
        ...message,
        id: message.id || this.generateMessageId(),
        timestamp: message.timestamp || new Date().toISOString(),
      };

      messages.push(newMessage);
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
      return newMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      return message;
    }
  }

  // Lưu nhiều tin nhắn cùng lúc
  saveMessages(messages) {
    try {
      const processedMessages = messages.map((msg) => ({
        ...msg,
        id: msg.id || this.generateMessageId(),
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      localStorage.setItem(this.storageKey, JSON.stringify(processedMessages));
      return processedMessages;
    } catch (error) {
      console.error('Error saving messages:', error);
      return messages;
    }
  }

  // Lấy tất cả tin nhắn
  getMessages() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Cập nhật tin nhắn
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

  // Xóa tin nhắn
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

  // Xóa tất cả tin nhắn
  clearMessages() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }

  // Tạo ID duy nhất cho tin nhắn
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Lấy thống kê chat
  getStats() {
    try {
      const messages = this.getMessages();
      return {
        totalMessages: messages.length,
        selfMessages: messages.filter((msg) => msg.sender === 'self').length,
        otherMessages: messages.filter((msg) => msg.sender !== 'self').length,
        filesShared: messages.filter((msg) => msg.type === 'files').length,
        imagesShared: messages.filter((msg) => msg.type === 'image').length,
        lastActivity:
          messages.length > 0 ? messages[messages.length - 1].timestamp : null,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // Export chat data
  exportChat() {
    try {
      const messages = this.getMessages();
      return JSON.stringify(
        {
          chatId: this.chatId,
          exportDate: new Date().toISOString(),
          messageCount: messages.length,
          messages: messages,
        },
        null,
        2,
      );
    } catch (error) {
      console.error('Error exporting chat:', error);
      return null;
    }
  }

  // Import chat data
  importChat(exportData) {
    try {
      const data =
        typeof exportData === 'string' ? JSON.parse(exportData) : exportData;
      if (data.messages && Array.isArray(data.messages)) {
        this.saveMessages(data.messages);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing chat:', error);
      return false;
    }
  }
}
