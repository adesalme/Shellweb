import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-dark-200 fixed w-full top-0 z-50">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Lumo
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                  {user?.displayName || user?.email}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-200">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 capitalize">
                      {user?.role}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;