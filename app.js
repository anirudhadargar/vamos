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
const stripe = require('stripe')('sk_test_51LoWOgSA0dw3ZeMMl9VJ55DMbyMI1XU9XQbN3gUjDVTYw1HwSj72az1AZIT9cZxcc3IXeOilDQcGv5fC0aCIfB1100gatFdKpu');

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

app.post("/home",function(req,res){
    res.redirect("/home");
});

app.get("/form",function(req,res){
    res.render('form')
});

app.post("/formPost",function(req,res){
    //console.log(req.body);
    const equipmentName=req.body.equipmentName;
    equip.findOne({name:equipmentName},async(err,info)=>{
        if(err){
            console.log(err);
        }
        else if(info){
            var newArray=[];
            var newList=[];
            var coordinates=[];                  
            if(Boolean(req.body.status)){
                console.log("start");
                var lat1,lat2,lon1,lon2;
                
                User.findOne({username:req.session.username},function(err,hospital){
                    if(err){
                        console.log(hospital);
                        console.log(hospital.address);
                        console.log(err);
                    }
                    else{
                        lat1=hospital.latitude;
                        lon1=hospital.longitude;
                        coordinates.push({
                            "lat":hospital.latitude,
                            "lng": hospital.longitude,
                            "info": hospital.username,
                        });
                        //console.log(lat1);
                        //console.log(lon1);
                    }
                });
                for(var i=0;i<info.hospital.length;i++){
                const doc=await User.findOne({username:info.hospital[i].name});
                lat2=doc.latitude;
                lon2=doc.longitude;
                coordinates.push({
                    "lat":doc.latitude,
                    "lng":doc.longitude,
                    "info":doc.username
                });
                var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2-lat1);  // deg2rad below
                var dLon = deg2rad(lon2-lon1); 
                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                var d = Math.ceil(parseFloat((R * c).toFixed(2))); // Distance in km
                console.log(d);
                newArray.push({
                    "name":info.hospital[i].name,
                    "distance":d
                });
                function deg2rad(deg) {
                    return deg * (Math.PI/180)
                }
                //console.log(req.session.username);
                newArray.sort(function(a,b){
                    if(a.distance==b.distance){
                        return a.distance>b.distance?1:a.distance<b.distance?-1:0;
                    }
                    return a.distance>b.distance?1:-1;
                });
                }
                for(var i=0;i<newArray.length;i++){
                        for(var j=0;j<info.hospital.length;j++){
                            if(newArray[i].name==info.hospital[j].name){
                                newList.push({
                                    "name":info.hospital[j].name,
                                    "location":info.hospital[j].location,
                                    "cost":info.hospital[j].cost,
                                    "quantity": info.hospital[j].quantity,
                                    "distance":newArray[i].distance
                                });
                            }
                        }
                }
                console.log(newArray);
                console.log(newList);
                console.log("working");

                res.render("shows",{listOfHospitals:newList,nameOfEquipment:info.name,quantity:req.body.quantity,hospitalCoordinates:coordinates});
                // {listOfHospitals:newList,nameOfEquipment:info.name,quantity:req.body.quantity,hospitalCoordinates:coordinates}
            }
            else{
                //
                User.findOne({username:req.session.username},function(err,hospital){
                    if(err){
                        console.log(hospital);
                        console.log(hospital.address);
                        console.log(err);
                    }
                    else{
                        lat1=hospital.latitude;
                        lon1=hospital.longitude;
                        coordinates.push({
                            "lat":hospital.latitude,
                            "lng": hospital.longitude,
                            "info": hospital.username,
                        });
                        //console.log(lat1);
                        //console.log(lon1);
                    }
                });
                for(var i=0;i<info.hospital.length;i++){
                const doc=await User.findOne({username:info.hospital[i].name});
                lat2=doc.latitude;
                lon2=doc.longitude;
                coordinates.push({
                    "lat":doc.latitude,
                    "lng":doc.longitude,
                    "info":doc.username
                });                
                }
                //
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
                res.render("shows",{listOfHospitals:info.hospital,nameOfEquipment:info.name,quantity:req.body.quantity,hospitalCoordinates:coordinates});
            }
        }
        else{
            res.render("notAvailable");
        }

    });

});

app.post("/notAvailable",function(req,res){
    res.redirect("/form");
});

app.get("/donor",function(req,res){
    var hospitalLocation="";
    console.log(req.session.username);
    User.findOne({username:req.session.username},function(err,doc){
        if(err){
            console.log(err);
        }
        else{
            hospitalLocation=doc.address;
            console.log(hospitalLocation);
            res.render("donor",{address:hospitalLocation});
        }
    })
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
    });
    const totalCost=req.body.equipmentCost*req.body.equipmentrequired;
    res.render("paymentDetails",{hospitalName:req.body.hospitalName,equipmentName:req.body.equipmentName,equipmentCost:req.body.equipmentCost,equipmentrequired:req.body.equipmentrequired,totalCost:totalCost});

});

app.get("/dashboard",function(req,res){
    res.render("dashboard",{name:userSession});
});

app.post("/donorPost",function(req,res){
    const equipment=req.body.EquipmentName;
    const quantity=req.body.Quantity;
    const hospitalName=req.body.hospitalName;
    const hospitalLocation=req.body.hospitalAddress;
    console.log(hospitalLocation);
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
                    info.hospital[i].location=hospitalLocation;
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
    userSession=hospitalName;
    res.redirect("/dashboard");
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

// CHANGES MADE FOR IN HERE...
app.get('/paymentDetails',(req,res)=>{
    res.render('paymentDetails')
})
//after show ejs we have to post the details to the ejs page


// app.get('/payment',(req,res)=>{
    
// })

app.post('/paymentDetails',(req,res)=>{
    res.render('payment')
})
const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };
  
  app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;
  
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    //   payment_method_types:['card'],
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });

  app.get("/success",function(req,res){
    res.render("success");
  });

app.listen(3000,function(){
    console.log("Server started on port 3000.");
});



//AIzaSyBtMYluDWhixYcCNVmuYvZP4joZeDvvFd8


