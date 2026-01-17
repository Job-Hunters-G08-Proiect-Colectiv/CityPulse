const express = require('express');
const router = express.Router();
const { httpSignUp, httpLogin } = require('../controllers/auth.controller');

// POST /api/auth/signup
router.post('/signup', httpSignUp);

// POST /api/auth/login
router.post('/login', httpLogin);

module.exports = router;