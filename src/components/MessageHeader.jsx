import React from "react";
import { Phone, Video, Info } from "lucide-react";

/**
 * Component header của khu vực chat
 * Hiển thị thông tin người đang chat và các nút action
 * @param {Function} setShowDetails - Hàm toggle hiển thị panel chi tiết
 */
function MessageHeader({ setShowDetails }) {
  return (
    // Header cố định phía trên với background và shadow
    <div className="bg-[#F9F9F9] dark:bg-[#212121] p-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        
        {/* Thông tin người đang chat */}
        <div className="flex items-center space-x-3">
          {/* Avatar người chat */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
            <span className="text-sm font-semibold">M</span>
          </div>
          
          {/* Thông tin tên và trạng thái */}
          <div className="flex flex-col">
            <h3 className="font-semibold">Maria Nelson</h3>
            {/* Badge hiển thị trạng thái online */}
            <span className="flex items-center gap-1 px-2 py-0.25 text-[12px] bg-green-100 text-green-600 rounded-full font-medium">
              {/* Chấm xanh nhỏ */}
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Active Now
            </span>
          </div>
        </div>
        
        {/* Các nút action */}
        <div className="flex space-x-2">
          {/* Nút gọi điện thoại */}
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
            <Phone size={20} />
          </button>
          
          {/* Nút gọi video */}
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
            <Video size={20} />
          </button>
          
          {/* Nút hiển thị thông tin chi tiết */}
          <button
            className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            onClick={() => setShowDetails((prev) => !prev)} // Toggle trạng thái hiển thị panel
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageHeader;
