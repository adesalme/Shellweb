import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Play, 
  Trash2, 
  Download, 
  Calendar,
  User,
  Activity
} from 'lucide-react';

const Library: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Mock data
  const scripts = [
    {
      id: '1',
      name: 'Azure VM Status Check',
      creator: 'John Doe',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      executions: 24,
      lastExecution: '2 hours ago',
      status: 'success',
      description: 'Checks the status of all Azure VMs in the subscription',
    },
    {
      id: '2',
      name: 'User Account Cleanup',
      creator: 'Jane Smith',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      executions: 12,
      lastExecution: '1 day ago',
      status: 'warning',
      description: 'Removes inactive user accounts older than 90 days',
    },
    {
      id: '3',
      name: 'System Health Report',
      creator: 'Mike Johnson',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-19',
      executions: 36,
      lastExecution: '30 minutes ago',
      status: 'success',
      description: 'Generates comprehensive system health reports',
    },
    {
      id: '4',
      name: 'Database Backup Script',
      creator: 'Sarah Wilson',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-17',
      executions: 8,
      lastExecution: '3 days ago',
      status: 'error',
      description: 'Automated database backup with compression',
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

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || script.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedScripts = [...filteredScripts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'executions':
        return b.executions - a.executions;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Script Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your PowerShell scripts
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

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Search scripts..."
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-32"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-36"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="executions">Executions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {scripts.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Scripts
            </div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {scripts.filter(s => s.status === 'success').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Successful
            </div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {scripts.filter(s => s.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Warnings
            </div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {scripts.filter(s => s.status === 'error').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Errors
            </div>
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedScripts.map((script) => (
          <div key={script.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {script.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {script.description}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(script.status)}`}>
                {script.status}
              </span>
            </div>

            {/* Script Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{script.creator}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Updated {script.updatedAt}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Activity className="w-4 h-4" />
                <span>{script.executions} executions • Last: {script.lastExecution}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-200">
              <div className="flex items-center space-x-2">
                <Link
                  to={`/editor/${script.id}`}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
                  title="Edit Script"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
                  title="Run Script"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
                  title="Export Script"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
                title="Delete Script"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedScripts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No scripts found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first PowerShell script'
            }
          </p>
          <Link
            to="/editor"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Script</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Library;