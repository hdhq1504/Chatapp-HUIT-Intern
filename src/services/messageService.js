import { api, handleApiResponse, handleApiError } from '../api';

export class MessageService {
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
      callbacks.forEach(callback => callback(messages));
    }
  }

  getConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  async getConversationMessages(userId1, userId2, page = 1, limit = 50, useCache = true) {
    try {
      const conversationKey = this.getConversationKey(userId1, userId2);

      if (useCache && this.cache.has(`${conversationKey}_${page}`)) {
        return this.cache.get(`${conversationKey}_${page}`);
      }

      const response = await api.getConversation(userId1, userId2, page, limit);
      const data = handleApiResponse(response);

      this.cache.set(`${conversationKey}_${page}`, data);

      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendMessage(fromUserId, toUserId, messageData) {
    try {
      const fullMessageData = {
        ...messageData,
        fromUserId,
        toUserId,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
      };

      const response = await api.sendMessage(fullMessageData);
      const savedMessage = handleApiResponse(response);

      const conversationKey = this.getConversationKey(fromUserId, toUserId);
      this.clearConversationCache(conversationKey);

      const messages = await this.getConversationMessages(fromUserId, toUserId, 1, 50, false);
      this.notifySubscribers(conversationKey, messages.messages || []);

      return savedMessage;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateMessage(messageId, updates) {
    try {
      const response = await api.updateMessage(messageId, updates);
      const updatedMessage = handleApiResponse(response);

      this.clearAllCache();

      return updatedMessage;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteMessage(messageId) {
    try {
      const response = await api.deleteMessage(messageId);
      const result = handleApiResponse(response);

      this.clearAllCache();

      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async markMessagesAsRead(userId1, userId2) {
    try {
      const conversationKey = this.getConversationKey(userId1, userId2);
      const response = await api.markMessagesAsRead(conversationKey);
      const result = handleApiResponse(response);

      this.updateReadStatusInCache(conversationKey, userId1);

      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  getUnreadCount(messages, currentUserId) {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.filter(msg =>
      msg.toUserId === currentUserId && !msg.read
    ).length;
  }

  clearConversationCache(conversationKey) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(conversationKey)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAllCache() {
    this.cache.clear();
  }

  updateReadStatusInCache(conversationKey, currentUserId) {
    for (const [key, data] of this.cache.entries()) {
      if (key.startsWith(conversationKey) && data.messages) {
        data.messages = data.messages.map(msg => {
          if (msg.toUserId === currentUserId && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        });
      }
    }
  }

  handleRealtimeMessage(message) {
    const conversationKey = this.getConversationKey(message.fromUserId, message.toUserId);

    for (const [key, data] of this.cache.entries()) {
      if (key.startsWith(conversationKey) && data.messages) {
        data.messages.push(message);
      }
    }

    this.notifySubscribers(conversationKey, [message]);
  }
}

export const messageService = new MessageService();