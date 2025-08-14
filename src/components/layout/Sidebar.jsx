import React, { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  UserRound,
  Settings,
  Search,
  Plus,
  LogOut,
  Ban,
  Archive,
  Trash2,
} from 'lucide-react';
import { customScrollbarStyles } from '../../utils/styles.jsx';
import { getInitial } from '../../utils/string.jsx';
import {
  useClickOutside,
  useMultipleClickOutside,
} from '../../hooks/useClickOutside.jsx';
import DeleteDialog from '../common/DeleteDialog.jsx';
import SettingModal from '../modals/SettingModal.jsx';

function Sidebar({
  onChatSelect,
  onCreateGroup,
  contacts = [],
  selectedContact,
  onDeleteChat,
  onMessageUpdate,
}) {
  const [openSettings, setOpenSettings] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [openUserSettingsId, setOpenUserSettingsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    contact: null,
  });
  const [profile, setProfile] = useState({ name: 'Quân Hồ', avatar: '' });
  const [localContacts, setLocalContacts] = useState(contacts);

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    if (onMessageUpdate) {
      onMessageUpdate((updateData) => {
        const {
          contactId,
          lastMessage,
          lastMessageTime,
          timestamp,
          isCleared,
        } = updateData;

        setLocalContacts((prevContacts) => {
          return prevContacts
            .map((contact) => {
              if (contact.id === contactId) {
                if (isCleared) {
                  return {
                    ...contact,
                    status: 'No messages yet',
                    lastMessageTime: '',
                    lastMessage: '',
                  };
                } else {
                  return {
                    ...contact,
                    status: lastMessage,
                    lastMessageTime: lastMessageTime,
                    lastMessage: lastMessage,
                    lastActivity: timestamp,
                  };
                }
              }
              return contact;
            })
            .sort((a, b) => {
              const timeA = a.lastActivity || a.timestamp || '0';
              const timeB = b.lastActivity || b.timestamp || '0';

              if (!timeA && timeB) return 1;
              if (timeA && !timeB) return -1;
              if (!timeA && !timeB) return 0;

              return new Date(timeB) - new Date(timeA);
            });
        });
      });
    }
  }, [onMessageUpdate]);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem('profile_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile({
            name: parsed.name || 'Quân Hồ',
            avatar: parsed.avatar || '',
          });
          return;
        }
      } catch {}

      const legacyAvatar = localStorage.getItem('profile_avatar_dataurl') || '';
      setProfile((prev) => ({ ...prev, avatar: legacyAvatar }));
    };

    loadProfile();

    const handleStorage = (e) => {
      if (e.key === 'profile_user' || e.key === 'profile_avatar_dataurl') {
        loadProfile();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const mainMenuRef = useClickOutside(
    () => setOpenSettings(false),
    openSettings,
  );

  const { registerClickOutside } = useMultipleClickOutside();

  const handleUserMenuToggle = (contactId, event) => {
    event.stopPropagation();
    setOpenUserSettingsId(openUserSettingsId === contactId ? null : contactId);
  };

  const handleContactClick = (contact) => {
    if (onChatSelect) {
      onChatSelect(contact);
    }
  };

  const handleDeleteClick = (contact) => {
    setDeleteDialog({
      isOpen: true,
      contact: contact,
    });
    setOpenUserSettingsId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.contact && onDeleteChat) {
      onDeleteChat(deleteDialog.contact.id);
    }

    setLocalContacts((prevContacts) =>
      prevContacts.filter((contact) => contact.id !== deleteDialog.contact.id),
    );
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      contact: null,
    });
  };

  return (
    <>
      <div className='flex h-screen w-full flex-col bg-[#f9f9f9] lg:w-80 dark:bg-[#181818]'>
        {/* Header Section */}
        <div className='p-4'>
          <div className='mb-4 flex items-center space-x-3'>
            <div className='h-10 w-10 overflow-hidden rounded-full bg-[#3F3F3F]'>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt='Avatar'
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <span className='text-sm font-semibold text-white'>
                    {getInitial(profile.name)}
                  </span>
                </div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <h2 className='truncate text-lg font-semibold'>{profile.name}</h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Active Now
              </p>
            </div>

            <div className='flex space-x-2'>
              <div className='relative inline-block' ref={mainMenuRef}>
                <button
                  className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
                  onClick={() => setOpenSettings((prev) => !prev)}
                >
                  <MoreHorizontal size={18} />
                </button>

                {openSettings && (
                  <div className='absolute right-0 z-10 mt-1 w-48 origin-top-right divide-y divide-gray-200 rounded-lg bg-[#F9F9F9] p-2 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:divide-[#3F3F3F] dark:bg-[#303030]'>
                    <div className='pt-0 pb-2'>
                      <div>
                        <a
                          href='/profile'
                          className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                        >
                          <UserRound size={18} />
                          <span>My Profile</span>
                        </a>
                      </div>
                      <div>
                        <a
                          href='/archive'
                          className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                        >
                          <Archive size={18} />
                          <span>Archived Chat</span>
                        </a>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setOpenSettings(false);
                            setShowSettingModal(true);
                          }}
                          className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                        >
                          <Settings size={18} />
                          <span>Settings</span>
                        </button>
                      </div>
                    </div>

                    <div className='pt-2 pb-0'>
                      <div>
                        <a
                          href='/login'
                          className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                        >
                          <LogOut size={18} />
                          <span>Sign Out</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex gap-2'>
            {/* Search Bar */}
            <div className='relative flex-1'>
              <Search
                className='absolute top-1/2 left-3 -translate-y-1/2 transform dark:text-[#EFEFEF]'
                size={20}
              />
              <input
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-full bg-gray-200 py-2 pr-4 pl-10 text-sm focus:outline-none dark:bg-[#303030]'
              />
            </div>

            {/* Create Group Button */}
            <button
              className='flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030]'
              onClick={onCreateGroup}
            >
              <Plus size={18} className='h-[20px] w-[20px]' />
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
          <div className='px-2'>
            {filteredContacts.length === 0 ? (
              <div className='flex h-32 flex-col items-center justify-center text-gray-500 dark:text-gray-400'>
                <Search size={48} className='mb-2 opacity-50' />
                <p className='text-sm'>No conversations found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const userMenuRef = registerClickOutside(
                  `user-${contact.id}`,
                  () => setOpenUserSettingsId(null),
                  openUserSettingsId === contact.id,
                );

                return (
                  <div
                    key={contact.id}
                    className={`group relative mb-1 flex cursor-pointer items-center space-x-3 rounded-2xl p-4 transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-slate-800 ${
                      selectedContact?.id === contact.id
                        ? 'bg-blue-100 dark:bg-slate-800'
                        : ''
                    }`}
                    onClick={() => handleContactClick(contact)}
                  >
                    {/* Avatar */}
                    <div className='relative h-12 w-12 flex-shrink-0'>
                      <div className='h-12 w-12 overflow-hidden rounded-full bg-[#3F3F3F]'>
                        {contact.avatar &&
                        contact.avatar !== '/api/placeholder/32/32' ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center'>
                            <span className='text-sm font-semibold text-white'>
                              {getInitial(contact.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      {contact.active && (
                        <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#181818]'></div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between'>
                        <p
                          className={`truncate text-base ${
                            contact.unreadCount && contact.unreadCount > 0
                              ? 'font-bold'
                              : 'font-semibold'
                          }`}
                        >
                          {contact.name}
                        </p>
                        <span className='block flex-shrink-0 text-xs text-gray-500 group-hover:hidden dark:text-gray-400'>
                          {contact.lastMessageTime || ''}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p
                          className={`truncate text-sm text-gray-500 dark:text-gray-400 ${
                            contact.unreadCount && contact.unreadCount > 0
                              ? 'font-medium'
                              : ''
                          }`}
                        >
                          {contact.status}
                        </p>
                        {contact.unreadCount && contact.unreadCount > 0 && (
                          <div className='ml-2 flex h-5 w-5.5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white group-hover:hidden'>
                            {contact.unreadCount > 5
                              ? '5+'
                              : contact.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className='relative hidden group-hover:block'>
                      <button
                        className='cursor-pointer rounded-full p-1.5 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
                        onClick={(e) => handleUserMenuToggle(contact.id, e)}
                        data-user-menu-trigger
                        data-user-id={contact.id}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openUserSettingsId === contact.id && (
                        <div
                          ref={userMenuRef}
                          className='absolute top-8 right-0 z-20 w-48 origin-top-right divide-y divide-gray-200 rounded-lg bg-[#F9F9F9] p-2 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:divide-[#3F3F3F] dark:bg-[#303030]'
                        >
                          <div>
                            <button
                              className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                              onClick={() => {
                                console.log('Block user:', contact.name);
                                setOpenUserSettingsId(null);
                              }}
                            >
                              <Ban size={18} />
                              <span>Block</span>
                            </button>

                            <button
                              className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-[#3F3F3F] dark:hover:text-white'
                              onClick={() => {
                                console.log('Archive chat:', contact.name);
                                setOpenUserSettingsId(null);
                              }}
                            >
                              <Archive size={18} />
                              <span>Archive Chat</span>
                            </button>

                            <button
                              className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-200 focus:outline-none dark:text-red-400 hover:dark:bg-red-950'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(contact);
                              }}
                            >
                              <Trash2 size={18} />
                              <span>Delete Chat</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Chat Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        contactName={deleteDialog.contact?.name}
      />

      {/* Settings Modal */}
      <SettingModal
        isOpen={showSettingModal}
        onClose={() => setShowSettingModal(false)}
      />
    </>
  );
}

export default Sidebar;
