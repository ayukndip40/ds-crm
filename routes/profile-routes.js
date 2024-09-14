const express = require('express');
const multer = require('multer');
const { handleProfilePictureUpload } = require('../controllers/profileController');
const { ensureAuthenticated } = require("../helpers/auth");
const router = express.Router();
const upload = multer({ dest: 'upload/' });

router.post('/upload-profile-picture', ensureAuthenticated, upload.single('profilePicture'), handleProfilePictureUpload);

module.exports = router;
