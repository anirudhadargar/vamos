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
    req.session.username=req.body.username;
    try{
        const{username,password,email,contact,uniqueID}=req.body;
        const user=new User({username,email,contact,uniqueID})
        const UserAuth=await User.register(user,password)
        req.login(UserAuth,err=>{
            if(err) return next(err);
            req.flash('success',`Hello, ${username} Nice to See You`)
            if(req.body.hasOwnProperty("donor")){
                res.redirect("/donor");
            }
            else{
                res.redirect('/home')
            }
        })

    }catch(err){
        req.flash('error','oops ! User already exists')
        res.redirect('/register')
    }
});

router.post("/login",passport.authenticate('local',{failureFlash: true,failureRedirect:'/register'}),(req,res)=>{
    req.flash("success","welcome back!")
    req.session.username=req.body.username;
    if(req.body.hasOwnProperty("donor")){
        res.render("dashboard",{name:req.body.username});
    }
    else{
        res.redirect("/home");
    }
})

router.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        else{
            res.redirect("/home");
        }
    })
})

module.exports=router;