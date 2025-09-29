import React from 'react';
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Scripts Created',
      value: '12',
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Executions',
      value: '89',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      name: 'Success Rate',
      value: '94%',
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      name: 'Member Since',
      value: 'Jan 2024',
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      type: 'script_created',
      description: 'Created "Azure VM Status Check"',
      timestamp: '2 hours ago',
    },
    {
      type: 'script_executed',
      description: 'Executed "User Account Cleanup"',
      timestamp: '1 day ago',
    },
    {
      type: 'script_updated',
      description: 'Updated "System Health Report"',
      timestamp: '3 days ago',
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and view your activity
        </p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user?.role} User</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user?.role === 'admin' 
                    ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                    : user?.role === 'dev'
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
                }`}>
                  {user?.role}
                </span>
              </div>
              {user?.createdAt && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <button className="btn-secondary">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive notifications about script executions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Auto-save Scripts
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically save scripts while editing
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;