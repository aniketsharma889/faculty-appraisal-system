require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDb = require('./config/db');
const userRouter = require('./routes/user-routes');
const appraisalFormRouter = require('./routes/appraisal-form-routes');
const hodRouter = require('./routes/hod-routes');
const adminRoutes = require('./routes/admin-routes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRouter);
app.use('/api/appraisal-form', appraisalFormRouter);
app.use('/api/hod', hodRouter);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started at http://localhost:${PORT}`);
  });
});

module.exports = app;