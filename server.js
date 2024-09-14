require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require('fs'); // Make sure to require fs

// Initialize express app
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Set up view engine
app.set("view engine", "ejs");

// Define routes
const router = require("./routes/index");
app.use(router);

// Static file serving
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Routes for authentication
app.use('/auth', require('./routes/auth-routes'));
app.use('/auth/profile', require('./routes/profile-routes'));

// Database connection
const DATABASE = process.env.DATABASE || 'mongodb://localhost:27017/CRM'; // Use environment variable or default to local DB

console.log('Database URI:', DATABASE); // Print the MongoDB URI for debugging

mongoose
  .connect(DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Could not connect to MongoDB...", err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
