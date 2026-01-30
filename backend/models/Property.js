const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    rent: {
        type: Number,
        required: [true, 'Rent amount is required'],
        min: [0, 'Rent must be positive']
    },
    advance: {
        type: Number,
        required: [true, 'Advance amount is required'],
        min: [0, 'Advance must be positive']
    },
    type: {
        type: String,
        required: [true, 'Property type is required'],
        enum: {
            values: ['Lease', 'Rent'],
            message: 'Type must be either Lease or Rent'
        }
    },
    bhk: {
        type: String,
        required: [true, 'BHK type is required'],
        enum: {
            values: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio'],
            message: 'Please select a valid BHK type'
        }
    },
    squareFeet: {
        type: Number,
        required: [true, 'Square feet is required'],
        min: [100, 'Minimum 100 square feet required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9+\-\s()]{10,15}$/, 'Please enter a valid phone number']
    },
    photos: [{
        type: String,
        required: [true, 'At least one photo is required'],
        validate: {
            validator: function(v) {
                return v.startsWith('data:image');
            },
            message: 'Photos must be valid base64 image strings'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    adminEmail: {
        type: String,
        required: [true, 'Admin email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    }
}, {
    timestamps: true // This will auto-create createdAt and updatedAt
});

// Middleware to handle updates
propertySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Ensure bhk and squareFeet exist (for old documents)
    if (!this.bhk) {
        this.bhk = '1 BHK';
    }
    if (!this.squareFeet) {
        this.squareFeet = 1000;
    }
    
    next();
});

// Static method to update old properties
propertySchema.statics.updateOldProperties = async function() {
    const oldProperties = await this.find({
        $or: [
            { bhk: { $exists: false } },
            { squareFeet: { $exists: false } }
        ]
    });
    
    for (const property of oldProperties) {
        await this.findByIdAndUpdate(property._id, {
            bhk: property.bhk || '1 BHK',
            squareFeet: property.squareFeet || 1000
        });
    }
    
    return oldProperties.length;
};

module.exports = mongoose.model('Property', propertySchema);