import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadDocuments = (formData) =>
  api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchDocuments = (params) =>
  api.get("/documents", { params });

export const downloadDocument = (id) =>
  api.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
