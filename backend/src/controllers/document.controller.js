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
    const sortBy = req.query.sortBy || "createdAt";
    const searchQuery = req.query.q || "";

    const filter = {
      title: { $regex: searchQuery, $options: "i" },
    };

    const total = await Document.countDocuments(filter);

    // 🔹 Aggregate total size (ALL matching docs, not just current page)
    const totalSizeAggregation = await Document.aggregate([
  {
    $group: {
      _id: null,
      totalSize: { $sum: "$size" },
    },
  },
]);

const totalSize =
  totalSizeAggregation.length > 0
    ? totalSizeAggregation[0].totalSize
    : 0;


    const documents = await Document.find(filter)
      .sort({ [sortBy]: sortOrder })
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
      summary: {
        totalDocuments: total,
        totalSize,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const fs = require("fs");
const path = require("path");

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.resolve(document.filepath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.title}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    await document.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  uploadDocuments,
  listDocuments,
  downloadDocument,
  deleteDocument,
};