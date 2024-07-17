const Conference = require('../models/conference');
const ConferenceMember = require('../models/conference_member');
const User = require('../models/user');

// Helper function to parse dates
const parseDate = (dateString) => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      throw new Error('Date string is empty or not a valid string');
    }

    const [startDateStr, endDateStr] = dateString.split(" - ");
    if (!startDateStr || !endDateStr) {
      throw new Error('Invalid date format, start or end date missing');
    }

    const isISOFormat = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    if (isISOFormat(startDateStr) && isISOFormat(endDateStr)) {
      return {
        startDate: startDateStr,
        endDate: endDateStr
      };
    }

    const convertDateFormat = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      if (!day || !month || !year) {
        throw new Error(`Invalid date component in ${dateStr}`);
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    return {
      startDate: convertDateFormat(startDateStr),
      endDate: convertDateFormat(endDateStr)
    };
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

exports.createConference = async (req, res) => {
  try {
    const {
      title,
      shortName,
      description,
      location,
      startDate,
      endDate,
      maxNumSub,
      isAbstracted,
      category
    } = req.body;

    const poster = req.file ? req.file.path : null;

    if (!startDate || !endDate) {
      throw new Error('Missing startDate or endDate in request');
    }

    const parsedDates = parseDate(`${startDate} - ${endDate}`);
    if (!parsedDates) {
      throw new Error('Invalid date format for startDate or endDate');
    }

    const newConference = new Conference({
      title,
      shortName,
      description,
      manager: req.user.id,
      location,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      maxNumOfSubmissions: maxNumSub,
      isAbstractEnabled: isAbstracted,
      confield: category,
      poster
    });

    const conference = await newConference.save();

    const newConferenceMember = new ConferenceMember({
      userId: req.user.id,
      conferenceId: conference._id,
      roleType: 'manager'
    });

    const conferenceMember = await newConferenceMember.save();
    conference.members.push(conferenceMember._id);
    await conference.save();

    res.status(201).json({
      message: "Conference created successfully.",
      conferenceId: conference._id,
      memberId: conferenceMember._id
    });
  } catch (error) {
    console.error('Error creating conference:', error);
    res.status(500).json({ error: error.message });
  }
};



module.exports.getConferences = async (req, res, next) => {
  try {
    let conferences = await Conference.find({acceptenceStatus : "Accepted"})
      .populate("members")
      .populate({
        path: "manager",
        select: "-__v -createdAt -updatedAt -password",
      })
      .populate({
        path: "members",
        populate: {
          path: "userId",
          select: "-__v -createdAt -updatedAt -password",
        },
      })
      .exec();
    res.status(200).json(conferences);
  } catch (error) {
    next(error);
  }
};

exports.editConference = async (req, res) => {
  try {
    const conferenceId = req.body.conferenceId;
    const { title, shortName, description, location, startDate, endDate } =
      req.body;

    // Ensure the conference ID is provided
    if (!conferenceId) {
      return res.status(400).send({ message: "Conference ID is required" });
    }

    // Find the conference by ID and update its details, excluding manager and members
    const updatedConference = await Conference.findByIdAndUpdate(
      conferenceId,
      {
        title,
        shortName,
        description,
        location,
        startDate,
        endDate,
      },
      { new: true },
    );

    if (!updatedConference) {
      return res.status(404).send({ message: "Conference not found" });
    }

    res.status(200).send({
      message: "Conference updated successfully",
      conference: updatedConference,
    });
  } catch (error) {
    console.error("Error during editConference:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

exports.getConferenceMembers = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    const conference = await Conference.findById(conferenceId).populate({
      path: "members",
      populate: {
        path: "userId",
        select: "email fullName", // Include only the fields you need from User
      },
    });

    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }

    const members = conference.members.map((member) => {
      return {
        id: member._id, // ConferenceMember _id
        user: {
          email: member.userId.email,
          fullName: member.userId.fullName,
        },
        role: member.roleType, // Assuming roleType is a field in the ConferenceMember model
        conferenceId: member.conferenceId,
        conferenceMember_id: member._id, // Adding ConferenceMember _id
      };
    });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting conference members:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getConferencesByCategory = async (req, res, next) => {
  try {
    const category = req.body.category;
    let conferences = await Conference.find({ confield: category ,acceptenceStatus : "Accepted"})
      .populate("members")
      .populate({
        path: "manager",
        select: "-__v -createdAt -updatedAt -password",
      })
      .populate({
        path: "members",
        populate: {
          path: "userId",
          select: "-__v -createdAt -updatedAt -password",
        },
      })
      .exec();
    res.status(200).json(conferences);
  } catch (error) {
    next(error);
  }
};

module.exports.searchConference = async (req, res, next) => {
  try {
      const { search, country } = req.body;

      let conferences = await Conference.find({
           $and: [
              {
                  $or: [
                      { confields: { $regex: search, $options: 'i' } },
                      { title: { $regex: search, $options: 'i' } },
                      { shortName: { $regex: search, $options: 'i' } }
                  ]
              },
               { location: country },
               {acceptenceStatus : "Accepted"}
           ]
      })
      .populate("members")
      .populate({
          path: "manager",
          select: "-__v -createdAt -updatedAt -password",
      })
      .populate({
          path: "members",
          populate: {
              path: "userId",
              select: "-__v -createdAt -updatedAt -password",
          },
      })
      .exec();

      res.status(200).json(conferences);
  } catch (error) {
      next(error);
  }
};

module.exports.getConferencesById = async (req, res, next) => {
  try {
    const conId = req.body.conId;
    let conferences = await Conference.findById( conId )
      .populate("members")
      .populate({
        path: "manager",
        select: "-__v -createdAt -updatedAt -password",
      })
      .populate({
        path: "members",
        populate: {
          path: "userId",
          select: "-__v -createdAt -updatedAt -password",
        },
      })
      .exec();
      // console.log(conferences.title)
    res.status(200).json(conferences);
  } catch (error) {
    next(error);
  }
};

module.exports.getConferences_ById = async (req, res, next) => {
  try {
    // Find all conference member documents by the user ID
    const conmembers = await ConferenceMember.find({ userId: req.user.id });
    if (!conmembers || conmembers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract all conference member IDs
    const memberIds = conmembers.map(member => member._id);

    // Find conferences where any of the member IDs are in the members array
    const conferences = await Conference.find({ 
      members: { $in: memberIds },
      acceptenceStatus: 'Accepted' // Add this line to include the search condition for isVerified
    })
    .populate({
      path: 'members',
      populate: {
        path: 'userId',
        select: '-__v -createdAt -updatedAt -password',
      },
    })
    .populate({
      path: 'manager',
      select: '-__v -createdAt -updatedAt -password',
    })
    .exec();

    res.status(200).json(conferences);
  } catch (error) {
    next(error);
  }
};

module.exports.getRoleType = async (req, res, next) => {
  try {
    // Find all conference member documents by the user ID
    const conmembers = await ConferenceMember.findOne({ userId: req.user.id, conferenceId: req.body.conferenceid });
    if (!conmembers) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(conmembers.roleType);
  } catch (error) {
    next(error);
  }
};

module.exports.getconferencemember = async (req, res, next) => {
  try {
    // Find all conference member documents by the user ID
    let conmembers = await ConferenceMember.findOne({ userId: req.user.id, conferenceId: req.body.conferenceid });
    if (!conmembers) {
      conmembers = "";
    }
    res.status(200).json(conmembers);
  } catch (error) {
    next(error);
  }
};
