import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Activity from '../models/Activity.js';
import Expense from '../models/Expense.js';

/**
 * @route   POST /api/trips
 * @desc    Create a new trip for authenticated user
 * @access  Private
 */
export const createTrip = async (req, res) => {
  try {
    const { name, description, startDate, endDate, coverPhoto, isPublic } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Trip name is required',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both start date and end date are required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or end date format',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date',
      });
    }

    // 2. Create Trip
    const trip = await Trip.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      startDate: start,
      endDate: end,
      coverPhoto: coverPhoto || '',
      isPublic: isPublic || false,
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip,
    });
  } catch (error) {
    console.error('[Create Trip Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating trip',
    });
  }
};

/**
 * @route   GET /api/trips
 * @desc    Get all trips for authenticated user
 * @access  Private
 */
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .sort({ startDate: 1 })
      .lean();

    // Fetch stops count for each trip
    const tripIds = trips.map((t) => t._id);
    const stops = await Stop.find({ trip: { $in: tripIds } }).lean();

    const enrichedTrips = trips.map((trip) => {
      const tripStops = stops.filter(
        (s) => s.trip.toString() === trip._id.toString()
      );
      return {
        ...trip,
        stopsCount: tripStops.length,
        destinations: tripStops.map((s) => `${s.city}, ${s.country}`),
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedTrips.length,
      trips: enrichedTrips,
    });
  } catch (error) {
    console.error('[Get Trips Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user trips',
    });
  }
};

/**
 * @route   GET /api/trips/:id
 * @desc    Get single trip details by ID
 * @access  Private
 */
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Security check: User must own the trip (unless public)
    if (trip.user.toString() !== req.user._id.toString() && !trip.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this private trip',
      });
    }

    // Fetch associated stops, activities, and expenses
    const stops = await Stop.find({ trip: trip._id }).sort({ order: 1 }).lean();
    const activities = await Activity.find({ trip: trip._id }).sort({ date: 1, time: 1 }).lean();
    const expenses = await Expense.find({ trip: trip._id }).sort({ date: -1 }).lean();

    res.status(200).json({
      success: true,
      trip: {
        ...trip.toObject(),
        stops,
        activities,
        expenses,
      },
    });
  } catch (error) {
    console.error('[Get Trip By ID Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving trip details',
    });
  }
};

/**
 * @route   PUT /api/trips/:id
 * @desc    Update an existing trip
 * @access  Private
 */
export const updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Security check: User must own the trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip',
      });
    }

    const { name, description, startDate, endDate, coverPhoto, isPublic } = req.body;

    // Validations if dates updated
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be before start date',
        });
      }
    }

    // Update fields
    if (name) trip.name = name.trim();
    if (description !== undefined) trip.description = description.trim();
    if (startDate) trip.startDate = new Date(startDate);
    if (endDate) trip.endDate = new Date(endDate);
    if (coverPhoto !== undefined) trip.coverPhoto = coverPhoto;
    if (isPublic !== undefined) trip.isPublic = isPublic;

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip,
    });
  } catch (error) {
    console.error('[Update Trip Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating trip',
    });
  }
};

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip and perform cascade cleanup
 * @access  Private
 */
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Security check: User must own the trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip',
      });
    }

    // Cascade delete associated stops, activities, and expenses
    await Stop.deleteMany({ trip: trip._id });
    await Activity.deleteMany({ trip: trip._id });
    await Expense.deleteMany({ trip: trip._id });

    // Delete trip
    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip and all associated data deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('[Delete Trip Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting trip',
    });
  }
};
