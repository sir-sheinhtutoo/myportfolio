const axios = require('axios');

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Expense categories mapping
const EXPENSE_CATEGORIES = {
  'Groceries': ['grocery', 'supermarket', 'food', 'walmart', 'target', 'costco', 'safeway', 'kroger', 'whole foods', 'trader joe'],
  'Dining': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'burger', 'takeout', 'delivery', 'dining'],
  'Utilities': ['electric', 'gas', 'water', 'internet', 'phone', 'cable', 'utility', 'bill', 'power', 'heating'],
  'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment', 'streaming', 'music'],
  'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'car', 'transport'],
  'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'dental', 'clinic', 'prescription'],
  'Shopping': ['amazon', 'store', 'mall', 'clothing', 'shoes', 'electronics', 'shopping', 'retail', 'purchase'],
  'Education': ['school', 'university', 'course', 'book', 'tuition', 'education', 'learning', 'training'],
  'Travel': ['hotel', 'flight', 'airbnb', 'vacation', 'travel', 'trip', 'booking', 'airline', 'rental'],
  'Insurance': ['insurance', 'premium', 'policy', 'coverage', 'auto insurance', 'health insurance'],
  'Investment': ['investment', 'stock', 'bond', 'mutual fund', 'retirement', '401k', 'ira', 'savings'],
  'Others': ['misc', 'other', 'miscellaneous', 'unknown']
};

// Rule-based categorization as fallback
function categorizeByRules(description) {
  const desc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return {
          category,
          confidence: 0.8,
          method: 'rule-based'
        };
      }
    }
  }
  
  return {
    category: 'Others',
    confidence: 0.5,
    method: 'rule-based'
  };
}

// AI-powered expense categorization
async function categorizeExpense(description) {
  try {
    // First try rule-based approach for quick categorization
    const ruleResult = categorizeByRules(description);
    if (ruleResult.confidence > 0.7) {
      return ruleResult;
    }

    // Use OpenRouter for more sophisticated categorization
    if (OPENROUTER_API_KEY) {
      const categories = Object.keys(EXPENSE_CATEGORIES);
      const prompt = `You are a financial expense categorization assistant. Categorize the following expense description into exactly one of these categories: ${categories.join(', ')}.

Expense description: "${description}"

Respond with only the category name, nothing else.`;

      try {
        const response = await axios.post(OPENROUTER_API_URL, {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 20,
          temperature: 0.1
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
            'X-Title': 'AI Finance Assistant'
          }
        });

        const aiCategory = response.data.choices[0].message.content.trim();
        
        // Validate AI response
        if (categories.includes(aiCategory)) {
          return {
            category: aiCategory,
            confidence: 0.9,
            method: 'ai-powered'
          };
        }
      } catch (apiError) {
        console.error('OpenRouter API error:', apiError.message);
      }
    }

    // Fallback to rule-based result
    return ruleResult;
  } catch (error) {
    console.error('AI categorization error:', error);
    return categorizeByRules(description);
  }
}

// Generate budget suggestions based on spending patterns
async function generateBudgetSuggestions(expenses, userPreferences = {}) {
  try {
    const categoryTotals = {};
    const monthlyData = {};

    // Analyze spending patterns
    expenses.forEach(expense => {
      const category = expense.category;
      const monthKey = expense.monthYear || `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = [];
      }
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      if (!monthlyData[monthKey][category]) {
        monthlyData[monthKey][category] = 0;
      }
      
      monthlyData[monthKey][category] += expense.amount;
    });

    // Calculate averages and suggest budgets
    const suggestions = {};
    
    for (const category of Object.keys(EXPENSE_CATEGORIES)) {
      const monthlyAmounts = Object.values(monthlyData)
        .map(month => month[category] || 0)
        .filter(amount => amount > 0);

      if (monthlyAmounts.length > 0) {
        const average = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
        const max = Math.max(...monthlyAmounts);
        const min = Math.min(...monthlyAmounts);
        
        // Suggest budget with 10% buffer above average
        const suggestedBudget = Math.round(average * 1.1);
        
        suggestions[category] = {
          suggested: suggestedBudget,
          average: Math.round(average),
          min: Math.round(min),
          max: Math.round(max),
          confidence: monthlyAmounts.length >= 3 ? 0.8 : 0.6,
          dataPoints: monthlyAmounts.length
        };
      }
    }

    return suggestions;
  } catch (error) {
    console.error('Budget suggestion error:', error);
    return {};
  }
}

// Generate AI-powered financial insights and tips
async function generateFinancialInsights(expenses, budgets = []) {
  try {
    const insights = [];
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    // Current month expenses by category
    const currentMonthExpenses = expenses.filter(exp => exp.date >= monthStart);
    const categorySpending = {};
    
    currentMonthExpenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = 0;
      }
      categorySpending[expense.category] += expense.amount;
    });

    // Budget vs actual analysis
    budgets.forEach(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage > 90) {
        insights.push({
          type: 'warning',
          category: budget.category,
          message: `You've spent ${percentage.toFixed(1)}% of your ${budget.category} budget this month.`,
          suggestion: `Consider reducing ${budget.category} expenses for the rest of the month.`
        });
      } else if (percentage < 50) {
        insights.push({
          type: 'positive',
          category: budget.category,
          message: `Great job! You're only at ${percentage.toFixed(1)}% of your ${budget.category} budget.`,
          suggestion: `You have room for additional ${budget.category} expenses if needed.`
        });
      }
    });

    // Spending pattern insights
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      insights.push({
        type: 'info',
        category: topCategory[0],
        message: `${topCategory[0]} is your highest spending category this month at $${topCategory[1].toFixed(2)}.`,
        suggestion: `Look for ways to optimize your ${topCategory[0]} expenses.`
      });
    }

    // Generate AI-powered personalized tips if OpenRouter is available
    if (OPENROUTER_API_KEY && expenses.length > 0) {
      try {
        const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const topCategories = Object.entries(categorySpending)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`);

        const prompt = `As a financial advisor, provide 2-3 personalized money-saving tips based on this spending data:

Total spent this month: $${totalSpent.toFixed(2)}
Top spending categories: ${topCategories.join(', ')}

Provide practical, actionable advice in a friendly tone. Keep each tip under 50 words.`;

        const response = await axios.post(OPENROUTER_API_URL, {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
            'X-Title': 'AI Finance Assistant'
          }
        });

        const aiTips = response.data.choices[0].message.content.trim();
        insights.push({
          type: 'ai-tip',
          category: 'General',
          message: 'AI-Generated Financial Tips',
          suggestion: aiTips
        });
      } catch (aiError) {
        console.error('AI insights error:', aiError.message);
      }
    }

    return insights;
  } catch (error) {
    console.error('Financial insights error:', error);
    return [];
  }
}

// Generate AI-powered chatbot responses
async function generateChatResponse(message, userContext = {}) {
  try {
    // Rule-based responses for common queries
    const lowerMessage = message.toLowerCase();
    
    // Identity questions
    if (lowerMessage.includes('what') && (lowerMessage.includes('your name') || lowerMessage.includes('who are you'))) {
      return {
        response: "I'm S-GenAi (V1) developed by Shein Htut Oo. I'm your personal AI finance assistant, specialized in helping you manage your money, create budgets, and make smart financial decisions. How can I help you with your finances today?",
        type: 'identity'
      };
    }
    
    if (lowerMessage.includes('who made you') || lowerMessage.includes('who created you') || lowerMessage.includes('developer')) {
      return {
        response: "I was developed by Shein Htut Oo. I'm S-GenAi (V1), designed specifically to be your intelligent financial companion. I can help you with budgeting, expense tracking, financial planning, and money-saving strategies.",
        type: 'identity'
      };
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        response: "Hello! I'm S-GenAi (V1), your personal finance assistant. I'm here to help you with budgeting, saving money, investment advice, and all your financial questions. What would you like to discuss today?",
        type: 'greeting'
      };
    }
    
    // Budget-related questions
    if (lowerMessage.includes('budget')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('create') || lowerMessage.includes('make')) {
        return {
          response: "I can help you create effective budgets! As S-GenAi, I analyze your spending patterns and suggest realistic budget amounts for each category. I use the 50/30/20 rule as a foundation: 50% for needs, 30% for wants, and 20% for savings. Would you like me to generate personalized budget suggestions based on your expense history?",
          type: 'helpful'
        };
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('saving')) {
        return {
          response: "I'd be happy to help with your budget savings! Here are proven strategies: 1) Use the envelope method for discretionary spending, 2) Automate savings before you can spend it, 3) Review and optimize recurring subscriptions, 4) Set specific savings goals with deadlines, 5) Track progress weekly. What's your current monthly income and main expense categories?",
          type: 'advice'
        };
      }
    }
    
    // Money saving questions
    if (lowerMessage.includes('save money') || lowerMessage.includes('reduce spending') || lowerMessage.includes('cut costs')) {
      return {
        response: "Here are my top money-saving strategies: 1) Track every expense to identify spending patterns, 2) Set category-specific budgets with alerts, 3) Use the 24-hour rule for non-essential purchases, 4) Automate savings transfers, 5) Review and cancel unused subscriptions monthly, 6) Cook at home more often - it can save $200+ monthly. Which area would you like me to help you optimize?",
        type: 'advice'
      };
    }
    
    // Investment questions
    if (lowerMessage.includes('investment') || lowerMessage.includes('invest') || lowerMessage.includes('stock') || lowerMessage.includes('portfolio')) {
      return {
        response: "Smart investing starts with a solid foundation! First, ensure you have an emergency fund (3-6 months expenses) and high-interest debt paid off. For beginners, I recommend starting with low-cost index funds or ETFs. Consider dollar-cost averaging to reduce market timing risk. What's your current financial situation and investment timeline?",
        type: 'advice'
      };
    }
    
    // Debt management
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('credit card')) {
      return {
        response: "Let's tackle that debt strategically! I recommend the debt avalanche method: pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money long-term. Alternatively, the debt snowball method (smallest balance first) can provide psychological wins. What types of debt are you dealing with?",
        type: 'advice'
      };
    }
    
    // Emergency fund questions
    if (lowerMessage.includes('emergency fund') || lowerMessage.includes('emergency saving')) {
      return {
        response: "An emergency fund is crucial for financial security! Aim for 3-6 months of essential expenses in a high-yield savings account. Start small - even $500 can cover many emergencies. Automate transfers of $50-100 monthly until you reach your goal. This fund prevents you from going into debt when unexpected expenses arise.",
        type: 'advice'
      };
    }
    
    // Expense tracking
    if (lowerMessage.includes('track') && (lowerMessage.includes('expense') || lowerMessage.includes('spending'))) {
      return {
        response: "Expense tracking is the foundation of good financial management! I can help you categorize expenses automatically. Key tips: 1) Record every transaction immediately, 2) Use categories that match your lifestyle, 3) Review weekly to spot patterns, 4) Set up alerts for overspending. This app can automatically categorize your expenses - have you tried adding some expenses yet?",
        type: 'helpful'
      };
    }
    
    // Financial planning
    if (lowerMessage.includes('financial plan') || lowerMessage.includes('money plan') || lowerMessage.includes('financial goal')) {
      return {
        response: "Great question about financial planning! A solid plan includes: 1) Clear short and long-term goals, 2) Emergency fund (3-6 months expenses), 3) Debt payoff strategy, 4) Investment allocation based on age and risk tolerance, 5) Regular review and adjustments. What specific financial goals are you working toward?",
        type: 'advice'
      };
    }
    
    // Retirement planning
    if (lowerMessage.includes('retirement') || lowerMessage.includes('401k') || lowerMessage.includes('ira')) {
      return {
        response: "Retirement planning is crucial for long-term financial security! Start with employer 401(k) matching - it's free money. Aim to save 10-15% of income for retirement. Consider Roth IRA for tax-free growth. The earlier you start, the more compound interest works for you. A 25-year-old saving $200/month could have $500k+ by retirement!",
        type: 'advice'
      };
    }
    
    // Credit score questions
    if (lowerMessage.includes('credit score') || lowerMessage.includes('credit report')) {
      return {
        response: "Building good credit is essential for financial health! Key factors: 1) Pay all bills on time (35% of score), 2) Keep credit utilization below 30% (30% of score), 3) Don't close old credit cards, 4) Monitor your credit report regularly, 5) Limit new credit applications. What's your current credit situation?",
        type: 'advice'
      };
    }

    // General financial questions with contextual responses
    if (lowerMessage.includes('help') && (lowerMessage.includes('money') || lowerMessage.includes('finance'))) {
      const contextResponse = userContext.totalSpent > 0 ? 
        `Based on your spending data, you've spent $${userContext.totalSpent} this month with ${userContext.topCategory} being your top category. ` : '';
      
      return {
        response: `${contextResponse}I'm S-GenAi (V1), and I can help you with: 1) Creating and managing budgets, 2) Expense tracking and categorization, 3) Investment strategies, 4) Debt management, 5) Savings goals, 6) Financial planning. What specific area would you like to focus on?`,
        type: 'helpful'
      };
    }

    // Try OpenRouter API with better error handling
    if (OPENROUTER_API_KEY) {
      try {
        const contextInfo = userContext.totalSpent ? 
          `User context: Total monthly spending: $${userContext.totalSpent}, Top category: ${userContext.topCategory}` : 
          'No specific user context available.';

        const prompt = `You are S-GenAi (V1), a specialized AI finance assistant developed by Shein Htut Oo. You are an expert in personal finance, budgeting, investing, and money management. Answer this financial question in a helpful, practical way:

"${message}"

${contextInfo}

Provide actionable financial advice in 2-3 sentences. Be encouraging, specific, and focus on practical steps the user can take. Always maintain your identity as S-GenAi when relevant.`;

        const response = await axios.post(OPENROUTER_API_URL, {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
            'X-Title': 'S-GenAi Finance Assistant'
          },
          timeout: 10000 // 10 second timeout
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
          return {
            response: response.data.choices[0].message.content.trim(),
            type: 'ai-powered'
          };
        }
      } catch (apiError) {
        console.error('OpenRouter API error:', apiError.message);
        // Fall through to enhanced fallback
      }
    }

    // Enhanced contextual fallback responses
    const contextualResponse = userContext.totalSpent > 0 ? 
      `I see you've spent $${userContext.totalSpent} this month. ` : '';
    
    // Provide specific help based on common financial topics
    if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
      return {
        response: `${contextualResponse}I'm S-GenAi (V1), and I can help you analyze your expenses! Try asking me about: "How can I reduce my spending?", "Help me categorize expenses", or "What's my spending pattern?" I'm here to provide personalized financial advice.`,
        type: 'fallback'
      };
    }
    
    if (lowerMessage.includes('money') || lowerMessage.includes('financial')) {
      return {
        response: `${contextualResponse}I'm S-GenAi (V1), your personal finance assistant developed by Shein Htut Oo. I specialize in budgeting, saving strategies, investment advice, and debt management. What specific financial topic would you like help with today?`,
        type: 'fallback'
      };
    }

    // Default enhanced fallback
    return {
      response: `${contextualResponse}Hello! I'm S-GenAi (V1), your personal finance assistant developed by Shein Htut Oo. I'm here to help you with budgeting, saving money, expense tracking, investment advice, debt management, and all your financial questions. Try asking me about creating budgets, saving strategies, or investment tips!`,
      type: 'fallback'
    };
  } catch (error) {
    console.error('Chat response error:', error);
    return {
      response: "I'm S-GenAi (V1), your finance assistant. I can help you with budgeting, saving money, investment advice, expense tracking, and debt management. What would you like to know about managing your finances?",
      type: 'error'
    };
  }
}

module.exports = {
  categorizeExpense,
  generateBudgetSuggestions,
  generateFinancialInsights,
  generateChatResponse
};
