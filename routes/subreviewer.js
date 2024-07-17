const express = require('express')
const router = express.Router()
const subreviewerController = require('../controllers/subreviewerController')
const verifyToken = require('../middleware/verify_token')

// accept invitation
router.post('/accept-invitation',verifyToken,subreviewerController.acceptInvitation)

// reject invitation
router.post('/reject-invitation',verifyToken,subreviewerController.rejectInvitation)

router.get('/get-invitations',verifyToken,subreviewerController.getInvitations)


module.exports = router