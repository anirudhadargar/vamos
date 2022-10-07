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
        cost:Number,
        quantity: Number
    }]
})

//we can review afterwards maybe.

module.exports=mongoose.model('equipment',equipSchema)


/*db.equipment.insertOne({
    name:'Oxygen Cylinder',
    description:'This is oxygen cylinder',
    category:'Cylinder',
    image:'o2cylinder',
    hospital:[{
        name:'RIT',
        location:"Mattikere",
        cost:5000,
        quantity: 20
    },
    {
        name:'City hospital',
        location:"MSR nagar",
        cost:7000,
        quantity: 35
    },
    {
        name: "Appolo",
        location: "Banglore",
        cost: 2000,
        quantity: 15
    }

]
})*/