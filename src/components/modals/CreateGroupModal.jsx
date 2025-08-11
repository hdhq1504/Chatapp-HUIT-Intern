import React, { useState, useEffect } from 'react';
import { X, Users, Check } from 'lucide-react';
import { getInitial } from '../../utils/string.jsx';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.jsx';

function CreateGroupModal({ isOpen, onClose, contacts = [] }) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldRender, setShouldRender] = useState(false);

  const modalRef = useClickOutside(() => handleClose(), isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      setTimeout(() => setShouldRender(false), 1);
    }
  }, [isOpen, shouldRender]);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      const selectedContactsData = contacts.filter((contact) =>
        selectedUsers.includes(contact.id),
      );

      console.log('Creating group:', {
        name: groupName,
        members: selectedContactsData,
      });

      handleClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    setSearchTerm('');
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 backdrop-blur-[2px]'>
      <div
        ref={modalRef}
        className='mx-4 flex max-h-[80vh] w-full max-w-md transform flex-col rounded-lg bg-white dark:bg-[#212121]'
      >
        <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <div className='flex items-center gap-2'>
            <Users size={20} className='text-blue-500' />
            <h2 className='text-lg font-semibold'>New group chat</h2>
          </div>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#303030]'
          >
            <X size={20} />
          </button>
        </div>

        <div className='border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <label className='mb-2 block text-sm font-medium'>Group name</label>
          <input
            type='text'
            placeholder='Enter your group name...'
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
          />
        </div>

        <div className='border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <label className='mb-2 block text-sm font-medium'>
            Add member ({selectedUsers.length} selected)
          </label>
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
          />
        </div>

        <div
          className={`max-h-60 flex-1 overflow-y-auto ${customScrollbarStyles}`}
        >
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className='flex cursor-pointer items-center space-x-3 px-4 py-3 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-[#303030]'
              onClick={() => handleUserToggle(contact.id)}
            >
              <div className='relative'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500'>
                  <span className='text-sm font-semibold text-white'>
                    {getInitial(contact.name)}
                  </span>
                </div>
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{contact.name}</p>
              </div>

              <div
                className={`flex h-5 w-5 transform items-center justify-center rounded border-2 transition-all duration-300 ${
                  selectedUsers.includes(contact.id)
                    ? 'scale-110 border-blue-500 bg-blue-500'
                    : 'scale-100 border-gray-300 dark:border-[#3F3F3F]'
                }`}
              >
                {selectedUsers.includes(contact.id) && (
                  <Check
                    size={12}
                    className='animate-in slide-in-from-top-1 text-white duration-200'
                  />
                )}
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
              Không tìm thấy người dùng nào
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
            disabled={!groupName.trim() || selectedUsers.length < 2}
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
