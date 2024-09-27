const Contact = require("../models/contact");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
  },
});

// Initialize Multer
const upload = multer({ storage });

const createContact = (req, res) => {
  console.log("Request Body:", req.body);
  const { name, phone, email, gender, country, city, address } = req.body;
  const image = req.file ? req.file.path : null; // Get the image path from the uploaded file
  console.log("Destructured Fields:", {
    name,
    phone,
    email,
    gender,
    country,
    city,
    address,
    image,
  });

  const userId = req.user.id;
  console.log("User ID:", userId);

  const contact = new Contact({
    name,
    phone,
    email,
    gender,
    country,
    city,
    address,
    image,
    userId,
  });
  console.log("New Contact Instance:", contact);

  contact
    .save()
    .then((contact) => {
      console.log("Contact Saved:", contact);
      res.status(201).json(contact);
    })
    .catch((err) => {
      console.log("Error Saving Contact:", err);
      res.status(400).json({ error: err.message });
    });
};

const getContacts = async (req, res) => {
  console.log("Fetching all contacts");
  try {
    const contacts = await Contact.find();
    console.log("Contacts Retrieved:", contacts);
    res.status(200).json(contacts);
  } catch (err) {
    console.log("Error Fetching Contacts:", err);
    res
      .status(400)
      .json({ message: "An error occurred when getting the contacts" });
  }
};

const getContact = async (req, res) => {
  console.log("Fetching contact with ID:", req.params.id);
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      console.log("Contact not found");
      return res.status(404).json({ message: "Contact not found" });
    }
    console.log("Contact Retrieved:", contact);
    res.status(200).json(contact);
  } catch (err) {
    console.log("Error Fetching Contact:", err);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const updateContact = async (req, res) => {
  console.log("Updating contact with ID:", req.params.id);
  console.log("Update Data:", req.body);
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact) {
      console.log("Contact not found for update");
      return res.status(404).json({ message: "Contact not found" });
    }
    console.log("Contact Updated:", contact);
    res.status(200).json(contact);
  } catch (err) {
    console.log("Error Updating Contact:", err);
    res
      .status(400)
      .json({ message: "An error occurred when updating the contact" });
  }
};

const deleteContact = async (req, res) => {
  const contactId = req.params.id;
  console.log("Deleting contact with ID:", contactId);

  try {
    // Check if the contact exists
    const contactExists = await Contact.findById(contactId);
    if (!contactExists) {
      console.log("Contact not found for deletion");
      return res.status(404).json({ message: "Contact not found" });
    }

    // Proceed with deletion
    const deletedContact = await Contact.findByIdAndDelete(contactId);
    console.log("Contact Deleted:", deletedContact);
    res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    console.log("Error Deleting Contact:", err);
    res.status(500).json({ message: "Internal Server error" });
  }
};

module.exports = {
  upload,
  createContact,
  getContact,
  getContacts,
  updateContact,
  deleteContact,
};
