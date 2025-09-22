import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Users, Check, Loader2, Search, UserMinus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { getInitial, scrollBar } from '../storage/helpers';
import { groupStorage, safeGetItem, safeSetItem } from '../utils/storage';
import { api } from '../api/apiService';

const USERS_CACHE_KEY = 'all_users';

function CreateRoomModal({ isOpen, onClose, onDirectChatCreated, onGroupCreated, existingContactIds = [] }) {
  const { user } = useAuth();
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useClickOutside(() => {
    if (isSubmitting) return;
    handleClose();
  }, isOpen);

  const existingContactIdSet = useMemo(
    () => new Set(existingContactIds.map((id) => id && id.toString())),
    [existingContactIds],
  );

  const loadUsers = useCallback(async () => {
    if (!user) return;

    setIsFetchingUsers(true);
    setFetchError('');

    try {
      const response = await api.getAllUsers();
      const rawUsers = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];

      const normalizedUsers = rawUsers
        .filter((candidate) => candidate?.id && candidate.id !== user.id)
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name || candidate.email || 'Unknown user',
          email: candidate.email || '',
          phone: candidate.phone || '',
          avatar: candidate.avatar || '',
        }));

      setAllUsers(normalizedUsers);
      safeSetItem(USERS_CACHE_KEY, normalizedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      const cached = safeGetItem(USERS_CACHE_KEY, []);
      if (cached.length > 0) {
        setAllUsers(cached);
        setFetchError('Không thể tải danh sách mới. Đang sử dụng dữ liệu đã lưu.');
      } else {
        setFetchError(error.message || 'Không thể tải danh sách người dùng.');
      }
    } finally {
      setIsFetchingUsers(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    setSearchTerm('');
    setSelectedUsers([]);
    setRoomName('');
    setSubmitError('');

    if (allUsers.length === 0) {
      void loadUsers();
    }
  }, [isOpen, loadUsers, allUsers.length]);

  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() === '') {
      return allUsers;
    }

    const normalized = searchTerm.trim().toLowerCase();
    return allUsers.filter((candidate) => {
      const name = candidate.name?.toLowerCase() || '';
      const email = candidate.email?.toLowerCase() || '';
      const phoneValue = candidate.phone ?? '';
      const phone = typeof phoneValue === 'string' ? phoneValue.toLowerCase() : String(phoneValue || '').toLowerCase();
      return name.includes(normalized) || email.includes(normalized) || phone.includes(normalized);
    });
  }, [allUsers, searchTerm]);

  const isGroupChat = selectedUsers.length > 1;
  const isCreateDisabled = selectedUsers.length === 0 || (isGroupChat && roomName.trim().length === 0) || isSubmitting;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.warn('Failed to format time', error);
      return '';
    }
  };

  const handleToggleUser = (candidate) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((item) => item.id === candidate.id);
      if (exists) {
        return prev.filter((item) => item.id !== candidate.id);
      }
      return [...prev, candidate];
    });
    setSubmitError('');
  };

  const handleRemoveSelected = (userId) => {
    setSelectedUsers((prev) => prev.filter((item) => item.id !== userId));
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUsers([]);
    setRoomName('');
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('Bạn cần đăng nhập để tạo phòng.');
      return;
    }

    if (selectedUsers.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một người dùng.');
      return;
    }

    if (isGroupChat && roomName.trim() === '') {
      setSubmitError('Vui lòng nhập tên cho phòng chat nhóm.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const memberIds = selectedUsers.map((member) => member.id);
      const response = await api.createMessageRoom(memberIds);
      const roomData = response?.data || response;

      if (!roomData) {
        throw new Error('Không nhận được phản hồi từ máy chủ.');
      }

      if (!isGroupChat) {
        const targetUser = selectedUsers[0];
        const lastMessageTime = roomData?.lastMessage?.dateSent ? formatTime(roomData.lastMessage.dateSent) : '';
        const lastMessageTimestamp = roomData?.lastMessage?.dateSent
          ? new Date(roomData.lastMessage.dateSent).getTime()
          : Date.now();

        const contactRecord = {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone,
          avatar: targetUser.avatar,
          type: 'contact',
          status: roomData?.lastMessage?.content || 'Click to start chatting',
          lastMessageTime,
          unreadCount: 0,
          lastMessageTimestamp,
          active: true,
        };

        onDirectChatCreated?.(contactRecord);
      } else {
        const trimmedName = roomName.trim();
        const lastMessageTimestamp = roomData?.lastMessage?.dateSent
          ? new Date(roomData.lastMessage.dateSent).getTime()
          : Date.now();
        const lastMessageTime = roomData?.lastMessage?.dateSent
          ? formatTime(roomData.lastMessage.dateSent)
          : formatTime(new Date(lastMessageTimestamp).toISOString());

        const groupMembers = [
          {
            id: user.id,
            name: user.name || user.email || 'You',
            role: 'admin',
          },
          ...selectedUsers.map((member) => ({
            id: member.id,
            name: member.name,
            role: 'member',
          })),
        ];

        const groupRecord = {
          id: roomData.id,
          name: trimmedName || roomData.name || 'New Room',
          members: groupMembers,
          avatar: '',
          status: roomData?.lastMessage?.content || `${user.name || 'Bạn'} vừa tạo phòng trò chuyện`,
          lastMessageTime,
          unreadCount: 0,
          lastMessageTimestamp,
          type: 'group',
          active: true,
        };

        groupStorage.createGroup(groupRecord);

        if (trimmedName && roomData?.id) {
          try {
            await api.updateRoom(roomData.id, { name: trimmedName });
          } catch (updateError) {
            console.warn('Failed to update room name:', updateError);
          }
        }

        onGroupCreated?.(groupRecord);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to create room:', error);
      const message = error.response?.data?.message || error.message || 'Không thể tạo phòng chat.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 backdrop-blur-[2px]'>
      <div
        ref={modalRef}
        className='mx-4 flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl dark:bg-[#212121]'
      >
        <div className='flex items-center justify-between border-b border-gray-200 p-5 dark:border-[#3F3F3F]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
              <Users size={18} className='text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>Tạo cuộc trò chuyện mới</h2>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Chọn người dùng để bắt đầu chat 1-1 hoặc nhóm</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#303030]'
          >
            <X size={20} />
          </button>
        </div>

        {fetchError && (
          <div className='mx-5 mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200'>
            <AlertCircle size={18} />
            <span>{fetchError}</span>
          </div>
        )}

        {submitError && (
          <div className='mx-5 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <div className='grid gap-4 p-5'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Người dùng đã chọn</label>
            {selectedUsers.length === 0 ? (
              <p className='rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-[#3F3F3F] dark:text-gray-400'>
                Chưa có người dùng nào được chọn
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {selectedUsers.map((member) => (
                  <span
                    key={member.id}
                    className='inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                  >
                    {member.name}
                    <button
                      onClick={() => handleRemoveSelected(member.id)}
                      className='rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-200 dark:text-blue-300 dark:hover:bg-blue-800'
                    >
                      <UserMinus size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>Tên phòng (bắt buộc cho chat nhóm)</label>
            <input
              type='text'
              value={roomName}
              onChange={(event) => {
                setRoomName(event.target.value);
                setSubmitError('');
              }}
              placeholder='Nhập tên phòng chat...'
              disabled={!isGroupChat}
              className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-none dark:bg-[#303030] ${
                isGroupChat ? '' : 'opacity-60'
              }`}
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>Tìm kiếm người dùng</label>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400' size={18} />
              <input
                type='text'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Nhập tên, email hoặc số điện thoại...'
                className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
              />
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto border-t border-gray-200 dark:border-[#3F3F3F] ${scrollBar}`}>
          {isFetchingUsers ? (
            <div className='flex h-40 items-center justify-center text-gray-500'>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Đang tải danh sách người dùng...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='flex h-40 flex-col items-center justify-center text-gray-500 dark:text-gray-400'>
              <Search size={36} className='mb-3 text-gray-300 dark:text-gray-600' />
              <p className='text-sm'>Không tìm thấy người dùng phù hợp</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100 dark:divide-[#2A2A2A]'>
              {filteredUsers.map((candidate) => {
                const isSelected = selectedUsers.some((item) => item.id === candidate.id);
                const alreadyInContacts = existingContactIdSet.has(candidate.id);

                return (
                  <button
                    key={candidate.id}
                    onClick={() => handleToggleUser(candidate)}
                    className='flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'
                  >
                    <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-300 dark:bg-[#3F3F3F]'>
                      {candidate.avatar ? (
                        <img src={candidate.avatar} alt={candidate.name} className='h-full w-full object-cover' />
                      ) : (
                        <span className='text-sm font-semibold text-white'>{getInitial(candidate.name)}</span>
                      )}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium'>{candidate.name}</p>
                      <p className='truncate text-sm text-gray-500 dark:text-gray-400'>
                        {candidate.email || candidate.phone}
                      </p>
                      {alreadyInContacts && !isSelected && (
                        <p className='mt-1 text-xs text-blue-500 dark:text-blue-300'>
                          Đã có trong danh sách trò chuyện
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-[#3F3F3F]'
                      }`}
                    >
                      {isSelected && <Check size={14} className='text-white' />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='flex gap-3 border-t border-gray-200 p-5 dark:border-[#3F3F3F]'>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className='flex-1 cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-[#3F3F3F] dark:text-gray-300 dark:hover:bg-[#303030]'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreateDisabled}
            className='flex-1 cursor-pointer rounded-full bg-blue-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            {isSubmitting ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' /> Đang tạo...
              </span>
            ) : isGroupChat ? (
              'Tạo phòng'
            ) : (
              'Bắt đầu chat'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
