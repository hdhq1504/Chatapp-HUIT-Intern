import axios from 'axios';
import { safeSessionGetItem } from '../utils/storage/index';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    this.apiPrefix = '/api/v1';
    this.token = null;

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: `${this.baseURL}${this.apiPrefix}`,
      timeout: 30000,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Backend returns { status, message, data } format
        return response.data;
      },
      (error) => {
        console.error(`API Error:`, error);

        // Handle different error scenarios
        if (error.response) {
          // Server responded with error status
          const errorData = error.response.data;
          const errorMessage = errorData?.message || `HTTP ${error.response.status}`;
          const customError = new Error(errorMessage);
          customError.response = {
            status: error.response.status,
            data: errorData,
          };
          throw customError;
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error - no response from server');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      },
    );
  }

  setToken(token) {
    this.token = token;
  }

  // Authentication endpoints
  async login(credentials) {
    return this.axiosInstance.post('/auth/signin', credentials);
  }

  async register(userData) {
    return this.axiosInstance.post('/auth/signup', userData);
  }

  async logout() {
    return this.axiosInstance.post('/auth/signout');
  }

  async refreshToken() {
    // For refresh token, we need to get it from sessionStorage and use it in headers
    const refreshToken = safeSessionGetItem('refresh_token', null);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.axiosInstance.post(
      '/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
  }

  async sendPasswordResetKey(email) {
    return this.axiosInstance.post('/auth/send-key', { email });
  }

  async resetPassword(resetData) {
    return this.axiosInstance.post('/auth/reset-password', resetData);
  }

  async changePassword(passwordData) {
    return this.axiosInstance.post('/users/change-password', passwordData);
  }

  // User management endpoints
  async getCurrentUser() {
    return this.axiosInstance.get('/users/profile');
  }

  async getAllUsers() {
    return this.axiosInstance.get('/users/all-user-online');
  }

  async getUserById(userId) {
    // Backend uses profile endpoint for current user
    void userId;
    return this.axiosInstance.get('/users/profile');
  }

  async updateProfile(userData) {
    // Note: Backend might need specific endpoint for profile updates
    return this.axiosInstance.put('/users/update-profile', userData);
  }

  async connectUser() {
    return this.axiosInstance.post('/users/connect');
  }

  async disconnectUser() {
    return this.axiosInstance.post('/users/disconnect');
  }

  // Message endpoints
  async sendMessage(messageData) {
    return this.axiosInstance.post('/messageContents/send', messageData);
  }

  async getConversationMessages(roomId, page = 0, size = 50) {
    return this.axiosInstance.get(
      `/messagerooms/find-message-room-at-least-one-content/${roomId}?page=${page}&size=${size}`,
    );
  }

  async getConversation(userId1, userId2, page = 0, size = 50) {
    // For direct messages between two users
    return this.axiosInstance.get(
      `/messageroomUsers/find-message-user-at-least-one-content/${userId1}?page=${page}&size=${size}`,
    );
  }

  async getMessagesByRoomId(roomId, page = 0, size = 50, before = null) {
    const params = new URLSearchParams({ page: page.toString(), limit: size.toString() });
    if (before) {
      params.append('before', before);
    }
    return this.axiosInstance.get(`/messagerooms/${roomId}/messages?${params.toString()}`);
  }

  async updateMessage(messageId, updates) {
    return this.axiosInstance.put(`/messageContents/${messageId}`, updates);
  }

  async deleteMessage(messageId) {
    return this.axiosInstance.delete(`/messageContents/${messageId}`);
  }

  async markMessagesAsRead(roomId) {
    return this.axiosInstance.put(`/messageContents/read`, { roomId });
  }

  // Room management endpoints
  async createMessageRoom(memberIds) {
    return this.axiosInstance.post('/messagerooms/create-room', {
      members: memberIds,
    });
  }

  async getMessageRooms(userId) {
    return this.axiosInstance.get(`/messagerooms/find-message-room-at-least-one-content/${userId}`);
  }

  async getMessageUsers(userId) {
    return this.axiosInstance.get(`/messageroomUsers/find-message-user-at-least-one-content/${userId}`);
  }

  async getUserRooms() {
    return this.axiosInstance.get('/messagerooms/me/rooms');
  }

  async getRoom(roomId) {
    return this.axiosInstance.get(`/messagerooms/${roomId}`);
  }

  async updateRoom(roomId, updates) {
    return this.axiosInstance.patch(`/messagerooms/${roomId}`, updates);
  }

  async deleteRoom(roomId) {
    return this.axiosInstance.delete(`/messagerooms/${roomId}`);
  }

  async addMemberToRoom(roomId, userIds) {
    return this.axiosInstance.post(`/messagerooms/${roomId}/members`, {
      userIds: Array.isArray(userIds) ? userIds : [userIds],
    });
  }

  async removeMemberFromRoom(roomId, userId) {
    return this.axiosInstance.delete(`/messagerooms/${roomId}/members/${userId}`);
  }

  async leaveRoom(roomId) {
    return this.axiosInstance.post(`/messagerooms/${roomId}/leave`);
  }

  async searchUsers(query, page = 0, limit = 20) {
    return this.axiosInstance.get('/messagerooms/search', {
      params: { query, page, limit },
    });
  }

  // File upload endpoint
  async uploadFile(file, type = 'message') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.axiosInstance.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Helper methods for data transformation

  /**
   * Transform backend user to client format
   */
  transformUser(backendUser) {
    if (!backendUser) return null;

    return {
      id: backendUser.id,
      name: backendUser.name,
      username: backendUser.name, // Map name to username for compatibility
      email: backendUser.email,
      phone: backendUser.phone,
      avatar: backendUser.avatar || null,
      roles: backendUser.roles || [],
      status: backendUser.status || 'OFFLINE',
      lastLogin: backendUser.lastLogin,
    };
  }

  /**
   * Transform backend message to client format
   */
  transformMessage(backendMessage, currentUserId) {
    if (!backendMessage) return null;

    return {
      id: backendMessage.id,
      senderId: backendMessage.userId,
      receiverId: backendMessage.recivedMessageUserId || null,
      content: backendMessage.content,
      type: backendMessage.messageType?.toLowerCase() || 'text',
      timestamp: new Date(backendMessage.dateSent || backendMessage.sendedAt).getTime(),
      status: 'sent',
      sender: backendMessage.userId === currentUserId ? 'self' : 'other',
      roomId: backendMessage.recivedMessageRoomId || null,
      read: backendMessage.read || false,
    };
  }

  /**
   * Transform backend room to client format
   */
  transformRoom(backendRoom) {
    if (!backendRoom) return null;

    return {
      id: backendRoom.id,
      name: backendRoom.name,
      type: backendRoom.isGroup ? 'group' : 'direct',
      createdAt: backendRoom.createdAt,
      createdBy: backendRoom.createdBy,
      members: backendRoom.members || [],
      lastMessage: backendRoom.lastMessage ? this.transformMessage(backendRoom.lastMessage) : null,
      unreadCount: backendRoom.unreadCount || 0,
    };
  }

  /**
   * Helper to handle API errors consistently
   */
  handleApiError(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Helper to check if response is successful
   */
  isSuccessResponse(response) {
    return (
      response.status === '200' || response.status === 200 || (response.data !== null && response.data !== undefined)
    );
  }

  // Batch operations for efficiency
  async batchRequest(requests) {
    try {
      const promises = requests.map(({ endpoint, options }) =>
        this.axiosInstance.request({ url: endpoint, ...options }),
      );
      return await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/actuator/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // WebSocket info (for ChatContext)
  getWebSocketUrl() {
    return `${this.baseURL}/api/ws`;
  }

  // Debug helper
  getApiInfo() {
    return {
      baseURL: this.baseURL,
      apiPrefix: this.apiPrefix,
      hasToken: !!this.token,
      tokenPrefix: this.token ? this.token.substring(0, 10) + '...' : null,
    };
  }
}

export const api = new ApiService();
