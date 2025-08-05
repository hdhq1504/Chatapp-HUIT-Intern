import React from "react";
import { Phone, Video, Info, ArrowLeft } from "lucide-react";

/**
 * Component header của khu vực chat
 * Hiển thị thông tin người đang chat và các nút action
 * @param {Function} setShowDetails - Hàm toggle hiển thị panel chi tiết
 * @param {Function} onBackToSidebar - Hàm quay lại sidebar (mobile)
 * @param {boolean} isMobile - Kiểm tra có phải mobile không
 * @param {boolean} isTablet - Kiểm tra có phải tablet không
 * @param {boolean} showSidebar - Trạng thái hiển thị sidebar
 * @param {Function} setShowSidebar - Hàm toggle sidebar
 */
function MessageHeader({
  setShowDetails,
  onBackToSidebar,
  isMobile,
  isTablet,
  showSidebar,
  setShowSidebar,
}) {
  return (
    <div className="bg-[#F9F9F9] dark:bg-[#212121] p-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        
        {/* Left section - Back button + User info  */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Back button for mobile/tablet */}
          {(isMobile || isTablet) && (
            <button
              className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer flex-shrink-0"
              onClick={onBackToSidebar}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          
          {/* Avatar người chat */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">M</span>
          </div>

          {/* Thông tin tên và trạng thái */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-base truncate">Maria Nelson</h3>
            {/* Badge hiển thị trạng thái online */}
            <span className="flex items-center gap-1 px-2 py-0.25 text-[12px] bg-green-100 text-green-600 rounded-full font-medium">
              {/* Chấm xanh nhỏ */}
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Active Now
            </span>
          </div>
        </div>

        {/* Các nút action */}
        <div className="flex space-x-2 flex-shrink-0">
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
            onClick={() => setShowDetails((prev) => !prev)}
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageHeader;
