import React from 'react';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';

function WelcomeScreen() {
  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Tin nhắn nhanh",
      description: "Gửi tin nhắn tức thì với bạn bè và gia đình"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Nhóm chat",
      description: "Tạo nhóm để trò chuyện với nhiều người cùng lúc"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bảo mật cao",
      description: "Tin nhắn được mã hóa end-to-end"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Tốc độ cao",
      description: "Trải nghiệm mượt mà và nhanh chóng"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-white dark:bg-[#212121] p-8">
      <div className="text-center max-w-md">
        {/* Logo/Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>

        {/* Welcome Title */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to ChatApp
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Choose a conversation to start chatting
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-gray-50 dark:bg-[#303030]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mb-3 mx-auto">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-100">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-100 text-sm">
            💡 Tips: Using search bar to find a conversation
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
