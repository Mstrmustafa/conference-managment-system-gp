const mongoose = require('mongoose')

const invitationSchema = mongoose.Schema({
    reviewerId:{type: mongoose.Schema.Types.ObjectId,ref:"ConferenceMember"},
    subreviewerId:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    conferenceId: {type:mongoose.Schema.Types.ObjectId,ref:'Conference'},
    textmessage:{type:String},
    invitationstatus:{type:String}

})

module.exports = mongoose.model('Invitation',invitationSchema)