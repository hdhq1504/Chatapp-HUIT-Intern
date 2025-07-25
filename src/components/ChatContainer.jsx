import React, { useState } from "react";
import { Phone, Video, Info, Image, Camera, Mic, Smile } from "lucide-react";

const messages = [
  {
    id: 1,
    type: "image",
    content: "/api/placeholder/400/200",
    timestamp: "48 minutes ago",
    sender: "other",
  },
  {
    id: 2,
    type: "text",
    content: "I'm thinking of going hiking if the weather's nice.",
    timestamp: "48 minutes ago",
    sender: "self",
  },
  {
    id: 3,
    type: "text",
    content: "Sounds fun! Let me know",
    timestamp: "48 minutes ago",
    sender: "other",
  },
  {
    id: 4,
    type: "text",
    content: "if you need company",
    timestamp: "47 minutes ago",
    sender: "other",
  },
];

function ChatContainer({ setShowDetails }) {
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="bg-[#F9F9F9] dark:bg-[#212121] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                <span className="text-sm font-semibold">M</span>
              </div>
              <div>
                <h3 className="font-semibold">Maria Nelson</h3>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
                <Phone size={20} />
              </button>
              <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer">
                <Video size={20} />
              </button>
              <button
                className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg cursor-pointer"
                onClick={() => setShowDetails((prev) => !prev)}
              >
                <Info size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const next = messages[idx + 1];
            const isFirst = !prev || prev.sender !== msg.sender;
            const isLast = !next || next.sender !== msg.sender;
            return (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "self" ? "justify-end" : "justify-start"} ${isFirst ? "mt-4" : "mt-1"}`}
              >
                <div className="max-w-md flex gap-2 items-end">
                  {msg.sender === "other" && (
                    isFirst ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-semibold">M</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8" />
                    )
                  )}
                  <div>
                    {msg.type === "image" ? (
                      <div className={`rounded-lg overflow-hidden ${msg.sender === "self" ? "ml-auto" : ""}`}>
                        <img
                          src={msg.content}
                          alt="Shared image"
                          className="w-100 h-55 object-cover bg-slate-600"
                        />
                      </div>
                    ) : (
                      <div className={`px-4 py-3 rounded-full ${msg.sender === "self" ? "bg-blue-600 text-white ml-auto" : "bg-[#212121] text-white"}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    )}
                    {isLast && (
                      <p className={`text-xs text-gray-100 mt-1 px-2 ${msg.sender === "self" ? "text-right" : ""}`}>{msg.timestamp}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-[#F9F9F9] dark:bg-[#212121] shadow-sm">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg">
              <Image size={20} />
            </button>
            <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg">
              <Camera size={20} />
            </button>
            <button className="p-2 hover:bg-[#EFEFEF] dark:hover:bg-[#303030] rounded-lg">
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

            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-white">
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatContainer;
