const express = require('express');
const router = express.Router();
const {submitAppraisal, getAllAppraisals, updateStatus, getMyAppraisals, getAppraisalById, updateAppraisal, getAppraisalStats, generateAppraisalPDF} = require('../controllers/appraisalForm');
const { auth, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.post('/submit-appraisal', auth, upload.array('files', 10), submitAppraisal);
router.get('/my-appraisals', auth, getMyAppraisals);
router.get('/appraisal/:id', auth, getAppraisalById);
router.put('/update-appraisal/:id', auth, upload.array('files', 10), updateAppraisal);
router.get('/all-appraisals', auth, adminOnly, getAllAppraisals);
router.patch('/update-status/:id', auth, adminOnly, updateStatus);
router.get('/download-pdf/:id', auth, generateAppraisalPDF);

module.exports = router;
