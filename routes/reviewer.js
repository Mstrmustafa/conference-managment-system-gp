const express = require('express');
const verifyToken = require('../middleware/verify_token');
const router = express.Router();
const reviewerControllers = require('../controllers/reviewerController');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname));
  }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Route to add review and score
router.post('/add-reviewandscore',  verifyToken,upload.single('description'), reviewerControllers.addReviewandScore);

// Routes for subreviewer management
router.post('/invite-subreviewer', verifyToken, reviewerControllers.inviteSubReviewer);
router.post('/cancel-invitation', verifyToken, reviewerControllers.cancelInvitation);

module.exports = router;
