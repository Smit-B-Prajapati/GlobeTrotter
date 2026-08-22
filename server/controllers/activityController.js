import Activity from '../models/Activity.js';
import Stop from '../models/Stop.js';
import Trip from '../models/Trip.js';

/**
 * Curated Activity Discovery Dataset
 */
export const ACTIVITIES_CATALOG = [
  {
    id: 'act_eiffel_tour',
    name: 'Eiffel Tower Summit & Garden Tour',
    city: 'Paris',
    description: 'Priority access to Eiffel Tower summit with guided historical narration and champagne toast.',
    category: 'Sightseeing',
    cost: 45,
    duration: 120, // minutes
    image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_louvre_guided',
    name: 'Louvre Museum Masterpieces Walk',
    city: 'Paris',
    description: 'Skip-the-line small group tour of Mona Lisa, Venus de Milo, and Winged Victory.',
    category: 'Culture',
    cost: 65,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_mumbai_street_food',
    name: 'Juhu Beach & Chowpatty Street Food Crawl',
    city: 'Mumbai',
    description: 'Taste authentic Pav Bhaji, Pani Puri, Bhel Puri, and Vada Pav guided by local culinary experts.',
    category: 'Food',
    cost: 20,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_gateway_heritage',
    name: 'Gateway of India & Elephanta Caves Boat Trip',
    city: 'Mumbai',
    description: 'Scenic ferry ride across Mumbai Harbor to explore 5th-century rock-cut cave temples.',
    category: 'Culture',
    cost: 30,
    duration: 240,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_goa_scuba',
    name: 'Grande Island Scuba Diving & Snorkeling',
    city: 'Goa',
    description: 'Underwater scuba dive session with underwater photos, training, and PADI instructors.',
    category: 'Adventure',
    cost: 75,
    duration: 300,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_goa_sunset_cruise',
    name: 'Mandovi River Sunset Cultural Cruise',
    city: 'Goa',
    description: 'Evening boat cruise featuring traditional Goan folk dances, music, and sunset vistas.',
    category: 'Nature',
    cost: 25,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_kyoto_bamboo',
    name: 'Arashiyama Bamboo Grove & Monkey Park Walk',
    city: 'Kyoto',
    description: 'Peaceful morning walk through towering green bamboo stalks and Tenryu-ji Temple gardens.',
    category: 'Nature',
    cost: 15,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_kyoto_tea',
    name: 'Traditional Machiya Kimono Tea Ceremony',
    city: 'Kyoto',
    description: 'Immersive tea ritual in a historic wooden townhouse with authentic Matcha preparation.',
    category: 'Culture',
    cost: 50,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_tokyo_shibuya',
    name: 'Shibuya Crossing & Harajuku Shopping Walk',
    city: 'Tokyo',
    description: 'Explore the world famous Shibuya scramble crossing, Takeshita street fashion, and boutique shops.',
    category: 'Shopping',
    cost: 25,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'act_santorini_catamaran',
    name: 'Santorini Caldera Sunset Catamaran Cruise',
    city: 'Santorini',
    description: 'Luxury sailing cruise around Red Beach, White Beach, hot springs, with BBQ lunch & wine.',
    category: 'Adventure',
    cost: 110,
    duration: 300,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * @route   GET /api/activities/catalog
 * @desc    Search and filter curated activity discovery catalog
 * @access  Public / Private
 */
export const getActivityCatalog = async (req, res) => {
  try {
    const { query, city, category, maxCost, maxDuration } = req.query;

    let filtered = ACTIVITIES_CATALOG;

    if (query) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      );
    }

    if (city) {
      filtered = filtered.filter((a) => a.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase().trim());
    }

    if (maxCost) {
      filtered = filtered.filter((a) => a.cost <= Number(maxCost));
    }

    if (maxDuration) {
      filtered = filtered.filter((a) => a.duration <= Number(maxDuration));
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      activities: filtered,
    });
  } catch (error) {
    console.error('[Get Activity Catalog Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving activity catalog',
    });
  }
};

/**
 * Helper to verify trip ownership for authenticated user
 */
const checkTripOwnership = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };
  if (trip.user.toString() !== userId.toString()) {
    return { error: 'Not authorized to modify activities for this trip', status: 403 };
  }
  return { trip };
};

/**
 * @route   POST /api/trips/:tripId/stops/:stopId/activities
 * @desc    Add an activity to a specific trip stop
 * @access  Private
 */
export const addActivityToStop = async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const { name, description, category, date, time, duration, cost } = req.body;

    // 1. Ownership check
    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // 2. Stop existence check
    const stop = await Stop.findOne({ _id: stopId, trip: tripId });
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Destination stop not found on this trip',
      });
    }

    // 3. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Activity name is required',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Activity date is required',
      });
    }

    const activityDate = new Date(date);
    if (isNaN(activityDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity date format',
      });
    }

    // 4. Create Activity
    const activity = await Activity.create({
      trip: tripId,
      stop: stopId,
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category || 'Sightseeing',
      date: activityDate,
      time: time || '09:00',
      duration: Number(duration) || 60,
      cost: Number(cost) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Activity added to stop successfully',
      activity,
    });
  } catch (error) {
    console.error('[Add Activity Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding activity',
    });
  }
};

/**
 * @route   GET /api/trips/:tripId/activities
 * @desc    Get all activities assigned to a trip
 * @access  Private
 */
export const getActivitiesByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const activities = await Activity.find({ trip: tripId }).sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('[Get Activities Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving trip activities',
    });
  }
};

/**
 * @route   DELETE /api/trips/:tripId/activities/:activityId
 * @desc    Remove an activity from a trip
 * @access  Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const activity = await Activity.findOne({ _id: activityId, trip: tripId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity removed successfully',
      deletedId: activityId,
    });
  } catch (error) {
    console.error('[Delete Activity Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error removing activity',
    });
  }
};
