import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import ThemeToggle from '../UI/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0 h-16 transition-colors duration-200">
      <div className="px-3 py-2 lg:px-5 lg:pl-3 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-primary-600 dark:text-primary-400">
                AI Finance Assistant
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              {/* Search */}
              <div className="relative mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:placeholder-gray-400"
                  placeholder="Search expenses..."
                />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle className="mr-2" />

              {/* Notifications */}
              <button
                type="button"
                className="p-2 mr-1 text-gray-500 dark:text-gray-400 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <Bell className="w-6 h-6" />
              </button>

              {/* User Menu */}
              <div className="flex items-center">
                <div className="flex items-center ml-3">
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                    onClick={() => {
                      // Toggle dropdown (implement dropdown logic)
                    }}
                  >
                    {user?.photoURL ? (
                      <img
                        className="w-8 h-8 rounded-full"
                        src={user.photoURL}
                        alt="User"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                </div>
                
                <div className="ml-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {user?.displayName || user?.email}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="ml-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
