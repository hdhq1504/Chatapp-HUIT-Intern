import React, { useState } from "react";
import leftGradient from "../assets/images/left-gradient.png";
import { Eye, EyeOff } from "lucide-react";
import useValidator from "../utils/validator";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {
    errors,
    touched,
    validators,
    validateField,
    validateAll,
    clearErrors,
  } = useValidator();

  // Định nghĩa validation rules
  const getValidationRules = () => {
    const rules = {
      email: [
        (value) => validators.isRequired(value, "Vui lòng nhập email"),
        (value) => validators.isEmail(value, "Email không hợp lệ"),
      ],
      password: [
        (value) => validators.isRequired(value, "Vui lòng nhập mật khẩu"),
        (value) =>
          validators.minLength(value, 6, "Mật khẩu phải có ít nhất 6 ký tự"),
      ],
    };

    if (isSignUp) {
      rules.username = [
        (value) => validators.isRequired(value, "Vui lòng nhập tên người dùng"),
        (value) =>
          validators.minLength(
            value,
            3,
            "Tên người dùng phải có ít nhất 3 ký tự"
          ),
      ];
      rules.confirmPassword = [
        (value) => validators.isRequired(value, "Vui lòng xác nhận mật khẩu"),
        (value) =>
          validators.isConfirmed(
            value,
            formData.password,
            "Mật khẩu xác nhận không khớp"
          ),
      ];
    }

    return rules;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error khi user bắt đầu nhập
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
      // Xử lý submit thành công
      console.log("Form submitted successfully:", formData);
      alert(isSignUp ? "Đăng ký thành công!" : "Đăng nhập thành công!");

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      clearErrors();
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    clearErrors();
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";
    const hasError = touched[fieldName] && errors[fieldName];
    return hasError
      ? `${baseClass} border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300`;
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left background image */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center">
        <img
          src={leftGradient}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover rounded-r-4xl overflow-hidden"
        />
      </div>

      {/* Right form section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold mb-3">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mb-6 text-gray-500 font-medium">
            {isSignUp
              ? "Please sign up to create an account"
              : "Please log in to your account to continue"}
          </p>
          
          <div className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('username')}
                  placeholder="Enter your username"
                />
                {getFieldError('username') && (
                  <p className="mt-1 text-sm text-red-500">{getFieldError('username')}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName('email')}
                placeholder="Enter your email"
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-gray-700">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('password')}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('password')}</p>
              )}
            </div>
            
            {isSignUp && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('confirmPassword')}
                  placeholder="Confirm your password"
                />
                {getFieldError('confirmPassword') && (
                  <p className="mt-1 text-sm text-red-500">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 transform hover:scale-[1.02]"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              className="ml-2 text-blue-600 hover:underline font-medium"
              onClick={toggleMode}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
