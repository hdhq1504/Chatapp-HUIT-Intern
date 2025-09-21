import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Users,
  UserPlus,
  UserMinus,
  Edit3,
  Crown,
  Shield,
  Check,
  Settings,
  X,
  Loader2,
} from 'lucide-react';
import { api } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { groupStorage } from '../utils/storage';
import { scrollBar, getInitial } from '../storage/helpers';

function ChatInfo({ onClose, selectedContact }) {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(true);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(true);
  const [groupMembersOpen, setGroupMembersOpen] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [localGroupMembers, setLocalGroupMembers] = useState(() => selectedContact?.members || []);
  const [displayGroupName, setDisplayGroupName] = useState(() => selectedContact?.name || '');
  const [memberActionLoading, setMemberActionLoading] = useState(null);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const { isUserOnline } = useChat();
  const { user } = useAuth();
  const isGroup = selectedContact?.type === 'group';
  const contactId = selectedContact?.id;

  useEffect(() => {
    if (isGroup && selectedContact) {
      setEditGroupName(selectedContact?.name || '');
      setDisplayGroupName(selectedContact?.name || '');
      setLocalGroupMembers(selectedContact?.members || []);
    }
    if (!isGroup) {
      setLocalGroupMembers([]);
      setDisplayGroupName(selectedContact?.name || '');
    }
  }, [isGroup, selectedContact]);

  const groupMembers = useMemo(() => {
    if (!isGroup) return [];
    return (localGroupMembers || []).map((member, index) => {
      const rawRole = member?.role ? String(member.role).toLowerCase() : '';
      const role = rawRole || (index === 0 ? 'admin' : 'member');
      return { ...member, role };
    });
  }, [isGroup, localGroupMembers]);

  const isCurrentUserAdmin = useMemo(() => {
    if (!isGroup || !user) return false;

    return groupMembers.some((member) => {
      if (!member?.id) return false;
      return String(member.id) === String(user.id) && member.role === 'admin';
    });
  }, [groupMembers, isGroup, user]);

  const getMemberRoleLabel = (member) => (member.role === 'admin' ? 'Admin' : 'Member');

  const handleUpdateGroupName = () => {
    if (!isGroup || !editGroupName.trim() || !contactId) return;

    const updatedGroup = groupStorage.updateGroup(contactId, {
      name: editGroupName.trim(),
    });

    if (updatedGroup) {
      setIsEditingGroupName(false);
      setDisplayGroupName(updatedGroup.name || editGroupName.trim());
      window.dispatchEvent(
        new CustomEvent('group-storage-updated', {
          detail: { groupId: contactId, group: updatedGroup, action: 'group-renamed' },
        }),
      );
    } else {
      console.error('Failed to update group name');
    }
  };

  const refreshGroupMembers = () => {
    if (!contactId) return null;
    const updated = groupStorage.getGroups().find((group) => group.id === contactId);
    setLocalGroupMembers(updated?.members || []);
    return updated;
  };

  const handleRemoveMember = async (memberId) => {
    if (!isGroup || !isCurrentUserAdmin || !contactId || !memberId) {
      return;
    }

    const targetMemberIndex = groupMembers.findIndex((candidate) => String(candidate.id) === String(memberId));
    if (targetMemberIndex === -1) {
      return;
    }

    const targetMember = groupMembers[targetMemberIndex];

    if (targetMember.role === 'admin') {
      alert('Không thể xóa quản trị viên khỏi nhóm.');
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${targetMember.name} khỏi phòng không?`);
    if (!confirmed) {
      return;
    }

    try {
      setMemberActionLoading(memberId);
      await api.removeMemberFromRoom(contactId, memberId);
    } catch (error) {
      console.error('Failed to remove member from room:', error);
      alert(error.response?.data?.message || 'Không thể xóa thành viên. Vui lòng thử lại.');
      setMemberActionLoading(null);
      return;
    }

    const updatedGroup = groupStorage.removeMemberFromGroup(contactId, memberId);

    if (!updatedGroup) {
      console.error('Failed to update local group storage after removing member');
      setMemberActionLoading(null);
      return;
    }

    const refreshedGroup = refreshGroupMembers();

    if (!refreshedGroup || refreshedGroup.members.length === 0) {
      groupStorage.deleteGroup(contactId);
      window.dispatchEvent(
        new CustomEvent('group-storage-updated', {
          detail: { groupId: contactId, action: 'group-removed' },
        }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('group-storage-updated', {
          detail: {
            groupId: contactId,
            group: refreshedGroup,
            action: 'member-removed',
            memberId,
          },
        }),
      );
    }

    setMemberActionLoading(null);
  };

  const handleLeaveGroup = async () => {
    if (!isGroup || !contactId || !user) {
      return;
    }

    const isMember = groupMembers.some((member) => String(member.id) === String(user.id));
    if (!isMember) {
      alert('Bạn không còn trong phòng này.');
      return;
    }

    const confirmed = window.confirm('Bạn có chắc chắn muốn rời khỏi phòng này không?');
    if (!confirmed) {
      return;
    }

    try {
      setIsLeavingGroup(true);
      await api.leaveRoom(contactId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      alert(error.response?.data?.message || 'Không thể rời khỏi phòng. Vui lòng thử lại.');
      setIsLeavingGroup(false);
      return;
    }

    groupStorage.removeMemberFromGroup(contactId, user.id);
    groupStorage.deleteGroup(contactId);
    setLocalGroupMembers([]);

    window.dispatchEvent(
      new CustomEvent('group-storage-updated', {
        detail: { groupId: contactId, action: 'member-left', memberId: user.id },
      }),
    );

    setIsLeavingGroup(false);
    onClose?.();
  };

  const renderAvatar = () => {
    if (isGroup) {
      return (
        <div
          className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r ${selectedContact.avatar} md:h-16 md:w-16`}
        >
          <span className='text-2xl font-semibold text-white md:text-xl'>{getInitial(selectedContact.name)}</span>
        </div>
      );
    }

    return (
      <div className='mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 md:h-16 md:w-16'>
        {selectedContact.avatar && selectedContact.avatar !== '/api/placeholder/32/32' ? (
          <img
            src={selectedContact.avatar}
            alt={selectedContact.name}
            className='h-full w-full rounded-full object-cover'
          />
        ) : (
          <span className='text-2xl font-semibold text-white md:text-xl'>{getInitial(selectedContact.name)}</span>
        )}
      </div>
    );
  };

  const renderStatusInfo = () => {
    if (isGroup) {
      return <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{groupMembers.length} members</p>;
    }

    const online = isUserOnline(selectedContact.id);
    const statusText = online ? 'Active Now' : 'Offline';
    return <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{statusText}</p>;
  };

  if (!selectedContact) return null;

  return (
    <div className='flex h-screen w-full flex-col bg-[#F9F9F9] md:w-80 lg:w-90 dark:border-[#3F3F3F] dark:bg-[#181818]'>
      <div className='border-b border-gray-200 px-4 py-3 md:py-4 dark:border-[#3F3F3F]'>
        <div className='mb-4 flex items-center justify-between md:hidden'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={onClose}
              className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <X size={18} />
            </button>
            <h2 className='text-lg font-semibold'>{isGroup ? 'Group Info' : 'Chat Info'}</h2>
          </div>
        </div>

        <div className='text-center'>
          {renderAvatar()}

          {isGroup && isEditingGroupName ? (
            <div className='mb-2 flex items-center justify-center gap-2'>
              <input
                type='text'
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className='bg-transparent text-center text-xl font-semibold focus:outline-none md:text-lg'
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateGroupName()}
                onBlur={handleUpdateGroupName}
                autoFocus
              />
              <button
                onClick={handleUpdateGroupName}
                className='cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:hover:bg-[#303030]'
              >
                <Check size={18} className='text-green-600' />
              </button>
            </div>
          ) : (
            <div className='mb-2 flex items-center justify-center gap-2'>
              <h3 className='text-xl font-semibold md:text-lg'>{displayGroupName || selectedContact.name}</h3>
              {isGroup && (
                <button
                  onClick={() => setIsEditingGroupName(true)}
                  className='cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:hover:bg-[#303030]'
                >
                  <Edit3 size={18} className='text-gray-500 dark:text-gray-100' />
                </button>
              )}
            </div>
          )}

          {renderStatusInfo()}
        </div>

        <div className='mt-4 flex justify-center gap-4'>
          {isGroup && (
            <button className='flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
              <UserPlus size={16} />
              <span>Add members</span>
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${scrollBar}`}>
        <div className='space-y-4 p-4'>
          {isGroup && (
            <div>
              <button
                onClick={() => setGroupMembersOpen(!groupMembersOpen)}
                className='flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
              >
                <div className='flex items-center gap-2'>
                  <Users size={18} />
                  <span>Members ({groupMembers.length})</span>
                </div>
                {groupMembersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  groupMembersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {groupMembersOpen && (
                  <div className='mt-2 space-y-2 px-2'>
                    {groupMembers.map((member, index) => (
                      <div
                        key={member.id || index}
                        className='flex items-center justify-between rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-[#303030]'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500'>
                            <span className='text-sm font-semibold text-white'>{getInitial(member.name)}</span>
                          </div>
                          <div>
                            <p className='font-medium'>{member.name}</p>
                            <p className='text-xs text-gray-500'>{getMemberRoleLabel(member)}</p>
                          </div>
                        </div>

                        <div className='flex items-center gap-1'>
                          {member.role === 'admin' && (
                            <div className='rounded-full p-2.5'>
                              <Crown size={16} className='text-yellow-500' />
                            </div>
                          )}
                          {isCurrentUserAdmin && member.role !== 'admin' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className='cursor-pointer rounded-full p-2.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#404040]'
                              disabled={memberActionLoading === member.id}
                            >
                              {memberActionLoading === member.id ? (
                                <Loader2 size={16} className='animate-spin text-gray-500' />
                              ) : (
                                <UserMinus size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <div className='flex items-center gap-2'>
                <Settings size={18} />
                <span>{isGroup ? 'Group Settings' : 'Chat Settings'}</span>
              </div>
              {chatSettingsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                chatSettingsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {chatSettingsOpen && (
                <div className='mt-2 space-y-2 px-2'>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Notifications: On</div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Media auto-download: Wi-Fi only</div>
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Disappearing messages: Off</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setPrivacyHelpOpen(!privacyHelpOpen)}
              className='flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left font-semibold transition-colors duration-200 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
            >
              <div className='flex items-center gap-2'>
                <Shield size={18} />
                <span>Privacy & help</span>
              </div>
              {privacyHelpOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                privacyHelpOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {privacyHelpOpen && (
                <div className='mt-2 space-y-2 px-2'>
                  {!isGroup ? (
                    <>
                      <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Block User</div>
                      <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Report User</div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLeaveGroup}
                        disabled={isLeavingGroup}
                        className='w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:text-red-400 dark:hover:bg-red-500/10'
                      >
                        {isLeavingGroup ? 'Leaving group...' : 'Leave Group'}
                      </button>
                      <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Report Group</div>
                    </>
                  )}
                  <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Clear Chat History</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInfo;
