import React, { useState } from "react";
import { X, Users, Check } from "lucide-react";
import { getInitial } from "../utils/string.jsx";

/**
 * Modal tạo nhóm chat mới
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {Array} contacts - Danh sách liên hệ để chọn thành viên
 */
function CreateGroupModal({ isOpen, onClose, contacts = [] }) {
  // State quản lý tên nhóm
  const [groupName, setGroupName] = useState("");
  
  // State quản lý danh sách user được chọn (mảng ID)
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // State quản lý từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách liên hệ theo từ khóa tìm kiếm
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Xử lý chọn/bỏ chọn user
   * @param {number} userId - ID của user
   */
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) // Bỏ chọn nếu đã chọn
        : [...prev, userId]                // Thêm vào nếu chưa chọn
    );
  };

  /**
   * Xử lý tạo nhóm mới
   * Điều kiện: Phải có tên nhóm và ít nhất 2 thành viên
   */
  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      // Lấy thông tin chi tiết của các user được chọn
      const selectedContactsData = contacts.filter(contact => 
        selectedUsers.includes(contact.id)
      );
      
      // Log dữ liệu nhóm mới (có thể thay bằng API call)
      console.log("Creating group:", {
        name: groupName,
        members: selectedContactsData
      });
      
      // Reset form về trạng thái ban đầu
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      onClose();
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

  // Không render nếu modal đóng
  if (!isOpen) return null;

  return (
    // Overlay tối đen phủ toàn màn hình
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#181818] rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        
        {/* Header modal với tiêu đề và nút đóng */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">Tạo nhóm mới</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input nhập tên nhóm */}
        <div className="p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <label className="block text-sm font-medium mb-2">
            Tên nhóm
          </label>
          <input
            type="text"
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] bg-white dark:bg-[#303030] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Input tìm kiếm thành viên */}
        <div className="p-4 border-b border-gray-200 dark:border-[#3F3F3F]">
          <label className="block text-sm font-medium mb-2">
            Thêm thành viên ({selectedUsers.length} đã chọn)
          </label>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#3F3F3F] bg-white dark:bg-[#303030] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Danh sách liên hệ có thể chọn */}
        <div className="flex-1 overflow-y-auto max-h-60">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#303030] cursor-pointer"
              onClick={() => handleUserToggle(contact.id)}
            >
              {/* Avatar với trạng thái online */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {getInitial(contact.name)}
                  </span>
                </div>
                {/* Chấm xanh hiển thị trạng thái online */}
                {contact.active && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#181818]"></div>
                )}
              </div>
              
              {/* Thông tin liên hệ */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{contact.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                  {contact.status}
                </p>
              </div>
              
              {/* Checkbox tùy chỉnh */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedUsers.includes(contact.id)
                  ? 'bg-blue-500 border-blue-500'      // Đã chọn: nền xanh
                  : 'border-gray-300 dark:border-[#3F3F3F]' // Chưa chọn: viền xám
              }`}>
                {selectedUsers.includes(contact.id) && (
                  <Check size={12} className="text-white" />
                )}
              </div>
            </div>
          ))}
          
          {/* Hiển thị khi không tìm thấy kết quả */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>

        {/* Footer với các nút action */}
        <div className="p-4 border-t border-gray-200 dark:border-[#3F3F3F] flex gap-3">
          {/* Nút hủy */}
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#3F3F3F] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
          >
            Cancel
          </button>
          
          {/* Nút tạo nhóm - chỉ enabled khi đủ điều kiện */}
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create New Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
