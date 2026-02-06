const express = require("express");
const Document = require("../models/Document");

const router = express.Router();

router.get("/test-db", async (req, res) => {
  try {
    const count = await Document.countDocuments();
    res.json({
      message: "Database connected successfully",
      documentsInDB: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
