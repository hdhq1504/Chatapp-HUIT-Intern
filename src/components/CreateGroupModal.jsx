import React, { useState, useEffect } from "react";
import { X, Users, Check } from "lucide-react";
import { getInitial } from "../utils/string.jsx";
import { customScrollbarStyles } from "../utils/styles.jsx";
import { useClickOutside } from "../hooks/useClickOutside.jsx";

/**
 * Modal tạo nhóm chat mới với animation mượt mà
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {Array} contacts - Danh sách liên hệ để chọn thành viên
 */
function CreateGroupModal({ isOpen, onClose, contacts = [] }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Sử dụng useClickOutside để đóng modal khi click outside
  const modalRef = useClickOutside(
    () => handleClose(),
    isOpen && isAnimating // Chỉ enable click outside khi modal đã mở hoàn toàn
  );

  // Effect xử lý animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else if (shouldRender) {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen, shouldRender]);

  // Lọc danh sách liên hệ
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Xử lý chọn/bỏ chọn user
   */
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Xử lý tạo nhóm mới
   */
  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      const selectedContactsData = contacts.filter(contact => 
        selectedUsers.includes(contact.id)
      );
      
      console.log("Creating group:", {
        name: groupName,
        members: selectedContactsData
      });
      
      handleClose();
    }
  };

  /**
   * Xử lý đóng modal và reset form
   */
  const handleClose = () => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchTerm("");
    onClose();
  };

  // Không render nếu modal không được hiển thị
  if (!shouldRender) return null;

  return (
    // Overlay với fade animation
    <div 
      className={`fixed inset-0 bg-[#111111]/75 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Modal container với click outside handling */}
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-[#212121] rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col transform transition-all duration-300 ease-out ${
          isAnimating 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">New group chat</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input nhập tên nhóm */}
        <div className="p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <label className="block text-sm font-medium mb-2">
            Group name
          </label>
          <input
            type="text"
            placeholder="Enter your group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-none bg-white dark:bg-[#303030] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        {/* Input tìm kiếm thành viên */}
        <div className="p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <label className="block text-sm font-medium mb-2">
            Add member ({selectedUsers.length} selected)
          </label>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-none bg-white dark:bg-[#303030] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        {/* Danh sách liên hệ */}
        <div className={`flex-1 overflow-y-auto max-h-60 ${customScrollbarStyles}`}>
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#303030] cursor-pointer transition-colors duration-200"
              onClick={() => handleUserToggle(contact.id)}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {getInitial(contact.name)}
                  </span>
                </div>
              </div>
              
              {/* Thông tin liên hệ */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{contact.name}</p>
              </div>
              
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 transform ${
                selectedUsers.includes(contact.id)
                  ? 'bg-blue-500 border-blue-500 scale-110'
                  : 'border-gray-300 dark:border-[#3F3F3F] scale-100'
              }`}>
                {selectedUsers.includes(contact.id) && (
                  <Check 
                    size={12} 
                    className="text-white animate-in slide-in-from-top-1 duration-200" 
                  />
                )}
              </div>
            </div>
          ))}
          
          {/* Không tìm thấy kết quả */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#3F3F3F] flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#3F3F3F] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#303030] transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
