import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../types";
import { isStandaloneMode } from "../../config/authConfig";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const Login: React.FC = () => {
  const { login, loginWithAzure } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoading(true);
      await login(data);
      reset();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = async () => {
    try {
      setAzureLoading(true);
      await loginWithAzure();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setAzureLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to ShellWeb Editor
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            PowerShell Web Editor - Sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-8 space-y-6">
          {/* Azure AD Login */}
          {!isStandaloneMode && (
            <div>
              <button
                onClick={handleAzureLogin}
                disabled={azureLoading}
                className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-gray-300 dark:border-dark-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {azureLoading ? (
                  <LoadingSpinner size="small" color="gray" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12.017 0L23.014 7.003V24H12.017V0Z"
                      fill="#f25022"
                    />
                    <path d="M1.005 0H12.017V11.5H1.005V0Z" fill="#7fba00" />
                    <path
                      d="M12.017 12.5V24H1.005V12.5H12.017Z"
                      fill="#00a4ef"
                    />
                    <path
                      d="M12.017 0V11.5H23.014V7.003L12.017 0Z"
                      fill="#ffb900"
                    />
                  </svg>
                )}
                <span>Continue with Microsoft</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-dark-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-dark-100 text-gray-500 dark:text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  id="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password (optional in standalone mode) */}
            {isStandaloneMode && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password", {
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="input pl-10 pr-10"
                    placeholder="Enter your password (optional)"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* Display Name (for new users in standalone mode) */}
            {isStandaloneMode && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Display Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...register("displayName")}
                  type="text"
                  id="displayName"
                  className="input"
                  placeholder="How should we call you?"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          {/* Footer */}
          {isStandaloneMode && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Running in standalone mode. New users will be created
                automatically.
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Lumo - Modern PowerShell Web Editor
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
