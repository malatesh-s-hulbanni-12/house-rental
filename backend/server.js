const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Debug: Log environment
console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
if (process.env.MONGO_URI) {
    console.log('MONGO_URI first 50 chars:', process.env.MONGO_URI.substring(0, 50) + '...');
}

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://house-rental1.vercel.app',
    'https://*.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                return origin.endsWith('.vercel.app');
            }
            return allowed === origin;
        })) {
            callback(null, true);
        } else {
            console.log('CORS blocked:', origin);
            callback(null, true); // Temporarily allow for debugging
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== IMPROVED MONGODB CONNECTION =====
const connectDB = async () => {
    try {
        console.log('🔗 Attempting MongoDB connection...');
        
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not set in environment variables');
            return false;
        }
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🏠 Host:', mongoose.connection.host);
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

// Connect to MongoDB
connectDB();

// MongoDB event listeners
mongoose.connection.on('connected', () => {
    console.log('📊 MongoDB connected event fired');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error event:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

// ===== IMPORT ROUTES =====
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
const feedbackRoutes = require('./routes/feedback');

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/feedback', feedbackRoutes);

// ===== DEBUG ENDPOINTS =====
app.get('/api/debug/mongodb', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({
        connectionState: state,
        connectionStatus: states[state],
        mongoUriExists: !!process.env.MONGO_URI,
        mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
        mongoUriFirst50: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 50) + '...' : 'Not set',
        environment: process.env.NODE_ENV || 'not set',
        vercel: process.env.VERCEL ? 'yes' : 'no',
        timestamp: new Date().toISOString()
    });
});

// Health check with more details
app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    
    res.json({ 
        status: 'OK',
        service: 'House Rental Backend',
        database: states[state],
        databaseState: state,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏠 House Rental Backend API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            root: '/',
            api: '/api',
            health: '/api/health',
            debug: '/api/debug/mongodb',
            auth: '/api/auth',
            properties: '/api/properties',
            feedback: '/api/feedback'
        },
        timestamp: new Date().toISOString()
    });
});

// API base route
app.get('/api', (req, res) => {
    res.json({
        message: 'House Rental API v1.0',
        available_endpoints: [
            'GET    /api/health - Health check',
            'GET    /api/debug/mongodb - Debug MongoDB connection',
            'POST   /api/auth/register - Register user',
            'POST   /api/auth/login - Login user',
            'GET    /api/properties - Get all properties',
            'POST   /api/properties - Create property',
            'GET    /api/feedback - Get feedback',
            'POST   /api/feedback - Submit feedback'
        ]
    });
});

// ===== VERCEL COMPATIBILITY =====
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
    console.log('🚀 Running on Vercel - exporting app');
    module.exports = app;
} else {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log(`🌐 Environment: Development`);
        console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
    });
}