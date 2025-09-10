import React from 'react';
import { Users, MoreHorizontal, Ban, Archive, Trash2 } from 'lucide-react';
import { getInitial } from '../../storage/helpers/index';

function ContactItem({
  contact,
  selectedContact,
  handleContactClick,
  handleUserMenuToggle,
  openUserSettingsId,
  setOpenUserSettingsId,
  handleDeleteClick,
  userMenuRef,
}) {
  const renderStatus = (contact) => {
    if (contact.type === 'group') {
      const memberCount = contact.members ? contact.members.length : 0;
      const statusText = contact.status || `${memberCount} members`;

      return (
        <p
          className={`truncate text-sm text-gray-500 dark:text-gray-400 ${
            contact.unreadCount > 0 ? 'font-medium' : ''
          }`}
        >
          {statusText}
        </p>
      );
    } else {
      return (
        <p
          className={`truncate text-sm text-gray-500 dark:text-gray-400 ${
            contact.unreadCount > 0 ? 'font-medium' : ''
          }`}
        >
          {contact.status}
        </p>
      );
    }
  };

  return (
    <div
      key={contact.id}
      className={`group relative mb-1 flex cursor-pointer items-center space-x-3 rounded-2xl p-4 transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-slate-800 ${
        selectedContact?.id === contact.id ? 'bg-blue-100 dark:bg-slate-800' : ''
      }`}
      onClick={() => handleContactClick(contact)}
    >
      {/* Avatar */}
      <div className='relative h-12 w-12 flex-shrink-0'>
        <div className='h-12 w-12 overflow-hidden rounded-full bg-[#3F3F3F]'>
          {contact.avatar ? (
            <img src={contact.avatar} alt='Avatar' className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <span className='text-sm font-semibold text-white'>{getInitial(contact.name)}</span>
            </div>
          )}
        </div>

        {/* Online indicator */}
        {contact.isOnline && (
          <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#181818]'></div>
        )}
      </div>

      {/* Contact/Group Info */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <p className={`truncate text-base ${contact.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
              {contact.name}
            </p>

            {/* Group badge */}
            {contact.type === 'group' && (
              <div className='flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900'>
                <Users size={10} className='text-blue-600 dark:text-blue-400' />
                <span className='text-xs text-blue-600 dark:text-blue-400'>
                  {contact.members ? contact.members.length : 0}
                </span>
              </div>
            )}
          </div>
          <span className='block flex-shrink-0 text-xs text-gray-500 group-hover:hidden dark:text-gray-400'>
            {contact.lastMessageTime || ''}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          {renderStatus(contact)}
          {contact.unreadCount > 0 && (
            <div className='ml-2 flex h-5 w-5.5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white group-hover:hidden'>
              {contact.unreadCount > 5 ? '5+' : contact.unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Options Menu */}
      <div className='relative hidden group-hover:block'>
        <button
          className='cursor-pointer rounded-full p-1.5 hover:bg-[#EFEFEF] dark:hover:bg-[#303030]'
          onClick={(e) => handleUserMenuToggle(contact.id, e)}
        >
          <MoreHorizontal size={18} />
        </button>

        {openUserSettingsId === contact.id && (
          <div
            ref={userMenuRef}
            className='absolute top-8 right-0 z-20 w-48 origin-top-right rounded-lg bg-[#F9F9F9] p-2 dark:bg-[#303030]'
          >
            {/* Menu items khác nhau cho group và contact */}
            {contact.type === 'group' ? (
              <>
                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                  onClick={() => setOpenUserSettingsId(null)}
                >
                  <Users size={18} />
                  <span>Group Info</span>
                </button>

                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                  onClick={() => setOpenUserSettingsId(null)}
                >
                  <Archive size={18} />
                  <span>Archive Group</span>
                </button>

                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-200 dark:text-red-400 hover:dark:bg-red-950'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(contact);
                  }}
                >
                  <Trash2 size={18} />
                  <span>Delete Group</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                  onClick={() => setOpenUserSettingsId(null)}
                >
                  <Ban size={18} />
                  <span>Block</span>
                </button>

                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#EFEFEF] dark:text-gray-200 dark:hover:bg-[#3F3F3F]'
                  onClick={() => setOpenUserSettingsId(null)}
                >
                  <Archive size={18} />
                  <span>Archive Chat</span>
                </button>

                <button
                  className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-200 dark:text-red-400 hover:dark:bg-red-950'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(contact);
                  }}
                >
                  <Trash2 size={18} />
                  <span>Delete Chat</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactItem;
