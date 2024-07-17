const Review = require('../models/review'); 
const Submission = require('../models/submission'); 
const Invitation = require('../models/invitation');
const User = require("../models/user");
const Conference = require('../models/conference');
exports.addReviewandScore = async (req, res, next) => {
  try {
    const { score, submissionId } = req.body;

    // Check if required fields are provided
    if (!score || !submissionId) {
      return res.status(400).json({ message: 'Score and submissionId are required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Validate the score
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ message: 'Score must be a number between 1 and 5' });
    }

    // Add the score to the submission
    submission.scores.push(numericScore);

    // Calculate the new average score
    const totalScores = submission.scores.reduce((total, score) => total + score, 0);
    const avgScore = totalScores / submission.scores.length;
    submission.avgScore = avgScore;

    // Save the updated submission
    await submission.save();

    const reviewerId = req.user.id;
    const newReview = new Review({
      reviewerId: reviewerId,
      submissionId: submissionId,
      description: req.file ? req.file.path : null // Save the file path if a file was uploaded
    });

    const savedReview = await newReview.save();

    res.status(201).json({ message: 'Review added successfully', review: savedReview, submission: submission });
  } catch (error) {
    console.error('Error adding review:', error);
    next(error);
  }
};exports.inviteSubReviewer = async (req, res) => {
  try {
    const { subreviewerEmail, textmessage, conferenceId } = req.body;

    // Find the subreviewer by email
    const subreviewer = await User.findOne({ email: subreviewerEmail });
    if (!subreviewer) {
      return res.status(404).send({ message: 'Subreviewer not found' });
    }

    // Find the conference by ID and populate the members
    const conference = await Conference.findById(conferenceId).populate("members");
    if (!conference) {
      return res.status(404).send({ message: 'Conference not found' });
    }

    // Find the user who is inviting the subreviewer
    let userReviewer = conference.members.find((member) => member.userId == req.user.id);

    // Calculate the expiry date (4 days from now)
    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 4);

    // Create a new invitation
    const newInvitation = new Invitation({
      reviewerId: userReviewer._id,
      subreviewerId: subreviewer._id,
      conferenceId: conferenceId,
      textmessage: textmessage,
      expirydate: expirydate,
      invitationstatus: 'pending'
    });

    // Save the invitation
    await newInvitation.save();

    res.status(201).send({ message: 'Invitation sent successfully', invitation: newInvitation });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error', error: error.message });
  }
};

exports.cancelInvitation = async (req, res) => {
  try {
      const { invitationId } = req.body;

      

      await Invitation.findByIdAndDelete(
          invitationId
      );


      res.status(200).send({ message: 'Invitation canceled and deleted successfully' });
  } catch (error) {
      console.error('Error during cancelInvitation:', error);
      res.status(500).send({ message: 'Server error', error: error.message });
  }
};