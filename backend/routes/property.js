const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Property = require('../models/Property');

// =============== SPECIFIC ROUTES FIRST ===============

// HEALTH CHECK
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Property API is working',
        timestamp: new Date().toISOString()
    });
});

// UTILITY - Fix old properties (run once)
router.get('/fix-old-properties', async (req, res) => {
    try {
        const count = await Property.updateOldProperties();
        res.status(200).json({
            success: true,
            message: `Updated ${count} old properties with default values`,
            count
        });
    } catch (error) {
        console.error('❌ Error fixing old properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// READ - Get all properties (wrapped response)
router.get('/all', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: properties.length,
            properties
        });
    } catch (error) {
        console.error('❌ Error fetching properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// READ - Get properties by admin email
router.get('/my-creations/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log('📋 Fetching properties for:', email);
        
        const properties = await Property.find({ 
            adminEmail: email.toLowerCase().trim() 
        })
        .sort({ updatedAt: -1, createdAt: -1 });
        
        console.log(`✅ Found ${properties.length} properties for ${email}`);
        
        if (properties.length > 0) {
            properties.forEach((prop, index) => {
                console.log(`Property ${index + 1}:`, {
                    id: prop._id,
                    owner: prop.ownerName,
                    bhk: prop.bhk,
                    sqft: prop.squareFeet,
                    type: prop.type
                });
            });
        }
        
        res.status(200).json({
            success: true,
            count: properties.length,
            properties: properties
        });
    } catch (error) {
        console.error('❌ Error fetching properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// =============== ROOT ROUTE ===============
// @route   GET /api/properties
// @desc    Get all properties (for Home page)
// @access  Public
router.get('/', async (req, res) => {
    try {
        console.log('🏠 Home page fetching all properties');
        const properties = await Property.find().sort({ createdAt: -1 });
        
        console.log(`✅ Found ${properties.length} properties for Home page`);
        
        if (properties.length > 0) {
            properties.forEach((prop, index) => {
                console.log(`Home Property ${index + 1}:`, {
                    id: prop._id,
                    title: prop.ownerName,
                    location: prop.bhk,
                    price: prop.rent,
                    type: prop.type
                });
            });
        } else {
            console.log('ℹ️  No properties found in database');
        }
        
        res.status(200).json(properties);
        
    } catch (error) {
        console.error('❌ Error in GET /api/properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch properties for home page',
            error: error.message 
        });
    }
});

// =============== PARAMETERIZED ROUTES LAST ===============

// READ - Get single property by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }
        
        const property = await Property.findById(id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        res.status(200).json({
            success: true,
            property
        });
    } catch (error) {
        console.error('❌ Error fetching property:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// CREATE - Add new property
router.post('/add', async (req, res) => {
    try {
        console.log('📨 Received property data:', {
            ownerName: req.body.ownerName,
            rent: req.body.rent,
            advance: req.body.advance,
            type: req.body.type,
            bhk: req.body.bhk,
            squareFeet: req.body.squareFeet,
            phoneNumber: req.body.phoneNumber,
            photosCount: req.body.photos?.length || 0,
            adminEmail: req.body.adminEmail
        });

        const { 
            ownerName, 
            rent, 
            advance, 
            type, 
            bhk, 
            squareFeet, 
            phoneNumber, 
            photos, 
            adminEmail 
        } = req.body;
        
        // Validate all required fields
        const requiredFields = {
            ownerName, rent, advance, type, bhk, squareFeet, phoneNumber, adminEmail
        };
        
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate photos
        let photoArray = [];
        if (photos && Array.isArray(photos)) {
            photoArray = photos;
        } else if (photos) {
            photoArray = [photos];
        }
        
        // Filter valid base64 images
        photoArray = photoArray.filter(photo => 
            photo && typeof photo === 'string' && photo.startsWith('data:image')
        );

        if (photoArray.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one valid image is required' 
            });
        }

        // Convert numeric fields
        const numericRent = parseFloat(rent);
        const numericAdvance = parseFloat(advance);
        const numericSquareFeet = parseFloat(squareFeet);

        if (isNaN(numericRent) || numericRent <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rent must be a positive number' 
            });
        }

        if (isNaN(numericAdvance) || numericAdvance <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Advance must be a positive number' 
            });
        }

        if (isNaN(numericSquareFeet) || numericSquareFeet < 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Square feet must be at least 100' 
            });
        }

        // Create new property with ALL fields
        const newProperty = new Property({
            ownerName: ownerName.trim(),
            rent: numericRent,
            advance: numericAdvance,
            type: type,
            bhk: bhk,
            squareFeet: numericSquareFeet,
            phoneNumber: phoneNumber.toString().trim(),
            photos: photoArray,
            adminEmail: adminEmail.trim().toLowerCase()
        });

        // Save to database
        const savedProperty = await newProperty.save();
        console.log('✅ Property saved to MongoDB with ID:', savedProperty._id);
        console.log('📊 Property details:', {
            bhk: savedProperty.bhk,
            squareFeet: savedProperty.squareFeet,
            type: savedProperty.type
        });
        
        res.status(201).json({
            success: true,
            message: 'Property added successfully!',
            property: savedProperty,
            propertyId: savedProperty._id
        });
    } catch (error) {
        console.error('❌ Error adding property:', error);
        
        // Handle validation errors
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
            message: 'Server error', 
            error: error.message 
        });
    }
});

// UPDATE - Edit property
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔄 Updating property ID:', id);

        const { 
            ownerName, 
            rent, 
            advance, 
            type, 
            bhk, 
            squareFeet, 
            phoneNumber, 
            photos, 
            adminEmail 
        } = req.body;
        
        // Validate all required fields
        const requiredFields = {
            ownerName, rent, advance, type, bhk, squareFeet, phoneNumber, adminEmail
        };
        
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate photos
        let photoArray = [];
        if (photos && Array.isArray(photos)) {
            photoArray = photos;
        } else if (photos) {
            photoArray = [photos];
        }
        
        photoArray = photoArray.filter(photo => 
            photo && typeof photo === 'string' && photo.startsWith('data:image')
        );

        if (photoArray.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one valid image is required' 
            });
        }

        // Convert numeric fields
        const numericRent = parseFloat(rent);
        const numericAdvance = parseFloat(advance);
        const numericSquareFeet = parseFloat(squareFeet);

        if (isNaN(numericRent) || numericRent <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rent must be a positive number' 
            });
        }

        if (isNaN(numericAdvance) || numericAdvance <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Advance must be a positive number' 
            });
        }

        if (isNaN(numericSquareFeet) || numericSquareFeet < 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Square feet must be at least 100' 
            });
        }

        const updateData = {
            ownerName: ownerName.trim(),
            rent: numericRent,
            advance: numericAdvance,
            type: type,
            bhk: bhk,
            squareFeet: numericSquareFeet,
            phoneNumber: phoneNumber.toString().trim(),
            photos: photoArray,
            adminEmail: adminEmail.trim().toLowerCase(),
            updatedAt: Date.now()
        };

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedProperty) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        console.log('✅ Property updated:', updatedProperty._id);
        console.log('📊 Updated details:', {
            bhk: updatedProperty.bhk,
            squareFeet: updatedProperty.squareFeet,
            type: updatedProperty.type
        });
        
        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            property: updatedProperty
        });
    } catch (error) {
        console.error('❌ Error updating property:', error);
        
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
            message: 'Server error', 
            error: error.message 
        });
    }
});

// DELETE - Remove property
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedProperty = await Property.findByIdAndDelete(id);
        
        if (!deletedProperty) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        console.log('✅ Property deleted:', id);
        
        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting property:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;