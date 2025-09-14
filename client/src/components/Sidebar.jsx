import React, { useEffect, useState } from 'react';
import { MoreHorizontal, UserRound, Settings, Search, Plus, LogOut, Archive, UserPlus } from 'lucide-react';
import { scrollBar, getInitial } from '../storage/helpers/index.js';
import { useClickOutside, useMultipleClickOutside } from '../hooks/useClickOutside.jsx';
import DeleteDialog from './DeleteDialog.jsx';
import SettingModal from './modals/SettingModal.jsx';
import AddContactModal from './modals/AddContactModal.jsx';
import ContactItem from './ContactItem.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useChat } from '../contexts/ChatContext.jsx';

function Sidebar({ onChatSelect, onCreateGroup, contacts = [], selectedContact, onDeleteChat, onContactAdded }) {
  const [openSettings, setOpenSettings] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [openUserSettingsId, setOpenUserSettingsId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, contact: null });
  const [searchTerm, setSearchTerm] = useState('');
  const { isUserOnline } = useChat();
  const { user, logout } = useAuth();
  const profile = {
    name: user?.name || user?.username || 'Guest User',
    avatar: user?.avatar || '',
    email: user?.email || '',
  };

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('Profile updated:', event.detail.user);
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    const result = logout();
    if (result.success) {
      // Redirect to login page
      window.location.href = '/login';
    } else {
      alert('Logout failed. Please try again');
    }
  };

  const handleContactAdded = (newContact) => {
    const existingContact = contacts.find((c) => c.id === newContact.id);
    if (!existingContact) {
      onContactAdded(newContact);
    } else {
      alert('This user is already in your contact list!');
    }
  };

  const filteredContacts = contacts
    .filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((contact) => ({
      ...contact,
      isOnline: isUserOnline(contact.id),
    }));

  const mainMenuRef = useClickOutside(() => setOpenSettings(false), openSettings);
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
    setDeleteDialog({ isOpen: true, contact: contact });
    setOpenUserSettingsId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.contact && onDeleteChat) {
      onDeleteChat(deleteDialog.contact.id);
    }
    setDeleteDialog({ isOpen: false, contact: null });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, contact: null });
  };

  return (
    <>
      <div className='flex h-screen w-full flex-col bg-[#f9f9f9] md:w-80 lg:w-90 dark:bg-[#181818]'>
        {/* Header Section */}
        <div className='p-4'>
          <div className='mb-4 flex items-center space-x-3'>
            <div className='h-10 w-10 overflow-hidden rounded-full bg-[#3F3F3F]'>
              {profile.avatar ? (
                <img src={profile.avatar} alt='Avatar' className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <span className='text-sm font-semibold text-white'>{getInitial(profile.name)}</span>
                </div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <h2 className='truncate text-lg font-semibold'>{profile.name}</h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Active Now</p>
            </div>

            <div className='relative inline-block' ref={mainMenuRef}>
              <button
                className='cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
                onClick={() => setOpenSettings((prev) => !prev)}
              >
                <MoreHorizontal size={18} />
              </button>

              {openSettings && (
                <div className='absolute right-0 z-10 mt-1 w-48 origin-top-right divide-y divide-gray-200 rounded-lg bg-[#F9F9F9] p-2 shadow-lg ring-1 ring-black/5 dark:divide-[#3F3F3F] dark:bg-[#303030]'>
                  <div className='pt-0 pb-2'>
                    <a
                      href='/profile'
                      className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                    >
                      <UserRound size={18} />
                      <span>My Profile</span>
                    </a>
                    <a
                      href='/archive'
                      className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                    >
                      <Archive size={18} />
                      <span>Archived Chat</span>
                    </a>
                    <button
                      onClick={() => {
                        setOpenSettings(false);
                        setShowSettingModal(true);
                      }}
                      className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className='pt-2 pb-0'>
                    <button
                      onClick={() => {
                        setOpenSettings(false);
                        handleLogout();
                      }}
                      className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
            {/* Search Bar */}
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 -translate-y-1/2 transform dark:text-[#EFEFEF]' size={20} />
              <input
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-full bg-gray-200 py-2 pr-4 pl-10 text-sm focus:outline-none dark:bg-[#303030]'
              />
            </div>

            {/* Add Contact Button */}
            <button
              className='flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030]'
              onClick={() => setShowAddContactModal(true)}
            >
              <UserPlus size={18} className='h-[20px] w-[20px]' />
            </button>

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
        <div className={`flex-1 overflow-y-auto ${scrollBar}`}>
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
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    selectedContact={selectedContact}
                    handleContactClick={handleContactClick}
                    handleUserMenuToggle={handleUserMenuToggle}
                    openUserSettingsId={openUserSettingsId}
                    setOpenUserSettingsId={setOpenUserSettingsId}
                    handleDeleteClick={handleDeleteClick}
                    userMenuRef={userMenuRef}
                  />
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
        isGroup={deleteDialog.contact?.type === 'group'}
      />

      {/* Settings Modal */}
      <SettingModal isOpen={showSettingModal} onClose={() => setShowSettingModal(false)} />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onContactAdded={handleContactAdded}
      />
    </>
  );
}

export default Sidebar;
