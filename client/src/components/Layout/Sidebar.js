import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Target, 
  BarChart3, 
  MessageCircle, 
  Settings,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: Receipt,
    },
    {
      name: 'Add Expense',
      href: '/expenses/add',
      icon: PlusCircle,
    },
    {
      name: 'Budgets',
      href: '/budgets',
      icon: Target,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: MessageCircle,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform -translate-x-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sm:translate-x-0">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center p-2 rounded-lg group transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition duration-75 ${
                    isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                  }`} />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* AI Insights Widget */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300">AI Insights</h3>
          </div>
          <p className="text-xs text-primary-700 dark:text-primary-400 mb-3">
            Get personalized financial tips and budget suggestions powered by AI.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            Ask AI Assistant
            <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
