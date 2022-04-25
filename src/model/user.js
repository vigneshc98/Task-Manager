const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

//1.create the schema
const userSchema = new mongoose.Schema({ //this object is converted into schema.
    name: {
        type: String,
        required:true,
        trim:true
    },
    email: {
        type: String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email id')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('invalid password, password shouldnot contain string "password"');
            }
        }
    },
    age:{
        type: Number,
        default:18,
        validate(value){
            if(value<0){
                throw new Error('age shouldnt be negative no')
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
   },
   {
    timestamps:true
   }
);

//create virtual property for maitaining task
userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner',
    // justOne:true
});

//2.add MiddleWare (hash the password before saving in db)
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});
// MiddleWare to delete the tasks on deleting the user
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})

//create a method to check login credential
userSchema.statics.findByCredential = async (email, password) =>{
    const user = await User.findOne({email});
    if(!user){
        // console.log('unable to find user');
        throw new Error('Unable to login, please check username or password');
    }
    const isPassMatch = await bcrypt.compare(password, user.password);
    // console.log(isPassMatch);
    if(!isPassMatch){
        // console.log('unable to match password');
        throw new Error('Unable to login, please check username or password');
    }
    return user;
}

//instance method to generate jwt token
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString() },'secretSignature',{expiresIn:'4 days'});

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
}

//filter user info
// userSchema.methods.getPulicProfile = function(){
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar

    return userObject;
}

const User = mongoose.model('User',userSchema);

module.exports = User

// const me1 = new User({
//     name:' john',
//     email:' john@GMAIL.COM',
//     password:'asdfpasswordjj'
// });

// me1.save().then(()=>{
//     console.log(me);
// }).catch((error)=>{
//     console.log(error);
// });
