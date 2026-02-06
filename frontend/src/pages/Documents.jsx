import { useEffect, useState } from "react";
import { fetchDocuments, downloadDocument } from "../services/api";
import UploadDocuments from "../components/UploadDocuments";

// Helper: file type icons
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
  const [search, setSearch] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetchDocuments({
        page,
        pageSize: 5,
        q: search,
      });
      setDocuments(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setError("");
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, search]);

  const handleDownload = async (id, title) => {
    const res = await downloadDocument(id);
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    a.click();
  };

  // Loading state (skeleton / pulse)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 animate-pulse">Loading documents...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mini Document Manager</h1>

      {/* Upload Section */}
      <UploadDocuments onUploadSuccess={loadDocuments} />

      {/* Search */}
      <input
        type="text"
        placeholder="Search documents..."
        className="border p-2 w-full mb-4 rounded"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {/* Empty State */}
      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No documents found. Upload your first document to get started.
        </p>
      ) : (
        <>
          {/* Document Table */}
          <table className="w-full border rounded overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-center">Size (KB)</th>
                <th className="p-2 text-center">Uploaded</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="p-2 flex items-center gap-2">
                    <span>{getFileIcon(doc.title)}</span>
                    <span>{doc.title}</span>
                  </td>

                  <td className="p-2 text-center">
                    {(doc.size / 1024).toFixed(1)}
                  </td>

                  <td className="p-2 text-center text-sm text-gray-600">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDownload(doc._id, doc.title)}
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
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
