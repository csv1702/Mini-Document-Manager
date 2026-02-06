# Mini Document Manager

A comprehensive full-stack document management system that enables users to efficiently upload, organize, search, sort, download, and manage documents in a cloud-based environment.

This project was developed as part of a Full-Stack Intern Assignment and emphasizes clean API architecture, separation of concerns, and intuitive user experience design.

---

## 🌐 Live Demo

- **Frontend (Vercel):** https://YOUR-FRONTEND-URL.vercel.app
- **Backend API (Render):** https://YOUR-BACKEND-URL.onrender.com

> **Note:** The backend employs local disk storage for uploaded files, which is mounted as a persistent volume on Render to ensure data persistence across deployments.

---

## 🛠️ Technology Stack

### Frontend

- **React** (via Vite bundler for optimal performance)
- **Tailwind CSS** (utility-first CSS framework)
- **Axios** (HTTP client for API integration)

### Backend

- **Node.js** (JavaScript runtime)
- **Express.js** (web application framework)
- **MongoDB Atlas** (cloud database service)
- **Multer** (middleware for multipart form data handling)
- **Node.js fs module** with streaming (`fs.createReadStream`) for efficient file handling

### Storage Architecture

- **Metadata Storage:** MongoDB Atlas (document properties, upload timestamps, etc.)
- **File Storage:** Local disk (`/uploads` directory) with configurable disk quotas

---

## ✨ Key Features

### Document Management

- **Bulk Upload Capability** – Upload multiple documents in a single request for improved efficiency
- **Comprehensive Document Listing** with the following details:
  - Document title/filename
  - File size (formatted for readability)
  - Upload timestamp
  - Quick access download and delete options

### Search & Organization

- **Server-side Pagination** – Configurable page size for optimal performance
- **Advanced Sorting** – Sort documents by creation date, title, or file size
- **Text Search** – Full-text search across document titles
- **Upload Progress Indicator** – Real-time feedback during file uploads

### User Experience

- **Responsive State Management** – Loading, empty, and error states with appropriate messaging
- **File Type Icons** – Visual indicators for different document types (PDF, Word, images, etc.)
- **Summary Dashboard** – Display total document count and aggregate storage usage
- **Streaming Downloads** – Efficient file transfers without loading entire files into memory

---

## 🏗️ Architecture Overview

### Design Philosophy

This system implements a **separation of concerns** pattern by isolating file storage and metadata management into distinct layers:

- **File Storage** – Binary documents are persisted on the local disk (or cloud storage like S3 in production)
- **Metadata Storage** – Document properties are maintained in MongoDB for efficient querying
- **Client-Server Communication** – RESTful API enables seamless data exchange and file streaming

### System Components

The architecture diagram below illustrates the interaction between frontend components, backend services, and storage layers:

![System Architecture Diagram](./Architecture%20Diagram.png)

**Key architectural elements:**

- React-based frontend communicates with Express.js API endpoints
- MongoDB stores document metadata with full-text search capabilities
- Local file system maintains binary document content
- Streaming mechanisms optimize memory usage during upload/download operations
- Separation allows for independent scaling of storage and metadata services

---

## 📡 API Reference

### 1. Upload Documents

```
POST /api/documents
Content-Type: multipart/form-data
```

**Request Parameters:**

- `files` (multipart) – Array of document files to upload (supports multiple files)

**Response:**

- Status `201 Created` with metadata for uploaded documents
- File size limits enforced to prevent abuse and manage storage

**Use Case:** Users select one or more files and submit them in a single request for batch processing.

---

### 2. List Documents

```
GET /api/documents
```

**Query Parameters:**

- `page` – Page number for pagination (default: 1)
- `pageSize` – Number of documents per page (default: 10)
- `q` – Text search query (searches document titles)
- `sortBy` – Sort field: `createdAt`, `title`, or `size`
- `sortOrder` – Sort direction: `asc` or `desc`

**Response:**

- Returns paginated list of documents with metadata
- Includes total count and pagination metadata

**Example:** `GET /api/documents?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&q=report`

---

### 3. Download Document (Streaming)

```
GET /api/documents/{id}/download
```

**Path Parameters:**

- `id` – Unique identifier of the document

**Response:**

- File streamed directly to client (chunked for efficiency)
- Preserves original filename and MIME type

**Performance Benefit:** Streaming prevents loading entire files into memory, enabling support for large files.

---

### 4. Delete Document

```
DELETE /api/documents/{id}
```

**Path Parameters:**

- `id` – Unique identifier of the document

**Response:**

- Status `204 No Content` on successful deletion
- Both metadata (MongoDB) and file (disk) are removed

---

## 💡 Technical Considerations & Design Decisions

### 1. Multi-Document Upload Strategy

**How does the system handle multiple uploads?**

Multiple documents are processed via a **single multipart/form-data request**. Multer middleware parses the request, extracts each file, stores binary content on disk, and persists metadata entries in MongoDB.

**Design Benefits:**

- Reduces network round-trips and overhead
- Atomic transaction per upload request
- Server-side rate limiting and file size constraints prevent abuse

**Trade-offs:**

- Single request failure requires re-upload of all files
- Larger request payload requires adequate buffer allocation

---

### 2. Importance of Streaming for File Operations

**Why is streaming critical for upload/download?**

Streaming transfers files in **chunks** rather than loading entire contents into memory. This approach is fundamental to scalable systems.

**Without Streaming (Anti-pattern):**

- ❌ Full file remains in server memory during transfer
- ❌ Large files consume excessive RAM, causing out-of-memory errors
- ❌ Scalability is severely limited (one large file blocks other requests)
- ❌ Increased response latency and poor user experience

**With Streaming (Recommended):**

- ✅ Constant memory footprint regardless of file size
- ✅ Server handles multiple concurrent large file transfers
- ✅ Responsive and predictable performance
- ✅ Suitable for production deployments

---

### 3. Cloud Storage Migration Path (S3)

**How would the system adapt to AWS S3 storage?**

If transitioning from local disk to Amazon S3:

**Changes Required:**

- Remove dependency on local file system
- Integrate AWS SDK for S3 operations
- Modify upload handler to stream directly to S3
- Update download handler to retrieve objects from S3

**MongoDB Metadata Updates:**

- Add `s3ObjectKey` and `s3Bucket` fields
- Preserve existing metadata schema

**Benefits of S3 Migration:**

- Unlimited scalability without disk management
- Geographic distribution and automatic redundancy
- Cost-efficient storage (pay-per-use model)
- Reduced operational overhead

**Architecture Remains Unchanged:**

- MongoDB still manages metadata
- REST API layer continues handling authorization and access control
- Download streaming now originates from S3 instead of local disk

---

### 4. Future Enhancements for User Experience

**Recommended improvements with additional development time:**

- 📄 **Document Previews** – Embedded PDF viewer and image lightbox for quick inspection
- 🎯 **Drag-and-Drop Upload** – Native drag-drop support for improved UX
- 📊 **Per-File Progress Tracking** – Granular progress indicators for each file during batch uploads
- ⚡ **Bulk Operations** – Multi-select with batch delete and metadata edit capabilities
- ♿ **Accessibility Enhancements** – WCAG 2.1 compliance, keyboard navigation, screen reader support
- 🔍 **Advanced Search** – Fuzzy search, filters by file type, date ranges, and size thresholds

---

## ⚙️ Design Trade-offs & Implementation Notes

The following decisions were made to align with project scope and requirements:

| Decision                            | Rationale                                                      | Future Alternative                                                      |
| ----------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **No Authentication/Authorization** | Focus on core document management functionality                | Implement JWT-based authentication with role-based access control       |
| **Local Disk Storage**              | Simplicity, clarity, and immediate usability                   | Cloud storage (AWS S3, Google Cloud Storage, Azure Blob)                |
| **MongoDB Atlas**                   | Managed NoSQL database with ACID support on replica sets       | PostgreSQL for relational requirements or Redis for caching             |
| **Simple Text Search**              | Straightforward implementation, adequate for typical use cases | Full-text search engines (Elasticsearch, Algolia) for advanced features |
| **No Virus Scanning**               | Out of scope for MVP                                           | Integrate ClamAV or third-party API services                            |
| **No Background Jobs**              | Synchronous processing sufficient for MVP                      | Background queues (Bull, RabbitMQ) for async operations                 |
| **No Rate Limiting**                | Development environment assumption                             | Implement rate limiting middleware and DDoS protection                  |

---

## 📸 Screenshots & User Interface

### Main Dashboard

The primary interface displays all uploaded documents in a clean, organized table format with sorting and search capabilities.

![Main Dashboard UI](./Main%20Page%20UI.png)

**Features Shown:**

- Document list with title, size, and upload date
- Quick action buttons for download and delete
- Search bar for filtering by document name
- Sorting controls for organizing documents
- Summary statistics showing total count and storage usage

---

### Multiple File Selection

The upload dialog supports selecting multiple files at once for efficient batch uploads.

![Multiple File Selection](./Multiple%20File%20selection.png)

**Capabilities:**

- Native file picker with multi-select enabled
- Visual preview of selected files
- File size and type information displayed
- Option to add or remove files before upload
- Clear submission button to initiate batch upload

---

### Upload Success Confirmation

Upon successful upload, the system displays confirmation with newly added documents in the list.

![File Upload Success](./File%20Uploaded.png)

**User Feedback:**

- Success notification confirming upload completion
- New documents immediately visible in the document list
- Toast message with document count and total size added
- Seamless refresh of metadata without page reload
- Ready for next action (upload more, search, or download)

---

## 👨‍💼 Author & Project Information

**Developed by:** Chandra Shekhar Verma

This project demonstrates full-stack development expertise including:

- Frontend architecture with React and Tailwind CSS
- Backend API design with Node.js and Express
- Database design and cloud integration with MongoDB
- File handling and streaming optimization
- Responsive UI/UX implementation

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Feedback & Contributions

Suggestions for improvements, bug reports, and feature requests are welcome. Please feel free to open an issue or submit a pull request.
