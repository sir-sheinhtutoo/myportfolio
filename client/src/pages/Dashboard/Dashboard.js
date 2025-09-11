import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Target,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ExpenseChart from '../../components/Charts/ExpenseChart';
import BudgetProgress from '../../components/Dashboard/BudgetProgress';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/overview');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { currentMonth, yearToDate, recentTransactions, budgetComparison, summary } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <Link to="/expenses/add" className="btn-primary whitespace-nowrap">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Expense
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentMonth?.total?.toFixed(2) || '0.00'}
                </p>
                {currentMonth?.changeFromLastMonth !== undefined && (
                  <div className="flex items-center mt-1">
                    {currentMonth.changeFromLastMonth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      currentMonth.changeFromLastMonth >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {Math.abs(currentMonth.changeFromLastMonth).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Year to Date</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${yearToDate?.total?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {yearToDate?.count || 0} transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.totalBudget > 0 
                    ? `${((summary.totalSpent / summary.totalBudget) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ${summary?.totalSpent?.toFixed(2) || '0.00'} of ${summary?.totalBudget?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.transactionCount || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending by Category</h3>
            <p className="card-description">Current month breakdown</p>
          </div>
          <div className="card-content">
            <ExpenseChart data={currentMonth?.byCategory || []} />
          </div>
        </div>

        {/* Budget Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budget Progress</h3>
            <p className="card-description">How you're tracking against your budgets</p>
          </div>
          <div className="card-content">
            <BudgetProgress budgets={budgetComparison || []} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-description">Your latest expenses</p>
            </div>
            <Link to="/expenses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="card-content">
          <RecentTransactions transactions={recentTransactions || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
