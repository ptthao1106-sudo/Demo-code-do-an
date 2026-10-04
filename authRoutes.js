const express = require('express');
const controller = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.post('/login', controller.login);
router.get('/me', requireAdmin, controller.me);

module.exports = router;
