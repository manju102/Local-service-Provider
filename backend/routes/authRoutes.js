import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/signup
// @desc    Register a new user (customer or provider)
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      address,
      bio,
      skills,
      category,
      ratePerHour,
      location,
      experience,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Build user data
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'customer',
      address: address || '',
    };

    // Add provider-specific fields if role is provider
    if (role === 'provider') {
      userData.bio = bio || '';
      userData.skills = skills || [];
      userData.category = category || '';
      userData.ratePerHour = ratePerHour || 0;
      userData.location = location || '';
      userData.experience = experience || '';
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        bio: user.bio,
        skills: user.skills,
        category: user.category,
        ratePerHour: user.ratePerHour,
        rating: user.rating,
        reviewsCount: user.reviewsCount,
        isAvailable: user.isAvailable,
        location: user.location,
        experience: user.experience,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        bio: user.bio,
        skills: user.skills,
        category: user.category,
        ratePerHour: user.ratePerHour,
        rating: user.rating,
        reviewsCount: user.reviewsCount,
        isAvailable: user.isAvailable,
        location: user.location,
        experience: user.experience,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Protected
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Protected
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address, avatar, bio, skills, category, ratePerHour, location, experience, isAvailable } = req.body;

    // Update common fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    // Update provider-specific fields if user is a provider
    if (user.role === 'provider') {
      if (bio !== undefined) user.bio = bio;
      if (skills !== undefined) user.skills = skills;
      if (category !== undefined) user.category = category;
      if (ratePerHour !== undefined) user.ratePerHour = ratePerHour;
      if (location !== undefined) user.location = location;
      if (experience !== undefined) user.experience = experience;
      if (isAvailable !== undefined) user.isAvailable = isAvailable;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      address: updatedUser.address,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      category: updatedUser.category,
      ratePerHour: updatedUser.ratePerHour,
      rating: updatedUser.rating,
      reviewsCount: updatedUser.reviewsCount,
      isAvailable: updatedUser.isAvailable,
      location: updatedUser.location,
      experience: updatedUser.experience,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;
