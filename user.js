var mongoose=require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('npm');
const confiq = require('../config/config').get(process.env.NODE_ENV);
const salt = 10;
const Schema = mongoose.Schema;

const userSchema=new Schema({
    firstname:{
        type: String,
        required: true,
        maxlength: 50
    },
    lastname:{
        type: String,
        required: true,
        maxlength: 50
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    password2:{
        type:String,
        required: true,
        minlength:8

    },
    token:{
        type: String
    }
});
 //login will be searched in compass

//setting up hashed passwords and salting
userSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});
//password comparison with the original password entered by the user
userSchema.methods.comparepassword=function(password,cb)
{
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

//Now , generating a token as soon as the user log in 

userSchema.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })

//login api

// userSchema.statics.login=async function(email,password){

//     const user = await this.findOne({email});
//     if(user){
//         const auth=await bcrypt.compare(password,user.password)
//         if(auth){
//             return user;
//         }
//         else throw Error('incorrect password');
//     }
//     else throw Error('incorrect email');
    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

//Logout token deleted

userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}
const login = mongoose.model('login',userSchema); 

module.exports=login;