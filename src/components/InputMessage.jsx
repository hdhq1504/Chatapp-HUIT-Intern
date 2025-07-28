import React, { useState } from "react";
import { Image, Camera, Mic, Smile, Send } from "lucide-react";

function InputMessage() {
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="p-4 bg-[#F9F9F9] dark:bg-[#212121] shadow-sm sticky bottom-0 z-10">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
            <Image size={20} />
          </button>
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
            <Camera size={20} />
          </button>
          <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
            <Mic size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full bg-gray-200 dark:bg-[#303030] rounded-lg px-4 py-2 pr-10 focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#212121] rounded">
              <Smile size={20} />
            </button>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-semibold text-white cursor-pointer">
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default InputMessage;
