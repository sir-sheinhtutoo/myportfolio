const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('./auth');
const { categorizeExpense, generateBudgetSuggestions, generateFinancialInsights, generateChatResponse } = require('../services/aiService');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const router = express.Router();

// Categorize expense description
router.post('/categorize',
  [
    body('description').trim().isLength({ min: 1, max: 200 })
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { description } = req.body;
      const result = await categorizeExpense(description);

      res.json({
        description,
        category: result.category,
        confidence: result.confidence,
        method: result.method
      });
    } catch (error) {
      console.error('Categorization error:', error);
      res.status(500).json({ message: 'Error categorizing expense' });
    }
  }
);

// Generate budget suggestions
router.post('/budget-suggestions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user's expense history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: sixMonthsAgo }
    });

    if (expenses.length === 0) {
      return res.json({
        message: 'Not enough expense data to generate suggestions',
        suggestions: {}
      });
    }

    const suggestions = await generateBudgetSuggestions(expenses);

    res.json({
      message: 'Budget suggestions generated successfully',
      suggestions,
      dataRange: {
        from: sixMonthsAgo,
        to: new Date(),
        expenseCount: expenses.length
      }
    });
  } catch (error) {
    console.error('Budget suggestions error:', error);
    res.status(500).json({ message: 'Error generating budget suggestions' });
  }
});

// Get financial insights
router.get('/insights', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get current month expenses
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: monthStart }
    });

    // Get active budgets
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    const insights = await generateFinancialInsights(expenses, budgets);

    res.json({
      insights,
      period: {
        from: monthStart,
        to: currentDate
      },
      expenseCount: expenses.length,
      budgetCount: budgets.length
    });
  } catch (error) {
    console.error('Financial insights error:', error);
    res.status(500).json({ message: 'Error generating financial insights' });
  }
});

// Batch categorize expenses
router.post('/batch-categorize', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find uncategorized expenses (category = 'Others' and not user-corrected)
    const uncategorizedExpenses = await Expense.find({
      userId,
      category: 'Others',
      userCorrected: { $ne: true }
    }).limit(100); // Process in batches

    if (uncategorizedExpenses.length === 0) {
      return res.json({
        message: 'No expenses need categorization',
        processed: 0
      });
    }

    let processed = 0;
    const results = [];

    for (const expense of uncategorizedExpenses) {
      try {
        const result = await categorizeExpense(expense.description);
        
        if (result.category !== 'Others' && result.confidence > 0.7) {
          expense.category = result.category;
          expense.aiCategorized = true;
          expense.aiConfidence = result.confidence;
          await expense.save();
          processed++;
          
          results.push({
            expenseId: expense._id,
            description: expense.description,
            oldCategory: 'Others',
            newCategory: result.category,
            confidence: result.confidence
          });
        }
      } catch (error) {
        console.error(`Error categorizing expense ${expense._id}:`, error);
      }
    }

    res.json({
      message: `Successfully categorized ${processed} expenses`,
      processed,
      total: uncategorizedExpenses.length,
      results
    });
  } catch (error) {
    console.error('Batch categorization error:', error);
    res.status(500).json({ message: 'Error in batch categorization' });
  }
});

// Analyze spending patterns
router.get('/spending-analysis', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period = 'monthly', months = 6 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    const expenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.category': 1
        }
      }
    ]);

    // Calculate trends
    const categoryTrends = {};
    expenses.forEach(item => {
      const category = item._id.category;
      if (!categoryTrends[category]) {
        categoryTrends[category] = [];
      }
      categoryTrends[category].push({
        period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        count: item.count,
        average: item.avgAmount
      });
    });

    // Calculate growth rates
    const analysis = {};
    Object.entries(categoryTrends).forEach(([category, data]) => {
      if (data.length >= 2) {
        const recent = data[data.length - 1];
        const previous = data[data.length - 2];
        const growthRate = ((recent.total - previous.total) / previous.total) * 100;
        
        analysis[category] = {
          currentMonth: recent.total,
          previousMonth: previous.total,
          growthRate: Math.round(growthRate * 100) / 100,
          trend: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
          data: data
        };
      }
    });

    res.json({
      analysis,
      period: {
        from: startDate,
        to: new Date(),
        months: parseInt(months)
      }
    });
  } catch (error) {
    console.error('Spending analysis error:', error);
    res.status(500).json({ message: 'Error analyzing spending patterns' });
  }
});

// Chat message endpoint
router.post('/chat/message',
  [
    body('message').trim().isLength({ min: 1, max: 1000 })
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

      // Get user context for personalized responses
      const currentDate = new Date();
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const expenses = await Expense.find({
        userId,
        date: { $gte: monthStart }
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categorySpending = {};
      
      expenses.forEach(expense => {
        if (!categorySpending[expense.category]) {
          categorySpending[expense.category] = 0;
        }
        categorySpending[expense.category] += expense.amount;
      });

      const topCategory = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b - a)[0];

      const userContext = {
        totalSpent,
        topCategory: topCategory ? topCategory[0] : null,
        expenseCount: expenses.length
      };

      const chatResponse = await generateChatResponse(message, userContext);

      res.json({
        botResponse: chatResponse.response,
        type: chatResponse.type,
        userContext: {
          totalSpent: totalSpent.toFixed(2),
          topCategory: userContext.topCategory,
          expenseCount: userContext.expenseCount
        }
      });
    } catch (error) {
      console.error('Chat message error:', error);
      res.status(500).json({ 
        botResponse: "I'm S-GenAi, and I'm having trouble processing that right now. Please try again!",
        type: 'error'
      });
    }
  }
);

// Chat suggestions endpoint
router.get('/chat/suggestions', verifyToken, async (req, res) => {
  try {
    const suggestions = [
      "How can I create a budget?",
      "What are some ways to save money?",
      "How should I start investing?",
      "What's your name?",
      "Help me reduce my spending",
      "How do I build an emergency fund?",
      "What's the best way to pay off debt?",
      "How can I track my expenses better?"
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Chat suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

module.exports = router;
