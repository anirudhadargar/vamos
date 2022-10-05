module.exports.isLoggedin=(req,res,next)=>{
    console.log(req.originalUrl)
    req.session.returnTo=req.originalUrl
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
}