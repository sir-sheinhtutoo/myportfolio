import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, Calendar, DollarSign, FileText, Tag } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'other',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Groceries', 'Dining', 'Utilities', 'Entertainment', 
    'Transportation', 'Healthcare', 'Shopping', 'Education', 
    'Travel', 'Insurance', 'Investment', 'Others'
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // AI categorization
  const suggestCategory = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a description first');
      return;
    }

    setLoadingAI(true);
    try {
      const response = await axios.post('/api/ai/categorize', {
        description: formData.description.trim()
      });

      setAiSuggestion(response.data);
      toast.success(`AI suggests: ${response.data.category} (${(response.data.confidence * 100).toFixed(0)}% confidence)`);
    } catch (error) {
      console.error('AI categorization error:', error);
      toast.error('Failed to get AI suggestion');
    } finally {
      setLoadingAI(false);
    }
  };

  const acceptAISuggestion = () => {
    if (aiSuggestion) {
      handleInputChange('category', aiSuggestion.category);
      setAiSuggestion(null);
      toast.success('Category applied!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Valid amount is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      toast.success('Expense added successfully!');
      navigate('/expenses');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Expense</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Track your spending with AI-powered categorization</p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-content">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Description *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="e.g., Grocery shopping at Walmart"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                <button
                  type="button"
                  onClick={suggestCategory}
                  disabled={loadingAI || !formData.description?.trim()}
                  className="btn-outline flex items-center"
                >
                  {loadingAI ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Suggest
                    </>
                  )}
                </button>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      AI Suggestion: {aiSuggestion.category}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Confidence: {(aiSuggestion.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={acceptAISuggestion}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category *
              </label>
              <select
                className="input"
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

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                className="input"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., business, personal, recurring"
                value={formData.tags || ''}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="card-footer">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Expense'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CSV Upload Option */}
      <div className="card">
        <div className="card-content">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Import Multiple Expenses
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload a CSV file to add multiple expenses at once
            </p>
            <button
              onClick={() => navigate('/expenses/upload')}
              className="btn-outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
