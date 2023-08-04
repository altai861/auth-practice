const express = require('express')
const router = express.Router()
const authController = require('../controllers/authControllers')


router.route('/login')
    .post(authController.login)

router.route('/register')
    .post(authController.register)

module.exports = router