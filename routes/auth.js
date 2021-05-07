const express = require('express')
const path = require('path')
const authController = require('../controllers/auth.js')
const router = express.Router();


router.post('/register', authController.register);
router.post('/login', authController.login);



module.exports = router;