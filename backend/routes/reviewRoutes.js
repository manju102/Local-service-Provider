import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Customer creates a review for a completed booking
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { booking: bookingId, rating, comment } = req.body;

    // Validate required fields
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the current user is the customer on this booking
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the customer of this booking can leave a review',
      });
    }

    // Verify the booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'You can only review completed bookings',
      });
    }

    // Check if a review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Create the review
    const review = await Review.create({
      customer: req.user._id,
      provider: booking.provider,
      booking: bookingId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Update the provider's rating and reviewsCount
    const allReviews = await Review.find({ provider: booking.provider });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await User.findByIdAndUpdate(booking.provider, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviewsCount: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('provider', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Create review error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error creating review' });
  }
});

// @route   GET /api/reviews/provider/:providerId
// @desc    Get all reviews for a specific provider
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
  try {
    const provider = await User.findById(req.params.providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      reviews,
      averageRating: provider.rating,
      totalReviews: provider.reviewsCount,
    });
  } catch (error) {
    console.error('Get reviews error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

export default router;
