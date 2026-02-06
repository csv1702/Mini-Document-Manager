const express = require("express");
const upload = require("../middleware/upload");
const {
  uploadDocuments,
  listDocuments,
} = require("../controllers/document.controller");

const router = express.Router();

// Upload multiple documents
router.post("/", upload.array("files", 10), uploadDocuments);

// List documents with pagination, sorting, search
router.get("/", listDocuments);

module.exports = router;
