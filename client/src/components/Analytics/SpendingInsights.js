import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  Lightbulb,
  Target
} from 'lucide-react';

const SpendingInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No insights available yet</p>
        <p className="text-sm">Add more expenses and budgets to get AI insights</p>
      </div>
    );
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightBgColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getInsightTextColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-orange-800';
      case 'positive':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {insight.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                    <Target className="w-3 h-3 mr-1" />
                    {insight.category}
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium mb-1 ${getInsightTextColor(insight.type)}`}>
                {insight.message}
              </p>
              {insight.suggestion && (
                <p className="text-xs text-gray-600">
                  💡 {insight.suggestion}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* General Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
        <h4 className="font-medium text-primary-900 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          Smart Spending Tips
        </h4>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Review your spending weekly to stay on track</li>
          <li>• Set up budget alerts to avoid overspending</li>
          <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          <li>• Track recurring expenses and look for optimization opportunities</li>
        </ul>
      </div>
    </div>
  );
};

export default SpendingInsights;
