import apiService from '../api/apiService';

export class UserService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  isValidCache(key) {
    const cached = this.cache.get(key);
    return cached && Date.now() - cached.timestamp < this.cacheExpiry;
  }

  async getAllUsers(useCache = true) {
    const cacheKey = 'all_users';

    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await apiService.request('/users', {
        method: 'GET',
      });

      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId, useCache = true) {
    const cacheKey = `user_${userId}`;

    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await apiService.request(`/users/${userId}`, {
        method: 'GET',
      });

      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      // Clear invalid cache entry if request fails
      this.cache.delete(cacheKey);
      throw error;
    }
  }

  async getOtherUsers(currentUserId, useCache = true) {
    try {
      const allUsers = await this.getAllUsers(useCache);
      return allUsers.filter((user) => user.id !== currentUserId);
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(query, excludeUserId = null) {
    try {
      const allUsers = await this.getAllUsers(true);

      const filtered = allUsers.filter((user) => {
        if (excludeUserId && user.id === excludeUserId) return false;

        const searchText = query.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchText) ||
          user.username?.toLowerCase().includes(searchText) ||
          user.email?.toLowerCase().includes(searchText)
        );
      });

      return filtered;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    const response = await apiService.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    });

    // Update cache with new profile data
    this.cache.set(`user_${response.id}`, {
      data: response,
      timestamp: Date.now(),
    });

    // Clear all users cache to refresh the list
    this.cache.delete('all_users');

    return response;
  }

  async uploadAvatar(file) {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiService.request('/users/avatar', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData
      headers: {},
    });

    // Update profile with new avatar URL
    return await this.updateProfile({
      avatar: response.url,
    });
  }

  async getUserConversations(userId) {
    const otherUsers = await this.getOtherUsers(userId);

    return otherUsers.map((user) => ({
      ...user,
      type: 'user',
      lastMessage: null,
      unreadCount: 0,
      lastMessageTime: '',
      lastMessageTimestamp: 0,
    }));
  }

  clearCache() {
    this.cache.clear();
  }

  clearUserCache(userId) {
    this.cache.delete(`user_${userId}`);
    this.cache.delete('all_users');
  }

  async updateUserStatus(status) {
    console.log('User status updated:', status);
    return { status };
  }

  async getUserStatus(userId) {
    try {
      // Note: apiService doesn't have getUserStatus method
      // You may need to add this method to apiService or use a different approach
      return {
        userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      };
    } catch (error) {
      // Return default status if API fails
      return {
        userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      };
    }
  }
}

export const userService = new UserService();