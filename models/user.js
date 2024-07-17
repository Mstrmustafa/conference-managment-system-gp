const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fullName: {type: String},
    email: {type: String},
    phoneNumber: {type: String,default: ""},
    password: {type: String},
    // interests: {type:[String]},
    degree: {type: String,default:''},
    googleScholarUsername: {type: String,default:''},
    // cv: {type:String,default: ''},
    university: {type:String,default: ''},
    webPage: {type: String,default: ''},
    //from here
    country:{type:String,default: ""},
    gender:{type:String,default: ""},
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
    userType: {type: String}
    
},{
    timestamps:true
})

module.exports = mongoose.model('User',userSchema)