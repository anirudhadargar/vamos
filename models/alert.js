const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const alertSchema=new Schema({
    receiverName:String,
    allAlerts:[{
        equipmentName:String,
        hospitalName:String,
        dueDate:String,
    }]
});

alertSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model('Alert',alertSchema);

/*
    db.alert.insertOne({
        cityName:"Bangalore",
        types:[{
            diseaseName:"Road accidents",
            equipmentRequired:["Pulse Recorder","Oxygen Cylinder","ICU Bed"]
        },
        {
            diseaseName:"Covid19",
            equipmentRequired:["Pulse oximeters","Patient monitors","Oxygen bed"]
        }]
    })
*/

