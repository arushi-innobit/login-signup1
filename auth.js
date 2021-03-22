const bodyParser = require('body-parser');
const user=require('./../models/user');

let auth =(req,res,next)=>{
    let token =req.cookies.auth;
    User.findByToken(err,user)
    {
        if(err) res.send(err);
        if(!user) 
        return res.json({error :true});
        req.token= token;
        req.user=user;
        next();

    }
}
module.exports={auth};

/*module.exports.login_post=async(req , res)=>{
    const {email , password }=req.body;
     try{
         const user = await user.login(email,password);
       res.status(200).json({user : user._id})

     }
     catch(err){
         res.status(400).json({});

     }
 }*/