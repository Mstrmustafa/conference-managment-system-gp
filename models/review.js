const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    reviewerId:{type:mongoose.Schema.Types.ObjectId,ref:"Reviewer"},
    submissionId:{type:mongoose.Schema.Types.ObjectId,ref:"Submission"},
    description:{type:String}
})

module.exports = mongoose.model('Review',reviewSchema)