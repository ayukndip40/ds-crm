const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/'); // Save images to the 'upload' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Import controllers and other middlewares
const { validationRules, validate } = require("../validations/user-validator");
const {
  showSignupForm,
  showSigninForm,
  signin,
  signup,
  verify,
  logout,
  registerUser,
  loginUser,
  logoutUser,
  profile,
} = require("../controllers/auth-controller");
const { ensureAuthenticated } = require("../helpers/auth");

// Define routes
router.get("/signup", async (req, res) => {
  await showSignupForm();
});

router.get("/signin", async (req, res) => {
  await showSigninForm(req, res);
});

// router.post("/login", async (req, res) => {
//   await signin(req.body, res);
// });

// router.post("/register", validationRules(), validate, async (req, res) => {
//   await signup(req.body, req.body.role, res);
// });

// router.get("/logout", ensureAuthenticated, logout);

router.post('/register', upload.single('file'), registerUser);

router.post('/login', loginUser);

router.post("/verify", verify);

router.post('/logout', ensureAuthenticated, logoutUser);

router.get('/profile', ensureAuthenticated, profile);

module.exports = router;
