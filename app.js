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
            if(Boolean(req.body.status)){

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
            equip.insertOne({
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
    request.findOne({name:req.session.username},function(err,hospital){
        if(err){
            console.log(err);
        }
        else{
            console.log(req.session.username);
            console.log(hospital);
            res.render("pendingReq",{orders:hospital.orders});
        }
    });
});

app.post("/deleteOrder",function(req,res){
    const hospitalName=req.body.checkbox;
    request.updateOne({name:req.session.username},{$pull:{orders:{requestingHospitalName:hospitalName}}});
    res.redirect("/pendingReq");
});

app.listen(3000,function(){
    console.log("Server started on port 3000.");
});

//AIzaSyBtMYluDWhixYcCNVmuYvZP4joZeDvvFd8


