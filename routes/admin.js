const express = require('express')
const adminController  = require('../controllers/adminController')
const router = express.Router()
const verifyToken = require('../middleware/verify_token')

//accept conference
router.post('/accept-conference',verifyToken,adminController.acceptConference)


//reject conference
router.post('/reject-conference',verifyToken,adminController.rejectConference)


router.get('/get-waiting',verifyToken,adminController.getWaitingConferences)

module.exports = router