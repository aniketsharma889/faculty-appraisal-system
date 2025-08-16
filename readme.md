# Faculty Appraisal System

## About This Project

The **Faculty Appraisal System** is a comprehensive full-stack web application designed to streamline faculty performance evaluation in educational institutions. This system provides a secure, role-based platform where faculty members can submit detailed appraisal forms documenting their academic achievements, research publications, seminars attended, projects undertaken, and teaching activities.

The system implements a multi-tier approval workflow where HODs (Head of Departments) can review and approve appraisals from their department faculty, followed by final administrative approval. This ensures transparent, efficient, and accountable faculty performance management.

Built with modern web technologies, this application features a React.js frontend with a Node.js/Express.js backend, utilizing MongoDB for scalable data storage and JWT-based authentication for security.

---

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Faculty, HOD, Admin)
- **Protected Routes** and middleware-based authorization

### 📝 **Faculty Appraisal Management**
- **Comprehensive Appraisal Forms** with multiple sections:
  - Personal and professional information
  - Academic qualifications and research publications
  - Seminars, workshops, and conferences attended
  - Research projects and collaborations
  - Awards and recognitions
  - Professional memberships
  - Courses taught and administrative responsibilities
  - Student mentoring activities
- **File Upload Support** for supporting documents
- **Form validation** with section-by-section progress
- **Edit/Update** submitted appraisals (when allowed)
- **Advanced PDF Download** with embedded document previews and image integration

### 👥 **HOD Dashboard & Management**
- **Department-specific Appraisal Review** (HODs see only their department)
- **Approval/Rejection Workflow** with comments
- **Faculty Management** and department overview
- **Review Comments** and feedback system

### 🛡️ **Admin Panel**
- **System-wide Appraisal Management** (view all departments)
- **Final Approval Authority** for appraisals
- **User Management**
- **Department Management** 
- **User Promotion** and role changes

### 📊 **Dashboard**
- **Role-specific Dashboards** with relevant metrics
- **Submission Tracking** and status monitoring
- **Recent Activity** feeds of appraisals

### 🔧 **Technical Features**
- **Responsive Design** for all device types
- **Advanced File Management** with secure upload via Cloudinary
- **Intelligent PDF Generation** with embedded document previews, image integration, and PDF file previews
- **Smart Document Categorization** separating images, PDFs, and other file types in generated reports
- **Data Validation** and error handling
- **Search and Filter** capabilities
- **Toast Notifications** for user feedback
- **Enhanced PDF Reports** with visual file previews and organized document sections

---

## 🛠️ Technology Stack

### Frontend Technologies
- **[React.js](https://reactjs.org/)** — Modern JavaScript library for building user interfaces
- **[Vite](https://vitejs.dev/)** — Next-generation frontend build tool with lightning-fast HMR
- **[React Router DOM](https://reactrouter.com/)** — Declarative routing for React applications
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework for rapid UI development
- **[Axios](https://axios-http.com/)** — Promise-based HTTP client for API requests
- **[Lucide React](https://lucide.dev/)** — Beautiful & customizable SVG icons for React
- **[Formik](https://formik.org/)** — Build forms in React without tears
- **[Yup](https://github.com/jquense/yup)** — JavaScript schema validation library

### Backend Technologies
- **[Node.js](https://nodejs.org/)** — JavaScript runtime environment for server-side applications
- **[Express.js](https://expressjs.com/)** — Fast, unopinionated web framework for Node.js
- **[MongoDB](https://www.mongodb.com/)** — NoSQL document database for flexible data storage
- **[Mongoose](https://mongoosejs.com/)** — Elegant MongoDB object modeling for Node.js
- **[JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)** — Secure token-based authentication
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js/)** — Password hashing for secure credential storage
- **[CORS](https://github.com/expressjs/cors)** — Cross-Origin Resource Sharing middleware
- **[dotenv](https://github.com/motdotla/dotenv)** — Environment variable management
- **[Cloudinary](https://cloudinary.com/)** — Cloud-based file upload and management
- **[Puppeteer](https://pptr.dev/)** — Advanced PDF generation with embedded document previews and image integration

### Development Tools
- **[Nodemon](https://github.com/remy/nodemon)** — Development server with automatic restart
- **[Jest](https://jestjs.io/)** — JavaScript testing framework
- **[Supertest](https://github.com/ladjs/supertest)** — HTTP assertion library for testing

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (Local installation or MongoDB Atlas) - [Setup guide](https://www.mongodb.com/docs/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/aniketsharma889/faculty-appraisal-system.git
cd faculty-appraisal-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
.env  
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017faculty-appraisal
# For MongoDB Atlas:
 mongodb+srv://username:password@cluster.mongodb.net/faculty-appraisal-system?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

### 4. Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Alternative
node server.js
```
Backend server will start on **http://localhost:5000**

### 5. Frontend Setup
```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend application will start on **http://localhost:5173**

---

## 🔗 API Endpoints

### Authentication Routes
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile

### Faculty Appraisal Routes
- `POST /api/appraisal-form/submit-appraisal` - Submit new appraisal
- `GET /api/appraisal-form/my-appraisals` - Get faculty's appraisals
- `GET /api/appraisal-form/appraisal/:id` - Get specific appraisal
- `PUT /api/appraisal-form/update-appraisal/:id` - Update appraisal
- `GET /api/appraisal-form/download-pdf/:id` - Download appraisal as enhanced PDF with document previews

### HOD Routes
- `GET /api/hod/appraisals` - Get department appraisals
- `GET /api/hod/appraisals/:id` - Get specific appraisal details
- `POST /api/hod/review` - Submit HOD review
- `GET /api/hod/dashboard-stats` - Get dashboard statistics
- `GET /api/hod/department-faculty` - Get department faculty list

### Admin Routes
- `GET /api/admin/appraisals` - Get all appraisals
- `GET /api/admin/appraisals/:id` - Get specific appraisal
- `POST /api/admin/review` - Submit admin review
- `GET /api/admin/dashboard-stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user details
- `PUT /api/admin/users/:id/role` - Promote user role
- `GET /api/admin/departments` - Get departments list

---

## 👥 User Roles & Permissions

### Faculty
- Submit and edit personal appraisal forms
- Upload supporting documents (images, PDFs, certificates)
- View submission status and feedback
- Download comprehensive PDF reports with embedded document previews
- Update profile information

### HOD (Head of Department)
- Review appraisals from department faculty
- Approve/reject appraisals with comments
- Manage department faculty information

### Admin
- System-wide appraisal management
- Final approval authority
- User management and role assignments
- Department configuration

---

## 🧪 Testing

### API Testing Tools
- **[Postman](https://www.postman.com/)** - API development and testing
- **cURL** - Command-line HTTP client
- **PowerShell Invoke-RestMethod** - Windows HTTP client

---

## 📚 Additional Resources & References

### Core Technologies Documentation
- **[React.js Documentation](https://reactjs.org/docs/getting-started.html)**
- **[Node.js Documentation](https://nodejs.org/en/docs/)**
- **[Express.js Guide](https://expressjs.com/en/starter/installing.html)**
- **[MongoDB Manual](https://www.mongodb.com/docs/manual/)**
- **[Mongoose Documentation](https://mongoosejs.com/docs/)**

### Authentication & Security
- **[JWT.io](https://jwt.io/)** - JWT token debugger and documentation
- **[bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js#readme)**
- **[CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)**

### Frontend Libraries
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[Vite Documentation](https://vitejs.dev/guide/)**
- **[React Router Documentation](https://reactrouter.com/en/main)**
- **[Axios Documentation](https://axios-http.com/docs/intro)**
- **[Formik Documentation](https://formik.org/docs/overview)**
- **[Yup Validation Documentation](https://github.com/jquense/yup#readme)**
- **[Lucide Icons](https://lucide.dev/icons/)**

### Development Tools
- **[Nodemon Documentation](https://github.com/remy/nodemon#nodemon)**
- **[Jest Testing Framework](https://jestjs.io/docs/getting-started)**
- **[Supertest Documentation](https://github.com/ladjs/supertest#readme)**

---

