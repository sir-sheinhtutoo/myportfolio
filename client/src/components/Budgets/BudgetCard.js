import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const BudgetCard = ({ budget, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: budget.amount,
    period: budget.period
  });

  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent;

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (percentage >= 100) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (percentage >= 90) {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const handleSave = async () => {
    await onUpdate(budget._id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      amount: budget.amount,
      period: budget.period
    });
    setIsEditing(false);
  };

  return (
    <div className="card">
      <div className="card-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900">{budget.category}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(budget._id)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                value={editForm.period}
                onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                className="input w-full"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleSave} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <>
            {/* Amount Display */}
            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${budget.spent.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  of ${budget.amount.toFixed(2)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${getStatusColor()}`}>
                  {percentage.toFixed(1)}% used
                </span>
                <span className="text-gray-500 capitalize">
                  {budget.period}
                </span>
              </div>
            </div>

            {/* Status Message */}
            <div className="mb-4">
              {remaining > 0 ? (
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">
                    ${remaining.toFixed(2)}
                  </span> remaining this {budget.period}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  <span className="font-medium">
                    ${Math.abs(remaining).toFixed(2)}
                  </span> over budget
                </p>
              )}
            </div>

            {/* AI Badge */}
            {budget.isAiGenerated && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                <TrendingUp className="w-3 h-3" />
                <span>AI Suggested</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
