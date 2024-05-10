const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const User = require('./models/user');
const Post= require('./models/post');
const bcrypt = require('bcryptjs') //pour hacher le mot de passe
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const uploadMiddlewareprofil = multer({dest: 'profilphoto/'});
const fs = require('fs') //file systheme

//hache pasword
const salt = bcrypt.genSaltSync(10);
const secret = 'dfldkflkvclvf5vgffgfg';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads')); //dosier static
app.use('/profilphoto',express.static(__dirname+'/profilphoto')); 

mongoose.connect('your user name')

app.post('/register',uploadMiddlewareprofil.single('file'),async(req,res)=>{
    
    let newPath =null;
    if(req.file){
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ ext;
        fs.renameSync(path, newPath);
    }else{
        newPath = 'profilphoto/default.png'
    }
    
    const {username,password} = req.body;
    try{
        const userDoc = await User.create({
            username:username,
            password: bcrypt.hashSync(password,salt),
            cover:newPath,
        });
        res.json(userDoc);
    }catch(error){
        res.status(400).json({error});
    }
})

app.post('/login', async(req, res)=>{

    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk= bcrypt.compareSync(password,userDoc.password);
    if(passOk){
        //log in
        jwt.sign({username,id:userDoc._id,cover:userDoc.cover},secret, {},(error, token)=>{
            if(error) throw error;
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
                cover:userDoc.cover,
            });
        });
    }else{
        res.status(400).json('wrong credentials')
    }   
})

app.get('/profile',(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secret,{},(error,info)=>{
        if(error) throw error;
        res.json(info);
    })
})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})

app.post('/post',uploadMiddleware.single('file'), async (req,res)=>{
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token,secret,{},async(error,info)=>{
        if(error) throw error;
        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author: info.id,
        });
        res.json(postDoc);
    });

});


app.put('/post',uploadMiddleware.single('file'),(req,res)=>{
    
    let newPath=null;
    if(req.file){
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token,secret,async(error,info)=>{
        if(error) throw error;
        const {id,title,summary,content} = req.body;  // ses donner vient de Dataforms c
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author)=== JSON.stringify(info.id);
        if(!isAuthor){
            res.status(400).json('you are not the author');
        }
        const resulte = await Post.findByIdAndUpdate(id, {
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        
        res.json(resulte);
    });

});


app.get('/posts',async(req,res)=>{
    const posts = await Post.find().populate('author',['username']).sort({createdAt: -1}).limit(20);
    res.json(posts);
});

app.get('/post/:id',async (req,res)=>{
    const {id} = req.params;
    const post = await Post.findById(id).populate('author',['username']);  //populate permet de faire la referance a l'auteur et estraire des info specifique
    res.json(post);
});

//
app.listen(4000);