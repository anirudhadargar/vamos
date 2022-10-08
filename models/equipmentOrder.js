const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const orderSchema=new Schema({
    name: String,
    orders:[{
        requestingHospitalName:String,
        equipmentName:String,
        equipmentQuantity: Number
    }]
})

//we can review afterwards maybe.

module.exports=mongoose.model('order',orderSchema)