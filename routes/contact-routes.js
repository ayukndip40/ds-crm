const express = require("express");
const { ensureAuthenticated } = require("../helpers/auth");
const {
  upload,
  createContact,
  getContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const router = express.Router();

router.post(
  "/contacts",
  ensureAuthenticated,
  upload.single("image"),
  createContact
);
router.get("/contacts", ensureAuthenticated, getContacts);
router.get("/contacts/:id", ensureAuthenticated, getContact);
router.put("/contacts/:id", ensureAuthenticated, updateContact);
router.delete("/contacts/:id", ensureAuthenticated, deleteContact);

module.exports = router;
