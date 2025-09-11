import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';

const CreateBudgetModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Groceries', 'Dining', 'Utilities', 'Entertainment', 
    'Transportation', 'Healthcare', 'Shopping', 'Education', 
    'Travel', 'Insurance', 'Investment', 'Others'
  ];

  // Listen for AI suggestion fill event
  useEffect(() => {
    const handleFillForm = (event) => {
      const { category, amount, period } = event.detail;
      setFormData({
        category,
        amount: amount.toString(),
        period
      });
    };

    window.addEventListener('fillBudgetForm', handleFillForm);
    return () => window.removeEventListener('fillBudgetForm', handleFillForm);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Valid amount is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const budgetData = {
      ...formData,
      amount: parseFloat(formData.amount),
      startDate: new Date(),
      endDate: getEndDate(formData.period)
    };
    onCreate(budgetData);
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getEndDate = (period) => {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              className="input w-full"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input w-full"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Period *
            </label>
            <select
              className="input w-full"
              value={formData.period}
              onChange={(e) => handleInputChange('period', e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {errors.period && (
              <p className="mt-1 text-sm text-red-600">{errors.period}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBudgetModal;
