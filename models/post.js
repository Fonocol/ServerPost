const mongoose = require('mongoose');
const {Schema,model} = mongoose;


const PostScheme = new Schema({
    title:{
        type: String,
    },
    summary:{
        type: String,
    },
    cover:{
        type: String,
    },
    content:{
        type: String,
    },
    author:{
        type:Schema.Types.ObjectId,
        ref: 'User',
    },
},{
    timestamps: true,
});

const PostModel = model('Post',PostScheme);

module.exports = PostModel;

//https://www.youtube.com/watch?v=xKs2IZZya7c&t=1719s