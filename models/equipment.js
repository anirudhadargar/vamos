const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const equipSchema=new Schema({
    name:String,
    descriptiom: String,
    category:String,
    image:String,
    hospital:[{
        name:String,
        location:String,
        cost:Number
    }]
})
//we can review afterwards maybe.

module.exports=mongoose.model('equipment',equipSchema)