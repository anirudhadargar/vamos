//jshint esversion:6

require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const ejsMate=require('ejs-mate');
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");
const LocalStratergy=require('passport-local')
const User=require('./models/user')
const flash=require('connect-flash')
const equip=require('./models/equipment')
const path=require("path");
const request=require("./models/equipmentOrder");
const haversine = require("haversine-distance");

const app=express();

let userSession;

//Routes
const UserRoutes=require('./routes/user');
const { resourceLimits } = require("worker_threads");

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname,'public')));

mongoose.connect("mongodb://localhost:27017/manipalDB",{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
// const userSchema=new mongoose.Schema({
//     username: String,
//     password: String,
//     uniqueID: String,
//     ContactNumber:Number,
//     email:String,
// });

// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);


//requiring ejs-mate
app.engine('ejs',ejsMate);


app.use(flash())
// const User=new mongoose.model("User",userSchema);
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStratergy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.login = req.isAuthenticated();
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

//routes to handle
app.use('/',UserRoutes)

app.get("/home",function(req,res){
    //console.log(req.session.username);
    res.render("home");
});

app.get("/form",function(req,res){
    res.render('form')
});

app.post("/formPost",function(req,res){
    //console.log(req.body);
    const equipmentName=req.body.equipmentName;
    equip.findOne({name:equipmentName},function(err,info){
        if(err){
            console.log(err);
        }
        else{
            //console.log("Found");
            //redirect to show page
            var lat1,lat2,lon1,lon2;
            var newArray=[];
            var newList=[];
            User.findOne({username:req.session.username},function(err,hospital){
                if(err){
                    console.log(hospital);
                    console.log(hospital.address);
                    console.log(err);
                }
                else{
                    lat1=hospital.latitude;
                    lon1=hospital.longitude;
                    console.log(lat1);
                    console.log(lon1);
                }
            });
            for(var i=0;i<info.hospital.length;i++){
                User.findOne({username:info.hospital[i].name},function(err,doc){
                    if(err){
                        console.log(err);
                    }
                    else{
                        lat2=doc.latitude;
                        lon2=doc.longitude;
                        console.log(lat2);
                        console.log(lon2);
                    }
                });
                var point1 = { "lat": lat1, "lng": lon1 }

                //Second point in your haversine calculation
                var point2 = { "lat": lat2, "lng": lon2}

                var haversine_m = haversine(point1, point2); //Results in meters (default)
                var haversine_km = haversine_m /1000; //Results in kilometers
                /*var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2-lat1);  // deg2rad below
                var dLon = deg2rad(lon2-lon1); 
                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);

                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                var d = R * c; // Distance in km
                function deg2rad(deg) {
                    return deg * (Math.PI/180)
                }
                console.log(d);*/
                newArray.push({
                    "name":info.hospital[i].name,
                    "distance":haversine_km
                });
            }
            if(Boolean(req.body.status)){
                //console.log(req.session.username);
                newArray.sort(function(a,b){
                    if(a.distance==b.distance){
                        return a.distance>b.distance?1:a.distance<b.distance?-1:0;
                    }
                    return a.distance>b.distance?1:-1;
                });
                for(var i=0;i<newArray.length;i++){
                    for(var j=0;j<info.hospital.length;j++){
                        if(newArray[i].name==info.hospital[j].name){
                            newList.push({
                                "name":info.hospital[j].name,
                                "location":info.hospital[j].location,
                                "cost":info.hospital[j].cost,
                                "quantity": info.hospital[j].quantity,
                                //"distance":newArray[i].distance
                            });
                        }
                    }
                }
                console.log(newArray);
                console.log(newList);
                res.render("show",{listOfHospitals:newList,nameOfEquipment:info.name,quantity:req.body.quantity});
            }
            else{
                info.hospital.sort(function(a,b){
                    if(a.cost==b.cost){
                        return a.cost>b.cost?1:a.cost<b.cost?-1:0;
                    }
                    return a.cost>b.cost?1:-1;
                });

                /*info.hospital.push({
                    name: "Appolo",
                    location: "Banglore",
                    cost: 2000
                });
                info.save();*/
                //console.log(info.hospital);
                res.render("show",{listOfHospitals:info.hospital,nameOfEquipment:info.name,quantity:req.body.quantity});
            }
        }
    });
    
});

app.get("/donor",function(req,res){
    res.render("donor");
});

app.post("/order",function(req,res){
    request.findOne({name:req.body.hospitalName},function(err,hospital){
        if(err){
            console.log(err);
        }
        else if(hospital){
            hospital.orders.push({
                requestingHospitalName:req.session.username,
                equipmentName:req.body.equipmentName,
                equipmentQuantity: req.body.equipmentrequired
            })
            hospital.save();
        }
        else{
            request.create({
                name:req.body.hospitalName,
                orders:[{
                    requestingHospitalName:req.session.username,
                    equipmentName:req.body.equipmentName,
                    equipmentQuantity: req.body.equipmentrequired
                }]
            },function(err,doc){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(doc);   
                }
            });
            //request.save();
        }
    })

});

app.get("/dashboard",function(req,res){
    res.render("dashboard",{name:userSession});
});

app.post("/donorPost",function(req,res){
    const equipment=req.body.EquipmentName;
    const quantity=req.body.Quantity;
    const hospitalName=req.body.hospitalName;
    const hospitalLocation=req.body.hospitalAddress;
    const equipmentCost=req.body.cost;
    equip.findOne({"name":equipment},function(err,info){
        if(err){
            console.log(err);
        }
        else if(info){
            var flag=0;
            for(var i=0;i<info.hospital.length;i++){
                if(info.hospital[i].name==hospitalName){
                    info.hospital[i].quantity=quantity;
                    info.hospital[i].cost=equipmentCost;
                    flag=1;
                    break;
                }
            }
            if(flag==0){
                info.hospital.push({
                    name: hospitalName,
                    location: hospitalLocation,
                    cost: equipmentCost,
                    quantity:quantity
                });
            }
            info.save();
            console.log("Successfully updated!");
        }
        else{
            equip.create({
                name:equipment,
                description:"",
                category:"",
                image:"",
                hospital:[{
                    name:hospitalName,
                    location:hospitalLocation,
                    cost:equipmentCost,
                    quantity: quantity
                }]
            })
        }
    });
    res.redirect("/dashboard");
    userSession=hospitalName;
});


app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});

app.post("/dashboard",function(req,res){
    if(req.body.hasOwnProperty("request")){
        res.redirect("/pendingReq");
    }
    else if(req.body.hasOwnProperty("update")){
        res.redirect("/donor");
    }
    else{
        res.redirect("/home");
    }
});

app.get("/pendingReq",function(req,res){
    //console.log("Display pending requests here !");
    var empty=[];
    request.findOne({name:req.session.username},function(err,hospital){
        if(err){
            console.log(err);
        }
        else if(hospital){
            console.log(req.session.username);
            console.log(hospital);
            res.render("pendingReq",{orders:hospital.orders});
        }
        else{
            res.render("pendingReq",{orders:empty});
        }
    });
});

app.post("/deleteOrder",function(req,res){
    const hospitalName=req.body.checkbox;
    var newOrders;
    var hospitalToDelete;
    /*request.findOne({name:req.session.username},function(err,doc){
        if(err){
            console.log(err);
        }
        else{
            console.log(doc.orders);
        }
    })*/
    request.findOne({name:req.session.username},function(err,hospital){
        if(err){
            console.log(err);
        }
        else{

            newOrders=hospital.orders.filter((item)=>item.requestingHospitalName!=hospitalName);
            hospital.orders=newOrders;
            hospital.save(function(err){
                if(!err){
                    res.redirect("/pendingReq");
                }
            });
        }
    });
});

app.listen(3000,function(){
    console.log("Server started on port 3000.");
});

//AIzaSyBtMYluDWhixYcCNVmuYvZP4joZeDvvFd8


