const express = require('express');
const router = express.Router();
const { getHODAppraisals, getHODAppraisalById } = require('../controllers/appraisalForm');
const { auth, hodOnly } = require('../middlewares/authMiddleware');

router.get('/appraisals', auth, hodOnly, getHODAppraisals);
router.get('/appraisals/:id', auth, hodOnly, getHODAppraisalById);

module.exports = router;
