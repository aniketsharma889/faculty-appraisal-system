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

### 📱 **Responsive Design**

- **Fully responsive UI** with mobile-first design
- **Optimized layouts** for desktop, tablet, and mobile
- **Built using TailwindCSS** for consistent styling

### 📝 **Faculty Appraisal Management**

- **Comprehensive Appraisal** Forms with multiple sections:
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
- **Client-side PDF Generation** with comprehensive details, and document links
- **Search & Filter** Faculty Appraisals for quick access
- **Status Tracking** (e.g., Pending, Reviewed by HOD, Approved by Admin)

### 👥 HOD Dashboard & Management

- **Department-specific Appraisal Review** (HODs see only their department)
- **Approval/Rejection** Workflow with comments & feedback
- **Faculty Management** and department overview
- **Search & Filter Appraisals** by:
  - Faculty name, email, joining year/date, employee code, activity status
  - Appraisal completion level (how much detail filled in forms)
  - Appraisal status: Approved, Rejected, Pending HOD Review, Pending Admin Review
  - Faculty state: Active, Inactive, Pending Review, Completed Review
- **Sorting by Completion** Level (faculty with more details filled shown first)
- **Statistics & Insights**:
  - Total faculty in department
  - Active faculty (submitted ≥1 appraisal)
  - Activity rate (submission & review stats)
  - Pending reviews count
- **Faculty Profile View** → access all appraisals of a particular faculty
- **Reports & Visual Analytics**:
  - Pie/Donut chart: Appraisal Status Distribution (Approved, Rejected, Pending HOD/Admin Review)
  - Bar chart: Submission Trends (with week/month/year filters)
  - Export Options: Download reports in PDF or Excel format.
### 🛡️ **Admin Panel**

- **System-wide Appraisal Management** across all departments
- **Final Approval Authority** for appraisals
- **Comprehensive** User & Department Management
- **Role Management** with promotion/demotion (Faculty ⇄ HOD)
- **Advanced Reporting & Analytics** with export options
- **Appraisal Management**: View and filter appraisals by status (Approved, Rejected, Pending HOD, Pending Admin), sort by completion level, filter by department or joining year.
- **User Management**: Search and filter by name, email, role, department, joining date. Restricted view (Admins can’t see other admins’ details). Edit basic info (name, email, employee code, department), and manage roles (promote/demote).
- **Department Management**: View department details with counts of users, faculty, and HODs. Filter departments (most users, most faculty, most HODs). Drill down to view users by department.
- **Reports & Analytics**:
  - User Roles Distribution (Pie/Donut Chart)
  - Appraisal Status Overview (Column Chart)
  - Top Departments by Users (Horizontal Bar Chart)
  - Top Departments by Appraisals (Horizontal Bar Chart)
  - Appraisals Submitted Over Time (Line Chart) with weekly/monthly/yearly filters
  - Department-wise Appraisals (Grouped Bar Chart) – Approved, Rejected, Pending
- **Export Options**: Reports and details exportable to PDF or Excel

---
### 📊 **Dashboard**
- **Role-specific Dashboards** with relevant metrics
- **Submission Tracking** and status monitoring
- **Recent Activity** feeds of appraisals
- **Analytics Widgets** for quick insights (totals, pending tasks, progress rates)
- **Responsive Design** for seamless use across devices

### 🔧 **Technical Features**
- **Responsive Design** for all device types
- **Advanced File Management** with secure upload via Cloudinary
- **Client-side PDF Generation** using html2pdf.js for faculty appraisals and HOD reports
- **Smart Document Integration** with file type recognition and direct download links
- **Data Validation** and error handling
- **Search and Filter** capabilities
- **Toast Notifications** for user feedback
- **Enhanced PDF Reports** with organized document sections
- **Protected API Endpoints** with middleware validation
- **Reusable UI Components** for consistency and maintainability
- **Optimized Performance**

---

```
## 🏗 Project Structure
├── backend
    ├── .gitignore
    ├── config
    │   ├── cloudinaryConfig.js
    │   ├── db.js
    │   └── multer.js
    ├── controllers
    │   ├── adminController.js
    │   ├── appraisalController.js
    │   ├── hodController.js
    │   └── userController.js
    ├── middlewares
    │   └── authMiddleware.js
    ├── models
    │   ├── appraisal-form-model.js
    │   └── user-model.js
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── .env
    ├── routes
    │   ├── admin-routes.js
    │   ├── appraisal-form-routes.js
    │   ├── hod-routes.js
    │   └── user-routes.js
    └── server.js
├── frontend
    ├── node_modules
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── .env
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   ├── components
    │   │   ├── auth
    │   │   │   ├── AdminAuth.jsx
    │   │   │   ├── FacultyAuth.jsx
    │   │   │   └── HODAuth.jsx
    │   │   ├── dashboard
    │   │   │   └── DashboardStats.jsx
    │   │   ├── forms
    │   │   │   ├── AdminLogin.jsx
    │   │   │   ├── AppraisalForm.jsx
    │   │   │   ├── EditAppraisalForm.jsx
    │   │   │   ├── FacultyLogin.jsx
    │   │   │   ├── HODLogin.jsx
    │   │   │   ├── RoleBasedLogin.jsx
    │   │   │   └── sections
    │   │   │   │   ├── FileUploadSection.jsx
    │   │   │   │   ├── PersonalInformationSection.jsx
    │   │   │   │   └── ProfessionalInformationSection.jsx
    │   │   ├── layout
    │   │   │   ├── AuthLayout.jsx
    │   │   │   ├── DashboardLayout.jsx
    │   │   │   └── Navigation.jsx
    │   │   └── ui
    │   │   │   ├── Button.jsx
    │   │   │   └── InputField.jsx
    │   ├── pages
    │   │   ├── admin
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Departments.jsx
    │   │   │   ├── EditProfile.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── ViewAppraisals.jsx
    │   │   │   ├── ReviewAppraisal.jsx
    │   │   │   ├── ManageUsers.jsx
    │   │   │   ├── ViewUser.jsx
    │   │   │   ├── EditUser.jsx
    │   │   │   └── AdminAnalyticsDashboard.jsx
    │   │   └── hod
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── EditProfile.jsx
    │   │   │   ├── ManageFaculty.jsx
    │   │   │   ├── FacultyAppraisals.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── ReviewAppraisal.jsx
    │   │   │   ├── ViewAppraisals.jsx
    │   │   │   └── Reports.jsx
    │   │   └── faculty
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── EditAppraisal.jsx
    │   │   │   ├── EditProfile.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── SubmitAppraisal.jsx
    │   │   │   ├── ViewAppraisalDetails.jsx
    │   │   │   └── ViewAppraisals.jsx
    │   └── utils
    │   │   ├── api.js
    │   │   └── toast.js
    └── vite.config.js
└── readme.md
```
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
- **[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)** — Client-side PDF generation from HTML  
- **[Chart.js](https://www.chartjs.org/)** — Flexible and interactive charting library  
- **[react-chartjs-2](https://react-chartjs-2.js.org/)** — React wrapper for Chart.js for easy integration in React apps  
- **[dotenv](https://github.com/motdotla/dotenv)** — Environment variable management

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
- **[Multer](https://github.com/expressjs/multer)** — Middleware for handling multipart/form-data, primarily for file uploads

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
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/)
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
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```
Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL= 'http://localhost:5000/api'

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
- PDF generation handled client-side using html2pdf.js

### HOD Routes
- `GET /api/hod/appraisals` - Get department appraisals
- `GET /api/hod/appraisals/:id` - Get specific appraisal details
- `POST /api/hod/review` - Submit HOD review
- `GET /api/hod/dashboard-stats` - Get dashboard statistics
- `GET /api/hod/department-faculty` - Get department faculty list
- `GET /api/hod/reports` - Get hod reports.

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
- Download comprehensive PDF reports with client-side generation
- Update profile information

### HOD (Head of Department)
- Review appraisals from department faculty
- Approve/reject appraisals with comments
- Manage department faculty information
- Generate department analytics reports with PDF and excel export

### Admin
- System-wide appraisal management
- Final approval authority
- User management and role assignments
- Department configuration
- Promote or Demote Faculty and HOD
- Genrate analytics reports with pdf and excel export
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
- **[html2pdf.js Documentation](https://github.com/eKoopmans/html2pdf.js)**
- **[Chart.js](https://www.chartjs.org/docs/latest/)**
- **[react-chartjs-2](https://react-chartjs-2.js.org/)**
### Development Tools
- **[Nodemon Documentation](https://github.com/remy/nodemon#nodemon)**
- **[Jest Testing Framework](https://jestjs.io/docs/getting-started)**
- **[Supertest Documentation](https://github.com/ladjs/supertest#readme)**

---

