const express =require('express');
const mongoose = require('mongoose');
const bodyparser =require('body-parser');
const cookieParser =require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const User = require('./models/user');
const {auth} = require('./middlewares/auth');
const { Logger } = require('mongodb');
const app=express();



// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());



//databse connection
const dburi = 'mongodb://localhost/Users';
mongoose.connect(dburi , {
    useNewUrlParser: true , useUnifiedTopology: true})
    .then((result) => console.log("connected to db"))

mongoose.connection
.once('open',() => console.info("Connected"))
.on('error',(error)  => {
    console.log('Connection error:',error);
});
                                //once listen to this event (open the connection)


//adding the new user , Sign up route

app.post('/api/register',function(req,res)
{
    const newuser=new User(req.body);
    console.log(newuser);
   if(newuser.password != newuser.password2)
   {
   return res.status(400).json({message: "password not match"});
   }
    else
    User.findOne({email:newuser.email},function(err,user){
        if(user) 
        {
        return res.status(400).json({ auth : false, message :"email exits"});
        }
        newuser.save((err,doc)=>{
            if(err) {
                console.log(err);
                return res.status(400).json({ success : false});
            }
            res.status(200).json({
                succes:true,
                user : res.json({
                    firstname : newuser.firstname , 
                    lastname : newuser.lastname , 
                    email : newuser.email , 
                    password : newuser.password })
            });
        });
    });
});
 // Login route of the user 
 app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findBy(token,(err,user)=>{
        if(err) 
        return  res.send(err);
        if(user) 
        return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id , 
                        email : user.email
                    });
                });    
            });
          });
        }
    });
});

//Logout of the user and deleting the token
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 

app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(3000,()=>{
    console.log(`app is live at ${PORT}`);
});