const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema=new Schema({
    address: String,
    uniqueID: String,
    contact:Number,
    email:String,
    latitude:Number,
    longitude:Number
})

UserSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model('User',UserSchema)