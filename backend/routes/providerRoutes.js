import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';

const router = express.Router();

// @route   GET /api/providers
// @desc    Search and list providers with filters, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      minRating,
      maxRate,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { role: 'provider' };

    // Text search on name and skills
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by maximum rate per hour
    if (maxRate) {
      query.ratePerHour = { $lte: Number(maxRate) };
    }

    // Sorting options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'rateAsc':
        sortOption = { ratePerHour: 1 };
        break;
      case 'rateDesc':
        sortOption = { ratePerHour: -1 };
        break;
      case 'reviewsCount':
        sortOption = { reviewsCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { rating: -1 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      providers,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get providers error:', error.message);
    res.status(500).json({ message: 'Server error fetching providers' });
  }
});

// @route   GET /api/providers/:id
// @desc    Get a single provider by ID with their reviews
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password');

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Fetch reviews for this provider
    const reviews = await Review.find({ provider: provider._id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      provider,
      reviews,
    });
  } catch (error) {
    console.error('Get provider error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(500).json({ message: 'Server error fetching provider' });
  }
});

export default router;
