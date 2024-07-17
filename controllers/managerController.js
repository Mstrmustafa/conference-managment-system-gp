const User = require("../models/user");
const Conference = require("../models/conference");
const ConferenceMember = require("../models/conference_member");
const Submission = require("../models/submission");
const Review = require("../models/review");
const Notification = require("../models/notification");
exports.addMember = async (req, res) => {
  try {
    const { conferenceId, title, email, role } = req.body;

    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).send({ message: "Conference not found" });
    }

    const addedUser = await User.findOne({ email });
    if (!addedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    const existingMember = await ConferenceMember.findOne({
      conferenceId: conference._id,
      userId: addedUser._id,
    });
    console.log()
    if (existingMember) {
      return res
        .status(400)
        .send({ message: "User is already a member of this conference" });
    }

    const newMember = new ConferenceMember({
      conferenceId: conference._id,
      userId: addedUser._id,
      roleType: role,
    });
    await newMember.save();

    conference.members.push(newMember._id);
    await conference.save();

    res
      .status(200)
      .send({ message: "Member added successfully", member: newMember });

    let newNotification = new Notification({
      receiverId: addedUser._id,
      notificationContent:
        req.user.requestedUserName + " added you to " + title + " Conference",
    });
    await newNotification.save();
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { conferenceMemberId, conferenceId } = req.body;

    let conference = await Conference.findById(conferenceId).populate(
      "members",
    );
    let targetMember = conference.members.find((member) => {
      return member._id == conferenceMemberId;
    });
    conference.members = conference.members.filter(
      (member) => member._id != conferenceMemberId,
    );
    await conference.save();
    let newNotification = new Notification({
      receiverId: targetMember.userId,
      notificationContent:
        req.user.requestedUserName + " removed you from " + conference.title,
    });
    await newNotification.save();
    
    // Corrected method name to deleteById
    await Submission.deleteMany({ authorId: conferenceMemberId });

    await ConferenceMember.findByIdAndDelete(conferenceMemberId);

    res.status(200).json({ message: "Member removed successfully" });
  
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

exports.acceptSubmission = async (req, res) => {
  try {
    const submissionId = req.body.submissionId;

    //edit the populate
    const submission = await Submission.findById(submissionId).populate({
      path: "authorId",
      populate: {
        path: "userId",
        select: "-__v -createdAt -updatedAt",
      },
    });
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    //تنويه عدم اعادة الاكسبة
    submission.isAccepted = true;
    await submission.save();

    res
      .status(200)
      .json({ message: "Submission accepted successfully", submission });
    let newNotification = await Notification({
      receiverId: submission.authorId.userId,//for this line
      notificationContent:
        req.user.requestedUserName + " accepted your submission",
    });
    await newNotification.save();
  } catch (error) {
    console.error("Error accepting submission:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.rejectSubmission = async (req, res) => {
  try {
    const { submissionId } = req.body;

    const submission = await Submission.findByIdAndDelete(submissionId).populate(
      "authorId",
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    await Review.deleteMany({ submissionId });
    await Submission.findByIdAndDelete(submissionId);

    res
      .status(200)
      .json({ message: "Submission rejected and deleted successfully" });
    let newNotification = new Notification({
      receiverId: submission.authorId.userId,
      notificationContent:
        req.user.requestedUserName + " rejected your submission",
    });
    await newNotification.save();
  } catch (error) {
    console.error("Error rejecting submission:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.disableEnableAbstracts = async (req,res,next)=>{
  try {
    const { conferenceId ,command} = req.body;
    let conference = await Conference.findById(conferenceId);
    if(command == "Yes"){
      conference.isAbstractEnabled = true
    }else{
      conference.isAbstractEnabled = false
    }
   await conference.save();
   res.status(200).json({message: "Updated Successfully"})


  } catch (error) {

    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.disableEnableAuthorNames = async (req,res,next)=>{
  try {
    const { conferenceId ,command} = req.body;
    let conference = await Conference.findById(conferenceId);
    if(command == "Yes"){
      conference.isNameEnabled = true
    }else{
      conference.isNameEnabled = false
    }
   await conference.save();
   res.status(200).json({message: "Updated Successfully"})


  } catch (error) {

    res.status(500).json({ message: "Server error", error: error.message });
  }
}