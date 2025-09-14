class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
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
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      if (!contentType || !contentType.includes('application/json')) {
        return await response.text();
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: userData,
    });
  }

  async getConversation(userId1, userId2, page = 1, limit = 50) {
    return this.request(
      `/messages/conversation?user1=${userId1}&user2=${userId2}&page=${page}&limit=${limit}`,
    );
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: messageData,
    });
  }

  async updateMessage(messageId, updates) {
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async markMessagesAsRead(conversationId) {
    return this.request(`/messages/read`, {
      method: 'PUT',
      body: { conversationId },
    });
  }

  async getGroups() {
    return this.request('/groups');
  }

  async createGroup(groupData) {
    return this.request('/groups', {
      method: 'POST',
      body: groupData,
    });
  }

  async updateGroup(groupId, updates) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteGroup(groupId) {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async uploadFile(file, type = 'message') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }
}

export const api = new ApiService();
