import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import Activity from '../models/Activity.js';
import Expense from '../models/Expense.js';

const COUNTRY_PHOTOS = {
  switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  swiss: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  japan: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  italy: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  greece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  india: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  ahmedabad: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  usa: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  spain: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
  thailand: 'https://images.unsplash.com/photo-1506665531195-3566fe27652f?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
};

const resolveCountryCoverPhoto = (name = '') => {
  const text = (name || '').toLowerCase();
  for (const key of Object.keys(COUNTRY_PHOTOS)) {
    if (text.includes(key)) return COUNTRY_PHOTOS[key];
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
};

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

    const defaultCameraCover = 'photo-1488646953014-85cb44e25828';
    const finalCover = (coverPhoto && !coverPhoto.includes(defaultCameraCover))
      ? coverPhoto.trim()
      : resolveCountryCoverPhoto(name);

    // 2. Create Trip
    const trip = await Trip.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      startDate: start,
      endDate: end,
      coverPhoto: finalCover,
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
