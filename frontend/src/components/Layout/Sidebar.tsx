import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Edit, 
  Library, 
  Activity, 
  Plus,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Editor',
      path: '/editor',
      icon: Edit,
    },
    {
      name: 'Library',
      path: '/library',
      icon: Library,
    },
  ];

  const quickActions = [
    {
      name: 'New Script',
      path: '/editor',
      icon: Plus,
      className: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20',
    },
  ];

  const insights = [
    {
      name: 'Analytics',
      icon: BarChart3,
      value: '127',
      label: 'Scripts',
    },
    {
      name: 'Executions',
      icon: Activity,
      value: '1.2k',
      label: 'This month',
    },
    {
      name: 'Success Rate',
      icon: Clock,
      value: '94%',
      label: 'Last 30 days',
    },
  ];

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-dark-200 overflow-y-auto">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-200'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <NavLink
                key={action.name}
                to={action.path}
                className={clsx(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  action.className
                )}
              >
                <action.icon className="w-5 h-5" />
                <span>{action.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick Stats
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.name}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-lg"
              >
                <div className="p-2 bg-white dark:bg-dark-100 rounded-lg">
                  <insight.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {insight.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {insight.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>Lumo v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;