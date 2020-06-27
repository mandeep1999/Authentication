


var express=require("express"),
  mongoose=require("mongoose"),
  passport=require("passport"),
  bodyParser=require("body-parser"),
  User=require("./models/user"),
  LocalStrategy=require("passport-local"),
  passportLocalMongoose=require("passport-local-mongoose"),
  ejs = require('ejs');
mongoose.connect("mongodb://localhost/auth_demo_app", {useUnifiedTopology: true,useNewUrlParser: true});
var app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
   secret:"Love hates fear",
   resave:false,
   saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//===============
//ROUTES
//===============

app.get("/",function(req,res){
    res.render("home",{currentUser:req.user});
})
app.get("/secret",isLoggedIn,function(req,res){
    res.render("secret",{currentUser:req.user});
})

//AUTH ROUTES
//SHOW SIGNUP FORM

app.get("/register",function(req,res){
    res.render("register",{currentUser:req.user});
})

//handling user signup

app.post("/register",function(req,res){
    // req.body.username;
    // req.body.password;
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
       if(err){
        console.log(err.message);
           return res.render("register");
       }
       passport.authenticate("local")(req,res,function(){
           res.redirect("/secret");
       });
    });
});


//LOGIN ROUTES

app.get("/login",function(req,res){
    res.render("login",{currentUser:req.user});
})

//login logic
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        console.log(err);
        res.redirect('/login') 
    }
      if (!user) { 
      res.redirect('/login'); 
    }
    req.logIn(user, function(err) {
        if (err) { 
            res.redirect('/login'); 
        }
         else{
           
            res.redirect('/secret');
        }
      });
    })(req, res, next);
  });

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

var port = process.env.port || 3000;

app.listen(port);
