const express =require('express');
const mongoose = require('mongoose');
const bodyparser =require('body-parser');
const cookieParser =require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const User = require('./models/user');
const bcrypt = require('bcrypt');
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

app.post('/api/register',async function(req,res)
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
 app.post('/api/login', async function(req,res){
      //let token=req.cookies.auth;
    const user= await User.findOne({email : req.body.email});
        if(!user) 
        {
        return  res.status(400).json({message: "User does not exist"});
        }
        const auth= await bcrypt.compare(password,user.password);
        if(!auth)
        { 
         return res.status(400).json({
            message:"Password does not match"
        });
    }
        /*else{
            User.findOne({'email':req.body.email},function(error,User){
                if(!User) 
                return res.json({isAuth : false, message : ' Email not found'});

                User.comparepassword(req.body.password,(error,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        */
                User.generateToken((error,User)=>{
                    if(!User) return res.status(400);
                    res.cookie('auth',User.token).json({
                        isAuth : true,
                        id : User._id , 
                        email : User.email
                    });
                });
            });
          //});
        
        //}
    //} )
//  });

//Logout of the user and deleting the token
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(error) return res.status(400).send(error);
        res.sendStatus(200);
    });

}); 

app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});