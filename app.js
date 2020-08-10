var express = require('express');
var app = express();
var fs = require('fs');
var session = require('express-session');
app.set('view engine','jade');
app.use(express.static('public'));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
var multer = require('multer');
var nodemailer = require('nodemailer');


//app.use(session({ secret: 'keyboard cat',proxy: true,resave: true,saveUninitialized: true, cookie: { maxAge: 600000 }}));
app.use(session({ secret: 'keyboard cat',proxy: true,resave: true,saveUninitialized: true, cookie: { maxAge: 600000 }}));
mongoose.connect('mongodb://localhost/expense',{useUnifiedTopology: true,useNewUrlParser: true});
var Schema = mongoose.Schema;

var signupschema =  new Schema(
    {
        username: {type: String, required: false},
        email: {type: String, required: true},
        password: {type: String, required: true }
    });
    var users = mongoose.model('users',signupschema);

var incomeschema =  new Schema(
        {
            amount: {type: Number, required: false},
            date: {type: Date, required: true},
            day: {type: Number,requried: true},
            month: {type: Number,requried: true},
            year: {type: Number,requried: true},
            email: {type: String, required: true},
            
        });
        var income = mongoose.model('income',incomeschema);

var expenseschema =  new Schema(
         {
             amount: {type: Number, required: false},
             date: {type: Date, required: true},
             day: {type: Number,requried: true},
             month: {type: Number,requried: true},
             year: {type: Number,requried: true},
             category: {type: String, required: true},
             method: {type: String, required: true},
             email: {type: String, required: false}
                
            });
            var expense = mongoose.model('expense',expenseschema);


app.get('/', function (req, res) {
   


        res.render('index1');

});

app.get('/login', function (req, res) {
   


    res.render('login');

});


app.post('/login', function (req, res) {
    
    console.log("hai");
    var email = req.body.username;
    var password = req.body.pass;
    console.log(email);
    console.log(password);
    users.find({$and:[{'email': email},{'password': password}]},function(err, users)
      
    {
        //console.log(users);
        if(err) throw err;


        if (users && users.length) { 

            //console.log("qwerty". users);
            var mail = users[0].email;
            console.log(mail);

           
            req.session.email =mail;
            //var email =  req.session.email;
           
            console.log(req.session.email);
 
         res.redirect('/home');
      } else {
         //var msg ="Login Faild!";
         res.redirect('/login');
         // empty
      }

       
     } );
       

    });

app.get('/signup', function (req, res) {
   


    res.render('signup');

});

app.post('/signup', function (req, res) {

    var result = users(
        {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
        });
         var email = req.body.email;
         var password = req.body.password;
         var confirmpassword = req.body.confirm_password;
            users.find({'email': email},function(err,user)
            {
            if(err) throw err;
            if(user && user.length)
            {
                var msg ="email already existing";
                res.render('signup',{message:msg,res: result});
            }else if(password == confirmpassword)
                {
        //console.log(result);
                    result.save(function (err,result)
                    {
                        if(err) throw err;
                    res.redirect('home');
                    });
                }else
                {
                    var msg2 ="password does not matched";
                    res.render('signup',{message2:msg2});   
                }
    });
});



    app.get('/home', function (req, res) {
   
     if(req.session.email)
      {
          var incom;
        console.log( "kkk" );
        var email = req.session.email;
        var datetime = new Date();
        var month = datetime.getUTCMonth() + 1;
        console.log(month);
        income.aggregate([
            {
                $match : {"email" : email,"month": month}},
                {$unwind : "$amount"},
                //{$match : {"email" : email}},
                {
                $group: {
                  _id: "$email",
                  total: {
                    $sum: "$amount" 
                  }
                }
            }],
        function (err, data){
           
       // console.log( data[0].total);

        if(data == 0)
        {
           var incom=0;
        }else
        {
            console.log(data);
            var  incom = data[0].total;
            console.log(incom);
        }
        

        expense.aggregate([
            {
                $match : {"email" : email,"month": month}},
                {$unwind : "$amount"},
                //{$match : {"email" : email}},
                {
                $group: {
                  _id: "$email",
                  total: {
                    $sum: "$amount" 
                  }
                }
            }],
        function (err, data){
           
        //console.log( data[0].total);

        if (data ==0)
        {
            var expen =0;
        }else
        {
        var  expen = data[0].total;
        console.log(expen);
        }
        var bal= incom- expen;
        res.render('home',{income:incom,expense:expen,balance:bal});
        });
        
    }); 
        
       
        
    }else{
        res.redirect('/login');
    }
    });

app.get('/expenseadd', function (req, res) {


     if(req.session.email)
     {
        res.render('expenseadd');
     }else{
        res.redirect('/login');
     }

    
    });


    app.post('/expenseadd', function (req, res) {

        var date = new Date(req.body.date);
        var day = date.getUTCDate();
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        var result = expense(
            {
                amount : req.body.amount,
                 date : req.body.date,
                 day: day,
                 month: month,
                 year: year,
                 category : req.body.category,
                 method: req.body.method,
                 email: req.session.email
            });
            console.log(result);
            result.save(function (err,result)
        {
            if(err) throw err;
          res.redirect('home');
        });
    });


 app.get('/incomeadd', function (req, res) {
   
    if(req.session.email)
    { 
        res.render('incomeadd');
    
    }else{
        res.redirect('/login');
     }
        
    });

app.post('/incomeadd', function (req, res) {

    var date = new Date(req.body.date);
    var day = date.getUTCDate();
    var month = date.getUTCMonth() + 1;
    var year = date.getUTCFullYear();
        var result = income(
            {
                amount : req.body.amount,
                 date : req.body.date,
                 day: day,
                 month: month,
                 year: year,
                 email : req.session.email
            });
            console.log(result);
            result.save(function (err,result)
        {
            if(err) throw err;
          res.redirect('home');
        });
    });


app.get('/incomeview', function (req, res) {
   
        if(req.session.email)
        {      
                var email =  req.session.email;
                income.find({'email': email},function(err,income)
                {
                res.render('incomeview',{incomelist: income});
                });
            }else{
                res.redirect('/login');
             }
                   
        });


 app.get('/income_delete/:id', function (req, res){ 

    if(req.session.email)
    {      
        var obid= req.params.id;        
        console.log(obid);
        income.findByIdAndRemove(obid,function(err){
            if(err) throw err;
            res.redirect('/incomeview');
        });
    }else{
        res.redirect('/login');
    }
});

app.get('/incomeedit/:id', function (req, res){ 

    if(req.session.email)
    { 
        var obid= req.params.id; 
        income.findById(obid,function(err,incom)
            {
               
            if(err) throw err;
            res.render('incomeedit',{income: incom});
            });
        }else{
            res.redirect('/login');
        }
    });

app.post('/incomeedit',function(req,res)
{
    if(req.session.email)
    { 
        var obid= req.body.id; 
        var date = new Date(req.body.date);
        var day = date.getUTCDate();
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        var result = 
                {
                    amount : req.body.amount,
                    date: req.body.date,
                    day: day,
                    month: month,
                    year: year,
                    email : req.session.email
                    
            
                } 
                income.findByIdAndUpdate({_id:obid},result,function(err,incom){
                    if(err) throw err;
                    res.redirect('incomeview');
                
                });
            }else{
                res.redirect('/login');
            }
});

app.get('/expenseview', function (req, res) {
    
    
    if(req.session.email)
    {  
                var date = new Date();
                var month = date.getUTCMonth() + 1;
                var email = req.session.email;
                expense.find({$and:[{'email': email},{'month': month}]},function(err,expense)
                {
                    console.log(date);
                    console.log(expense);
                res.render('expenseview',{expenselist: expense});
                });
            }else{
                res.redirect('/login');
             }
           
        });


 app.get('/expense_delete/:id', function (req, res){ 

            if(req.session.email)
            {      
                var obid= req.params.id;        
                console.log(obid);
                expense.findByIdAndRemove(obid,function(err){
                    if(err) throw err;
                    res.redirect('/expenseview');
                });
            }else{
                res.redirect('/login');
            }
        });


app.get('/expenseedit/:id', function (req, res){ 

            if(req.session.email)
            { 
                var obid= req.params.id; 
                expense.findById(obid,function(err,expen)
                    {
                       
                    if(err) throw err;
                    res.render('expenseedit',{expense: expen});
                    });
                }else{
                    res.redirect('/login');
                }
            });

app.post('/expenseedit',function(req,res)
            {
                if(req.session.email)
                { 
                    var obid= req.body.id; 
                    var date = new Date(req.body.date);
                    var day = date.getUTCDate();
                    var month = date.getUTCMonth() + 1;
                    var year = date.getUTCFullYear();
                    var result = 
                            {
                                amount : req.body.amount,
                                date : req.body.date,
                                day: day,
                                month: month,
                                 year: year,
                                category : req.body.category,
                                 method: req.body.method,
                                 email: req.session.email
                                
                        
                            } 
                            expense.findByIdAndUpdate({_id:obid},result,function(err,expen){
                                if(err) throw err;
                                res.redirect('expenseview');
                            
                            });
                        }else{
                            res.redirect('/login');
                        }
            });

app.get('/logout', function (req,res)
{

    if(req.session.email)
    {
         req.session.destroy(function(err)
        {
            if(err) throw err;
            res.redirect('/login');
        });
    }else
    {
        res.redirect('/login'); 
    }
});

app.get('/overview', function (req, res) {
   
    if(req.session.email)
    {  
                
                var email = req.session.email;
                var datetime = new Date();
                var month = datetime.getUTCMonth() + 1;
                var day = datetime.getUTCDay();
                var year= datetime.getUTCFullYear();
                expense.aggregate([
                    {
                        $match : {"email" : email,"month": month}},
                        {$unwind : "$amount"},
                        //{$match : {"email" : email}},
                        {
                        $group: { _id: "$category", total: {   $sum: "$amount"  },totalamt: {$sum: "amount"}}},
                        
                        {
                        $sort : {total : -1}
                    }],
                    function (err, data){
                        
                        var cmonth= data;
                        console.log(cmonth);
                       if (month== 1)
                       {
                            var yr= year-1;
                            var mth = 12;
                       }
                       else
                       {
                           var yr = year;
                           var mth= month-1;
                           //console.log(yr );
                       }
                        expense.aggregate([
                            {
                                $match : {"email" : email,"month": mth,"year":yr}},
                                {$unwind : "$amount"},
                                //{$match : {"email" : email}},
                                {
                                $group: {
                                  _id: "$category",
                                  total: {
                                    $sum: "$amount" 
                                  }
                                }},
                                {
                                $sort : {total : -1}
                            }],
                            function (err, datas){
                                console.log(datas);
                                var pmonth = datas;
                                res.render('overview',{cmth: cmonth,pmth: pmonth});


                            });
                    }
                );

                
                
            }else{
                res.redirect('/login');
             }
           
        });

 app.post('/contact', function (req,res)
        {
        
            if(req.session.email)
            {
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'currencydetection@gmail.com',
                      pass: 'currency123#1'
                    }
                  });
                  
                  var mailOptions = {
                    
                    from: req.session.email,
                    to: 'currencydetection@gmail.com',
                    subject: req.body.email,
                    text:  req.body.message
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                      res.render('home',{msg:'Email sending failed'});
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.render('home',{msg:'Email sent successfully'});
                       }
                  });
                
             
                };
            });
 

app.get('/', (req, res) => res.send('Hello World!'))
var server = app.listen(5000, function () 
{
    console.log('Node server is running..');
});