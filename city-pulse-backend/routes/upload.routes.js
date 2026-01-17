const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

// Upload multiple images
router.post('/images', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Return URLs of uploaded images
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        res.status(200).json({ imageUrls });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ message: 'Server error during file upload' });
    }
});

module.exports = router;