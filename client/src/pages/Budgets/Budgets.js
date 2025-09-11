import React, { useState, useEffect } from 'react';
import { PlusCircle, Target, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import BudgetCard from '../../components/Budgets/BudgetCard';
import CreateBudgetModal from '../../components/Budgets/CreateBudgetModal';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budgets');
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await axios.post('/api/ai/budget-suggestions');
      setAiSuggestions(response.data.suggestions);
      toast.success('AI budget suggestions generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      await axios.post('/api/budgets', budgetData);
      toast.success('Budget created successfully!');
      setShowCreateModal(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const updateBudget = async (budgetId, updates) => {
    try {
      await axios.put(`/api/budgets/${budgetId}`, updates);
      toast.success('Budget updated successfully!');
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await axios.delete(`/api/budgets/${budgetId}`);
      toast.success('Budget deleted successfully!');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const applyAISuggestion = (category, suggestion) => {
    setShowCreateModal(true);
    // Pre-fill the modal with AI suggestion
    setTimeout(() => {
      const event = new CustomEvent('fillBudgetForm', {
        detail: {
          category,
          amount: suggestion.suggested,
          period: 'monthly'
        }
      });
      window.dispatchEvent(event);
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Set and track your spending limits</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateAISuggestions}
            disabled={loadingSuggestions}
            className="btn-outline"
          >
            {loadingSuggestions ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Suggestions
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Budget
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions && Object.keys(aiSuggestions).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
              AI Budget Suggestions
            </h3>
            <p className="card-description">
              Based on your spending history, here are recommended budgets
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(aiSuggestions).map(([category, suggestion]) => (
                <div key={category} className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-primary-900">{category}</h4>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {(suggestion.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-800 mb-1">
                    ${suggestion.suggested}
                  </p>
                  <p className="text-xs text-primary-700 mb-3">
                    Avg: ${suggestion.average} | Range: ${suggestion.min} - ${suggestion.max}
                  </p>
                  <button
                    onClick={() => applyAISuggestion(category, suggestion)}
                    className="w-full text-xs bg-primary-600 text-white py-2 px-3 rounded hover:bg-primary-700 transition-colors"
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setAiSuggestions(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Dismiss Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgets.reduce((sum, b) => sum + (b.spent || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Over Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {budgets.filter(b => (b.spent || 0) > b.amount).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Budget
            </button>
          </div>
        ) : (
          budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onUpdate={updateBudget}
              onDelete={deleteBudget}
            />
          ))
        )}
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <CreateBudgetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createBudget}
        />
      )}
    </div>
  );
};

export default Budgets;
