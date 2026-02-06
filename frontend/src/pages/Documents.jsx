import { useEffect, useState } from "react";
import { fetchDocuments, downloadDocument } from "../services/api";
import UploadDocuments from "../components/UploadDocuments";

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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <UploadDocuments onUploadSuccess={loadDocuments} />

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

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents found</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2">Size (KB)</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id} className="border-t">
                <td className="p-2">{doc.title}</td>
                <td className="p-2 text-center">
                  {(doc.size / 1024).toFixed(1)}
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
      )}

      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
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
    </div>
  );
}

export default Documents;
