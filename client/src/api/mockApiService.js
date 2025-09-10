import { globalMessageStorage } from '../utils/globalMessageStorage';
import { safeGetItem, safeSetItem, generateId } from '../utils/storageUtils';

class MockApiService {
  constructor() {
    this.token = null;
    this.delay = 300;
  }

  async simulateNetworkDelay() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  setToken(token) {
    this.token = token;
  }

  // Simulate API response
  createResponse(data, success = true, message = '') {
    return {
      success,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  // Auth endpoints
  async login(credentials) {
    await this.simulateNetworkDelay();

  const { email } = credentials;
    const existingUser = this.getUserByEmail(email);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // In real app, verify password
    const profile = existingUser;
    const token = `mock_token_${profile.id}_${Date.now()}`;

    return this.createResponse({
      user: profile,
      token,
      refreshToken: `refresh_${token}`,
    });
  }

  async register(userData) {
    await this.simulateNetworkDelay();

  const { username, email } = userData;
    const existingUser = this.getUserByEmail(email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const profile = {
      id: this.generateUserId(),
      username,
      name: username,
      email,
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveUserToStorage(profile);
    const token = `mock_token_${profile.id}_${Date.now()}`;

    return this.createResponse({
      user: profile,
      token,
      refreshToken: `refresh_${token}`,
    });
  }

  async logout() {
    await this.simulateNetworkDelay();
    this.token = null;
    return this.createResponse({ message: 'Logged out successfully' });
  }

  async refreshToken() {
    await this.simulateNetworkDelay();
    const newToken = `mock_token_refresh_${Date.now()}`;
    return this.createResponse({
      token: newToken,
      refreshToken: `refresh_${newToken}`,
    });
  }

  async getCurrentUser() {
    await this.simulateNetworkDelay();

    if (!this.token) {
      throw new Error('Unauthorized');
    }

    const userId = this.token.split('_')[2];
    const user = this.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.createResponse(user);
  }

  async getAllUsers() {
    await this.simulateNetworkDelay();
    const users = this.getAllUsersFromStorage();
    return this.createResponse(users);
  }

  async getUserById(userId) {
    await this.simulateNetworkDelay();
    const user = this.getUserByIdFromStorage(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.createResponse(user);
  }

  async updateProfile(userData) {
    await this.simulateNetworkDelay();

    if (!this.token) {
      throw new Error('Unauthorized');
    }

    const userId = this.token.split('_')[2];
    const user = this.getUserByIdFromStorage(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    this.updateUserInStorage(updatedUser);
    return this.createResponse(updatedUser);
  }

  async getConversation(userId1, userId2, page = 1, limit = 50) {
    await this.simulateNetworkDelay();

    const messages = globalMessageStorage.getConversationMessages(userId1, userId2);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    return this.createResponse({
      messages: paginatedMessages,
      pagination: {
        page,
        limit,
        total: messages.length,
        hasNext: endIndex < messages.length,
        hasPrev: page > 1,
      },
    });
  }

  async sendMessage(messageData) {
    await this.simulateNetworkDelay();

    const savedMessage = globalMessageStorage.saveMessage(
      messageData.fromUserId,
      messageData.toUserId,
      messageData
    );

    return this.createResponse(savedMessage);
  }

  async updateMessage(messageId, updates) {
    await this.simulateNetworkDelay();

    const allMessages = globalMessageStorage.getAllMessages();
    let updatedMessage = null;

    for (const conversationKey in allMessages) {
      const messageIndex = allMessages[conversationKey].findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        allMessages[conversationKey][messageIndex] = {
          ...allMessages[conversationKey][messageIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        updatedMessage = allMessages[conversationKey][messageIndex];
        safeSetItem('global_messages', allMessages);
        break;
      }
    }

    if (!updatedMessage) {
      throw new Error('Message not found');
    }

    return this.createResponse(updatedMessage);
  }

  async deleteMessage(messageId) {
    await this.simulateNetworkDelay();

    const allMessages = globalMessageStorage.getAllMessages();
    let found = false;

    for (const conversationKey in allMessages) {
      const messageIndex = allMessages[conversationKey].findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        allMessages[conversationKey].splice(messageIndex, 1);
        safeSetItem('global_messages', allMessages);
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error('Message not found');
    }

    return this.createResponse({ message: 'Message deleted successfully' });
  }

  async markMessagesAsRead() {
    await this.simulateNetworkDelay();

    return this.createResponse({ message: 'Messages marked as read' });
  }

  async getGroups() {
    await this.simulateNetworkDelay();

    try {
      const groups = safeGetItem('groups', []);
      return this.createResponse(groups);
    } catch (err) {
      console.warn('getGroups error', err);
      return this.createResponse([]);
    }
  }

  async createGroup(groupData) {
    await this.simulateNetworkDelay();

    const group = {
      ...groupData,
      id: this.generateGroupId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const groups = safeGetItem('groups', []);
    groups.push(group);
    safeSetItem('groups', groups);

    return this.createResponse(group);
  }

  async updateGroup(groupId, updates) {
    await this.simulateNetworkDelay();

    const groups = safeGetItem('groups', []);
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) {
      throw new Error('Group not found');
    }

    groups[groupIndex] = {
      ...groups[groupIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    safeSetItem('groups', groups);
    return this.createResponse(groups[groupIndex]);
  }

  async deleteGroup(groupId) {
    await this.simulateNetworkDelay();

    const groups = safeGetItem('groups', []);
    const filteredGroups = groups.filter(g => g.id !== groupId);

    if (groups.length === filteredGroups.length) {
      throw new Error('Group not found');
    }

    safeSetItem('groups', filteredGroups);
    return this.createResponse({ message: 'Group deleted successfully' });
  }

  async uploadFile(file) {
    await this.simulateNetworkDelay();

    const fileData = {
      id: generateId('file'),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    return this.createResponse(fileData);
  }

  getUserByEmail(email) {
    const users = this.getAllUsersFromStorage();
    return users.find(user => user.email === email);
  }

  getUserByIdFromStorage(userId) {
    const users = this.getAllUsersFromStorage();
    return users.find(user => user.id === userId);
  }

  getAllUsersFromStorage() {
    try {
      return safeGetItem('all_users', []);
    } catch (error) {
      console.warn('getAllUsersFromStorage error', error);
      return [];
    }
  }

  saveUserToStorage(user) {
    try {
      const users = this.getAllUsersFromStorage();
      const existingIndex = users.findIndex(u => u.id === user.id);

      if (existingIndex === -1) users.push(user);
      else users[existingIndex] = user;

      safeSetItem('all_users', users);
    } catch (error) {
      console.warn('Error saving user:', error);
    }
  }

  updateUserInStorage(user) {
    try {
      const users = this.getAllUsersFromStorage();
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex !== -1) {
        users[userIndex] = user;
        safeSetItem('all_users', users);
      }
    } catch (error) {
      console.warn('Error updating user:', error);
    }
  }

  generateUserId() {
    return generateId('user');
  }

  generateGroupId() {
    return generateId('group');
  }
}

export const mockApiService = new MockApiService();