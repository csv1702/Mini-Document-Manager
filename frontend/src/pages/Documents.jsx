import { useEffect, useState } from "react";
import {
  fetchDocuments,
  downloadDocument,
  deleteDocument,
} from "../services/api";
import UploadDocuments from "../components/UploadDocuments";

/* ---------- Helper: File Type Icons ---------- */
const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx"].includes(ext)) return "📊";
  if (["png", "jpg", "jpeg"].includes(ext)) return "🖼️";

  return "📁";
};

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search (controlled + submit-on-enter)
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [summary, setSummary] = useState({
    totalDocuments: 0,
    totalSize: 0,
  });

  /* ---------- Load Documents ---------- */
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetchDocuments({
        page,
        pageSize: 5,
        q: searchQuery,
        sortBy,
        sortOrder,
      });

      setDocuments(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setSummary(res.data.summary);

      setError("");
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, searchQuery, sortBy, sortOrder]);

  /* ---------- Download ---------- */
  const handleDownload = async (id, title) => {
    const res = await downloadDocument(id);
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    a.click();
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    await deleteDocument(id);
    loadDocuments();
  };

  /* ---------- Loading State ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 animate-pulse">Loading documents...</p>
      </div>
    );
  }

  /* ---------- Error State ---------- */
  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";

    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Mini Document Manager
        </h1>
        <p className="text-gray-500 text-sm">
          Upload, manage, search and download your documents
        </p>
      </div>

      {/* Upload Section */}
      <UploadDocuments onUploadSuccess={loadDocuments} />

      {/* Search + Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-5">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by file name and press Enter..."
          className="border p-2 rounded w-full md:w-1/2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setSearchQuery(searchInput);
            }
          }}
        />

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => {
            setPage(1);
            setSortBy(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="createdAt">Upload Date</option>
          <option value="title">File Name</option>
          <option value="size">File Size</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setPage(1);
            setSortOrder(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No documents found. Upload your first document to get started.
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
            <span>
              Showing {documents.length} of {summary.totalDocuments} documents
            </span>
            <span>Total size: {formatSize(summary.totalSize)}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-700">
                  <th className="p-3 text-left">Document</th>
                  <th className="p-3 text-center">Size (KB)</th>
                  <th className="p-3 text-center">Uploaded</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <span>{getFileIcon(doc.title)}</span>
                      <span className="text-gray-800">{doc.title}</span>
                    </td>

                    <td className="p-3 text-center text-sm">
                      {(doc.size / 1024).toFixed(1)}
                    </td>

                    <td className="p-3 text-center text-sm text-gray-600">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-center text-sm">
                      <button
                        onClick={() => handleDownload(doc._id, doc.title)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Documents;
