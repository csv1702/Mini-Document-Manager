const express = require("express");
const upload = require("../middleware/upload");
const {
  uploadDocuments,
  listDocuments,
  downloadDocument,
  deleteDocument,
} = require("../controllers/document.controller");

const router = express.Router();

// Upload multiple documents
router.post("/", upload.array("files", 10), uploadDocuments);

// List documents
router.get("/", listDocuments);

// Download document (streaming)
router.get("/:id/download", downloadDocument);

router.delete("/:id", deleteDocument);


module.exports = router;
