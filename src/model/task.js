const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({   //this object is converted into schema.
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
});

const Task = mongoose.model('Tasks',taskSchema);

module.exports=Task;

// const me2 = new Task({
//     description:'  Hello World  ',
// });

// me2.save().then(()=>{
//     console.log(me2);
// }).catch((error)=>{
//     console.log(error);
// });