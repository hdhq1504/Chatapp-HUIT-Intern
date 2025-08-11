import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Camera, ChevronLeft, Edit3, Check, X } from 'lucide-react';
import useValidator from '../utils/validator.jsx';

function MyProfilePage() {
  const [userInfo, setUserInfo] = useState({
    name: 'Quân Hồ',
    email: 'hoquan15042004@gmail.com',
    avatar: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [initialUserInfo, setInitialUserInfo] = useState(null);

  const fileInputRef = useRef(null);
  const { errors, touched, validators, validateField, validateAll } = useValidator();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('profile_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserInfo({
          name: parsed.name || 'Quân Hồ',
          email: parsed.email || 'hoquan15042004@gmail.com',
          avatar: parsed.avatar || '',
        });
        setInitialUserInfo({
          name: parsed.name || 'Quân Hồ',
          email: parsed.email || 'hoquan15042004@gmail.com',
          avatar: parsed.avatar || '',
        });
        return;
      }
    } catch {
      // ignore parse error
    }

    const savedAvatar = localStorage.getItem('profile_avatar_dataurl');
    const next = savedAvatar
      ? { name: 'Quân Hồ', email: 'hoquan15042004@gmail.com', avatar: savedAvatar }
      : { name: 'Quân Hồ', email: 'hoquan15042004@gmail.com', avatar: '' };
    setUserInfo(next);
    setInitialUserInfo(next);
  }, []);

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        setUserInfo((prev) => ({ ...prev, avatar: dataUrl }));
        try {
          localStorage.setItem('profile_avatar_dataurl', dataUrl);
        } catch (error) {
          console.warn('Unable to persist avatar to localStorage', error);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const validationRules = {
    name: [
      (v) => validators.isRequired(v, 'Vui lòng nhập tên'),
      (v) => validators.minLength(v, 2, 'Tên phải có tối thiểu 2 ký tự'),
    ],
    email: [
      (v) => validators.isRequired(v, 'Vui lòng nhập email'),
      (v) => validators.isEmail(v, 'Email không hợp lệ'),
    ],
  };

  const handleStartEdit = () => {
    setInitialUserInfo(userInfo);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (initialUserInfo) setUserInfo(initialUserInfo);
    setIsEditing(false);
  };

  const handleSave = () => {
    const ok = validateAll(userInfo, validationRules);
    if (!ok) return;
    try {
      localStorage.setItem('profile_user', JSON.stringify(userInfo));
      if (userInfo.avatar) {
        localStorage.setItem('profile_avatar_dataurl', userInfo.avatar);
      }
    } catch (error) {
      console.warn('Unable to persist profile to localStorage', error);
    }
    setIsEditing(false);
  };

  return (
    <div className='min-h-screen bg-gray-100 px-4 py-8 dark:bg-[#212121]'>
      <div className='mx-auto max-w-md space-y-6'>
        <button
          onClick={() => (window.location.href = '/')}
          className='mb-2 flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-blue-600 shadow transition-all duration-200 hover:bg-blue-100 dark:bg-[#3F3F3F] dark:text-blue-400 dark:hover:bg-blue-900'
        >
          <ChevronLeft size={18} />
        </button>

        <div className='overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[#3F3F3F]'>
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-20'>
            <div className='flex items-center justify-between'>
              <h1 className='text-xl font-bold text-white'>My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className='hover:bg-opacity-20 cursor-pointer rounded-full bg-blue-100 p-2 text-blue-600 transition-all duration-200 hover:scale-105'
                  title='Chỉnh sửa'
                >
                  <Edit3 size={18} />
                </button>
              ) : (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleSave}
                    className='cursor-pointer rounded-full bg-green-100 p-2 text-green-600 transition-all duration-200 hover:scale-105'
                    title='Lưu'
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className='cursor-pointer rounded-full bg-red-100 p-2 text-red-600 transition-all duration-200 hover:scale-105'
                    title='Hủy'
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className='relative -mt-16 flex flex-col items-center px-6 pb-6'>
            <div className='group relative'>
              <div className='h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg'>
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt='Avatar'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500'>
                    <User size={48} className='text-white' />
                  </div>
                )}
              </div>
              <button
                onClick={handleAvatarUploadClick}
                className='absolute right-2 bottom-2 cursor-pointer rounded-full bg-blue-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600'
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleAvatarFileChange}
              />
            </div>

            <div className='mt-4 w-full space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Username
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={userInfo.name}
                    onChange={(e) => setUserInfo((p) => ({ ...p, name: e.target.value }))}
                    onBlur={(e) => validateField('name', e.target.value, validationRules.name)}
                    className='w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                    placeholder='Nhập tên của bạn'
                  />
                ) : (
                  <div className='flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700'>
                    <User size={18} className='mr-3 text-gray-400' />
                    <span className='font-medium text-gray-800 dark:text-gray-100'>
                      {userInfo.name}
                    </span>
                  </div>
                )}
                {touched.name && errors.name && (
                  <p className='mt-1 text-xs text-red-500'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type='email'
                    value={userInfo.email}
                    onChange={(e) => setUserInfo((p) => ({ ...p, email: e.target.value }))}
                    onBlur={(e) => validateField('email', e.target.value, validationRules.email)}
                    className='w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                    placeholder='you@example.com'
                  />
                ) : (
                  <div className='flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700'>
                    <Mail size={18} className='mr-3 text-gray-400' />
                    <span className='font-medium text-gray-800 dark:text-gray-100'>
                      {userInfo.email}
                    </span>
                  </div>
                )}
                {touched.email && errors.email && (
                  <p className='mt-1 text-xs text-red-500'>{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
