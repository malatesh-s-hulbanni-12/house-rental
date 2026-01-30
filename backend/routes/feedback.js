// routes/feedback.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Feedback Schema - FIXED propertyDetails type
const feedbackSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: [true, 'Property ID is required'],
    trim: true
  },
  propertyTitle: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  feedback: {
    type: String,
    required: [true, 'Feedback text is required'],
    trim: true,
    minlength: [5, 'Feedback must be at least 5 characters long']
  },
  photo: {
    type: String, // For base64 image
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // FIXED: propertyDetails should be an Object, not String
  propertyDetails: {
    type: Object, // Changed from String to Object
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received feedback:', {
      propertyId: req.body.propertyId,
      propertyTitle: req.body.propertyTitle,
      feedbackLength: req.body.feedback?.length,
      hasPhoto: !!req.body.photo,
      photoSize: req.body.photo ? `${Math.round(req.body.photo.length / 1024)}KB` : 'No photo',
      propertyDetails: req.body.propertyDetails
    });
    
    // Extract ALL fields from request body
    const { 
      propertyId, 
      propertyTitle, 
      feedback, 
      photo,
      propertyDetails 
    } = req.body;
    
    // Validation
    if (!propertyId || !propertyId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }
    
    if (!propertyTitle || !propertyTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Property title is required'
      });
    }
    
    if (!feedback || !feedback.trim() || feedback.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must be at least 5 characters long'
      });
    }
    
    // Create new feedback WITH propertyDetails as object
    const newFeedback = new Feedback({
      propertyId: propertyId.trim(),
      propertyTitle: propertyTitle.trim(),
      feedback: feedback.trim(),
      photo: photo || null,
      propertyDetails: propertyDetails || {}, // Ensure it's an object
      status: 'pending'
    });
    
    await newFeedback.save();
    
    console.log('✅ Feedback saved:', newFeedback._id);
    console.log('📊 Feedback details:', {
      hasPhoto: !!newFeedback.photo,
      property: newFeedback.propertyTitle,
      status: newFeedback.status,
      propertyDetailsType: typeof newFeedback.propertyDetails
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: newFeedback,
      feedbackId: newFeedback._id
    });
    
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (for admin)
// @access  Public (you should add authentication later)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all feedback');
    
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${feedbacks.length} feedback entries`);
    
    // Return full feedback objects
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/property/:propertyId
// @desc    Get feedback for specific property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log('📋 Fetching feedback for property:', propertyId);
    
    const feedbacks = await Feedback.find({ propertyId }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${feedbacks.length} feedback for property ${propertyId}`);
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
    
  } catch (error) {
    console.error('❌ Error fetching property feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status
// @access  Public (add authentication)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating feedback ${id} status to:`, status);
    
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, reviewed, or resolved'
      });
    }
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    console.log('✅ Feedback status updated:', updatedFeedback._id);
    
    res.status(200).json({
      success: true,
      message: `Feedback marked as ${status}`,
      feedback: updatedFeedback
    });
    
  } catch (error) {
    console.error('❌ Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: error.message
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Public (add authentication)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting feedback:', id);
    
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    
    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    console.log('✅ Feedback deleted:', id);
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: 'pending' });
    const reviewed = await Feedback.countDocuments({ status: 'reviewed' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Feedback.countDocuments({ createdAt: { $gte: today } });
    
    // Count feedbacks with photos
    const withPhotos = await Feedback.countDocuments({ photo: { $ne: null } });
    
    console.log('📊 Feedback stats:', { total, pending, reviewed, resolved, today: todayCount, withPhotos });
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        reviewed,
        resolved,
        today: todayCount,
        withPhotos
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get single feedback by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      feedback
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, photo, status } = req.body;
    
    const updateData = {};
    if (feedback !== undefined) updateData.feedback = feedback;
    if (photo !== undefined) updateData.photo = photo;
    if (status !== undefined) updateData.status = status;
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });
    
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feedback API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;