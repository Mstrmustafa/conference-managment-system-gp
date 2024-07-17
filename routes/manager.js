const express = require('express');
const router = express.Router();
const managerControllers = require('../controllers/managerController');
const verifyToken = require('../middleware/verify_token')

// Add Member
router.post('/add-member', verifyToken,managerControllers.addMember);


// kick out Reviewer
router.post('/delete-member',verifyToken,managerControllers.deleteMember)

// accept submission
router.post('/accept-sub',verifyToken,managerControllers.acceptSubmission)

// reject submission
router.post('/reject-sub',verifyToken,managerControllers.rejectSubmission)




// enable disable abstracts
router.post('/enable-disable-abs',verifyToken,managerControllers.disableEnableAbstracts)


// enable disable show names
router.post('/enable-disable-show-names',verifyToken,managerControllers.disableEnableAuthorNames)




module.exports = router