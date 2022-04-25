const express = require('express');
require('./db/mongoose'); //mongoose connect to the database.
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

//registering with express application
app.use(express.json()); 
app.use(userRouter);
app.use(taskRouter);

app.listen(port, ()=>{
    console.log('server started on port ',port);
});

// -----------------
// const sgMail = require('@sendgrid/mail');


// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//     sgMail.send({
//         to:'vignesh.chandrashekar16@gmail.com',
//         from:'vignesh.c1698@gmail.com',
//         subject:'Thank for joining in',
//         text:`Welcome to the app, let me know how you get along with the app.`
//     });




