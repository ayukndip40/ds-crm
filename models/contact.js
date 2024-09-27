const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    image: {
      type: String,
      default: "no-image.png",
    },
  },
  { timestamps: true }
);

contactSchema.index({ name: 1, phone: 1, email: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
