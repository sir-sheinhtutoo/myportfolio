import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Filter,
  PieChart,
  LineChart
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ExpenseChart from '../../components/Charts/ExpenseChart';
import TrendChart from '../../components/Charts/TrendChart';
import CategoryBreakdown from '../../components/Analytics/CategoryBreakdown';
import SpendingInsights from '../../components/Analytics/SpendingInsights';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [filters, setFilters] = useState({
    period: 'last_6_months',
    chartType: 'pie'
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters, fetchAnalyticsData]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch trends data
      const trendsResponse = await axios.get('/api/dashboard/trends', {
        params: { months: getPeriodMonths(filters.period) }
      });
      setTrendsData(trendsResponse.data);

      // Fetch category breakdown
      const categoryResponse = await axios.get('/api/dashboard/category-breakdown', {
        params: { period: filters.period }
      });
      setCategoryData(categoryResponse.data);

      // Fetch AI insights
      const insightsResponse = await axios.get('/api/ai/insights');
      setInsights(insightsResponse.data.insights);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodMonths = (period) => {
    switch (period) {
      case 'last_3_months': return 3;
      case 'last_6_months': return 6;
      case 'last_12_months': return 12;
      case 'current_year': return 12;
      default: return 6;
    }
  };

  const exportReport = async () => {
    try {
      const response = await axios.get('/api/analytics/export', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your spending patterns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportReport}
            className="btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="input"
              >
                <option value="current_month">Current Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_12_months">Last 12 Months</option>
                <option value="current_year">Current Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filters.chartType}
                onChange={(e) => setFilters({ ...filters, chartType: e.target.value })}
                className="input"
              >
                <option value="pie">Pie Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${categoryData?.total?.toFixed(2) || '0.00'}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Avg per Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${categoryData?.total ? (categoryData.total / getPeriodMonths(filters.period)).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categoryData?.breakdown?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LineChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-900">
                  {categoryData?.breakdown?.[0]?.category || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending by Category</h3>
            <p className="card-description">
              {filters.period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <div className="card-content">
            <ExpenseChart 
              data={categoryData?.breakdown || []} 
              type={filters.chartType}
            />
          </div>
        </div>

        {/* Spending Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending Trends</h3>
            <p className="card-description">Monthly spending over time</p>
          </div>
          <div className="card-content">
            <TrendChart data={trendsData?.monthlyTrends || {}} />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Breakdown</h3>
            <p className="card-description">Detailed spending by category</p>
          </div>
          <div className="card-content">
            <CategoryBreakdown breakdown={categoryData?.breakdown || []} />
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Insights</h3>
            <p className="card-description">Personalized spending insights</p>
          </div>
          <div className="card-content">
            <SpendingInsights insights={insights} />
          </div>
        </div>
      </div>

      {/* Category Trends */}
      {trendsData?.categoryTrends && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Trends Over Time</h3>
            <p className="card-description">How your spending in each category has changed</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(trendsData.categoryTrends).map(([category, data]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-1">
                    {Object.entries(data).slice(-3).map(([month, amount]) => (
                      <div key={month} className="flex justify-between text-sm">
                        <span className="text-gray-600">{month}</span>
                        <span className="font-medium">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
