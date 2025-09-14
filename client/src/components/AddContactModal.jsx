import React, { useState } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { getInitial } from '../../storage/helpers/index.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { safeGetItem } from '../../utils/storage/index.js';

function AddContactModal({ isOpen, onClose, onContactAdded }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allUsers = [];
      try {
        const stored = safeGetItem('all_users', []);
        for (const userData of stored) {
          if (userData.id !== user.id && userData.email !== user.email) {
            allUsers.push({
              id: userData.id,
              name: userData.name || userData.username,
              email: userData.email,
              username: userData.username,
              avatar: userData.avatar || '',
            });
          }
        }
      } catch (err) {
        console.warn('Error reading users from storage', err);
      }

      // Filter theo search term
      const filtered = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())),
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = (userToAdd) => {
    const newContact = {
      id: userToAdd.id,
      name: userToAdd.name,
      email: userToAdd.email,
      username: userToAdd.username,
      avatar: userToAdd.avatar,
      status: 'Click to start chatting',
      type: 'contact',
      lastMessageTime: '',
      unreadCount: 0,
      lastMessageTimestamp: 0,
      isOnline: false,
    };

    onContactAdded(newContact);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 backdrop-blur-[2px]'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-[#212121]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-[#3F3F3F]'>
          <h2 className='text-lg font-semibold'>Add Contact</h2>
          <button
            onClick={handleClose}
            className='cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#303030]'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Search Input */}
          <div className='relative mb-4'>
            <Search className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-4 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-none dark:bg-[#303030]'
            />
          </div>

          {/* Search Button */}
          <button
            onClick={searchUsers}
            disabled={!searchTerm.trim() || isSearching}
            className='mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
          >
            {isSearching ? (
              <>
                <Loader2 size={18} className='animate-spin' />
                Searching...
              </>
            ) : (
              <>Search</>
            )}
          </button>

          {/* Search Results */}
          <div className='max-h-80 overflow-y-auto'>
            {isSearching ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 size={24} className='animate-spin text-gray-400' />
              </div>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div className='space-y-2'>
                  <h3 className='mb-3 text-sm font-medium text-gray-600 dark:text-gray-400'>
                    Found {searchResults.length} user(s):
                  </h3>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center space-x-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#303030]'
                    >
                      {/* Avatar */}
                      <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-400'>
                        {user.avatar ? (
                          <img src={user.avatar} alt='Avatar' className='h-full w-full object-cover' />
                        ) : (
                          <span className='text-sm font-semibold text-white'>{getInitial(user.name)}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className='min-w-0 flex-1'>
                        <p className='truncate font-medium'>{user.name}</p>
                        <p className='truncate text-sm text-gray-500 dark:text-gray-400'>{user.email}</p>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddContact(user)}
                        className='flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700'
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Search size={48} className='mx-auto mb-4 text-gray-300 dark:text-gray-600' />
                  <p className='text-gray-500 dark:text-gray-400'>No users found for "{searchTerm}"</p>
                  <p className='mt-2 text-sm text-gray-400 dark:text-gray-500'>
                    Make sure the user has signed up with this email or name
                  </p>
                </div>
              )
            ) : (
              <div className='py-8 text-center'>
                <UserPlus size={48} className='mx-auto mb-4 text-gray-300 dark:text-gray-600' />
                <p className='text-gray-500 dark:text-gray-400'>Enter a name or email to search for users</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddContactModal;
