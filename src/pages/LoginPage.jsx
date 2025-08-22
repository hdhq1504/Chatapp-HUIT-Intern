import React, { useState } from 'react';
import leftGradient from '../assets/images/left-gradient.png';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'email') {
      if (!value) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError[name] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const allFieldErrors = { ...emailErrors, ...passwordErrors };
    
    setFieldErrors(allFieldErrors);
    
    if (Object.keys(allFieldErrors).length > 0) {
      return;
    }
    
    try {
      await login({ email: formData.email, password: formData.password });
    } catch (err) {
      console.error(err);
      setError('Login failed');
    }
  };

  const getInputClassName = () => {
    const baseClass = 'w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition';
    return baseClass;
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
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='mb-2 block font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={getInputClassName()}
                placeholder='Enter your email'
              />
              {fieldErrors.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <label className='block font-medium text-gray-700'>
                  Password
                </label>
              </div>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName()}
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
              {fieldErrors.password && (
                <p className='mt-1 text-sm text-red-500'>
                  {fieldErrors.password}
                </p>
              )}
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <div className='mt-3 text-center'>
              <span className='font-medium text-gray-700'>
                Don't have an account?
              </span>
              <a href='/signup' className='ml-2 font-medium text-blue-600 hover:text-blue-700'>
                Sign Up
              </a>
            </div>
            <button
              type='submit'
              className='w-full transform rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700'
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
