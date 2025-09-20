import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { groupStorage } from '../utils/storage';
import { scrollBar, getInitial } from '../storage/helpers';
import { useChat } from '../contexts/ChatContext';

function ChatInfo({ onClose, selectedContact }) {
  const [chatSettingsOpen, setChatSettingsOpen] = useState(true);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(true);
  const [groupMembersOpen, setGroupMembersOpen] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const { isUserOnline } = useChat();
  const isGroup = selectedContact?.type === 'group';
  const groupMembers = isGroup ? selectedContact?.members || [] : [];

  useEffect(() => {
    if (isGroup && selectedContact) {
      setEditGroupName(selectedContact?.name || '');
    }
  }, [isGroup, selectedContact]);

  if (!selectedContact) {
    return null;
  }

  const handleUpdateGroupName = () => {
    if (!isGroup || !editGroupName.trim()) return;

    const updatedGroup = groupStorage.updateGroup(selectedContact.id, {
      name: editGroupName.trim(),
    });

    if (updatedGroup) {
      setIsEditingGroupName(false);
    } else {
      console.error('Failed to update group name');
    }
  };

  const handleRemoveMember = () => {
    // TODO: implement remove member's group function
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
              <h3 className='text-xl font-semibold md:text-lg'>{selectedContact.name}</h3>
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
                            <p className='text-xs text-gray-500'>{index === 0 ? 'Admin' : 'Member'}</p>
                          </div>
                        </div>

                        <div className='flex items-center gap-1'>
                          {index === 0 && (
                            <div className='rounded-full p-2.5'>
                              <Crown size={16} className='text-yellow-500' />
                            </div>
                          )}
                          {index !== 0 && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className='cursor-pointer rounded-full p-2.5'
                            >
                              <UserMinus size={16} />
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
                      <div className='py-2 text-sm text-gray-600 dark:text-gray-400'>Leave Group</div>
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
