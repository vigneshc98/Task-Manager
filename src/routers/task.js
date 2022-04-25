const express = require('express');
const mongoose = require('mongoose');
const Task = require('../model/task');
const auth = require('../middleware/auth')
const router = new express.Router();

router.post('/tasks',auth, async (req,res)=>{
    // const tasks = new Task(req.body);
    const tasks = new Task({
        ...req.body,
        "owner":req.user._id
    });

    try {
        await tasks.save();
        res.status(201).send(tasks);
    } catch (error) {
        res.status(400).send(error);
    }

    // tasks.save().then(()=>{
    //     res.status(201).send(tasks);
    // }).catch((error)=>{
    //     res.status(400).send(error);
    // })
});

//GET - /tasks?completed=true(or)false
//GET - /task?limit=2&skip=2
//GET - /task?sortBy=createdAt:desc
router.get('/tasks', auth, async (req,res)=>{
    const match ={};
    const sort = {};

    if(req.query.completed){
        match.completed= req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1]==='desc' ? -1 : 1
    }

    try {
        const user = await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            } 
        });
        res.send(user.tasks);
        // const tasks = await Task.find({'owner':req.user._id});
        // res.send(tasks);
    } catch (error) {
        res.status(500).send();
    }

    // Task.find({}).then((tasks)=>{
    //     res.send(tasks);
    // }).catch((error)=>{
    //     res.status(500).send();
    // })
});

router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id;
    const valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if(valid){  
        try {
            // const task = await Task.findById(_id);
            const task = await Task.findOne({_id, 'owner':req.user._id});  
            if(!task){
                return res.status(404).send();
            }
            res.send(task);
        } catch (error) {
            res.status(500).send(error);
        }
        // Task.findById(_id).then((user)=>{
        //     if(!user){
        //         return res.status(404).send();
        //     }
        //     res.send(user);
        // }).catch((error)=>{
        //     res.status(400).send(error);
        // })
    }else{
        res.status(404).send();
    }
});

router.patch('/tasks/:id',auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates!'})
    }
    
    const _id = req.params.id;
    const isValid = mongoose.Types.ObjectId.isValid(req.params.id);

    if(isValid){
        try {
            // const task = await Task.findByIdAndUpdate(_id, req.body, {new:true, runValidators:true});
            // const task = await Task.findByIdAndUpdate(_id);
            const task = await Task.findOne({_id, owner:req.user._id});

            if(!task){
               return res.status(404).send();
            }
            updates.forEach((update)=> task[update]=req.body[update]);
            await task.save();
            
            res.send(task);
        } catch (error) {
            res.status(400).send(error);
        }
    }else{
        res.status(404).send('user not foudn')
    }
});

router.delete('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(isValid){
        try {
            // const task = await Task.findByIdAndDelete(_id);
            const task = await Task.findOneAndDelete({_id,owner:req.user._id});
            if(!task){
               return res.status(404).send();
            }
            res.send(task);
        } catch (error) {
            res.status(400).send();
        }
    }else{
        res.send(404).send();
    }
});

module.exports=router;