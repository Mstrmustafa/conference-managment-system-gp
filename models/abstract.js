const mongoose = require('mongoose')

const abstractSchema = mongoose.Schema({
    authorId:{type: mongoose.Schema.Types.ObjectId,ref:'Author'}
})

module.exports = mongoose.model('Abstract',abstractSchema)