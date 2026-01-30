const express = require('express');
const router = express.Router();

// Simple admin login (as per your requirement - store in frontend env)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // In production, this should be in backend .env and check against database
    // For now, we'll just return success for any valid request
    // You can add your validation logic here
    
    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
            email: email,
            role: 'admin'
        }
    });
});

module.exports = router;