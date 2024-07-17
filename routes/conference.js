const express = require('express');
const multer = require('multer');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');
const verifyToken = require('../middleware/verify_token');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace ':' and '.' with '-' for a safe filename
    const originalName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-]/g, ''); // Clean up the filename
    const filename = `${timestamp}_${originalName}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Create conference route
router.post('/create-conference', verifyToken, upload.single('poster'), conferenceController.createConference);

// Other routes
router.post('/search-conference', verifyToken, conferenceController.searchConference);
router.get('/get-conferences', conferenceController.getConferences);
router.patch('/edit-conference', verifyToken, conferenceController.editConference);
router.post('/get-conferenceMembers', verifyToken, conferenceController.getConferenceMembers);
router.post('/conferencesByCategory', verifyToken, conferenceController.getConferencesByCategory);
router.post('/get-conferenceById', verifyToken, conferenceController.getConferencesById);
router.get('/get-conferencesByUserId', verifyToken, conferenceController.getConferences_ById);
router.post('/get-roletype', verifyToken, conferenceController.getRoleType);
router.post('/get-conferemember', verifyToken, conferenceController.getconferencemember);

module.exports = router;
