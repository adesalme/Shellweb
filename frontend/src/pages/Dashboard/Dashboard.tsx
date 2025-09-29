import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Users, FileText, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Scripts',
      value: '24',
      change: '+12%',
      changeType: 'increase',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Executions Today',
      value: '18',
      change: '+5',
      changeType: 'increase',
      icon: Play,
      color: 'bg-green-500',
    },
    {
      name: 'Active Users',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Success Rate',
      value: '94%',
      change: '+2%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const recentScripts = [
    {
      id: '1',
      name: 'Azure VM Status Check',
      lastModified: '2 hours ago',
      executions: 12,
      status: 'success',
    },
    {
      id: '2',
      name: 'User Account Cleanup',
      lastModified: '1 day ago',
      executions: 8,
      status: 'warning',
    },
    {
      id: '3',
      name: 'System Health Report',
      lastModified: '3 days ago',
      executions: 24,
      status: 'success',
    },
  ];

  const recentExecutions = [
    {
      id: '1',
      scriptName: 'Azure VM Status Check',
      executor: 'John Doe',
      timestamp: '10 minutes ago',
      status: 'success',
      duration: '2.3s',
    },
    {
      id: '2',
      scriptName: 'User Account Cleanup',
      executor: 'Jane Smith',
      timestamp: '1 hour ago',
      status: 'warning',
      duration: '45.2s',
    },
    {
      id: '3',
      scriptName: 'System Health Report',
      executor: 'Mike Johnson',
      timestamp: '2 hours ago',
      status: 'success',
      duration: '12.8s',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your PowerShell scripts today.
          </p>
        </div>
        <Link
          to="/editor"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Script</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scripts */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Scripts
            </h2>
            <Link
              to="/library"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentScripts.map((script) => (
              <div
                key={script.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {script.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Modified {script.lastModified} • {script.executions} executions
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(script.status)}`}>
                    {script.status}
                  </span>
                  <Link
                    to={`/editor/${script.id}`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Executions
            </h2>
            <Link
              to="/library"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentExecutions.map((execution) => (
              <div
                key={execution.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {execution.scriptName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {execution.executor} • {execution.timestamp}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {execution.duration}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/editor"
            className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="font-medium text-primary-900 dark:text-primary-100">
                Create New Script
              </h3>
              <p className="text-sm text-primary-600 dark:text-primary-400">
                Start writing a new PowerShell script
              </p>
            </div>
          </Link>

          <Link
            to="/library"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Browse Scripts
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                View and manage your script library
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-100">
                View Analytics
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Detailed execution statistics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;