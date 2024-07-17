const Conference = require("../models/conference");
const Notification = require("../models/notification");

module.exports.acceptConference = async (req, res, next) => {
  try {
    let conference = await Conference.findById(req.body.conferenceId);
    conference.acceptenceStatus = "Accepted";
    let updatedConference = await conference.save();
    let notification = new Notification({
      receiverId: updatedConference.manager,
      notificationContent: "Congratulations, Your Conference Accepted",
    });
    await notification.save();
    res.status(200).json({ message: "Conference Accepted Successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports.rejectConference = async (req, res, next) => {
  try {
    let conference = await Conference.findById(req.body.conferenceId);
    let notification = new Notification({
      receiverId: conference.manager,
      notificationContent: "Unfortunately, Your Conference Rejected",
    });
    await Conference.findByIdAndDelete(conference._id);
    await notification.save();
    res.status(200).json({ message: "Conference Rejected Successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports.getWaitingConferences = async (req, res, next) => {
  try {
    let conferences = await Conference.find({ acceptenceStatus: "Waiting" })
      .populate("members")
      .populate({
        path: "manager",
        select: "-__v -createdAt -updatedAt -password -phoneNumber -degree -googleScholarUsername -university -webPage -country -gender -isVerified -verificationToken -userType",
      })
      // .populate({
      //   path: "members",
      //   populate: {
      //     path: "userId",
      //     select: "-__v -createdAt -updatedAt -password -phoneNumber -degree -googleScholarUsername -university -webPage -country -gender -isVerified -verificationToken -userType",
      //   },
      // })
      
      .exec();
      console.log(conferences)
    res.status(200).json(conferences);
  } catch (error) {
    next(error);
  }
};
