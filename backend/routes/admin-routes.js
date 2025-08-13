const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middlewares/authMiddleware');
const { getAllAppraisalsForAdmin, getAppraisalByIdForAdmin, reviewAppraisalAsAdmin, getDashboardStats, getAllUsers, getUserById, updateUserAsAdmin, promoteUser, getDepartments } = require('../controllers/adminController');
const { getProfile, updateProfile } = require('../controllers/userController');

// Admin routes for appraisals
router.get('/appraisals', auth, adminOnly, getAllAppraisalsForAdmin);
router.get('/appraisals/:id', auth, adminOnly, getAppraisalByIdForAdmin);
router.post('/review', auth, adminOnly, reviewAppraisalAsAdmin);

// Admin dashboard and user management routes
router.get('/dashboard-stats', auth, adminOnly, getDashboardStats);
router.get('/users', auth, adminOnly, getAllUsers);
router.get('/users/:id', auth, adminOnly, getUserById);
router.put('/users/:id', auth, adminOnly, updateUserAsAdmin);
router.put('/users/:id/role', auth, adminOnly, promoteUser);

// Admin departments route
router.get('/departments', auth, adminOnly, getDepartments);

// Admin profile routes
router.get('/profile', auth, adminOnly, getProfile);
router.put('/profile/:id', auth, adminOnly, updateProfile);

module.exports = router;
