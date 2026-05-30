import express from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Admin middleware - must be used after protect
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics
// @access  Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const acceptedBookings = await Booking.countDocuments({ status: 'accepted' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Total revenue from completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Average rating across all providers
    const ratingResult = await User.aggregate([
      { $match: { role: 'provider', reviewsCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgPlatformRating = ratingResult.length > 0 ? ratingResult[0].avgRating : 0;

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Top categories
    const categoryStats = await User.aggregate([
      { $match: { role: 'provider', category: { $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      totalUsers,
      totalCustomers,
      totalProviders,
      totalBookings,
      totalReviews,
      pendingBookings,
      acceptedBookings,
      completedBookings,
      rejectedBookings,
      cancelledBookings,
      totalRevenue,
      avgPlatformRating,
      recentSignups,
      categoryStats,
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with optional filters
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin users error:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Admin
router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin bookings error:', error.message);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews
// @access  Admin
router.get('/reviews', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin reviews error:', error.message);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Delete associated bookings and reviews
    await Booking.deleteMany({ $or: [{ customer: user._id }, { provider: user._id }] });
    await Review.deleteMany({ $or: [{ customer: user._id }, { provider: user._id }] });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete a booking
// @access  Admin
router.delete('/bookings/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Also remove any reviews tied to this booking
    await Review.deleteMany({ booking: req.params.id });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Admin delete booking error:', error.message);
    res.status(500).json({ message: 'Server error deleting booking' });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review and recalculate provider rating
// @access  Admin
router.delete('/reviews/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const providerId = review.provider;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate provider rating
    const reviews = await Review.find({ provider: providerId });
    const provider = await User.findById(providerId);
    if (provider) {
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        provider.rating = Math.round(avgRating * 10) / 10;
        provider.reviewsCount = reviews.length;
      } else {
        provider.rating = 0;
        provider.reviewsCount = 0;
      }
      await provider.save();
    }

    res.json({ message: 'Review deleted and rating recalculated' });
  } catch (error) {
    console.error('Admin delete review error:', error.message);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

export default router;
