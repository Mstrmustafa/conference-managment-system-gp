const mongoose = require('mongoose')

const memberSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
    conferenceId: {type:mongoose.Schema.Types.ObjectId,ref:'Conference'},
    roleType: {type: String}
})

module.exports = mongoose.model('ConferenceMember',memberSchema)