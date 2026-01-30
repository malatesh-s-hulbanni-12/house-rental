const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware with increased limits for base64 images
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB with better settings
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/house-rental', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Test MongoDB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('📊 Connected to MongoDB database');
});

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});
// server.js - Add after property routes
const feedbackRoutes = require('./routes/feedback');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/feedback', feedbackRoutes); // Add this line

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});