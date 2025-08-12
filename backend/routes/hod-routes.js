const express = require('express');
const router = express.Router();
const { getHODAppraisals, getHODAppraisalById, reviewAppraisal } = require('../controllers/appraisalForm');
const { auth, hodOnly } = require('../middlewares/authMiddleware');
const { getDepartmentFaculty, getDashboardStats } = require('../controllers/hodController');

router.get('/appraisals', auth, hodOnly, getHODAppraisals);
router.get('/appraisals/:id', auth, hodOnly, getHODAppraisalById);
router.post('/review', auth, hodOnly, reviewAppraisal);
router.get('/department-faculty', auth, hodOnly, getDepartmentFaculty);
router.get('/dashboard-stats', auth, hodOnly, getDashboardStats);

module.exports = router;
