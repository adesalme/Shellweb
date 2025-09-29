import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center space-x-2 ml-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Lost? Try using the navigation menu or search for what you need.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;