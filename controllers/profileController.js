const uploadProfilePicture = require('../service/userService').updateUserProfilePicture;
const path = require('path');
const fs = require('fs');

const handleProfilePictureUpload = async (req, res) => {
    try {
        // Ensure `user` is attached to the request object (from middleware)
        const user = req.user; // Assuming this is how user data is attached
        
        if (!user || !user._id) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const userId = user._id;
        const file = req.file; // The file object from multer

        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Construct image URL or path
        const imageUrl = path.join('upload', file.filename);

        // Update user profile picture
        const updatedUser = await uploadProfilePicture(userId, imageUrl);

        // Respond with success and new image URL
        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            imageUrl: imageUrl, // Send the new image URL back to the client
            user: updatedUser
        });
    } catch (err) {
        console.error('Error during profile picture upload:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile picture' });
    }
};

module.exports = {
    handleProfilePictureUpload,
};
