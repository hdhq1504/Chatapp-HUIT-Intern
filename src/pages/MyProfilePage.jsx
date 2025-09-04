import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import useValidator from '../utils/validator';

function MyProfilePage() {
  useTheme();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  const { errors, touched, validators, validateField, validateAll, clearErrors } = useValidator();

  const getValidationRules = () => ({
    username: [
      (value) => validators.isRequired(value, 'Please enter your username'),
      (value) => validators.minLength(value, 3, 'Username must be at least 3 characters'),
    ],
    email: [
      (value) => validators.isRequired(value, 'Please enter your email'),
      (value) => validators.isEmail(value, 'Email is invalid'),
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name] && errors[name]) {
      validateField(name, value, getValidationRules()[name] || []);
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const rules = getValidationRules()[name];
    if (rules) {
      validateField(name, value, rules);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreviewAvatar(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationRules = getValidationRules();
    const isValid = validateAll(formData, validationRules);

    if (isValid) {
      setIsLoading(true);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Prepare update data - generate name from username if not provided
        const updateData = {
          ...formData,
          name: formData.username.charAt(0).toUpperCase() + formData.username.slice(1), // Auto generate name from username
        };

        const result = updateProfile(updateData);

        if (result.success) {
          // Clear any validation errors
          clearErrors();

          // Show success message
          alert('Profile updated successfully!');

          // Navigate back to chat
          navigate('/chat');
        } else {
          alert(result.error || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Profile update error:', error);
        alert('An error occurred while updating profile');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      'w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-800 dark:text-gray-100 bg-white dark:bg-[#404040] placeholder-gray-500 dark:placeholder-gray-400';
    const hasError = touched[fieldName] && errors[fieldName];
    return hasError
      ? `${baseClass} border-red-500 focus:ring-red-500 dark:border-red-500`
      : `${baseClass} border-gray-300 dark:border-gray-600`;
  };

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-[#181818]'>
      {/* Header */}
      <div className='bg-transparent'>
        <div className='mx-auto max-w-lg px-4 py-4'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/chat')}
              className='cursor-pointer rounded-full p-2 text-[#181818] transition-all duration-200 hover:bg-gray-100 hover:text-[#181818] dark:text-gray-100 dark:hover:bg-[#303030] dark:hover:text-gray-100'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-[#181818] dark:text-gray-100'>My Profile</h1>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className='mx-auto max-w-lg px-4 py-8'>
        <form
          onSubmit={handleSubmit}
          className='rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-[#212121]'
        >
          {/* Avatar Section */}
          <div className='mb-8 flex flex-col items-center'>
            <div className='relative'>
              <div className='h-24 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                {previewAvatar ? (
                  <img src={previewAvatar} alt='Profile' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <User size={32} className='text-gray-400' />
                  </div>
                )}
              </div>
              <label className='absolute right-0 bottom-0 cursor-pointer rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'>
                <Camera size={16} />
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className='mt-2 text-center text-sm text-gray-500 dark:text-gray-400'>
              Click the camera icon to change your avatar
            </p>
          </div>

          <div className='space-y-6'>
            {/* Username Field */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>Username</label>
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName('username')}
                placeholder='Enter your username'
                disabled={isLoading}
              />
              {getFieldError('username') && <p className='mt-1 text-sm text-red-500'>{getFieldError('username')}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>Email Address</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName('email')}
                placeholder='Enter your email'
                disabled={isLoading}
              />
              {getFieldError('email') && <p className='mt-1 text-sm text-red-500'>{getFieldError('email')}</p>}
            </div>

            {/* Submit Button */}
            <div className='flex space-x-4 pt-6'>
              <button
                type='button'
                onClick={() => navigate('/chat')}
                className='flex-1 cursor-pointer rounded-full border border-gray-300 p-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-[#303030]'
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-full bg-blue-600 p-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyProfilePage;
