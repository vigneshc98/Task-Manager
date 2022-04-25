const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'vignesh.c1698@gmail.com',
        subject:'Thank for joining in',
        text:`Welcome to the app, ${name}, let me know how you get along with the app.`
    });
}
const sendCancelEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'vignesh.c1698@gmail.com',
        subject:'Sorry to see you go!',
        text:`Goodbye ${name}, We hope to see you back sometime soon.`
    });
}


module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}


