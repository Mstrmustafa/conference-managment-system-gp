const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notficationController')
const verifyToken = require('../middleware/verify_token')

router.get('/get-notifications',verifyToken,notificationController.getNotifications)

module.exports = router