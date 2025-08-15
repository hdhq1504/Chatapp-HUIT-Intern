import React, { useEffect, useRef, useState } from 'react';
import { User, Camera, ChevronLeft } from 'lucide-react';
import useValidator from '../utils/validator.jsx';

function MyProfilePage() {
  const [userInfo, setUserInfo] = useState({
    name: 'Quân Hồ',
    email: 'hoquan15042004@gmail.com',
    avatar: '',
  });
  // Giữ initial để có thể reset nếu cần (hiện chưa dùng trực tiếp)
  const [initialUserInfo, setInitialUserInfo] = useState(null);

  const fileInputRef = useRef(null);
  const { errors, touched, validators, validateField, validateAll } =
    useValidator();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('profile_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const next = {
          name: parsed.name || 'Quân Hồ',
          email: parsed.email || 'hoquan15042004@gmail.com',
          avatar: parsed.avatar || '',
        };
        setUserInfo(next);
        setInitialUserInfo(next);
        return;
      }
    } catch {
      // ignore parse errors
    }

    const savedAvatar = localStorage.getItem('profile_avatar_dataurl');
    const next = savedAvatar
      ? {
          name: 'Quân Hồ',
          email: 'hoquan15042004@gmail.com',
          avatar: savedAvatar,
        }
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
      (v) => validators.isRequired(v, 'Please enter your username'),
      (v) => validators.minLength(v, 2, 'Username is at least 2 characters'),
    ],
    email: [
      (v) => validators.isRequired(v, 'Please enter your email'),
      (v) => validators.isEmail(v, 'Email is invalid'),
    ],
  };

  // Lưu profile vào localStorage
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
    setInitialUserInfo(userInfo);
  };

  return (
    <div className='min-h-screen bg-gray-100 px-4 py-8 dark:bg-[#212121]'>
      <div className='mx-auto max-w-lg space-y-6'>
        <button
          onClick={() => (window.location.href = '/')}
          className='mb-2 flex cursor-pointer items-center gap-2 rounded-full bg-white p-3 font-semibold shadow transition-all duration-200 hover:bg-blue-100 dark:bg-[#303030] dark:text-gray-100 dark:hover:bg-[#3F3F3F]'
        >
          <ChevronLeft size={18} />
        </button>

        <div className='overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[#303030]'>
          <div className='p-6 pb-20'>
            <div className='flex items-center justify-between'>
              <h1 className='text-xl font-bold text-white'>My Account</h1>
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
                title='Upload avatar'
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
                <input
                  type='text'
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo((p) => ({ ...p, name: e.target.value }))
                  }
                  onBlur={(e) =>
                    validateField('name', e.target.value, validationRules.name)
                  }
                  className='w-full rounded-2xl bg-gray-100 px-4 py-3 text-gray-800 focus:border-transparent focus:outline-none dark:bg-[#3F3F3F] dark:text-gray-200'
                  placeholder='Enter your username'
                />
                {touched.name && errors.name && (
                  <p className='mt-1 text-xs text-red-500'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Email Address
                </label>

                <div className='flex items-center rounded-2xl bg-gray-50 dark:bg-[#3F3F3F]'>
                  <input
                    type='email'
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo((p) => ({ ...p, email: e.target.value }))
                    }
                    onBlur={(e) =>
                      validateField(
                        'email',
                        e.target.value,
                        validationRules.email,
                      )
                    }
                    className='w-full rounded-2xl bg-gray-100 px-4 py-3 text-gray-800 focus:border-transparent focus:outline-none dark:bg-[#3F3F3F] dark:text-gray-200'
                    placeholder='you@example.com'
                  />
                </div>
                {touched.email && errors.email && (
                  <p className='mt-1 text-xs text-red-500'>{errors.email}</p>
                )}
              </div>

              {/* Nút Save */}
              <div className='mt-8 flex w-full items-center justify-center gap-2'>
                <button
                  onClick={handleSave}
                  className='cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow transition hover:bg-blue-700'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
