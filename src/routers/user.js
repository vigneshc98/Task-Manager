const express = require('express');
const { LoggerLevel } = require('mongodb');
const mongoose = require('mongoose');
const User = require('../model/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail,sendCancelEmail} = require('../emails/account')

router.post('/users', async (req,res)=>{
    const user = new User(req.body);

    try {
        await user.save();
        // sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user,token});
    } catch (error) {
        res.status(400).send(error);
    }
    // user.save().then(()=>{
    //     res.status(201).send(user);
    // }).catch((error)=>{
    //     res.status(400).send(error);
    // })
});

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredential(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        // res.send({user:user.getPulicProfile(),token});
        res.send({user,token});
    } catch (error) {
        console.log(error.message);
        res.status(400).send({"error":error.message});
    }
});

router.post('/users/logout', auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll',auth, async (req,res)=>{
    try {
        req.user.tokens.splice(0,req.user.tokens.length);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get('/users/me',auth, async (req,res)=>{

    res.send(req.user);
});

//---- DONOT SERVER ANY PURPOSE
// router.get('/users/:id',auth, async (req,res)=>{
//     // console.log(req.params); //{ id: '2342424242423' }
//     const _id = req.params.id;
//     var valid = mongoose.Types.ObjectId.isValid(req.params.id);

//     if(valid){

//         try {
//             const user = await User.findById(_id);
//             if(!user){
//                 return res.status(404).send();
//             }
//             res.send(user);
//         } catch (error) {
//             res.status(500).send(error);
//         }

//         // User.findById(_id).then((user)=>{
//         //     if(!user){
//         //         return res.status(404).send();
//         //     }
//         //     res.send(user);
//         // }).catch((error)=>{
//         //     res.status(500).send(error);
//         // })
//     }else{
//         res.status(404).send('User not found');
//     }
// });

router.patch('/users/me',auth, auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));  //if all conditions are true then only returns true.

    if(!isValidOperation){
        return res.status(400).send({error:"inavlid updates!"})
    }

    //----HENCE WE ALREADY AUTHENTICATED THE USER NO NEED TO CHECK IT AGAIN, SO IT SERVER NO PURPOSE.
    // const _id = req.params.id;
    // const _id = req.user._id;
    // const valid = mongoose.Types.ObjectId.isValid(req.params.id);
    // if(valid){
    //     try {
    //         // const user = await User.findByIdAndUpdate(_id, req.body, {new:true, runValidators:true});  //it will bypass the middleware so..
    //         const user = await User.findByIdAndUpdate(_id);
    //         updates.forEach((update)=> user[update]= req.body[update]);
    //         await user.save();

    //         if(!user){
    //            return res.status(404).send('user not foudn');
    //         }
    //         res.send(user);
    //     } catch (error) {
    //         res.status(400).send(error);
    //     }
    // }else{
    //     res.status(404).send('User not found');
    // }
    try {
        updates.forEach((update)=> req.user[update]= req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete('/users/me',auth, async (req,res)=>{
    //----HENCE WE ALREADY AUTHENTICATED THE USER NO NEED TO CHECK IT AGAIN, SO IT SERVER NO PURPOSE.
    // const _id = req.user._id; 
    // const isValid = mongoose.Types.ObjectId.isValid(_id);
    // if(isValid){
    //     try {
    //         const user = await User.findByIdAndDelete(_id);
    //         if(!user){
    //            return res.status(404).send();
    //         }
    //         res.send(user);
    //     } catch (error) {
    //         res.status(400).send();
    //     }
    // }else{
    //     res.send(404).send();
    // }
    try {
        await req.user.remove();  // remove() method by mongoose
        // sendCancelEmail(req.user.email,req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
});

//Uploading image part
const updload = multer({
    // dest:'avatars', //we shouldnot use this if we want to store images in db
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload a jpg or png file')); //throw error
        }
        cb(undefined, true); //accept
        // cb(undefined,false); //reject
    }
});
router.post('/users/me/avatar',auth, updload.single('avatar'), async (req,res)=>{
    try {
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(400).send({'error':error.message});
    }
   },(error,req,res,next)=>{
       res.status(400).send({'error':error.message});
   }
);
router.delete('/users/me/avatar',auth, async (req,res)=>{
    try {
        req.user.avatar=undefined;
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(400).send();
    }
});
router.get('/users/:id/avatar', async(req,res)=>{
    console.log(req.params.id);
    try {
        const user =await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('Content-Type','image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});


module.exports = router;