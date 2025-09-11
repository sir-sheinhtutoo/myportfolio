const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'exceeded', 'completed'],
    default: 'active'
  },
  alerts: {
    threshold50: {
      type: Boolean,
      default: false
    },
    threshold75: {
      type: Boolean,
      default: false
    },
    threshold90: {
      type: Boolean,
      default: false
    },
    exceeded: {
      type: Boolean,
      default: false
    }
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

budgetSchema.index({ userId: 1, category: 1, period: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update status based on spent amount
  const percentage = (this.spent / this.amount) * 100;
  if (percentage >= 100) {
    this.status = 'exceeded';
  } else if (percentage >= 90) {
    this.status = 'active';
  }
  
  next();
});

// Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function() {
  return Math.round((this.spent / this.amount) * 100);
});

module.exports = mongoose.model('Budget', budgetSchema);
