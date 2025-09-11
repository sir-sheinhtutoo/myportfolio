const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('./auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { generateChatResponse } = require('../services/aiService');

const router = express.Router();

// Simple financial chatbot responses
const FINANCIAL_TIPS = {
  'save money': [
    'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
    'Cook at home more often to reduce dining expenses.',
    'Cancel unused subscriptions and memberships.',
    'Use cashback apps and compare prices before shopping.'
  ],
  'budget': [
    'Start by tracking all your expenses for a month.',
    'Set realistic budget limits for each category.',
    'Review and adjust your budget monthly.',
    'Use the envelope method for discretionary spending.'
  ],
  'groceries': [
    'Make a shopping list and stick to it.',
    'Buy generic brands when possible.',
    'Shop with a full stomach to avoid impulse purchases.',
    'Use coupons and shop sales.'
  ],
  'dining': [
    'Limit eating out to special occasions.',
    'Try meal prepping on weekends.',
    'Look for restaurant deals and happy hours.',
    'Consider cooking classes to make home cooking more enjoyable.'
  ],
  'debt': [
    'List all debts and prioritize high-interest ones.',
    'Consider the debt snowball or avalanche method.',
    'Negotiate with creditors for better terms.',
    'Avoid taking on new debt while paying off existing ones.'
  ],
  'investment': [
    'Start with an emergency fund of 3-6 months expenses.',
    'Consider low-cost index funds for beginners.',
    'Diversify your investment portfolio.',
    'Invest regularly, even small amounts help.'
  ]
};

// Generate chatbot response
function generateResponse(message, userExpenses = [], userBudgets = []) {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific keywords
  for (const [keyword, tips] of Object.entries(FINANCIAL_TIPS)) {
    if (lowerMessage.includes(keyword)) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      return {
        message: randomTip,
        type: 'tip',
        category: keyword
      };
    }
  }

  // Personalized responses based on user data
  if (lowerMessage.includes('spending') || lowerMessage.includes('expenses')) {
    if (userExpenses.length > 0) {
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const thisMonthExpenses = userExpenses.filter(exp => exp.date >= monthStart);
      const total = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        message: `This month you've spent $${total.toFixed(2)} across ${thisMonthExpenses.length} transactions. Your top category is ${getTopCategory(thisMonthExpenses)}.`,
        type: 'analysis',
        data: { total, count: thisMonthExpenses.length }
      };
    }
  }

  if (lowerMessage.includes('budget') && userBudgets.length > 0) {
    const overBudget = userBudgets.filter(b => b.spent > b.amount);
    if (overBudget.length > 0) {
      return {
        message: `You're over budget in ${overBudget.length} categories: ${overBudget.map(b => b.category).join(', ')}. Consider reducing expenses in these areas.`,
        type: 'warning',
        categories: overBudget.map(b => b.category)
      };
    }
  }

  // Default responses
  const defaultResponses = [
    "I'm here to help with your finances! Ask me about budgeting, saving money, or specific expense categories.",
    "Try asking me about ways to save money, budget tips, or how to reduce expenses in specific categories.",
    "I can provide tips on budgeting, saving, investing, and managing expenses. What would you like to know?",
    "Need financial advice? Ask me about creating budgets, reducing expenses, or building savings habits."
  ];

  return {
    message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    type: 'general'
  };
}

function getTopCategory(expenses) {
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  return Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Others';
}

// Chat endpoint
router.post('/message',
  [
    body('message').trim().isLength({ min: 1, max: 500 })
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message } = req.body;
      const userId = req.user.uid;

      // Get user's recent expenses and budgets for context
      const recentExpenses = await Expense.find({ userId })
        .sort({ date: -1 })
        .limit(100);

      const activeBudgets = await Budget.find({
        userId,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      // Calculate user context for AI
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const thisMonthExpenses = recentExpenses.filter(exp => exp.date >= monthStart);
      const totalSpent = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const topCategory = getTopCategory(thisMonthExpenses);

      const userContext = {
        totalSpent: totalSpent,
        topCategory: topCategory,
        expenseCount: thisMonthExpenses.length
      };

      // Use AI service for response generation
      const aiResponse = await generateChatResponse(message, userContext);
      
      // Fallback to rule-based if AI fails
      const response = aiResponse || generateResponse(message, recentExpenses, activeBudgets);

      res.json({
        userMessage: message,
        botResponse: response.response || response.message,
        type: response.type,
        timestamp: new Date(),
        ...(response.data && { data: response.data }),
        ...(response.categories && { categories: response.categories })
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        message: 'Sorry, I encountered an error. Please try again.',
        type: 'error'
      });
    }
  }
);

// Get chat suggestions
router.get('/suggestions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user's top spending categories for personalized suggestions
    const topCategories = await Expense.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 3
      }
    ]);

    const suggestions = [
      "How can I save money on groceries?",
      "What's a good budgeting strategy?",
      "How much should I save each month?",
      "Tips for reducing dining expenses"
    ];

    // Add personalized suggestions based on top categories
    topCategories.forEach(cat => {
      if (cat._id !== 'Others') {
        suggestions.push(`How can I reduce my ${cat._id.toLowerCase()} expenses?`);
      }
    });

    res.json({
      suggestions: suggestions.slice(0, 6) // Limit to 6 suggestions
    });
  } catch (error) {
    console.error('Chat suggestions error:', error);
    res.status(500).json({ message: 'Error fetching chat suggestions' });
  }
});

module.exports = router;
