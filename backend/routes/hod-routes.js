const express = require('express');
const router = express.Router();
const { getHODAppraisals, getHODAppraisalById, reviewAppraisal } = require('../controllers/appraisalForm');
const { auth, hodOnly } = require('../middlewares/authMiddleware');
const { getDepartmentFaculty, getDashboardStats, getReportsData } = require('../controllers/hodController');
const { getProfile, updateProfile } = require('../controllers/userController');

router.get('/appraisals', auth, hodOnly, getHODAppraisals);
router.get('/appraisals/:id', auth, hodOnly, getHODAppraisalById);
router.post('/review', auth, hodOnly, reviewAppraisal);
router.get('/department-faculty', auth, hodOnly, getDepartmentFaculty);
router.get('/dashboard-stats', auth, hodOnly, getDashboardStats);
router.get('/profile', auth, hodOnly, getProfile);
router.put('/profile/:id', auth, hodOnly, updateProfile);
router.get('/reports', auth, hodOnly, getReportsData);

module.exports = router;
