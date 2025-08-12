# Faculty Appraisal System

## About This Project

The **Faculty Appraisal System** is a comprehensive application designed to streamline and automate faculty performance evaluation in educational institutions. This system provides a secure platform for faculty members to submit detailed appraisal forms documenting their research publications, seminars attended, projects undertaken, and lectures delivered.


Administrators can review these appraisals, provide feedback, and update their status (approved, rejected, pending), enabling transparent and efficient faculty performance management.

Developed using modern technologies, this backend is built to be scalable, secure, and maintainable, serving as the core foundation for the overall appraisal management solution.

---

## Features

- **User Authentication & Authorization**  
  Secure login system with **JSON Web Tokens (JWT)**, supporting role-based access control for faculty, HOD, and admin users.

- **Faculty Appraisal Form Submission & Update**  
  Faculty members can submit and edit appraisal details including research publications, seminars, projects, and lectures.

- **HOD Department Management**  
  HODs can view and review appraisals submitted by faculty members in their own department only.

- **Admin Dashboard**  
  Admins can view all appraisal submissions, update their status, and add comments or feedback.

- **Data Validation & Integrity**  
  Robust backend validations ensure all required data fields are properly formatted and complete.

- **Role-Based Middleware**  
  Middleware enforces secure access control restricting routes based on user roles (faculty, HOD, admin).

- **Scalable API Architecture**  
  Modular and maintainable codebase, ready for future features like notifications, reporting, or frontend integration.

---


## Technology Stack

### Backend
- **Node.js** — JavaScript runtime environment for building fast and scalable server-side applications.
- **Express.js** — Minimalist web framework for Node.js, used to build the RESTful API endpoints.
- **MongoDB** — NoSQL document database for flexible and scalable data storage.
- **Mongoose** — Elegant MongoDB object modeling for Node.js to define schemas and interact with the database.
- **JSON Web Tokens (JWT)** — Secure token-based authentication system.
- **bcrypt** — Password hashing for secure storage of user credentials.
- **dotenv** — Loads environment variables from `.env` files for configuration management.
- **multer** — Middleware for handling multipart/form-data, primarily used for uploading files.
- **Nodemon** — Tool to automatically restart the server during development on code changes.

### Frontend
- **React.js** For building dynamic and responsive user interfaces.
- **Vite** — Module bundler and development servers for frontend assets.
- **Axios / Fetch API** — For making HTTP requests to the backend APIs.
- **Tailwind CSS** — Styling and UI component frameworks to create attractive interfaces.

### Testing & Development Tools
- **Postman / curl / PowerShell Invoke-RestMethod** — Tools used for API testing and development.

---

## Setup & Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/aniketsharma889/faculty-appraisal-system.git
   cd faculty-appraisal-system
   cd backend
   ```
2. **Install Backend Dependencies**

    ```bash
    npm install
    ```
3. **Create a .env file in the root directory with the following variables:**

    ```bash
   PORT=5000                  # Server port
   MONGO_URI=your_mongo_uri   # MongoDB connection string
   JWT_SECRET=your_jwt_secret # Secret key for signing JWT tokens
    ```
4. **Run the Backend server**

    ```bash
    npm run dev
    or
    npm run start
    or
    node server.js
    ```
- The server will start on http://localhost:5000.

5. **Install Frontend Dependencies**

    ```bash
    cd frontend
    npm install
    ```
6. **Run the Frontend server**

    ```bash
    npm run dev
    ```
- The server will start on http://localhost:5173/.


## Refrences

### Backend Refrences

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JSON Web Tokens (JWT)](https://github.com/auth0/node-jsonwebtoken#readme)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js/)
- [dotenv](https://github.com/motdotla/dotenv)
- [nodemon](https://github.com/remy/nodemon#nodemon)
- [multer](https://github.com/expressjs/multer)
### Frontend References
- [React.js](https://reactjs.org/) 
- [Vite](https://vitejs.dev/) 
- [Axios](https://axios-http.com/) 
- [Tailwind CSS](https://tailwindcss.com/) 

### Testing & Development Tools

- [Postman](https://www.postman.com/)