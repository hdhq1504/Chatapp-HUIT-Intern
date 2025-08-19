export class GroupStorage {
  constructor() {
    this.storageKey = 'chat_groups';
  }

  // Tạo group mới
  createGroup(groupData) {
    try {
      const groups = this.getGroups();
      const newGroup = {
        id: this.generateGroupId(),
        name: groupData.name,
        members: groupData.members || [],
        avatar: this.generateGroupAvatar(groupData.name),
        createdAt: new Date().toISOString(),
        lastMessageTime: '',
        status: 'Group created',
        unreadCount: 0,
        lastMessageTimestamp: Date.now(),
        type: 'group', // Phân biệt group và contact
        active: true,
      };

      groups.unshift(newGroup); // Thêm vào đầu list
      localStorage.setItem(this.storageKey, JSON.stringify(groups));
      return newGroup;
    } catch (error) {
      return null;
    }
  }

  // Lấy tất cả groups
  getGroups() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Cập nhật group
  updateGroup(groupId, updates) {
    try {
      const groups = this.getGroups();
      const index = groups.findIndex((group) => group.id === groupId);

      if (index !== -1) {
        groups[index] = { ...groups[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(groups));
        return groups[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating group:', error);
      return null;
    }
  }

  // Xóa group
  deleteGroup(groupId) {
    try {
      const groups = this.getGroups();
      const filtered = groups.filter((group) => group.id !== groupId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  // Thêm member vào group
  addMemberToGroup(groupId, member) {
    try {
      const groups = this.getGroups();
      const group = groups.find((g) => g.id === groupId);

      if (group && !group.members.some((m) => m.id === member.id)) {
        group.members.push(member);
        localStorage.setItem(this.storageKey, JSON.stringify(groups));
        return group;
      }
      return null;
    } catch (error) {
      console.error('Error adding member to group:', error);
      return null;
    }
  }

  // Xóa member khỏi group
  removeMemberFromGroup(groupId, memberId) {
    try {
      const groups = this.getGroups();
      const group = groups.find((g) => g.id === groupId);

      if (group) {
        group.members = group.members.filter((m) => m.id !== memberId);
        localStorage.setItem(this.storageKey, JSON.stringify(groups));
        return group;
      }
      return null;
    } catch (error) {
      console.error('Error removing member from group:', error);
      return null;
    }
  }

  // Generate unique group ID
  generateGroupId() {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate group avatar (gradient based on name)
  generateGroupAvatar(name) {
    return name;
  }
}

// Export singleton instance
export const groupStorage = new GroupStorage();
