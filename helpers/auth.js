const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ACCESS_TOKEN_SECRET = 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_secret';

const ensureAuthenticated = async (req, res, next) => {
  console.log('Starting ensureAuthenticated middleware');

  console.log('Request Headers:', req.headers);  // Log the entire headers object for debugging

  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);

  const refreshToken = req.headers['x-refresh-token'];
  console.log('Refresh token header:', refreshToken);

  if (!authHeader) {
    console.warn('No authorization header provided');
    return res.status(401).json({ msg: 'Access token is required' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    console.warn('Authorization header is malformed');
    return res.status(401).json({ msg: 'Authorization header is malformed' });
  }

  const token = tokenParts[1];
  console.log('Extracted token from authorization header:', token);

  if (!token) {
    console.warn('No token found in authorization header');
    return res.status(401).json({ msg: 'Access token is required' });
  }

  try {
    console.log('Attempting to verify access token');
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log('Access token successfully verified:', decoded);

    req.user = await User.findById(decoded.user.id);
    console.log('User attached to request object:', req.user);

    return next();
  } catch (error) {
    console.error('Error verifying access token:', error);

    if (error.name === 'TokenExpiredError' && refreshToken) {
      console.log('Access token expired, attempting to verify refresh token');

      try {
        const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        console.log('Refresh token successfully verified:', decodedRefreshToken);

        const newAccessToken = jwt.sign(
          { user: { id: decodedRefreshToken.user.id } },
          ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        );
        console.log('New access token issued:', newAccessToken);

        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        console.log('New access token sent in response headers');

        req.user = await User.findById(decodedRefreshToken.user.id);
        console.log('User attached to request object after refresh:', req.user);

        return next();
      } catch (refreshError) {
        console.error('Error verifying refresh token:', refreshError);
        return res.status(403).json({ msg: 'Invalid or expired refresh token' });
      }
    }

    console.warn('Invalid or expired token, sending 403 response');
    return res.status(403).json({ msg: 'Invalid or expired token' });
  }
};


const checkUser = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.profile = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

const ensureAuthorized = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  // return res.status(401).json({
  //   message: "Unauthorized",
  //   success: false,
  // });
  res.render("unauthorized");
};

module.exports = {
  ensureAuthenticated,
  checkUser,
  ensureAuthorized,
};
