const express = require('express')
const router = express.Router()

const authController = require('../controllers/authControllers')

router.route('/sign-in')
    .post(authController.login)
router.route('/sign-up')
    .post(authController.signup)
router.route('/log-out')
    .post(authController.logout)


module.exports = router