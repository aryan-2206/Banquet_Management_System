const Booking = require('../models/Booking');

// @desc    Create a new booking enquiry
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Create new booking
    const booking = new Booking(bookingData);

    // Calculate total cost
    booking.calculateTotalCost();

    // Add initial timeline entry
    booking.timeline.push({
      action: 'Enquiry created',
      timestamp: new Date(),
      details: `New booking enquiry received from ${booking.personalDetails.name}`
    });

    // Save booking
    await booking.save();

    // Populate for response
    await booking.populate('salesManager', 'name email');

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking enquiry created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to create booking enquiry'
    });
  }
};

// @desc    Get all bookings with filtering and pagination
// @route   GET /api/bookings
// @access  Private (Sales Manager)
exports.getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      venue,
      eventType,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Venue filter
    if (venue) {
      query['eventDetails.venue'] = venue;
    }

    // Event type filter
    if (eventType) {
      query['eventDetails.eventType'] = eventType;
    }

    // Date range filter
    if (startDate || endDate) {
      query['eventDetails.date'] = {};
      if (startDate) {
        query['eventDetails.date'].$gte = new Date(startDate);
      }
      if (endDate) {
        query['eventDetails.date'].$lte = new Date(endDate);
      }
    }

    // Search filter (name, email, phone, enquiryId)
    if (search) {
      query.$or = [
        { 'personalDetails.name': { $regex: search, $options: 'i' } },
        { 'personalDetails.email': { $regex: search, $options: 'i' } },
        { 'personalDetails.phone': { $regex: search, $options: 'i' } },
        { enquiryId: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const bookings = await Booking.find(query)
      .populate('salesManager', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch bookings'
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('salesManager', 'name email')
      .populate('notes');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch booking'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking data
    Object.assign(booking, req.body);

    // Recalculate cost if menu or venue changed
    if (req.body.eventDetails?.venue || req.body.menuSelection) {
      booking.calculateTotalCost();
    }

    // Add timeline entry for update
    booking.timeline.push({
      action: 'Booking updated',
      timestamp: new Date(),
      user: req.user?.id,
      details: 'Booking details were modified'
    });

    await booking.save();

    await booking.populate('salesManager', 'name email');

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to update booking'
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const oldStatus = booking.status;
    booking.status = status;

    // Add timeline entry
    booking.timeline.push({
      action: `Status changed to ${status}`,
      timestamp: new Date(),
      user: req.user?.id,
      details: notes || `Status updated from ${oldStatus} to ${status}`
    });

    // Set follow-up dates based on status
    if (status === 'confirmed') {
      booking.nextFollowUp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week later
    } else if (status === 'enquiry') {
      booking.nextFollowUp = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days later
    }

    await booking.save();

    await booking.populate('salesManager', 'name email');

    res.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to update booking status'
    });
  }
};

// @desc    Assign sales manager to booking
// @route   PATCH /api/bookings/:id/assign
// @access  Private (Admin)
exports.assignSalesManager = async (req, res) => {
  try {
    const { salesManagerId } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.salesManager = salesManagerId;

    // Add timeline entry
    booking.timeline.push({
      action: 'Sales manager assigned',
      timestamp: new Date(),
      user: req.user?.id,
      details: `Assigned to sales manager: ${salesManagerId}`
    });

    await booking.save();

    await booking.populate('salesManager', 'name email');

    res.json({
      success: true,
      data: booking,
      message: 'Sales manager assigned successfully'
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to assign sales manager'
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
exports.getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.getBookingStats();

    // Get additional stats
    const totalBookings = await Booking.countDocuments();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const upcomingEvents = await Booking.countDocuments({
      'eventDetails.date': { $gte: new Date() },
      status: { $in: ['confirmed', 'pending-payment'] }
    });

    res.json({
      success: true,
      data: {
        ...stats,
        totalBookings,
        monthlyBookings,
        upcomingEvents
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch booking statistics'
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete booking'
    });
  }
};

// @desc    Get venue availability
// @route   GET /api/bookings/availability
// @access  Public
exports.getVenueAvailability = async (req, res) => {
  try {
    const { venue, startDate, endDate } = req.query;

    if (!venue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Venue, start date, and end date are required'
      });
    }

    const bookings = await Booking.find({
      'eventDetails.venue': venue,
      'eventDetails.date': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $in: ['confirmed', 'pending-payment'] }
    }).select('eventDetails.date eventDetails.time enquiryId personalDetails.name');

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch venue availability'
    });
  }
};