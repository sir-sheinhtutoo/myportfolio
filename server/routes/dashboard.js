const express = require('express');
const { verifyToken } = require('./auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const router = express.Router();

// Get dashboard overview data
router.get('/overview', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentYear = new Date(currentDate.getFullYear(), 0, 1);

    // Current month expenses
    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month total for comparison
    const lastMonthTotal = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { 
            $gte: lastMonth,
            $lt: currentMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Year to date expenses
    const yearToDateExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent transactions
    const recentTransactions = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .select('amount description category date');

    // Active budgets
    const activeBudgets = await Budget.find({
      userId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    // Calculate totals and changes
    const currentMonthTotal = currentMonthExpenses.reduce((sum, cat) => sum + cat.total, 0);
    const lastMonthTotalAmount = lastMonthTotal[0]?.total || 0;
    const monthlyChange = lastMonthTotalAmount > 0 
      ? ((currentMonthTotal - lastMonthTotalAmount) / lastMonthTotalAmount) * 100 
      : 0;

    // Budget vs actual
    const budgetComparison = activeBudgets.map(budget => {
      const spent = currentMonthExpenses.find(exp => exp._id === budget.category)?.total || 0;
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100
      };
    });

    res.json({
      currentMonth: {
        total: currentMonthTotal,
        byCategory: currentMonthExpenses,
        changeFromLastMonth: monthlyChange
      },
      yearToDate: yearToDateExpenses[0] || { total: 0, count: 0 },
      recentTransactions,
      budgetComparison,
      summary: {
        totalBudget: activeBudgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: currentMonthTotal,
        transactionCount: currentMonthExpenses.reduce((sum, cat) => sum + cat.count, 0)
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get spending trends for charts
router.get('/trends', verifyToken, async (req, res) => {
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
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Format data for charts
    const monthlyTrends = {};
    const categoryTrends = {};

    expenses.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      const category = item._id.category;

      // Monthly totals
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = 0;
      }
      monthlyTrends[monthKey] += item.total;

      // Category trends
      if (!categoryTrends[category]) {
        categoryTrends[category] = {};
      }
      categoryTrends[category][monthKey] = item.total;
    });

    res.json({
      monthlyTrends,
      categoryTrends,
      period: {
        from: startDate,
        to: new Date(),
        months: parseInt(months)
      }
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Error fetching trend data' });
  }
});

// Get category breakdown for pie chart
router.get('/category-breakdown', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period = 'current_month' } = req.query;
    
    let startDate, endDate;
    const currentDate = new Date();

    switch (period) {
      case 'current_month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case 'last_3_months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        endDate = currentDate;
        break;
      case 'current_year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = currentDate;
        break;
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = currentDate;
    }

    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const totalSpent = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
    
    const breakdown = categoryBreakdown.map(cat => ({
      category: cat._id,
      amount: cat.total,
      count: cat.count,
      average: cat.avgAmount,
      percentage: totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0
    }));

    res.json({
      breakdown,
      total: totalSpent,
      period: {
        from: startDate,
        to: endDate,
        type: period
      }
    });
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ message: 'Error fetching category breakdown' });
  }
});

module.exports = router;
