const User = require('../models/user');

const updateUserProfilePicture = async (userId, imageUrl) => {
    console.log('Attempting to update profile picture for user:', userId);
    console.log('New image URL:', imageUrl);

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { image: imageUrl },
            { new: true }
        );

        if (!user) {
            console.error('User not found:', userId);
            throw new Error('User not found');
        }

        console.log('Profile picture updated successfully:', user);
        return user;
    } catch (err) {
        console.error('Error updating profile picture:', err);
        throw new Error('Failed to update profile picture');
    }
};

module.exports = {
    updateUserProfilePicture,
};
