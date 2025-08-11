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

      // Fallback: legacy avatar key
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
    console.log('Selected contact:', contact.name);
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
        <div className='p-4'>
          <div className='mb-4 flex items-center space-x-3'>
            <div className='h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600'>
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
            <button
              className='flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030]'
              onClick={onCreateGroup}
            >
              <Plus size={18} className='h-[20px] w-[20px]' />
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
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
                  className={`group relative flex cursor-pointer items-center space-x-3 p-4 transition-colors duration-200 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-slate-800 ${
                    selectedContact?.id === contact.id
                      ? 'border-blue-500 bg-blue-100 dark:bg-slate-800'
                      : ''
                  }`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className='relative flex-shrink-0'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500'>
                      <span className='text-xs font-semibold text-white'>
                        {getInitial(contact.name)}
                      </span>
                    </div>
                    {contact.active && (
                      <div className='absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-[#181818]'></div>
                    )}
                  </div>

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
                        <div className='ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white group-hover:hidden'>
                          {contact.unreadCount > 5 ? '5+' : contact.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='relative hidden group-hover:block'>
                    <button
                      className='cursor-pointer rounded-lg p-1.5 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
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
