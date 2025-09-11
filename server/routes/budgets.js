const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all budgets for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const currentDate = new Date();
    
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ category: 1 });

    // Calculate spent amounts for each budget
    for (let budget of budgets) {
      const expenses = await Expense.aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            date: {
              $gte: budget.startDate,
              $lte: budget.endDate
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

      budget.spent = expenses[0]?.total || 0;
      await budget.save();
    }

    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
});

// Create new budget
router.post('/',
  [
    body('category').trim().isLength({ min: 1 }),
    body('amount').isFloat({ min: 0.01 }),
    body('period').isIn(['weekly', 'monthly', 'yearly']),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, amount, period, startDate, endDate } = req.body;
      const userId = req.user.uid;

      // Check if budget already exists for this category and period
      const existingBudget = await Budget.findOne({
        userId,
        category,
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      });

      if (existingBudget) {
        return res.status(400).json({ message: 'Budget already exists for this category and period' });
      }

      const budget = new Budget({
        userId,
        category,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      await budget.save();

      res.status(201).json({
        message: 'Budget created successfully',
        budget
      });
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ message: 'Server error creating budget' });
    }
  }
);

// Update budget
router.put('/:id',
  [
    body('amount').optional().isFloat({ min: 0.01 }),
    body('period').optional().isIn(['weekly', 'monthly', 'yearly']),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.user.uid
      });

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      Object.assign(budget, req.body);
      await budget.save();

      res.json({
        message: 'Budget updated successfully',
        budget
      });
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({ message: 'Server error updating budget' });
    }
  }
);

// Delete budget
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
});

module.exports = router;
