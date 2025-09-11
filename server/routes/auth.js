const express = require('express');
const admin = require('firebase-admin');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Initialize Firebase Admin (you'll need to add your service account key)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register/Login user
router.post('/register', 
  [
    body('email').isEmail().normalizeEmail(),
    body('displayName').trim().isLength({ min: 1 }),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, displayName, photoURL } = req.body;
      const { uid } = req.user;

      console.log('Attempting to register user:', { uid, email, displayName });
      
      // Check if user already exists
      let user = await User.findOne({ uid });
      console.log('Existing user found:', user ? 'Yes' : 'No');
      
      if (!user) {
        // Create new user
        user = new User({
          uid,
          email,
          displayName,
          photoURL,
          preferences: {
            currency: 'USD',
            budgetPeriod: 'monthly',
            categories: [
              { name: 'Groceries', color: '#10B981', budget: 500 },
              { name: 'Dining', color: '#F59E0B', budget: 300 },
              { name: 'Utilities', color: '#3B82F6', budget: 200 },
              { name: 'Entertainment', color: '#EF4444', budget: 150 },
              { name: 'Transportation', color: '#8B5CF6', budget: 250 },
              { name: 'Others', color: '#6B7280', budget: 200 }
            ]
          }
        });
        
        console.log('Saving new user to database...');
        await user.save();
        console.log('User saved successfully:', user._id);
      }

      res.json({
        message: 'User registered successfully',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.uid);
    const user = await User.findOne({ uid: req.user.uid });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user preferences
router.put('/preferences', 
  [
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('budgetPeriod').optional().isIn(['weekly', 'monthly', 'yearly']),
  ],
  verifyToken, 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update preferences
      Object.assign(user.preferences, req.body);
      await user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Preferences update error:', error);
      res.status(500).json({ message: 'Server error updating preferences' });
    }
  }
);

module.exports = { router, verifyToken };
