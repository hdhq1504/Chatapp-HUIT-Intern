class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    this.apiPrefix = '/api/v1';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${this.apiPrefix}${endpoint}`;
    const config = { ...options };

    const headers = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...config.headers,
    };

    if (!(config.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';

      if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
      }
    }

    config.headers = headers;

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        let errorData = {};
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const text = await response.text().catch(() => '');
          errorData = { message: text };
        }

        // Handle backend error format
        const errorMessage = errorData.message || `HTTP ${response.status}`;
        const error = new Error(errorMessage);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      if (response.status === 204) {
        return { data: null };
      }

      if (!contentType || !contentType.includes('application/json')) {
        return { data: await response.text() };
      }

      const jsonResponse = await response.json();

      // Handle backend response format: { status, message, data }
      if (jsonResponse.hasOwnProperty('status') && jsonResponse.hasOwnProperty('data')) {
        return jsonResponse; // Return full backend response
      }

      // Fallback for other response formats
      return { data: jsonResponse };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return await this.request('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    // Backend handles logout via JWT filter at /api/v1/auth/logout
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request('/auth/refresh-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  async sendPasswordResetKey(email) {
    return this.request('/auth/send-key', {
      method: 'POST',
      body: { email },
    });
  }

  async resetPassword(resetData) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: resetData,
    });
  }

  async changePassword(passwordData) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: passwordData,
    });
  }

  // User management endpoints
  async getCurrentUser() {
    return this.request('/users');
  }

  async getAllUsers() {
    return this.request('/users/all-user-online');
  }

  async getUserById(userId) {
    // Note: Backend might not have this endpoint, using current user endpoint
    return this.request('/users');
  }

  async updateProfile(userData) {
    // Note: Backend might need specific endpoint for profile updates
    return this.request('/users/update-profile', {
      method: 'PUT',
      body: userData,
    });
  }

  async connectUser() {
    return this.request('/users/connect', {
      method: 'POST',
    });
  }

  async disconnectUser() {
    return this.request('/users/disconnect', {
      method: 'POST',
    });
  }

  // Message endpoints
  async sendMessage(messageData) {
    return this.request('/messageContents/send', {
      method: 'POST',
      body: messageData,
    });
  }

  async getConversationMessages(roomId, page = 0, size = 50) {
    return this.request(`/messagerooms/find-message-room-at-least-one-content/${roomId}?page=${page}&size=${size}`);
  }

  async getConversation(userId1, userId2, page = 0, size = 50) {
    // For direct messages between two users
    return this.request(
      `/messageroomUsers/find-message-user-at-least-one-content/${userId1}?page=${page}&size=${size}`,
    );
  }

  async getMessagesByRoomId(roomId, page = 0, size = 50) {
    return this.request(`/messageContents/room/${roomId}?page=${page}&size=${size}`);
  }

  async updateMessage(messageId, updates) {
    return this.request(`/messageContents/${messageId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messageContents/${messageId}`, {
      method: 'DELETE',
    });
  }

  async markMessagesAsRead(roomId) {
    return this.request(`/messageContents/read`, {
      method: 'PUT',
      body: { roomId },
    });
  }

  // Room management endpoints
  async createMessageRoom(memberIds) {
    return this.request('/messagerooms/create-room', {
      method: 'POST',
      body: { members: memberIds },
    });
  }

  async getMessageRooms(userId) {
    return this.request(`/messagerooms/find-message-room-at-least-one-content/${userId}`);
  }

  async getMessageUsers(userId) {
    return this.request(`/messageroomUsers/find-message-user-at-least-one-content/${userId}`);
  }

  async updateRoom(roomId, updates) {
    return this.request(`/messagerooms/${roomId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteRoom(roomId) {
    return this.request(`/messagerooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  async addMemberToRoom(roomId, userId) {
    return this.request(`/messagerooms/${roomId}/members`, {
      method: 'POST',
      body: { userId },
    });
  }

  async removeMemberFromRoom(roomId, userId) {
    return this.request(`/messagerooms/${roomId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoint
  async uploadFile(file, type = 'message') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
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
      username: backendUser.name, // Map email to username for compatibility
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
      receiverId: backendMessage.receiverId || null,
      content: backendMessage.content,
      type: backendMessage.messageType?.toLowerCase() || 'text',
      timestamp: new Date(backendMessage.dateSent).getTime(),
      status: 'sent',
      sender: backendMessage.userId === currentUserId ? 'self' : 'other',
      roomId: backendMessage.roomId || null,
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
      const promises = requests.map(({ endpoint, options }) => this.request(endpoint, options));
      return await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/actuator/health`);
      return response.ok;
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
