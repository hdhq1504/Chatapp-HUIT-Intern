import { api } from '../api/apiService';

export class MessageService {
  static instance = null;

  static getInstance() {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  subscribe(conversationKey, callback) {
    if (!this.subscribers.has(conversationKey)) {
      this.subscribers.set(conversationKey, new Set());
    }
    this.subscribers.get(conversationKey).add(callback);

    return () => {
      const callbacks = this.subscribers.get(conversationKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(conversationKey);
        }
      }
    };
  }

  notifySubscribers(conversationKey, messages) {
    const callbacks = this.subscribers.get(conversationKey);
    if (callbacks) {
      callbacks.forEach((callback) => callback(messages));
    }
  }

  getConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  async getConversationMessages(roomId, page = 1, limit = 50, useCache = true) {
    if (useCache && this.cache.has(`${roomId}_${page}`)) {
      return this.cache.get(`${roomId}_${page}`);
    }

    const response = await api.request(
      `/messages/${roomId}?page=${page - 1}&size=${limit}`,
      {
        method: 'GET',
      }
    );

    this.cache.set(`${roomId}_${page}`, response.content);

    return response.content;
  }

  async sendMessage(roomId, messageData) {
    const response = await api.request(`/messages/${roomId}`, {
      method: 'POST',
      body: {
        content: messageData.content,
        type: messageData.type || 'TEXT',
      },
    });

    const savedMessage = response;

    // Clear cache for this room
    this.clearRoomCache(roomId);

    // Get updated messages and notify subscribers
    const messages = await this.getConversationMessages(
      roomId,
      1,
      50,
      false
    );

    // Create conversation key from room participants if available
    if (messageData.fromUserId && messageData.toUserId) {
      const conversationKey = this.getConversationKey(
        messageData.fromUserId,
        messageData.toUserId
      );
      this.notifySubscribers(conversationKey, messages || []);
    }

    return savedMessage;
  }

  async updateMessage(messageId, updates) {
    const response = await api.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: updates,
    });

    this.clearAllCache();
    return response;
  }

  async deleteMessage(messageId) {
    await api.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });

    this.clearAllCache();
    return true;
  }

  async markMessagesAsRead(roomId, userId) {
    const response = await api.request(`/messages/${roomId}/read`, {
      method: 'PUT',
    });

    // Update read status in cache
    this.updateReadStatusInCache(roomId, userId);

    return response;
  }

  getUnreadCount(messages, currentUserId) {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.filter(
      (msg) => msg.toUserId === currentUserId && !msg.read
    ).length;
  }

  clearConversationCache(conversationKey) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(conversationKey)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clearRoomCache(roomId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${roomId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clearAllCache() {
    this.cache.clear();
  }

  updateReadStatusInCache(roomId, currentUserId) {
    for (const [key, data] of this.cache.entries()) {
      if (key.startsWith(`${roomId}_`) && data.messages) {
        data.messages = data.messages.map((msg) => {
          if (msg.toUserId === currentUserId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });
      }
    }
  }

  handleRealtimeMessage(message) {
    const conversationKey = this.getConversationKey(
      message.fromUserId,
      message.toUserId
    );

    // Add message to cache
    for (const [key, data] of this.cache.entries()) {
      if (key.startsWith(conversationKey) && data.messages) {
        data.messages.push(message);
      }
    }

    // Notify subscribers
    this.notifySubscribers(conversationKey, [message]);
  }
}

export const messageService = new MessageService();