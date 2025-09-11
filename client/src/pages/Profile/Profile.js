import React, { useState, useEffect, useCallback } from 'react';
import { User, Settings, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    currency: 'USD',
    budgetPeriod: 'monthly',
    notifications: {
      budgetAlerts: true,
      weeklyReports: true
    }
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/profile');
      setProfile(response.data.user);
      setPreferences(response.data.user.preferences || preferences);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const savePreferences = async () => {
    try {
      setSaving(true);
      await axios.put('/api/auth/preferences', preferences);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </h3>
        </div>
        <div className="card-content">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user?.photoURL ? (
                <img
                  className="w-20 h-20 rounded-full"
                  src={user.photoURL}
                  alt="Profile"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.displayName || 'User'}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Preferences
          </h3>
        </div>
        <div className="card-content space-y-6">
          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="input max-w-xs"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Budget Period
            </label>
            <select
              value={preferences.budgetPeriod}
              onChange={(e) => handlePreferenceChange('budgetPeriod', e.target.value)}
              className="input max-w-xs"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h3>
        </div>
        <div className="card-content space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Budget Alerts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get notified when you're approaching budget limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.budgetAlerts || false}
                onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Weekly Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Receive weekly spending summaries and insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications?.weeklyReports || false}
                onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security & Privacy
          </h3>
        </div>
        <div className="card-content space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Add an extra layer of security to your account</p>
            </div>
            <button className="btn-outline">
              Enable 2FA
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Data Export</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Download all your financial data</p>
            </div>
            <button className="btn-outline">
              Export Data
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Delete Account</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile;
