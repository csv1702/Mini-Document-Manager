const Document = require("../models/Document");

const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const documents = req.files.map((file) => ({
      title: file.originalname,
      filename: file.filename,
      filepath: file.path,
      size: file.size,
    }));

    const savedDocs = await Document.insertMany(documents);

    res.status(201).json({
      message: "Documents uploaded successfully",
      documents: savedDocs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const searchQuery = req.query.q || "";

    const filter = {
      title: { $regex: searchQuery, $options: "i" },
    };

    const total = await Document.countDocuments(filter);

    const documents = await Document.find(filter)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      data: documents,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadDocuments,
  listDocuments,
};