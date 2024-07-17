const Submission = require("../models/submission");
const Review = require("../models/review");
//const { unlink } = require("node:fs/promises");
const Conference = require("../models/conference");
const ConferenceMember = require("../models/conference_member");
const { unlink } = require("fs").promises; // Importing fs promises for file operations

exports.addSubmissionWithAbstract = async (req, res, next) => {
  try {
    const { conferenceId } = req.body;
    console.log(conferenceId)

    // Find the conference by conferenceId
    let conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(400).json({ message: "Conference not found" });
    }

    // Find the conference member (author) associated with the current user
    let conmember = await ConferenceMember.findOne({ userId: req.user.id,conferenceId:conferenceId });
    if (!conmember) {
      // If conference member doesn't exist, create a new one
      let authorMember = new ConferenceMember({
        userId: req.user.id,
        conferenceId: conferenceId,
        roleType: "Author",
      });
      conmember = await authorMember.save(); // Save the new conference member
    }

    // Multer should have stored the files in req.files
    const paperFile = req.files['paper'][0];
    const abstractFile = req.files['abstract'][0];

    if (!paperFile || !abstractFile) {
      return res.status(400).json({ message: "Both paper and abstract files are required" });
    }

    // Create a new Submission object
    const newSubmission = new Submission({
      conferenceId: conferenceId,
      authorId: conmember._id,
      paper: paperFile.path,
      abstract: abstractFile.path,
    });

    // Save the new submission to the database
    const savedSubmission = await newSubmission.save();
    console.log(savedSubmission)

    // Return success response with details of the saved submission
    res.status(201).json({
      message: "Submission added successfully",
      submission: {
        submissionID: savedSubmission._id,
        conferenceId: savedSubmission.conferenceId,
        paperFile: "http://localhost:3000/" + savedSubmission.paper,
        abstractFile: "http://localhost:3000/" + savedSubmission.abstract,
        avgScore: savedSubmission.avgScore,
      },
    });
  } catch (error) {
    console.error("Error adding submission:", error);
    next(error); // Pass the error to the error handling middleware
  }
};

exports.addSubmissionWithoutAbstract = async (req, res, next) => {
  try {
    const { conferenceId } = req.body;

    // Find the conference by conferenceId
    let conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(400).json({ message: "Conference not found" });
    }

    // Find the conference member (author) associated with the current user
    let conmember = await ConferenceMember.findOne({ userId: req.user.id,conferenceId:conferenceId });
    if (!conmember) {
      // If conference member doesn't exist, create a new one
      let authorMember = new ConferenceMember({
        userId: req.user.id,
        conferenceId: conferenceId,
        roleType: "Author",
      });
      conmember = await authorMember.save(); // Save the new conference member
    }

    // Multer should have stored the file in req.file
    const paperFile = req.file;

    if (!paperFile) {
      return res.status(400).json({ message: "Paper file is required" });
    }

    // Create a new Submission object
    const newSubmission = new Submission({
      conferenceId: conferenceId,
      authorId: conmember._id,
      paper: paperFile.path,
    });

    // Save the new submission to the database
    const savedSubmission = await newSubmission.save();

    // Return success response with details of the saved submission
    res.status(201).json({
      message: "Submission added successfully",
      submission: {
        submissionID: savedSubmission._id,
        conferenceId: savedSubmission.conferenceId,
        paperFile: "http://localhost:3000/" + savedSubmission.paper,
        avgScore: savedSubmission.avgScore,
      },
    });
  } catch (error) {
    console.error("Error adding submission:", error);
    next(error); // Pass the error to the error handling middleware
  }
};
exports.deleteSubmission = async (req, res, next) => {
  try {
    //const submissionId = req.params.submissionId;
    const submissionId = req.body.submissionId;
    await Review.deleteMany({ submissionId: submissionId });
    let submission = await Submission.findById(submissionId);
    await unlink(submission.paper);
    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    next(error); // Pass the error to the error handling middleware
  }
};

exports.getSubmissions = async (req, res, next) => {
  try {
    // Find the conference member associated with the current user
    const conId = req.body.conId
    const conmember = await ConferenceMember.findOne({ userId: req.user.id,conferenceId:conId });

    if (!conmember) {
      return res.status(404).json({ message: "Conference member not found for the user" });
    }

    // Find submissions associated with the conference member
    const submissions = await Submission.find({ authorId: conmember._id,conferenceId:conId });

   
    if (!submissions || submissions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    next(error);
  }
};


exports.editSubmissionWith = async (req, res, next) => {
  try {
    const submission = await Submission.findOne({ authorId: req.user.id });

    if (!submission) {
      return res.status(404).json({ message: "there is no submission" });
    }
    submission.paper = req.file.path;
    submission.abstract = req.file.path;

    await submission.save();

    return res
      .status(200)
      .json({ message: "Submission updated successfully", submission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editSubmissionWithout = async (req, res, next) => {
  try {
    const submission = await Submission.findOne({ authorId: req.user.id });

    if (!submission) {
      return res.status(404).json({ message: "there is no submission" });
    }
    submission.paper = req.file.path;

    await submission.save();

    return res
      .status(200)
      .json({ message: "Submission updated successfully", submission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getSubmissionsByConId = async (req, res, next) => {
  try {
    const conId = req.body.conferenceid
    
    const submissions = await Submission.find({ conferenceId:conId });

    if (!submissions || submissions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    next(error);
  }
};

