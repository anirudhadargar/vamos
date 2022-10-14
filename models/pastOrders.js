const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const pastOrderSchema=new Schema({
    name:String,
    transactions:[{
        hospitalName:String,
        equipmentName:String,
        equipmentPurchased:Number,
        equipmentCost:Number
    }]
});

pastOrderSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model('pastOrder',pastOrderSchema);
