import 'dotenv/config'
import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import session from 'express-session'
import passport from 'passport'
import passportLocalMongoose from 'passport-local-mongoose'


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

await mongoose.connect('mongodb://127.0.0.1:27017/storage').
catch(error => handleError(error))

const userSchema = new mongoose.Schema (
    {
        username:String,
        password:String
    }
);

userSchema.plugin(passportLocalMongoose);


export const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home.ejs");
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.get("/register",(req,res)=>{
    res.render("register.ejs",{output:""});
});

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets.ejs");
    }else{
        res.redirect("/login");
    }
});

app.post("/register", (req,res)=>{
 User.register({username:req.body["username"]},req.body["password"],function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate('local')(req,res,function(){
            res.redirect("/secrets");
        });
    }
 });
});

app.get("/logout",(req,res)=>{
    req.logout(function(err){
        console.log(err);
    });
    res.redirect("/");
})
  

app.post("/login",async (req,res)=>{
    
const user = new User({
    username:req.body["username"],
    password:req.body["password"]
});

req.login(user,function(err){
    if(err){
        console.log(err);
    }else{
        passport.authenticate('local')(req,res,function(){
            res.redirect("/secrets");
        });
    }
});
  
});

app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
});













