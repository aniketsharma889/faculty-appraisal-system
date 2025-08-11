const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const { auth } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile/:id', auth, updateProfile);

module.exports = router;
