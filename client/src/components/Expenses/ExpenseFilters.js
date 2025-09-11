import React from 'react';
import { Calendar, Tag } from 'lucide-react';

const ExpenseFilters = ({ filters, onFilterChange }) => {
  const categories = [
    'All Categories',
    'Groceries', 'Dining', 'Utilities', 'Entertainment', 
    'Transportation', 'Healthcare', 'Shopping', 'Education', 
    'Travel', 'Insurance', 'Investment', 'Others'
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value === 'All Categories' ? '' : e.target.value)}
          className="input w-full"
        >
          {categories.map(category => (
            <option key={category} value={category === 'All Categories' ? '' : category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Start Date
        </label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          End Date
        </label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Quick Date Filters */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const today = new Date();
              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              handleFilterChange('startDate', startOfMonth.toISOString().split('T')[0]);
              handleFilterChange('endDate', today.toISOString().split('T')[0]);
            }}
            className="btn-outline text-sm"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
              handleFilterChange('startDate', lastMonth.toISOString().split('T')[0]);
              handleFilterChange('endDate', endOfLastMonth.toISOString().split('T')[0]);
            }}
            className="btn-outline text-sm"
          >
            Last Month
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              handleFilterChange('startDate', last30Days.toISOString().split('T')[0]);
              handleFilterChange('endDate', today.toISOString().split('T')[0]);
            }}
            className="btn-outline text-sm"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const startOfYear = new Date(today.getFullYear(), 0, 1);
              handleFilterChange('startDate', startOfYear.toISOString().split('T')[0]);
              handleFilterChange('endDate', today.toISOString().split('T')[0]);
            }}
            className="btn-outline text-sm"
          >
            This Year
          </button>
          <button
            onClick={() => {
              handleFilterChange('startDate', '');
              handleFilterChange('endDate', '');
              handleFilterChange('category', '');
            }}
            className="btn-secondary text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
