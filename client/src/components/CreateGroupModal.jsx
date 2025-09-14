import React, { useState, useEffect } from 'react';
import { X, Users, Check } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.jsx';
import { getInitial, scrollBar } from '../../storage/helpers/index.js';
import { groupStorage } from '../../utils/storage/index.js';

function CreateGroupModal({ isOpen, onClose, contacts = [], onGroupCreated }) {
  const { user } = useAuth();
  const { sendMessage } = useChat();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldRender, setShouldRender] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useClickOutside(() => handleClose(), isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setError('');
    } else if (shouldRender) {
      setTimeout(() => setShouldRender(false), 1);
    }
  }, [isOpen, shouldRender]);

  const filteredContacts = contacts
    .filter((contact) => contact.type !== 'group')
    .filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUserToggle = (userId) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    setError('');
  };

  // const validateForm = () => {
  //   if (!groupName.trim()) {
  //     setError('Group name is required');
  //     return false;
  //   }
  //   if (groupName.trim().length < 2) {
  //     setError('Group name must be at least 2 characters');
  //     return false;
  //   }
  //   if (selectedMembers.length < 2) {
  //     setError('Please select at least 2 members for the group');
  //     return false;
  //   }
  //   return true;
  // };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    const newGroup = {
      id: Date.now(),
      name: groupName,
      type: 'group',
      avatar: '',
      members: [
        { id: user.id, name: user.name || user.username, avatar: user.avatar, role: 'admin' },
        ...selectedMembers.map((member) => ({ ...member, role: 'member' })),
      ],
      createdBy: user.id,
      createdAt: Date.now(),
      lastMessageTime: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      status: 'Group created',
      unreadCount: 0,
      lastMessageTimestamp: Date.now(),
    };

    // Save to storage
    groupStorage.createGroup(newGroup);

    // Send system message to group
    await sendMessage(
      newGroup.id,
      {
        content: `${user.name || user.username} created the group`,
        type: 'system',
      },
      'group',
    );

    // Notify parent
    if (onGroupCreated) {
      onGroupCreated();
    }

    // Reset and close
    setGroupName('');
    setSelectedMembers([]);
    onClose();
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedMembers([]);
    setSearchTerm('');
    setError('');
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 backdrop-blur-[2px]'>
      <div
        ref={modalRef}
        className='mx-4 flex max-h-[85vh] w-full max-w-md transform flex-col rounded-lg bg-white dark:bg-[#212121]'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
              <Users size={16} className='text-blue-600 dark:text-blue-400' />
            </div>
            <h2 className='text-lg font-semibold'>New Group Chat</h2>
          </div>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#303030]'
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className='mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
            <AlertCircle size={16} />
            <span className='text-sm'>{error}</span>
          </div>
        )}

        {/* Group Name Input */}
        <div className='border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <div className='flex items-start justify-between'>
            <label className='mb-2 block text-sm font-medium'>
              Group name <span className='text-red-500'>*</span>
            </label>
            <div className='mt-1 text-right text-xs text-gray-500'>{groupName.length}/50</div>
          </div>
          <input
            type='text'
            placeholder='Enter your group name...'
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError('');
            }}
            maxLength={50}
            className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
          />
        </div>

        {/* Member Search */}
        <div className='border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <label className='mb-2 block text-sm font-medium'>
            Add Members <span className='text-red-500'>*</span>
            <span className='ml-2 text-xs font-normal text-gray-500'>(minimum 2 required)</span>
          </label>
          <input
            type='text'
            placeholder='Search contacts...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
          />
        </div>

        {/* Members List */}
        <div className={`max-h-60 flex-1 overflow-y-auto ${scrollBar}`}>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className='flex cursor-pointer items-center space-x-3 px-4 py-3 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-[#303030]'
                onClick={() => handleUserToggle(contact.id)}
              >
                <div className='relative'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500'>
                    <span className='text-sm font-semibold text-white'>{getInitial(contact.name)}</span>
                  </div>
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{contact.name}</p>
                </div>

                <div
                  className={`flex h-5 w-5 transform items-center justify-center rounded border-2 transition-all duration-300 ${
                    selectedMembers.includes(contact.id)
                      ? 'scale-110 border-blue-500 bg-blue-500'
                      : 'scale-100 border-gray-300 dark:border-[#3F3F3F]'
                  }`}
                >
                  {selectedMembers.includes(contact.id) && (
                    <Check size={12} className='animate-in slide-in-from-top-1 text-white duration-200' />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
              {searchTerm ? 'No contacts found' : 'No contacts available'}
            </div>
          )}
        </div>

        <div className='flex gap-3 border-t border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <button
            onClick={handleClose}
            className='flex-1 cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-[#3F3F3F] dark:text-gray-300 dark:hover:bg-[#303030]'
          >
            Cancel
          </button>

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length < 2}
            className='flex-1 cursor-pointer rounded-full bg-blue-500 px-4 py-2 text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
