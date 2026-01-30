const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware with increased limits for base64 images
// Updated CORS configuration - Replace the above code with:
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'https://house-rental1.vercel.app', // Your production frontend
    'https://house-rental1-git-main-*.vercel.app', // Vercel preview deployments
    'https://*.vercel.app' // All Vercel domains
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.some(allowed => {
            // Handle wildcard patterns
            if (allowed.includes('*')) {
                const pattern = allowed.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowed === origin;
        })) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// ===== ADD THESE ROUTES =====
// Root route for Vercel (fixes "Cannot GET /")
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏠 House Rental Backend API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            properties: '/api/properties',
            feedback: '/api/feedback'
        },
        documentation: 'Use the endpoints above to interact with the API',
        timestamp: new Date().toISOString()
    });
});

// API base route
app.get('/api', (req, res) => {
    res.json({
        message: 'House Rental API v1.0',
        available_endpoints: [
            'GET    /api/health',
            'POST   /api/auth/register',
            'POST   /api/auth/login',
            'GET    /api/properties',
            'POST   /api/properties',
            'GET    /api/feedback',
            'POST   /api/feedback'
        ]
    });
});

// ===== VERCEL COMPATIBILITY =====
// Check if running on Vercel or locally
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
    // Export for Vercel serverless function
    module.exports = app;
} else {
    // Start server locally
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log(`🌐 Environment: Development`);
    });
}