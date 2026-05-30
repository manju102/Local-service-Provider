import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Customer creates a new booking
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { provider, service, date, time, address, notes, totalPrice } = req.body;

    // Validate required fields
    if (!provider || !service || !date || !time || !address) {
      return res.status(400).json({
        message: 'Provider, service, date, time, and address are required',
      });
    }

    // Verify the provider exists and has the provider role
    const providerUser = await User.findById(provider);
    if (!providerUser || providerUser.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Prevent providers from booking themselves
    if (req.user._id.toString() === provider) {
      return res.status(400).json({ message: 'You cannot book yourself' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      provider,
      service,
      date,
      time,
      address,
      notes: notes || '',
      totalPrice: totalPrice || 0,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar category ratePerHour');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// @route   GET /api/bookings
// @desc    Get bookings for the current user (customers see their bookings, providers see requests)
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    let query;

    if (req.user.role === 'provider') {
      // Providers see bookings where they are the provider
      query = { provider: req.user._id };
    } else {
      // Customers see their own bookings
      query = { customer: req.user._id };
    }

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar category ratePerHour location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error.message);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (provider: accept/reject, customer: cancel)
// @access  Protected
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const userId = req.user._id.toString();
    const isProvider = booking.provider.toString() === userId;
    const isCustomer = booking.customer.toString() === userId;

    if (!isProvider && !isCustomer) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Provider can accept or reject pending bookings
    if (isProvider) {
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          message: 'Provider can only accept or reject bookings',
        });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({
          message: `Cannot ${status} a booking that is already ${booking.status}`,
        });
      }
    }

    // Customer can only cancel
    if (isCustomer) {
      if (status !== 'cancelled') {
        return res.status(400).json({
          message: 'Customer can only cancel bookings',
        });
      }
      if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
        return res.status(400).json({
          message: `Cannot cancel a booking that is already ${booking.status}`,
        });
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar category ratePerHour location');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error updating booking status' });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Provider marks a booking as completed
// @access  Protected
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the provider can mark as completed
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the provider can mark a booking as completed',
      });
    }

    // Only accepted bookings can be completed
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        message: `Cannot complete a booking that is ${booking.status}. Booking must be accepted first.`,
      });
    }

    booking.status = 'completed';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar category ratePerHour location');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Complete booking error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error completing booking' });
  }
});

export default router;
