// Base Storage Class với các phương thức chung
class BaseStorage {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  getData(defaultValue = []) {
    return safeGetItem(this.storageKey, defaultValue);
  }

  setData(data) {
    return safeSetItem(this.storageKey, data);
  }

  clear() {
    return safeRemoveItem(this.storageKey);
  }
}

// Chat Storage - Quản lý tin nhắn trong chat đơn
export class ChatStorage extends BaseStorage {
  constructor(chatId = 'default') {
    super(`chat_messages_${chatId}`);
    this.chatId = chatId;
  }

  saveMessage(message) {
    const messages = this.getData([]);
    const newMessage = {
      ...message,
      id: message.id || generateId('msg'),
      timestamp: message.timestamp || new Date().toISOString(),
      timestampMs: message.timestampMs || Date.now(),
    };

    messages.push(newMessage);
    this.setData(messages);
    return newMessage;
  }

  getMessages() {
    return this.getData([]);
  }

  updateMessage(messageId, updates) {
    const messages = this.getMessages();
    const index = messages.findIndex((msg) => msg.id === messageId);

    if (index === -1) return null;

    messages[index] = { ...messages[index], ...updates };
    this.setData(messages);
    return messages[index];
  }

  deleteMessage(messageId) {
    const messages = this.getMessages();
    const filtered = messages.filter((msg) => msg.id !== messageId);
    return this.setData(filtered);
  }

  clearMessages() {
    return this.clear();
  }
}

// Global Message Storage - Quản lý tin nhắn giữa các user
export class GlobalMessageStorage extends BaseStorage {
  constructor() {
    super('global_messages');
  }

  getConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  saveMessage(fromUserId, toUserId, message) {
    const allMessages = this.getData({});
    const conversationKey = this.getConversationKey(fromUserId, toUserId);

    if (!allMessages[conversationKey]) allMessages[conversationKey] = [];

    const newMessage = {
      ...message,
      id: message.id || generateId('msg'),
      fromUserId,
      toUserId,
      timestamp: message.timestamp || new Date().toISOString(),
      timestampMs: message.timestampMs || Date.now(),
    };

    allMessages[conversationKey].push(newMessage);
    this.setData(allMessages);
    return newMessage;
  }

  getConversationMessages(userId1, userId2) {
    const allMessages = this.getData({});
    const conversationKey = this.getConversationKey(userId1, userId2);
    return allMessages[conversationKey] || [];
  }

  clearConversation(userId1, userId2) {
    const allMessages = this.getData({});
    const conversationKey = this.getConversationKey(userId1, userId2);
    delete allMessages[conversationKey];
    return this.setData(allMessages);
  }

  getLastMessage(userId1, userId2) {
    const messages = this.getConversationMessages(userId1, userId2);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  markMessagesAsRead(userId1, userId2, currentUserId) {
    const allMessages = this.getData({});
    const conversationKey = this.getConversationKey(userId1, userId2);

    if (!allMessages[conversationKey]) return false;

    allMessages[conversationKey] = allMessages[conversationKey].map((msg) =>
      msg.toUserId === currentUserId && !msg.read ? { ...msg, read: true } : msg,
    );

    return this.setData(allMessages);
  }

  getUnreadCount(userId1, userId2, currentUserId) {
    const messages = this.getConversationMessages(userId1, userId2);
    return messages.filter((msg) => msg.toUserId === currentUserId && !msg.read).length;
  }
}

// Group Storage - Quản lý các nhóm chat
export class GroupStorage extends BaseStorage {
  constructor() {
    super('chat_groups');
  }

  generateGroupAvatar(name) {
    return name;
  }

  createGroup(groupData) {
    const groups = this.getData([]);
    const newGroup = {
      id: generateId('group'),
      name: groupData.name,
      members: groupData.members || [],
      avatar: this.generateGroupAvatar(groupData.name),
      createdAt: new Date().toISOString(),
      lastMessageTime: '',
      status: 'Group created',
      unreadCount: 0,
      lastMessageTimestamp: Date.now(),
      type: 'group',
      active: true,
    };

    groups.unshift(newGroup);
    this.setData(groups);
    return newGroup;
  }

  getGroups() {
    return this.getData([]);
  }

  updateGroup(groupId, updates) {
    const groups = this.getGroups();
    const index = groups.findIndex((group) => group.id === groupId);
    if (index === -1) return null;

    groups[index] = { ...groups[index], ...updates };
    this.setData(groups);
    return groups[index];
  }

  deleteGroup(groupId) {
    const groups = this.getGroups();
    const filtered = groups.filter((group) => group.id !== groupId);
    return this.setData(filtered);
  }

  addMemberToGroup(groupId, member) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return null;

    if (!group.members.some((m) => m.id === member.id)) {
      group.members.push(member);
      this.setData(groups);
    }
    return group;
  }

  removeMemberFromGroup(groupId, memberId) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return null;

    group.members = group.members.filter((m) => m.id !== memberId);
    this.setData(groups);
    return group;
  }

  generateGroupId() {
    return generateId('group');
  }
}

// Storage Utils - Các hàm tiện ích cho localStorage
export function safeGetItem(key, defaultValue = null) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`safeStorageGetItem(${key}) error`, err);
    return defaultValue;
  }
};

const safeStorageSetItem = (storage, key, value) => {
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Try a simple quota handling: trim arrays to keep recent items
    try {
      if (err && err.name === 'QuotaExceededError') {
        if (Array.isArray(value)) {
          const trimmed = value.slice(-50);
          localStorage.setItem(key, JSON.stringify(trimmed));
          return true;
        }
      }
    } catch (e) {
      console.warn('safeSetItem fallback failed', e);
    }

    console.warn(`safeStorageSetItem(${key}) failed`, err);
    return false;
  }
};

const safeStorageRemoveItem = (storage, key) => {
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`safeStorageRemoveItem(${key}) failed`, err);
    return false;
  }
};

// Storage Utils - Các hàm tiện ích cho localStorage
export function safeGetItem(key, defaultValue = null) {
  return safeStorageGetItem(localStorageRef, key, defaultValue);
}

export function safeSetItem(key, value) {
  return safeStorageSetItem(localStorageRef, key, value);
}

export function safeRemoveItem(key) {
  return safeStorageRemoveItem(localStorageRef, key);
}

// Session storage helpers for per-tab persistence
export function safeSessionGetItem(key, defaultValue = null) {
  return safeStorageGetItem(sessionStorageRef, key, defaultValue);
}

export function safeSessionSetItem(key, value) {
  return safeStorageSetItem(sessionStorageRef, key, value);
}

export function safeSessionRemoveItem(key) {
  return safeStorageRemoveItem(sessionStorageRef, key);
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// Export instances sẵn sàng sử dụng
export const globalMessageStorage = new GlobalMessageStorage();
export const groupStorage = new GroupStorage();
