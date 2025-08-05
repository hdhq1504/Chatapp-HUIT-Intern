import React, { useState } from "react";
import { MoreHorizontal, UserRound, Settings, Search, Plus, LogOut, Ban, Archive, Trash2, Menu, X } from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { getInitial } from "../utils/string.jsx";
import { useClickOutside, useMultipleClickOutside } from "../hooks/useClickOutside.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";

// Dữ liệu mẫu danh sách liên hệ
const contacts = [
  {
    id: 1,
    name: "Maria Nelson",
    status: "looks good",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
  {
    id: 2,
    name: "Ashley Harris",
    status: "lucky you",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
  {
    id: 3,
    name: "Andrew Wilson",
    status: "same here.",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 4,
    name: "Jennifer Brown",
    status: "wait a second",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 5,
    name: "Edward Davis",
    status: "how's it going?",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 6,
    name: "Karen Wilson",
    status: "i hear you",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 7,
    name: "Joseph Garcia",
    status: "at least it's friday",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: 8,
    name: "Patricia Jones",
    status: "what about you?",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
];

/**
 * Component sidebar chứa danh sách liên hệ và menu cài đặt
 */
function Sidebar({onChatSelect, onBackToSidebar, isMobile, isTablet, showSidebar, setShowSidebar}) {
  const [openSettings, setOpenSettings] = useState(false);
  const [openUserSettingsId, setOpenUserSettingsId] = useState(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc contacts theo search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sử dụng useClickOutside cho menu cài đặt chính
  const mainMenuRef = useClickOutside(
    () => setOpenSettings(false),
    openSettings
  );

  // Sử dụng useMultipleClickOutside cho các user menu
  const { registerClickOutside } = useMultipleClickOutside();

  /**
   * Xử lý toggle menu user settings với logic loại trừ trigger button
   */
  const handleUserMenuToggle = (contactId, event) => {
    event.stopPropagation();
    
    // Nếu đang mở menu khác, đóng menu đó và mở menu mới
    // Nếu đang mở chính menu này, thì đóng nó
    setOpenUserSettingsId(openUserSettingsId === contactId ? null : contactId);
  };

  const handleOpenCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  const handleContactClick = (contact) => {
    console.log('Selected contact:', contact.name);
    if (onChatSelect) {
      onChatSelect(contact);
    }
  };

  return (
    <>
      <div className={`h-screen bg-[#f9f9f9] dark:bg-[#181818] flex flex-col ${isMobile ? "w-full" : "w-80"}`}>
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">H</span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">Quân Hồ</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isMobile ? "Messages" : "Online"}
              </p>
            </div>

            {/* Menu cài đặt chính */}
            <div className="flex space-x-2">
              <div className="relative inline-block" ref={mainMenuRef}>
                <button
                  className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
                  onClick={() => setOpenSettings((prev) => !prev)}
                >
                  <MoreHorizontal size={20} />
                </button>

                {openSettings && (
                  <div className="absolute right-0 z-10 mt-1 w-48 p-2 origin-top-right divide-y divide-gray-200 dark:divide-[#3F3F3F] rounded-lg bg-[#F9F9F9] dark:bg-[#303030] shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                    <div className="pt-0 pb-2">
                      <div>
                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg"
                        >
                          <UserRound size={18} />
                          <span>My Profile</span>
                        </a>
                      </div>
                      <div>
                        <a
                          href="/archive"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg"
                        >
                          <Archive size={18} />
                          <span>Archived Chat</span>
                        </a>
                      </div>
                      <div>
                        <a
                          href="#"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg"
                        >
                          <Settings size={18} />
                          <span>Settings</span>
                        </a>
                      </div>
                    </div>

                    <div className="pb-0 pt-2">
                      <div>
                        <a
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg"
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

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-200 dark:bg-[#303030] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              className="p-2 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030] rounded-lg cursor-pointer flex-shrink-0"
              onClick={handleOpenCreateGroupModal}
              title="Tạo nhóm mới"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <Search size={48} className="mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              // Đăng ký click outside cho từng user menu
              const userMenuRef = registerClickOutside(
                `user-${contact.id}`,
                () => setOpenUserSettingsId(null),
                openUserSettingsId === contact.id
              );
              
              return (
                <div
                  key={contact.id}
                  className={`group flex items-center space-x-3 p-4 hover:bg-blue-100 dark:hover:bg-slate-800 cursor-pointer relative transition-colors duration-200 border-l-3 border-transparent hover:border-blue-500`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {getInitial(contact.name)}
                      </span>
                    </div>
                    {contact.active && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#181818]"></div>
                    )}
                  </div>
  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-base truncate">{contact.name}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 block group-hover:hidden">
                        2:30 PM
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      {contact.status}
                    </p>
                  </div>
  
                  {/* User menu */}
                  <div className="relative hidden group-hover:block">
                    <button
                      className="p-1.5 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
                      onClick={(e) => handleUserMenuToggle(contact.id, e)}
                      data-user-menu-trigger
                      data-user-id={contact.id}
                    >
                      <MoreHorizontal size={18} />
                    </button>
  
                    {openUserSettingsId === contact.id && (
                      <div
                        ref={userMenuRef}
                        className="absolute right-0 top-8 z-20 w-48 p-2 origin-top-right divide-y divide-gray-200 dark:divide-[#3F3F3F] rounded-lg bg-[#F9F9F9] dark:bg-[#303030] shadow-lg ring-1 ring-black/5 focus:outline-hidden"
                      >
                        <div>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg w-full text-left cursor-pointer"
                            onClick={() => {
                              console.log("Block user:", contact.name);
                              setOpenUserSettingsId(null);
                            }}
                          >
                            <Ban size={18} />
                            <span>Block</span>
                          </button>
  
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg w-full text-left cursor-pointer"
                            onClick={() => {
                              console.log("Archive chat:", contact.name);
                              setOpenUserSettingsId(null);
                            }}
                          >
                            <Archive size={18} />
                            <span>Archive Chat</span>
                          </button>
  
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-200 hover:dark:bg-red-950 focus:outline-none rounded-lg w-full text-left cursor-pointer"
                            onClick={() => {
                              console.log("Delete chat:", contact.name);
                              setOpenUserSettingsId(null);
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

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
        contacts={contacts}
      />
    </>
  );
}

export default Sidebar;
