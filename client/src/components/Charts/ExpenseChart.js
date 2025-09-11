import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ExpenseChart = ({ data, type = 'pie' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p>No expense data available</p>
          <p className="text-sm">Add some expenses to see your spending breakdown</p>
        </div>
      </div>
    );
  }

  // Category colors
  const categoryColors = {
    'Groceries': '#10B981',
    'Dining': '#F59E0B',
    'Utilities': '#3B82F6',
    'Entertainment': '#EF4444',
    'Transportation': '#8B5CF6',
    'Healthcare': '#EC4899',
    'Shopping': '#F97316',
    'Education': '#06B6D4',
    'Travel': '#84CC16',
    'Insurance': '#6366F1',
    'Investment': '#14B8A6',
    'Others': '#6B7280'
  };

  const chartData = {
    labels: data.map(item => item._id || item.category),
    datasets: [
      {
        data: data.map(item => item.total),
        backgroundColor: data.map(item => 
          categoryColors[item._id || item.category] || categoryColors['Others']
        ),
        borderColor: data.map(item => 
          categoryColors[item._id || item.category] || categoryColors['Others']
        ),
        borderWidth: type === 'pie' ? 2 : 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'pie' ? 'right' : 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    ...(type === 'bar' && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(0);
            },
          },
        },
      },
    }),
  };

  return (
    <div className="h-64">
      {type === 'pie' ? (
        <Pie data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default ExpenseChart;
