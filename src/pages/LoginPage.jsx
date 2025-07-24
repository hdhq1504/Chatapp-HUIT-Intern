import React, { useState } from "react";
import leftGradient from "../assets/images/left-gradient.png";
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          <form className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your username"
                  required
                />
              </div>
            )}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {isSignUp && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              className="ml-2 text-blue-600 hover:underline font-medium"
              onClick={() => setIsSignUp((prev) => !prev)}
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
