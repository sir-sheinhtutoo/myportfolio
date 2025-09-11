const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Expense = require('../models/Expense');
const { verifyToken } = require('./auth');
const { categorizeExpense } = require('../services/aiService');

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all expenses for user
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  verifyToken, 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query
      const query = { userId: req.user.uid };
      
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) {
          query.date.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          query.date.$lte = new Date(req.query.endDate);
        }
      }

      const expenses = await Expense.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Expense.countDocuments(query);

      res.json({
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ message: 'Server error fetching expenses' });
    }
  }
);

// Add single expense
router.post('/',
  [
    body('amount').isFloat({ min: 0.01 }),
    body('description').trim().isLength({ min: 1, max: 200 }),
    body('category').optional().isIn([
      'Groceries', 'Dining', 'Utilities', 'Entertainment', 
      'Transportation', 'Healthcare', 'Shopping', 'Education', 
      'Travel', 'Insurance', 'Investment', 'Others'
    ]),
    body('date').isISO8601(),
    body('paymentMethod').optional().isIn([
      'cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'
    ]),
    body('isRecurring').optional().isBoolean(),
    body('recurringFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description, category, date, paymentMethod, tags, isRecurring, recurringFrequency } = req.body;
      
      let finalCategory = category;
      let aiCategorized = false;
      let aiConfidence = null;

      // If no category provided, use AI to categorize
      if (!category) {
        try {
          const aiResult = await categorizeExpense(description);
          finalCategory = aiResult.category;
          aiCategorized = true;
          aiConfidence = aiResult.confidence;
        } catch (aiError) {
          console.error('AI categorization error:', aiError);
          finalCategory = 'Others'; // Fallback
        }
      }

      const expenseData = {
        userId: req.user.uid,
        amount: parseFloat(amount),
        description,
        category: finalCategory,
        date: new Date(date),
        paymentMethod: paymentMethod || 'other',
        tags: tags || [],
        aiCategorized,
        aiConfidence,
        isRecurring: isRecurring || false
      };

      // Only add recurringFrequency if it's provided and not empty
      if (recurringFrequency && recurringFrequency.trim() !== '') {
        expenseData.recurringFrequency = recurringFrequency;
      }

      const expense = new Expense(expenseData);

      await expense.save();

      res.status(201).json({
        message: 'Expense added successfully',
        expense
      });
    } catch (error) {
      console.error('Add expense error:', error);
      res.status(500).json({ message: 'Server error adding expense' });
    }
  }
);

// Upload CSV expenses
router.post('/upload-csv', verifyToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const expenses = [];
    const errors = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Expected CSV format: date, description, amount, category (optional)
          const { date, description, amount, category } = row;
          
          if (!date || !description || !amount) {
            errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
            return;
          }

          let finalCategory = category;
          let aiCategorized = false;
          let aiConfidence = null;

          // Use AI to categorize if no category provided
          if (!category || category.trim() === '') {
            try {
              const aiResult = await categorizeExpense(description);
              finalCategory = aiResult.category;
              aiCategorized = true;
              aiConfidence = aiResult.confidence;
            } catch (aiError) {
              finalCategory = 'Others';
            }
          }

          const expense = {
            userId: req.user.uid,
            amount: parseFloat(amount),
            description: description.trim(),
            category: finalCategory,
            date: new Date(date),
            paymentMethod: 'other',
            aiCategorized,
            aiConfidence
          };

          expenses.push(expense);
        } catch (error) {
          errors.push(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          // Bulk insert expenses
          if (expenses.length > 0) {
            await Expense.insertMany(expenses);
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: 'CSV processed successfully',
            imported: expenses.length,
            errors: errors.length,
            errorDetails: errors
          });
        } catch (error) {
          console.error('Bulk insert error:', error);
          res.status(500).json({ message: 'Error saving expenses to database' });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        fs.unlinkSync(req.file.path);
        res.status(400).json({ message: 'Error parsing CSV file' });
      });
  } catch (error) {
    console.error('CSV upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error processing CSV' });
  }
});

// Update expense
router.put('/:id',
  [
    body('amount').optional().isFloat({ min: 0.01 }),
    body('description').optional().trim().isLength({ min: 1, max: 200 }),
    body('category').optional().isIn([
      'Groceries', 'Dining', 'Utilities', 'Entertainment', 
      'Transportation', 'Healthcare', 'Shopping', 'Education', 
      'Travel', 'Insurance', 'Investment', 'Others'
    ]),
    body('date').optional().isISO8601(),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const expense = await Expense.findOne({ 
        _id: req.params.id, 
        userId: req.user.uid 
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      // Track if user corrected AI categorization
      if (req.body.category && expense.aiCategorized && req.body.category !== expense.category) {
        expense.userCorrected = true;
        expense.originalCategory = expense.category;
      }

      // Update fields
      Object.assign(expense, req.body);
      await expense.save();

      res.json({
        message: 'Expense updated successfully',
        expense
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({ message: 'Server error updating expense' });
    }
  }
);

// Delete expense
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
});

// Get expense statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Current month stats
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

    // Last month stats for comparison
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

    const currentMonthTotal = currentMonthExpenses.reduce((sum, cat) => sum + cat.total, 0);
    const lastMonthTotalAmount = lastMonthTotal[0]?.total || 0;
    const monthlyChange = lastMonthTotalAmount > 0 
      ? ((currentMonthTotal - lastMonthTotalAmount) / lastMonthTotalAmount) * 100 
      : 0;

    res.json({
      currentMonth: {
        total: currentMonthTotal,
        byCategory: currentMonthExpenses,
        changeFromLastMonth: monthlyChange
      },
      lastMonth: {
        total: lastMonthTotalAmount
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
