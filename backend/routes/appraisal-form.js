const express = require('express');
const router = express.Router();
const {submitAppraisal, getAllAppraisals, updateStatus} = require('../controllers/appraisalForm');
const { auth, adminOnly } = require('../middlewares/authMiddleware');

router.post('/submit-appraisal', auth, submitAppraisal);
router.get('/all-appraisals', auth, adminOnly, getAllAppraisals);
router.patch('/update-status/:id', auth, adminOnly, updateStatus);

module.exports = router;
