const Notification = require('../models/notification')

module.exports.getNotifications = async (req,res,next)=>{
    try {
        let notifications = await Notification.find({receiverId: req.user.id})
        res.status(200).json({notifications: notifications})
    } catch (error) {
        next(error)
    }
}