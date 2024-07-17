const mongoose = require('mongoose');
const conference = require('./conference');
const submissionSchema = mongoose.Schema({
    conferenceId: {type:mongoose.Schema.Types.ObjectId,ref:'Conference'},
    avgScore: {type: Number,default: 0},
    isAccepted: {type: Boolean,default:false},
    authorId: {type: mongoose.Schema.Types.ObjectId,ref:'ConferenceMember'},
    submissionFields: {type:[String]},
    paper: {type:String},
    scores:{type:[Number],default:[]},
    abstract:{type:String}
})

module.exports = mongoose.model('Submission',submissionSchema);