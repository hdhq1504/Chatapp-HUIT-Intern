import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Loader2, User, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import useValidator from '../hooks/useValidator';

function MyProfilePage() {
  useTheme();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    avatar: user?.avatar ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar ?? '');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  const { errors, touched, validators, validateField, validateAll, clearErrors } = useValidator();

  useEffect(() => {
    setFormData({
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      avatar: user?.avatar ?? '',
    });
    setPreviewAvatar(user?.avatar ?? '');
  }, [user]);

  const phoneValidator = useMemo(
    () => (value) => {
      const normalized = value?.trim();
      if (!normalized) return undefined;
      const phoneRegex = /^[0-9]{10,11}$/;
      return phoneRegex.test(normalized) ? undefined : 'Phone number must be 10-11 digits (e.g. 0901234567).';
    },
    [],
  );

  const validationRules = useMemo(
    () => ({
      fullName: [
        (value) => validators.isRequired(value, 'Please enter your full name'),
        (value) => validators.minLength(value?.trim(), 2, 'Full name must be at least 2 characters'),
      ],
      email: [
        (value) => validators.isRequired(value, 'Please enter your email'),
        (value) => validators.isEmail(value, 'Email is invalid'),
      ],
      phone: [phoneValidator],
    }),
    [validators, phoneValidator],
  );

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      'w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-[#2B2B2B]';
    const hasError = touched[fieldName] && errors[fieldName];
    return hasError
      ? `${baseClass} border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300 focus:ring-blue-500 dark:border-gray-600`;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatusMessage('');

    if (touched[name] && errors[name]) {
      const rules = validationRules[name] || [];
      const normalizedValue = typeof value === 'string' ? value.trim() : value;
      if (rules.length > 0) {
        validateField(name, normalizedValue, rules);
      }
    }
  };

  const handleInputBlur = (event) => {
    const { name, value } = event.target;
    const rules = validationRules[name];
    if (rules) {
      const normalizedValue = typeof value === 'string' ? value.trim() : value;
      validateField(name, normalizedValue, rules);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result ?? '';
      setPreviewAvatar(result);
      setFormData((prev) => ({ ...prev, avatar: result }));
      setStatusMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarRemove = () => {
    setPreviewAvatar('');
    setFormData((prev) => ({ ...prev, avatar: '' }));
    setStatusMessage('');
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      avatar: user?.avatar ?? '',
    });
    setPreviewAvatar(user?.avatar ?? '');
    clearErrors();
    setStatusMessage('');
  };

  const normalizedFormData = useMemo(
    () => ({
      fullName: formData.fullName?.trim() ?? '',
      email: formData.email?.trim() ?? '',
      phone: formData.phone?.trim() ?? '',
      avatar: formData.avatar ?? '',
    }),
    [formData],
  );

  const isDirty = useMemo(() => {
    return (
      normalizedFormData.fullName !== (user?.name ?? '') ||
      normalizedFormData.email !== (user?.email ?? '') ||
      normalizedFormData.phone !== (user?.phone ?? '') ||
      normalizedFormData.avatar !== (user?.avatar ?? '')
    );
  }, [normalizedFormData, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateAll(normalizedFormData, validationRules);
    if (!isValid) {
      setStatusType('error');
      setStatusMessage('Please fix the highlighted fields and try again.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      const payload = {
        name: normalizedFormData.fullName,
        email: normalizedFormData.email,
        phone: normalizedFormData.phone || null,
        avatar: normalizedFormData.avatar || null,
      };

      const result = await updateProfile(payload);

      if (result.success) {
        clearErrors();
        setStatusType('success');
        setStatusMessage('Your profile information has been updated successfully.');

        const updatedUser = result.user ?? payload;
        setFormData({
          fullName: updatedUser.name ?? normalizedFormData.fullName,
          email: updatedUser.email ?? normalizedFormData.email,
          phone: updatedUser.phone ?? normalizedFormData.phone,
          avatar: updatedUser.avatar ?? normalizedFormData.avatar,
        });
        setPreviewAvatar(updatedUser.avatar ?? normalizedFormData.avatar ?? '');
      } else {
        setStatusType('error');
        setStatusMessage(result.error || 'Failed to update your profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setStatusType('error');
      setStatusMessage('An unexpected error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 pb-12 dark:bg-[#121212]'>
      <div className='relative bg-linear-to-r from-cyan-700 via-blue-500 to-indigo-600 pb-28 text-white'>
        <div className='mx-auto flex max-w-3xl items-center justify-between px-4 py-6'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20'
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className='text-center'>
            <p className='text-sm tracking-widest text-white/80 uppercase'>Account</p>
            <h1 className='text-2xl font-semibold md:text-3xl'>My Profile</h1>
          </div>

          <div className='h-10 w-10 overflow-hidden rounded-full border border-white/40 bg-white/20'>
            {previewAvatar ? (
              <img src={previewAvatar} alt='Profile avatar' className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-white'>
                <User size={20} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='absolute right-[50%] -mt-10 w-full max-w-3xl translate-x-[50%] px-4'>
        <form onSubmit={handleSubmit} className='rounded-3xl bg-white p-6 shadow-xl md:p-8 dark:bg-[#1E1E1E]'>
          <div className='-mt-20 mb-8 flex flex-col items-center gap-3 md:flex-row md:items-end md:gap-6'>
            <div className='relative'>
              <div className='h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg dark:border-[#1E1E1E] dark:bg-[#2B2B2B]'>
                {previewAvatar ? (
                  <img src={previewAvatar} alt='Profile avatar' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-gray-400'>
                    <User size={36} />
                  </div>
                )}
              </div>
              <label className='absolute right-0 bottom-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700'>
                <Camera size={18} />
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </label>
              {previewAvatar && (
                <button
                  type='button'
                  onClick={handleAvatarRemove}
                  className='absolute top-0 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition hover:bg-red-50 hover:text-red-500 dark:bg-[#2B2B2B] dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-300'
                  aria-label='Remove avatar'
                  disabled={isLoading}
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>

            <div className='text-center md:text-left'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-50'>
                {formData.fullName || 'New User'}
              </h2>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`mb-8 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                statusType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {statusType === 'success' ? (
                <CheckCircle2 size={18} className='mt-0.5 shrink-0' />
              ) : (
                <AlertCircle size={18} className='mt-0.5 shrink-0' />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className='space-y-10'>
            <section>
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Personal Information</h3>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>Full Name</label>
                  <input
                    type='text'
                    name='fullName'
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={getInputClassName('fullName')}
                    placeholder='Enter your full name'
                    disabled={isLoading}
                  />
                  {getFieldError('fullName') && (
                    <p className='mt-1 text-sm text-red-500'>{getFieldError('fullName')}</p>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Email Address
                  </label>
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

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={getInputClassName('phone')}
                    placeholder='Enter your phone number'
                    disabled={isLoading}
                  />
                  <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                    Enter 10-11 digits, for example 0901234567.
                  </p>
                  {getFieldError('phone') && <p className='mt-1 text-sm text-red-500'>{getFieldError('phone')}</p>}
                </div>
              </div>
            </section>
          </div>

          <div className='mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 md:flex-row md:justify-end dark:border-gray-800'>
            <button
              type='button'
              onClick={handleCancel}
              className='w-full rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto dark:border-gray-600 dark:text-gray-200 dark:hover:bg-[#2B2B2B]'
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type='submit'
              disabled={isLoading || !isDirty}
              className='flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Saving</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyProfilePage;
