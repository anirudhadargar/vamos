const express=require('express')
const passport =require('passport')
const User=require('../models/user')
const router=express.Router()

router.get("/login",function(req,res){
    res.render("login");
});

router.get("/register",function(req,res){
    res.render("register");
});

router.post("/register",async(req,res)=>{
    try{
        const{username,password,email,contact,uniqueID}=req.body;
        const user=new User({username,email,contact,uniqueID})
        const UserAuth=await User.register(user,password)
        req.login(UserAuth,err=>{
            if(err) return next(err);
            req.flash('success',`Hello, ${username} Nice to See You`)
            res.redirect('/home')
        })

    }catch(err){
        req.flash('error','oops ! User already exists')
        res.redirect('/register')
    }
});

router.post("/login",function(req,res){
    const user=new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/home");
            });
        }
    });
});

module.exports=router;