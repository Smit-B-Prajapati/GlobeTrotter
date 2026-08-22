import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';
import Activity from '../models/Activity.js';

/**
 * Helper to check trip ownership
 */
const checkTripOwnership = async (tripId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return { error: 'Invalid trip ID format', status: 400 };
  }
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };
  if (trip.user.toString() !== userId.toString()) {
    return { error: 'Not authorized to access budget data for this trip', status: 403 };
  }
  return { trip };
};

/**
 * @route   GET /api/trips/:tripId/budget
 * @desc    Get complete budget metrics, category breakdown, and expense list
 * @access  Private
 */
export const getBudgetSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { error, status, trip } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // 1. Calculate number of trip days
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate || trip.startDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // 2. Fetch recorded expenses
    const expenses = await Expense.find({ trip: tripId }).sort({ date: -1 });

    // 3. Fetch scheduled activities to integrate activity costs
    const activities = await Activity.find({ trip: tripId });
    const totalActivitiesCost = activities.reduce((sum, act) => sum + (act.cost || 0), 0);

    // 4. Calculate Category Totals
    const categories = {
      Transportation: 0,
      Accommodation: 0,
      Food: 0,
      Activities: totalActivitiesCost,
      Other: 0,
    };

    expenses.forEach((exp) => {
      const cat = exp.category;
      if (categories[cat] !== undefined) {
        categories[cat] += Number(exp.amount || 0);
      } else {
        categories['Other'] += Number(exp.amount || 0);
      }
    });

    // 5. Total Trip Cost & Average Daily Cost
    const totalCost = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const averageCostPerDay = parseFloat((totalCost / totalDays).toFixed(2));

    // 6. Budget Alert Check
    const budgetLimit = trip.budgetLimit || 0;
    const isOverBudget = budgetLimit > 0 && totalCost > budgetLimit;
    const remainingBudget = budgetLimit > 0 ? budgetLimit - totalCost : null;

    res.status(200).json({
      success: true,
      trip: {
        _id: trip._id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budgetLimit,
      },
      metrics: {
        totalCost,
        totalDays,
        averageCostPerDay,
        budgetLimit,
        isOverBudget,
        remainingBudget,
        exceededAmount: isOverBudget ? totalCost - budgetLimit : 0,
      },
      categories,
      expenses,
    });
  } catch (error) {
    console.error('[Get Budget Summary Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error calculating budget summary',
    });
  }
};

/**
 * @route   POST /api/trips/:tripId/expenses
 * @desc    Add a new expense item to trip
 * @access  Private
 */
export const addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { category, amount, description, date } = req.body;

    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (!category || amount === undefined || amount === null || !date) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and date are required',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be greater than 0',
      });
    }

    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense date format',
      });
    }

    const expense = await Expense.create({
      trip: tripId,
      category,
      amount: Number(amount),
      description: description ? description.trim() : '',
      date: expenseDate,
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense,
    });
  } catch (error) {
    console.error('[Add Expense Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding expense',
    });
  }
};

/**
 * @route   PUT /api/trips/:tripId/expenses/:expenseId
 * @desc    Update an existing expense item
 * @access  Private
 */
export const updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID format' });
    }

    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    let expense = await Expense.findOne({ _id: expenseId, trip: tripId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const { category, amount, description, date } = req.body;

    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (description !== undefined) expense.description = description.trim();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        expense.date = parsedDate;
      }
    }

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense record updated successfully',
      expense,
    });
  } catch (error) {
    console.error('[Update Expense Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating expense',
    });
  }
};

/**
 * @route   DELETE /api/trips/:tripId/expenses/:expenseId
 * @desc    Delete an expense item
 * @access  Private
 */
export const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID format' });
    }

    const { error, status } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const expense = await Expense.findOne({ _id: expenseId, trip: tripId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully',
      deletedId: expenseId,
    });
  } catch (error) {
    console.error('[Delete Expense Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense',
    });
  }
};

/**
 * @route   PUT /api/trips/:tripId/budget-limit
 * @desc    Update trip target budget limit
 * @access  Private
 */
export const updateBudgetLimit = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { budgetLimit } = req.body;

    const { error, status, trip } = await checkTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    trip.budgetLimit = Number(budgetLimit) >= 0 ? Number(budgetLimit) : 0;
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip budget limit updated successfully',
      budgetLimit: trip.budgetLimit,
    });
  } catch (error) {
    console.error('[Update Budget Limit Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating budget limit',
    });
  }
};
