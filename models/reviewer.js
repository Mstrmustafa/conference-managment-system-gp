const mongoose = require('mongoose')

const reviewerSchema = mongoose.Schema({
    memberId: {type: mongoose.Schema.Types.ObjectId,ref: 'ConferenceMember'},
    conferenceId:{type: mongoose.Schema.Types.ObjectId,ref: 'Conference'},
    assignedSubmissions: [{type:mongoose.Schema.Types.ObjectId,ref:'Submission'}]   
})

module.exports = mongoose.model('Reviewer',reviewerSchema)