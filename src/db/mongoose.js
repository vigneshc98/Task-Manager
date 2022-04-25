const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:true
    // useUnifiedTopology: true,
});
