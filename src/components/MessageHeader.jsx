import React from "react";
import { Phone, Video, Info, ArrowLeft } from "lucide-react";
import { getInitial } from "../utils/string.jsx";

function MessageHeader({
  setShowDetails,
  onBackToSidebar,
  selectedContact
}) {
  if (!selectedContact) {
    return null;
  }

  return (
    <div className="bg-[#F9F9F9] dark:bg-[#212121] px-3 py-2.5 md:p-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <button
            className="block md:hidden p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            onClick={onBackToSidebar}
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
            <span className="text-xs md:text-sm font-semibold text-white">
              {getInitial(selectedContact.name)}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate">
              {selectedContact.name}
            </h3>
            
            <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.25 text-[10px] md:text-xs rounded-full font-medium w-fit ${
              selectedContact.active 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              <span className={`inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                selectedContact.active ? 'bg-green-500' : 'bg-gray-400'
              }`}></span>
              {selectedContact.active ? 'Active Now' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex space-x-1 md:space-x-2 flex-shrink-0">
          <button 
            className="p-1.5 md:p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            title="Call"
          >
            <Phone size={18} className="md:w-5 md:h-5" />
          </button>

          <button 
            className="p-1.5 md:p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            title="Video Call"
          >
            <Video size={18} className="md:w-5 md:h-5" />
          </button>

          <button
            className="p-1.5 md:p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
            onClick={() => setShowDetails((prev) => !prev)}
            title="Chat Info"
          >
            <Info size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageHeader;
