import React from 'react';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';

const BudgetProgress = ({ budgets }) => {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No budgets set up yet</p>
        <p className="text-sm">Create budgets to track your spending</p>
      </div>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (percentage >= 90) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-4">
      {budgets.map((budget, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {getStatusIcon(budget.percentage)}
              <span className="font-medium text-gray-900">{budget.category}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
              </span>
              <div className="text-xs text-gray-500">
                {budget.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.percentage)}`}
              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
            />
          </div>
          
          {budget.remaining > 0 ? (
            <p className="text-xs text-gray-600">
              ${budget.remaining.toFixed(2)} remaining
            </p>
          ) : (
            <p className="text-xs text-red-600">
              Over budget by ${Math.abs(budget.remaining).toFixed(2)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default BudgetProgress;
