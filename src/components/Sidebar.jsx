import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, UserRound, Settings, Search, Plus, LogOut, Ban, Archive, Trash2 } from "lucide-react";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { getInitial } from "../utils/string.jsx";

// Dữ liệu mẫu danh sách liên hệ
const contacts = [
  {
    id: 1,
    name: "Maria Nelson",
    status: "looks good",
    avatar: "/api/placeholder/32/32",
    active: true, // Trạng thái online
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
function Sidebar() {
  // State quản lý trạng thái mở/đóng menu cài đặt chính
  const [openSettings, setOpenSettings] = useState(false);
  
  // State quản lý ID của user đang mở menu (null = không có menu nào mở)
  const [openUserSettingsId, setOpenUserSettingsId] = useState(null);
  
  // Refs để quản lý việc click outside
  const userMenuRefs = useRef({}); // Object chứa refs của từng user menu
  const menuRef = useRef(null);    // Ref của menu cài đặt chính
  
  /**
   * Effect xử lý click outside để đóng dropdown menus
   * Lắng nghe sự kiện mousedown trên document
   */
  useEffect(() => {
    function handleClickOutside(event) {
      // Kiểm tra menu cài đặt chính
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenSettings(false);
      }
      
      // Kiểm tra user settings menus
      if (openUserSettingsId !== null) {
        const currentUserMenuRef = userMenuRefs.current[openUserSettingsId];
        if (currentUserMenuRef && !currentUserMenuRef.contains(event.target)) {
          // Kiểm tra xem có click vào trigger button không
          const triggerButton = event.target.closest('[data-user-menu-trigger]');
          const triggerId = triggerButton?.getAttribute('data-user-id');
          
          // Chỉ đóng menu nếu không click vào trigger button của chính menu đó
          if (!triggerButton || parseInt(triggerId) !== openUserSettingsId) {
            setOpenUserSettingsId(null);
          }
        }
      }
    }
    
    // Chỉ add event listener khi có menu đang mở
    if (openSettings || openUserSettingsId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup function
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSettings, openUserSettingsId]);

  /**
   * Xử lý toggle menu user settings
   * @param {number} contactId - ID của contact
   * @param {Event} event - Event object để stopPropagation
   */
  const handleUserMenuToggle = (contactId, event) => {
    event.stopPropagation(); // Ngăn event bubble lên parent
    setOpenUserSettingsId(openUserSettingsId === contactId ? null : contactId);
  };

  return (
    <>
      {/* Sidebar cố định bên trái với responsive width */}
      <div className="fixed left-0 top-0 w-full lg:w-80 md:w-80 h-screen bg-[#f9f9f9] dark:bg-[#181818] flex flex-col z-30">
        
        {/* Header section */}
        <div className="p-4">
          
          {/* Thông tin user hiện tại */}
          <div className="flex items-center space-x-3 mb-4">
            {/* Avatar user hiện tại */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold">H</span>
            </div>
            
            {/* Tên user */}
            <div className="flex-1">
              <h2 className="font-semibold">Quân Hồ</h2>
            </div>
            
            {/* Menu cài đặt chính */}
            <div className="flex space-x-2">
              <div className="relative inline-block" ref={menuRef}>
                <button
                  className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
                  onClick={() => setOpenSettings((prev) => !prev)}
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {/* Dropdown menu cài đặt */}
                {openSettings && (
                  <div className="absolute right-0 z-10 mt-1 w-56 p-2 origin-top-right divide-y divide-gray-200 dark:divide-[#3F3F3F] rounded-lg bg-[#F9F9F9] dark:bg-[#303030] shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                    
                    {/* Nhóm menu chính */}
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
                    
                    {/* Nhóm menu đăng xuất */}
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

          {/* Thanh tìm kiếm và nút thêm */}
          <div className="flex justify-center relative">
            {/* Icon search */}
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-slate-400"
              size={20}
            />
            {/* Input tìm kiếm */}
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-200 dark:bg-[#303030] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
            {/* Nút thêm (tạo nhóm, thêm bạn, etc.) */}
            <button className="p-2 ml-3 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Danh sách liên hệ với scroll tùy chỉnh */}
        <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`group flex items-center space-x-3 px-3 py-4 hover:bg-[#EFEFEF] dark:hover:bg-slate-800 cursor-pointer relative`}
            >
              {/* Avatar với status indicator */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {getInitial(contact.name)}
                  </span>
                </div>
                {/* Chấm xanh hiển thị trạng thái online */}
                {contact.active && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-transparent dark:border-[#181818]"></div>
                )}
              </div>
              
              {/* Thông tin liên hệ */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{contact.name}</p>
                <p className="text-slate-400 text-xs truncate">
                  {contact.status}
                </p>
              </div>
              
              {/* Menu action cho từng user - chỉ hiển thị khi hover */}
              <div className="relative opacity-0 group-hover:opacity-100">
                <button
                  className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
                  onClick={(e) => handleUserMenuToggle(contact.id, e)}
                  data-user-menu-trigger
                  data-user-id={contact.id}
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {/* Dropdown menu cho user */}
                {openUserSettingsId === contact.id && (
                  <div 
                    ref={(el) => userMenuRefs.current[contact.id] = el}
                    className="absolute right-0 top-8 z-20 w-48 p-2 origin-top-right divide-y divide-gray-200 dark:divide-[#3F3F3F] rounded-lg bg-[#F9F9F9] dark:bg-[#303030] shadow-lg ring-1 ring-black/5 focus:outline-hidden"
                  >
                    <div>
                      {/* Nút block user */}
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg w-full text-left cursor-pointer"
                        onClick={() => {
                          console.log('Block user:', contact.name);
                          setOpenUserSettingsId(null);
                        }}
                      >
                        <Ban size={18} />
                        <span>Block</span>
                      </button>
                      
                      {/* Nút archive chat */}
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg w-full text-left cursor-pointer"
                        onClick={() => {
                          console.log('Archive chat:', contact.name);
                          setOpenUserSettingsId(null);
                        }}
                      >
                        <Archive size={18} />
                        <span>Archive Chat</span>
                      </button>
                      
                      {/* Nút delete chat - màu đỏ để cảnh báo */}
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-200 hover:dark:bg-red-950 focus:outline-none rounded-lg w-full text-left cursor-pointer"
                        onClick={() => {
                          console.log('Delete chat:', contact.name);
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
          ))}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
