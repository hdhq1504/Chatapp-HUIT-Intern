import React from "react";
import Photo3 from "../assets/images/photo_2025_3.png";
import MessageHeader from "./MessageHeader.jsx";
import InputMessage from "./InputMessage.jsx";

const messages = [
  {
    id: 1,
    type: "image",
    content: Photo3,
    timestamp: "48 minutes ago",
    sender: "other",
  },
  {
    id: 2,
    type: "text",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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
  {
    id: 5,
    type: "text",
    content: "Oke, I'll let you know",
    timestamp: "45 minutes ago",
    sender: "self",
  },
  {
    id: 6,
    type: "text",
    content: "!",
    timestamp: "35 minutes ago",
    sender: "other",
  },
];

function ChatContainer({ setShowDetails }) {
  return (
    <>
      <div className="flex-1 flex flex-col relative h-full">
        <MessageHeader setShowDetails={setShowDetails} />
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const next = messages[idx + 1];
            const isFirst = !prev || prev.sender !== msg.sender;
            const isLast = !next || next.sender !== msg.sender;
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "self" ? "justify-end" : "justify-start"
                } ${isFirst ? "mt-4" : "mt-1"}`}
              >
                <div className="flex gap-2 items-end">
                  {msg.sender === "other" &&
                    (isFirst ? (
                      <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-semibold">M</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 min-w-[2rem] min-h-[2rem]" />
                    ))}
                  <div className="flex flex-col">
                    {msg.type === "image" ? (
                      <div
                        className={`rounded-lg overflow-hidden ${
                          msg.sender === "self" ? "ml-auto" : ""
                        }`}
                      >
                        <img
                          src={msg.content}
                          alt="Shared image"
                          className="w-full h-55 object-cover bg-slate-600"
                        />
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-3 rounded-3xl max-w-xs text-pretty ${
                          msg.sender === "self"
                            ? "bg-blue-600 text-white ml-auto"
                            : "bg-gray-200 dark:bg-[#212121] text-[#212121] dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    )}
                    {isLast && (
                      <p
                        className={`text-xs text-gray-100 mt-1 px-2 ${
                          msg.sender === "self" ? "text-right" : ""
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <InputMessage />
      </div>
    </>
  );
}

export default ChatContainer;
