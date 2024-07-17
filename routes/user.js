const express = require('express')
const verifyToken = require('../middleware/verify_token')
const router = express.Router()
//down
const userControler = require('../controllers/userController');
router.post('/sign-in',userControler.signIn)

router.post('/sign-up',userControler.signUp)
//up when you see it delete the comment

router.get('/verify-email',userControler.verifyEmail)
router.put('/update-user',verifyToken,userControler.updateUser)
router.get('/get-user',verifyToken,userControler.getUser)
router.post('/admin-sign-in',userControler.adminLogin)
router.put('/update-email',verifyToken,userControler.updateEmail)
router.post('/getuserByConMemId',verifyToken,userControler.getuserByConMemId)
router.post('/getuserById',verifyToken,userControler.getUser_ById)
router.post('/get-conmem',verifyToken,userControler.getconmemid)
router.put('/update-password',verifyToken,userControler.updatePassword)
router.post('/send-feedback',userControler.sendFeedback);
router.post('/send-feedbackuser',verifyToken,userControler.sendFeedbackuser);
module.exports = router