import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, UserRound, Settings, Search, Plus, LogOut } from "lucide-react";

// Sample data
const contacts = [
  {
    name: "Maria Nelson",
    status: "looks good",
    avatar: "/api/placeholder/32/32",
    active: true,
  },
  {
    name: "Ashley Harris",
    status: "lucky you",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Andrew Wilson",
    status: "same here.",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Jennifer Brown",
    status: "wait a second",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Edward Davis",
    status: "how's it going?",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Karen Wilson",
    status: "i hear you",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Joseph Garcia",
    status: "at least it's friday",
    avatar: "/api/placeholder/32/32",
  },
  {
    name: "Patricia Jones",
    status: "what about you?",
    avatar: "/api/placeholder/32/32",
  },
];

// Custom scrollbar
const customScrollbarStyles =" \
  [&::-webkit-scrollbar]:w-2 \
  [&::-webkit-scrollbar-track]:rounded-full \
  [&::-webkit-scrollbar-track]:bg-gray-100 \
  [&::-webkit-scrollbar-thumb]:rounded-full \
  [&::-webkit-scrollbar-thumb]:bg-gray-300 \
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700 \
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 \
";

function Sidebar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      <div className="w-80 bg-[#f9f9f9] dark:bg-[#181818] h-screen flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold">H</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Quân Hồ</h2>
            </div>
            <div className="flex space-x-2">
              <div className="relative inline-block" ref={menuRef}>
                <button
                  className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <MoreHorizontal size={20} />
                </button>
                {open && (
                  <div className="absolute right-0 z-10 mt-2 w-56 p-2 origin-top-right divide-y divide-gray-200 dark:divide-[#3F3F3F] rounded-md bg-[#F9F9F9] dark:bg-[#303030] shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                    <div className="py-1">
                      <div>
                        <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg">
                          <UserRound size={18} />
                          <span>My Profile</span>
                        </a>
                      </div>
                      <div>
                        <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg">
                          <Settings size={18} />
                          <span>Settings</span>
                        </a>
                      </div>
                    </div>
                    <div className="pb-1 pt-2">
                      <div>
                        <a href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F3F] hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-lg">
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

          {/* Search bar */}
          <div className="flex justify-center relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-200 dark:bg-[#303030] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
            <button className="p-2 ml-3 hover:bg-[#EFEFEF] dark:bg-[#181818] dark:hover:bg-[#303030] rounded-lg">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className={`flex-1 overflow-y-auto ${customScrollbarStyles}`}>
          {contacts.map((contact, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 hover:bg-[#EFEFEF] dark:hover:bg-slate-800 cursor-pointer ${
                contact.active
                  ? "bg-blue-100 dark:bg-slate-800 border-l-2 border-blue-500"
                  : ""
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                {contact.active && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#181818]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{contact.name}</p>
                <p className="text-slate-400 text-xs truncate">
                  {contact.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
