import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Tag } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const ExpenseList = ({ expenses, loading, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  const categories = [
    'Groceries', 'Dining', 'Utilities', 'Entertainment', 
    'Transportation', 'Healthcare', 'Shopping', 'Education', 
    'Travel', 'Insurance', 'Investment', 'Others'
  ];

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: format(new Date(expense.date), 'yyyy-MM-dd')
    });
  };

  const handleSave = async (expenseId) => {
    try {
      await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      onEdit();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-500 mb-4">Start by adding your first expense</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense._id} className="hover:bg-gray-50">
              {editingId === expense._id ? (
                // Edit mode
                <>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="input w-full"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="input w-full"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                      className="input w-full"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="input w-full"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(expense._id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                        {expense.aiCategorized && (
                          <div className="text-xs text-blue-600 flex items-center mt-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                            AI Categorized ({(expense.aiConfidence * 100).toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[expense.category] || categoryColors['Others']
                    }`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
