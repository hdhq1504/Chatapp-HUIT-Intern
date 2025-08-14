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
}
