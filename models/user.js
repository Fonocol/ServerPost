const mongoose = require('mongoose');
const {Schema,model} = mongoose;


const UserScheme = new Schema({
    username:{
        type: String,
        require: true,
        min: 4 ,
        unique: true
    },
    password:{
        type: String,
        require: true,
    },
    cover:{
        type: String,
    }
});

const UserModel = model('User',UserScheme);

module.exports = UserModel;

//https://www.youtube.com/watch?v=xKs2IZZya7c&t=1719s