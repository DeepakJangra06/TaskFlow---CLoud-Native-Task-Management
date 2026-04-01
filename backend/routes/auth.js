const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register User
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    next(err);
  }
});

// Login User
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isEqual = await user.comparePassword(password);
    if (!isEqual) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: token, userId: user._id.toString(), username: user.username });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
