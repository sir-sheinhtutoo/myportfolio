const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Groceries',
      'Dining',
      'Utilities',
      'Entertainment',
      'Transportation',
      'Healthcare',
      'Shopping',
      'Education',
      'Travel',
      'Insurance',
      'Investment',
      'Others'
    ]
  },
  subcategory: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: false
  },
  aiCategorized: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  userCorrected: {
    type: Boolean,
    default: false
  },
  originalCategory: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for month/year grouping
expenseSchema.virtual('monthYear').get(function() {
  return `${this.date.getFullYear()}-${String(this.date.getMonth() + 1).padStart(2, '0')}`;
});

module.exports = mongoose.model('Expense', expenseSchema);
