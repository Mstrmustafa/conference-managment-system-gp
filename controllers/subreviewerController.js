const Invitation = require('../models/invitation');
const Conference = require('../models/conference');
const ConferenceMember = require('../models/conference_member');
const User = require('../models/user');

exports.acceptInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.body;

    const invitation = await Invitation.findById(invitationId);
   

    const existingMember = await ConferenceMember.findOne({
      conferenceId: invitation.conferenceId,
      userId: invitation.subreviewerId
    });
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this conference' });
    }

    const newMember = new ConferenceMember({
      conferenceId: invitation.conferenceId,
      userId: invitation.subreviewerId,
      roleType: 'Subreviewer'
    });
    await newMember.save();

    await Conference.findByIdAndUpdate(invitation.conferenceId, {
      $push: { members: newMember._id }
    });
    await Invitation.findByIdAndDelete(invitationId);


    res.status(200).json({ message: 'Invitation accepted', member: newMember });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    next(error);
  }
};

exports.rejectInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.body;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.invitationstatus !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been processed' });
    }

  

    await Invitation.findByIdAndDelete(invitationId);
    res.status(200).json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    next(error); 
  }
};

exports.getInvitations = async (req,res,next)=>{
  try{
    let receiverId = req.user.id;

    let invitations = await Invitation.find({subreviewerId: receiverId})
    .populate("reviewerId")
    .populate({
      path: 'reviewerId',
      populate:{
        path: "userId",
        select: "-password -__v -createdAt -updatedAt"
      }
    }).exec();

    return res.status(200).json(invitations)


  }catch(e){
    res.status(500).json({message: "Something went wrong!"})
  }
}