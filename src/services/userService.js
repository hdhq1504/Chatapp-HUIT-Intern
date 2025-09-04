import { api, handleApiResponse, handleApiError } from '../api';

export class UserService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;
  }

  async getAllUsers(useCache = true) {
    try {
      const cacheKey = 'all_users';

      if (useCache && this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      const response = await api.getAllUsers();
      const users = handleApiResponse(response);

      this.cache.set(cacheKey, {
        data: users,
        timestamp: Date.now(),
      });

      return users;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserById(userId, useCache = true) {
    try {
      const cacheKey = `user_${userId}`;

      if (useCache && this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      const response = await api.getUserById(userId);
      const user = handleApiResponse(response);

      this.cache.set(cacheKey, {
        data: user,
        timestamp: Date.now(),
      });

      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getOtherUsers(currentUserId, useCache = true) {
    try {
      const allUsers = await this.getAllUsers(useCache);
      return allUsers.filter(user => user.id !== currentUserId);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async searchUsers(query, excludeUserId = null) {
    try {
      const allUsers = await this.getAllUsers(true);

      const filtered = allUsers.filter(user => {
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
      throw handleApiError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.updateProfile(profileData);
      const updatedUser = handleApiResponse(response);

      this.cache.set(`user_${updatedUser.id}`, {
        data: updatedUser,
        timestamp: Date.now(),
      });

      this.cache.delete('all_users');

      return updatedUser;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async uploadAvatar(file) {
    try {
      const response = await api.uploadFile(file, 'avatar');
      const fileData = handleApiResponse(response);

      return await this.updateProfile({
        avatar: fileData.url,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserConversations(userId) {
    try {
      const otherUsers = await this.getOtherUsers(userId);

      return otherUsers.map(user => ({
        ...user,
        type: 'user',
        lastMessage: null,
        unreadCount: 0,
        lastMessageTime: '',
        lastMessageTimestamp: 0,
      }));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  isValidCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = (Date.now() - cached.timestamp) > this.cacheExpiry;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clearCache() {
    this.cache.clear();
  }

  clearUserCache(userId) {
    this.cache.delete(`user_${userId}`);
    this.cache.delete('all_users');
  }

  async updateUserStatus(status) {
    try {
      console.log('User status updated:', status);
      return { status };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserStatus(userId) {
    try {
      return {
        userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const userService = new UserService();