const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const { welcomeSender, forgotPasswordSender } = require("../mailers/senders");
const path = require("path");

const showSignupForm  = async (req, res) => {
    res.render('signup');
}

const showSigninForm  = async (req, res) => {
    res.render('login');
}

const registerUser = async (req, res) => {
  console.log("registerUser function called.");
  
  const { name, email, contact, password, gender, country, city } = req.body;
  console.log(`Received registration data: name=${name}, email=${email}, contact=${contact}, gender=${gender}, country=${country}, city=${city}`);

  const image = req.file; // Access the uploaded image file
  console.log(`Image received: ${image ? image.originalname : 'No image uploaded'}`);

  try {
    // Validation checks
    console.log("Starting validation checks.");

    if (await validateEmail(email)) {
      console.log(`Validation failed: Email ${email} is already taken.`);
      return res.status(400).json({ email: "Email is already taken", message: "Email is already taken", success: false });
    }

    if (await validateName(name)) {
      console.log(`Validation failed: Name ${name} is already taken.`);
      return res.status(400).json({ name: "Name is already taken", message: "Name is already taken", success: false });
    }

    if (await validateNumber(contact)) {
      console.log(`Validation failed: Contact number ${contact} is already taken.`);
      return res.status(400).json({ number: "Number is already taken", message: "Number is already taken", success: false });
    }

    if (!['M', 'F'].includes(gender)) {
      console.log(`Validation failed: Invalid gender value ${gender}.`);
      return res.status(400).json({ gender: "Invalid gender value", message: "Registration failure", success: false });
    }

    if (!country || !city) {
      console.log("Validation failed: Country and city are required.");
      return res.status(400).json({ country: "Country is required", city: "City is required", message: "Registration failure", success: false });
    }

    console.log("All validation checks passed.");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Password hashed successfully for user ${email}.`);

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 1000000);
    console.log(`Verification code generated: ${verificationCode}`);

    // Get image path
    const imageUrl = image ? image.path : null;
    if (image) {
      console.log(`Image uploaded successfully for user ${email}. Saved at ${imageUrl}`);
    } else {
      console.log("No image uploaded.");
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      contact,
      password: hashedPassword,
      gender,
      country,
      city,
      verificationCode,
      image: imageUrl // Save the image path
    });

    console.log("Attempting to save new user to the database.");
    
    // Save new user to the database
    await newUser.save();
    console.log(`New user created successfully with email ${email}.`);

    // Redirect to verification form
    console.log("Redirecting to /verify.");
    return res.status(200).json({ message: "Registration successful! Please check your email for verification.", success: true });
  } catch (err) {
    console.error(`Error during registration: ${err.message}`);
    console.log(err);
    return res.status(500).json({ message: err.message, success: false });
  }
};


const ACCESS_TOKEN_SECRET = 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_secret';

// Function to generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { user: { id: user._id, email: user.email } },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { user: { id: user._id, email: user.email } },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Login function
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Incorrect email",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Incorrect password",
        success: false,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Prepare user profile
    const profile = {
      email: user.email,
      role: user.role,
      name: user.name,
      id: user._id,
      image:user.image,
    };

    // Send back tokens and profile information
    res.json({
      success: true,
      accessToken,
      refreshToken,
      profile
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};


const signup = async (data, role, res) => {
  try {
    const userTaken = await validateEmail(data.email);
    if (userTaken) {
      return res.status(400).json({
        email: "Email is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const nameTaken = await validateName(data.name);
    if (nameTaken) {
      return res.status(400).json({
        name: "Name is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const numberTaken = await validateNumber(data.contact);
    if (numberTaken) {
      return res.status(400).json({
        number: "Number is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const code = crypto.randomInt(100000, 1000000);
    const newUser = new User({
      ...data,
      password: hashedPassword,
      verificationCode: code,
      role,
    });
    await newUser.save();
    welcomeSender(newUser.email, newUser.name, newUser.verificationCode);
    return res.status(201).json({
      message: "Account successfully created",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const signin = async (data, res) => {
  try {
    let { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Failed login attempt",
        email: "Incorrect email",
        success: false,
      });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = jwt.sign(
        {
          user_id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "3h",
        }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
      });

      let profile = {
        email: user.email,
        role: user.role,
        name: user.name,
        id: user._id,
      };

      let result = {
        user: profile,
        token: token,
        expiresIn: "72h",
      };
      return res.status(200).json({
        ...result,
        message: "Login success",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: "Failed login attempt",
        email: "Incorrect password",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

//const logout = async (req, res) => {
//  res.clearCookie("jwt");
//  res.redirect("/signin");
//};

const logoutUser = (req, res) => {
  console.log('Logout request received');

  try {
    // Clear the JWT cookie
    console.log('Clearing JWT cookie');
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    console.log('JWT cookie cleared');

    // Optionally, you might want to clear other cookies or session data here
    // e.g., res.clearCookie('anotherCookie');

    // Redirect to the login page
    console.log('Redirecting to /login');
    res.redirect('/login');
  } catch (err) {
    console.error('Error during logout:', err);
    // Send an error response if needed
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};


const verify = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      console.log("Verification failed: No code provided.");
      return res.status(400).json({
        message: "Verification code is required",
        success: false,
      });
    }

    // Find user by verification code
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      console.log(`Verification failed: Invalid verification code ${code}.`);
      return res.status(404).json({
        message: "Invalid verification code",
        success: false,
      });
    }

    if (user.isEmailVerified) {
      console.log(`Verification failed: Email for code ${code} is already verified.`);
      return res.status(409).json({
        message: "Email already verified",
        success: false,
      });
    }

    // Mark user as verified
    user.isEmailVerified = true;
    user.verificationCode = null; // Optionally clear the verification code
    await user.save();
    
    console.log(`Verification successful: Email for code ${code} has been verified.`);
    return res.redirect('/login'); // Redirect to login page after successful verification

  } catch (err) {
    console.error(`Error during verification: ${err.message}`);
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const profile = async (req, res) => {
  try {
    // Extract user ID from request object (e.g., added by authentication middleware)
    const userId = req.user.id;
    console.log('Extracted user ID from request:', userId); // Log the user ID

    // Check if user ID exists
    if (!userId) {
      console.warn('No user ID found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.warn('User not found for ID:', userId); // Log if user is not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Log user profile data being sent
    console.log('User profile data:', {
      email: user.email,
      name: user.name,
      role: user.role,
      contact:user.contact,
      profilePicture: user.image,
      notifications: user.notifications,
      messages: user.messages,
    });

    // Send back user profile data
    return res.status(200).json({
      success: true,
      message: 'User profile',
      profile: {
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.image,
        contact:user.contact,
        notifications: user.notifications,
        messages: user.messages,
      }
    });
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Error fetching user profile:', err);

    // Send back error response
    return res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' 
    });
  }
}

const validateEmail = async (email) => {
  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log(`Email validation failed: ${email} is already taken.`);
      return true;
    } else {
      console.log(`Email validation passed: ${email} is available.`);
      return false;
    }
  } catch (error) {
    console.error(`Error during email validation: ${error.message}`);
    throw error; // Re-throw the error to handle it upstream if needed
  }
};

const validateName = async (name) => {
  try {
    let user = await User.findOne({ name });
    if (user !== null) {
      console.log(`Name validation failed: ${name} is already taken.`);
      return true;
    } else {
      console.log(`Name validation passed: ${name} is available.`);
      return false;
    }
  } catch (error) {
    console.error(`Error during name validation: ${error.message}`);
    throw error; // Re-throw the error to handle it upstream if needed
  }
};

const validateNumber = async (contact) => {
  try {
    let user = await User.findOne({ contact });
    if (user !== null) {
      console.log(`Contact number validation failed: ${contact} is already taken.`);
      return true;
    } else {
      console.log(`Contact number validation passed: ${contact} is available.`);
      return false;
    }
  } catch (error) {
    console.error(`Error during contact number validation: ${error.message}`);
    throw error; // Re-throw the error to handle it upstream if needed
  }
};


module.exports = {
  showSigninForm,
  showSignupForm,
  signin,
  signup,
  verify,
  registerUser,
  loginUser,
  logoutUser,
  profile,
};
