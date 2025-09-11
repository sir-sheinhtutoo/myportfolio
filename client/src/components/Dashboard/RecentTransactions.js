import React from 'react';
import { format } from 'date-fns';
import { Receipt, ArrowUpRight } from 'lucide-react';

const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No recent transactions</p>
        <p className="text-sm">Your expenses will appear here</p>
      </div>
    );
  }

  const categoryColors = {
    'Groceries': 'bg-green-100 text-green-800',
    'Dining': 'bg-orange-100 text-orange-800',
    'Utilities': 'bg-blue-100 text-blue-800',
    'Entertainment': 'bg-red-100 text-red-800',
    'Transportation': 'bg-purple-100 text-purple-800',
    'Healthcare': 'bg-pink-100 text-pink-800',
    'Shopping': 'bg-indigo-100 text-indigo-800',
    'Education': 'bg-cyan-100 text-cyan-800',
    'Travel': 'bg-lime-100 text-lime-800',
    'Insurance': 'bg-violet-100 text-violet-800',
    'Investment': 'bg-teal-100 text-teal-800',
    'Others': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div key={transaction._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Receipt className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 truncate max-w-xs">
                {transaction.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  categoryColors[transaction.category] || categoryColors['Others']
                }`}>
                  {transaction.category}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(transaction.date), 'MMM dd')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              ${transaction.amount.toFixed(2)}
            </span>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;
