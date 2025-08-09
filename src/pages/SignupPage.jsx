import React, { useState } from "react";
import leftGradient from "../assets/images/left-gradient.png";
import { Eye, EyeOff } from "lucide-react";
import useValidator from "../utils/validator";

function SignupPage() {
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

  const getValidationRules = () => ({
    username: [
      (value) => validators.isRequired(value, "Please enter the username"),
      (value) =>
        validators.minLength(
          value,
          3,
          "The username must have at least 3 characters",
        ),
    ],
    email: [
      (value) => validators.isRequired(value, "Please enter the email"),
      (value) => validators.isEmail(value, "Email is invalid"),
    ],
    password: [
      (value) => validators.isRequired(value, "Please enter the password"),
      (value) =>
        validators.minLength(value, 6, "The password is at least 6 characters"),
    ],
    confirmPassword: [
      (value) => validators.isRequired(value, "Please confirm the password"),
      (value) =>
        validators.isConfirmed(
          value,
          formData.password,
          "Mật khẩu xác nhận không khớp",
        ),
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
      console.log("Sign up form submitted successfully:", formData);
      alert("Sign up successfully!");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      clearErrors();
    }
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
    <div className="flex min-h-screen bg-gray-100">
      <div className="relative hidden w-1/2 items-center justify-center md:flex">
        <img
          src={leftGradient}
          alt="Background"
          className="absolute inset-0 h-full w-full overflow-hidden rounded-r-4xl object-cover"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center px-8 py-12 md:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="mb-3 text-4xl font-semibold">Create an account</h1>
          <p className="mb-6 font-medium text-gray-500">
            Please sign up to create an account
          </p>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName("username")}
                placeholder="Enter your username"
              />
              {getFieldError("username") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("username")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName("email")}
                placeholder="Enter your email"
              />
              {getFieldError("email") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("email")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName("password")}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getFieldError("password") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("password")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getInputClassName("confirmPassword")}
                placeholder="Confirm your password"
              />
              {getFieldError("confirmPassword") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("confirmPassword")}
                </p>
              )}
            </div>
            <div className="mt-3 text-center">
              <span className="font-medium text-gray-700">
                Already have an account?
              </span>
              <a
                href="/login"
                className="ml-2 font-medium text-blue-600 hover:text-blue-700"
              >
                Log In
              </a>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
