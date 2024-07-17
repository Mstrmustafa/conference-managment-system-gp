const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/verify_token');
const AuthorController = require("../controllers/authorController");
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
// Routes
router.post('/add-submission-with-abstract', verifyToken, upload.fields([{ name: 'paper', maxCount: 1 }, { name: 'abstract', maxCount: 1 }]), AuthorController.addSubmissionWithAbstract);
router.post('/add-submission-without-abstract', verifyToken, upload.single('paper'), AuthorController.addSubmissionWithoutAbstract);
router.post('/delete-submission', verifyToken, AuthorController.deleteSubmission);
// edit submission
// router.patch('/edit-submission-with-abstract', verifyToken, AuthorController.editSubmissionWithAbstract);
// router.patch('/edit-submission-without-abstract', verifyToken, AuthorController.editSubmissionWithoutAbstract);

router.post('/get-submission', verifyToken, AuthorController.getSubmissions);
router.post('/get-submissionsByConId', verifyToken, AuthorController.getSubmissionsByConId);

module.exports = router;