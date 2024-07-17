const mongoose = require('mongoose')
const conferenceSchema = mongoose.Schema({
    title: {type: String},
    shortName: {type: String},
    description: {type: String},
    // abstract:{type: String,default: 'NA'},
    location: {type: String},
    maxNumOfSubmissions: {type: Number,default: 100},
    isNameEnabled: {type: Boolean,default: false},
    isAbstractEnabled:{type: Boolean,default: false},
    allAccessSubreviewer:{type: Boolean,default: false},
    manager: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
    members: [{type: mongoose.Schema.Types.ObjectId,ref:'ConferenceMember'}],
    //from here
    startDate:{type: Date},
    endDate:{type: Date},
    confield:{type:String},
    acceptenceStatus:{type:String,default:'Waiting'},
    poster: {type:String},
    

},{
    timestamps: true
})
//
module.exports = mongoose.model('Conference',conferenceSchema)