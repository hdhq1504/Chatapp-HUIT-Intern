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
    <div className="min-h-screen bg-gray-100 px-4 py-8 dark:bg-[#212121]">
      <div className="mx-auto max-w-md space-y-6">
        <button
          onClick={() => (window.location.href = "/")}
          className="mb-2 flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-blue-600 shadow transition-all duration-200 hover:bg-blue-100 dark:bg-[#3F3F3F] dark:text-blue-400 dark:hover:bg-blue-900"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[#3F3F3F]">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-20">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-opacity-20 cursor-pointer rounded-full bg-blue-100 p-2 text-blue-500 transition-all duration-200 hover:scale-105"
                >
                  <Edit3 size={18} />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="cursor-pointer rounded-full bg-green-100 p-2 text-green-500 transition-all duration-200 hover:scale-105"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer rounded-full bg-red-100 p-2 text-red-500 transition-all duration-200 hover:scale-105"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative -mt-16 flex flex-col items-center px-6 pb-6">
            <div className="group relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={handleAvatarUpload}
                className="absolute right-2 bottom-2 cursor-pointer rounded-full bg-blue-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">
                {userInfo.name}
              </h2>
              <div
                className={`flex items-center justify-center space-x-2 rounded-3xl px-2 py-1 ${getStatusBgColor(
                  userInfo.status,
                )}`}
              >
                <div
                  className={`h-3 w-3 ${getStatusColor(
                    userInfo.status,
                  )} animate-pulse rounded-full`}
                ></div>
                <span
                  className={`text-sm font-medium ${getStatusTextColor(
                    userInfo.status,
                  )}`}
                >
                  {userInfo.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                ) : (
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                    <User size={18} className="mr-3 text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {userInfo.name}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                ) : (
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                    <Mail size={18} className="mr-3 text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {userInfo.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-[#3F3F3F]">
          <div className="mb-4 flex items-center">
            <div className="mr-1 rounded-lg p-2">
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
                className="group flex cursor-pointer items-center rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={userInfo.status === status}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mr-4 h-4 w-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="group cursor-pointer rounded-2xl bg-white p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl dark:bg-[#3F3F3F]">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-purple-100 p-3 transition-colors duration-200 group-hover:bg-purple-200 dark:bg-purple-900 dark:group-hover:bg-purple-800">
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

          <button className="group cursor-pointer rounded-2xl bg-white p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl dark:bg-[#3F3F3F]">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-green-100 p-3 transition-colors duration-200 group-hover:bg-green-200 dark:bg-green-900 dark:group-hover:bg-green-800">
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
