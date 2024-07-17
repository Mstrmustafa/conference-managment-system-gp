const mongoose = require('mongoose')

const feedbackSchema = mongoose.Schema({
    title:{type:String},
    description:{type:String}
})

module.exports = mongoose.model('Feedback',feedbackSchema)