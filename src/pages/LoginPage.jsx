import React, { useState } from 'react';
import leftGradient from '../assets/images/left-gradient.png';
import { Eye, EyeOff } from 'lucide-react';
import useValidator from '../utils/validator';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const {
    errors,
    touched,
    validators,
    validateField,
    validateAll,
    clearErrors,
  } = useValidator();

  const getValidationRules = () => ({
    email: [
      (value) => validators.isRequired(value, 'Please enter the email'),
      (value) => validators.isEmail(value, 'Email is invalid'),
    ],
    password: [
      (value) => validators.isRequired(value, 'Please enter the password'),
      (value) =>
        validators.minLength(value, 6, 'The password is at least 6 characters'),
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationRules = getValidationRules();
    const isValid = validateAll(formData, validationRules);
    if (isValid) {
      console.log('Login form submitted successfully:', formData);
      alert('Log in successfully!');
      setFormData({
        email: '',
        password: '',
      });
      clearErrors();
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      'w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition';
    const hasError = touched[fieldName] && errors[fieldName];
    return hasError
      ? `${baseClass} border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300`;
  };

  return (
    <div className='flex min-h-screen bg-gray-100'>
      <div className='relative hidden w-1/2 items-center justify-center md:flex'>
        <img
          src={leftGradient}
          alt='Background'
          className='absolute inset-0 h-full w-full overflow-hidden rounded-r-4xl object-cover'
        />
      </div>
      <div className='flex w-full flex-col items-center justify-center px-8 py-12 md:w-1/2'>
        <div className='w-full max-w-md'>
          <h1 className='mb-3 text-4xl font-semibold'>Welcome back</h1>
          <p className='mb-6 font-medium text-gray-500'>
            Please log in to your account to continue
          </p>
          <div className='space-y-5'>
            <div>
              <label className='mb-2 block font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName('email')}
                placeholder='Enter your email'
              />
              {getFieldError('email') && (
                <p className='mt-1 text-sm text-red-500'>
                  {getFieldError('email')}
                </p>
              )}
            </div>
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <label className='block font-medium text-gray-700'>
                  Password
                </label>
                <button
                  type='button'
                  className='cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-800'
                >
                  Forgot Password?
                </button>
              </div>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('password')}
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer text-gray-500 hover:text-gray-700'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className='mt-1 text-sm text-red-500'>
                  {getFieldError('password')}
                </p>
              )}
            </div>
            <div className='mt-3 text-center'>
              <span className='font-medium text-gray-700'>
                Don't have an account?
              </span>
              <a
                href='/signup'
                className='ml-2 font-medium text-blue-600 hover:text-blue-700'
              >
                Sign Up
              </a>
            </div>
            <button
              type='button'
              onClick={handleSubmit}
              className='w-full transform rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:scale-[1.02] hover:bg-blue-700'
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
