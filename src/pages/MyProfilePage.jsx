import React, { useState } from "react";
import {
  User,
  Mail,
  Edit3,
  Check,
  X,
  Camera,
  Settings,
  Shield,
  Bell,
  ChevronLeft,
} from "lucide-react";

function MyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Quân Hồ",
    email: "hoquan15042004@gmail.com",
    status: "Active Now",
    avatar: "",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Ở đây sẽ gọi API để lưu thông tin
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset lại thông tin nếu cần
  };

  const handleAvatarUpload = () => {
    // Logic upload avatar
    console.log("Upload avatar");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active Now":
        return "bg-green-400";
      case "Busy":
        return "bg-yellow-400";
      case "Offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Active Now":
        return "text-green-600";
      case "Busy":
        return "text-yellow-600";
      case "Offline":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Active Now":
        return "bg-green-100";
      case "Busy":
        return "bg-yellow-100";
      case "Offline":
        return "bg-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#212121] py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 mb-2 px-4 py-2 bg-white dark:bg-[#3F3F3F] rounded-xl shadow hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-[#3F3F3F] rounded-2xl shadow-lg overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-20">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-white hover:text-blue-500 hover:bg-blue-100 hover:bg-opacity-20 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Edit3 size={18} />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="p-2 text-white hover:text-green-500 hover:bg-green-100 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-white hover:text-red-500 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative -mt-16 flex flex-col items-center px-6 pb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {userInfo.name}
              </h2>
              <div
                className={`flex items-center justify-center space-x-2 rounded-3xl px-2 py-1 ${getStatusBgColor(
                  userInfo.status
                )}`}
              >
                <div
                  className={`w-3 h-3 ${getStatusColor(
                    userInfo.status
                  )} rounded-full animate-pulse`}
                ></div>
                <span
                  className={`text-sm font-medium ${getStatusTextColor(
                    userInfo.status
                  )}`}
                >
                  {userInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <User size={18} className="text-gray-400 mr-3" />
                    <span className="text-gray-800 dark:text-gray-100 font-medium">
                      {userInfo.name}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <Mail size={18} className="text-gray-400 mr-3" />
                    <span className="text-gray-800 dark:text-gray-100 font-medium">
                      {userInfo.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Settings Card */}
        <div className="bg-white dark:bg-[#3F3F3F] rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg mr-1">
              <Settings
                size={20}
                className="text-blue-600 dark:text-[#F3F3F3]"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Status Settings
            </h3>
          </div>

          <div className="space-y-3">
            {["Active Now", "Busy", "Offline"].map((status) => (
              <label
                key={status}
                className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={userInfo.status === status}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mr-4 w-4 h-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-800 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white dark:bg-[#3F3F3F] p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-200">
                <Shield
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Privacy
              </span>
            </div>
          </button>

          <button className="bg-white dark:bg-[#3F3F3F] p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-200">
                <Bell
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Notifications
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
