import React from 'react';

const CategoryBreakdown = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No category data available</p>
        <p className="text-sm">Add expenses to see category breakdown</p>
      </div>
    );
  }

  const categoryColors = {
    'Groceries': 'bg-green-500',
    'Dining': 'bg-orange-500',
    'Utilities': 'bg-blue-500',
    'Entertainment': 'bg-red-500',
    'Transportation': 'bg-purple-500',
    'Healthcare': 'bg-pink-500',
    'Shopping': 'bg-indigo-500',
    'Education': 'bg-cyan-500',
    'Travel': 'bg-lime-500',
    'Insurance': 'bg-violet-500',
    'Investment': 'bg-teal-500',
    'Others': 'bg-gray-500'
  };


  return (
    <div className="space-y-3">
      {breakdown.map((item, index) => (
        <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${categoryColors[item.category] || categoryColors['Others']}`}
              />
              <span className="font-medium text-gray-900">{item.category}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                ${item.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {item.count} transactions
              </div>
            </div>
            
            <div className="text-right min-w-[60px]">
              <div className="font-medium text-gray-700">
                {item.percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                Avg: ${item.average.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryBreakdown;
