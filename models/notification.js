const mongoose = require('mongoose')
const notifcationSchema = mongoose.Schema({
    receiverId: {type: mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    notificationContent: {type: String,required: true},
},{
    timestamps: true
})

module.exports = mongoose.model('Notification',notifcationSchema)