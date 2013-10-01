var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());
app.use(express.cookieParser());
app.use(express.session({secret:'my secret'}));
app.use(express.static(__dirname));
var mustache = require('mustache');
app.set('view options', { layout: true });
app.set('views', __dirname);
mongoose = require('mongoose');
async = require('async');
app.use(express.bodyParser({uploadDir:__dirname+'/server/tmp'}));

mongoose.connect('mongodb://localhost/test');

//Mongoose schema for MongoDB
var userschema = mongoose.Schema({
              
                password:String,
                email:String,
                gender:String,
                name:String,
		age:Number,
		bloodgroup:String,
		family:[String],
		data:[{name:[String],img:[String],tags:[String]}]
		
});

users = mongoose.model('MedicalUserDetails',userschema);

app.get('/', function(req, res) {

	console.log("Root login:"+req.session.logged_in);
	
	if(!req.session.logged_in)
	{
		var page = fs.readFileSync("client/indexpage.html");
                var html = mustache.to_html(page.toString(), {dummy:"axya"});
                res.send(html);
	}
	else
	{
		res.redirect("/home");
	}
});


 

app.post("/registered",function(req,res){
	console.log("Registering user");

	var p =req.param('password',null);
	var gender = req.param('gender',null);
        var email =req.param('email',null);
	var name = req.param('name',null);
        var age =req.param('age',null);
	var bloodgroup = req.param('bloodgroup',null);
	
	console.log(email,p);

	var newuser = new users({password:p,email:email,gender:gender,name:name,age:age,bloodgroup:bloodgroup});
	newuser.save();
	console.log("Registered Successfully");
	req.session.logged_in = true;
	req.session.name = email;

	res.redirect("/home");

});


app.post('/signin', function(req, res) {
	console.log("Session loggedin:"+req.session.logged_in);
	console.log("Session name:"+req.session.name);
	var email = req.param('email',null);
	console.log( email);
	var passwd = req.param('password',null);
	console.log(passwd);

	console.log("Connecting to DB");

 	var uname ="";	//email of loggedin user
	var currentuser = ""; //current user name
        users.find({email:email,password:passwd},function(err,curuser){
		console.log("Searching in DB");
		if(err) 
		{
			console.log("Error while fetching signin");
		}	
		else if(curuser.length!=0)
		{
			console.log("User found",curuser[0].email);
			uname = curuser[0].email;	
			currentuser = curuser[0].name;	
			req.session.logged_in = true;
			req.session.name = uname;
			console.log(req.session.logged_in);
			console.log(req.session.name);

			var view = {};
			users.find({email:req.session.name},function(err,curuser1){
				if(err)
				{
					console.log(err);
				}
				else
				{
					console.log("here");
					var  family = new Array();
					console.log(curuser1[0]);
					for(var i=0;i<curuser1[0].family.length;i++)
					{
						family[i] = {'fam':curuser1[0].family[i]};
						console.log(curuser1[0].family[i]);
						console.log(family);
					}
					view = {
							name:curuser1[0].name,
							family:family
						}
				}
			});
			
			setTimeout(function(){
				console.log("view:"+view);			
				var page = fs.readFileSync("client/homepage.html");
        	                var html = mustache.to_html(page.toString(), view);
        	                res.send(html);},200);
		}
		else
		{	
			var page = fs.readFileSync("client/indexpage.html");
	                var html = mustache.to_html(page.toString(), {dummy:"axya"});
        	        res.send(html);
			console.log("Account not found");
		}
});
});	

           
app.get('/home', function(req, res) {

      
	if(req.session.logged_in)
	{

		var uname =""; //user email
		var currentuser = ""; //curuser name
		console.log(req.session.name);	
		uname = req.session.name;
		users.find({email:req.session.name},function(err,curuser){
                console.log("Searching in DB");
                if(err)
                {
                        console.log("Error while fetching signin");
                }
                else if(curuser.length!=0)
                {
                       
			var view = {};
			users.find({email:req.session.name},function(err,curuser1){
				if(err)
				{
					console.log(err);
				}
				else
				{
					console.log("here");
					var  family = new Array();
					console.log(curuser1[0]);
					for(var i=0;i<curuser1[0].family.length;i++)
					{
						family[i] = {'fam':curuser1[0].family[i]};
						console.log(curuser1[0].family[i]);
						console.log(family);
					}
					view = {
							name:curuser1[0].name,
							family:family
						}
				}
			});
			
			setTimeout(function(){
				console.log("view:"+view);			
				var page = fs.readFileSync("client/homepage.html");
		                var html = mustache.to_html(page.toString(), view);
                      res.send(html);},200);
		}
		else
                {
                        console.log("Account not found");
                }
});
	               
}
});


app.get('/profile',function(req,res){
	if(req.session.logged_in)
	{
		users.find({email:req.session.name},function(err,curuser){
			
			
		var view = { 
				name:curuser[0].name,
				age:curuser[0].age,
				gender:curuser[0].gender,
				bloodgroup:curuser[0].bloodgroup					
		           }
	
		      var page = fs.readFileSync("client/profile.html");
                      var html = mustache.to_html(page.toString(), view);
                      res.send(html);
		});
	}
});


app.get('/uploaddocuments',function(req,res){
	if(req.session.logged_in)
	{	
		var view= {};
		var fam = new Array();
		var name = "";
		users.find({email:req.session.name},function(err,curuser){
			console.log(curuser[0].family.length);
			name = curuser[0].name;
			for(var i=0;i<curuser[0].family.length;i++)
			{
				fam[i] = {names:curuser[0].family[i]};
			}
		});
		setTimeout(function(){
		view = {
				name:name,	
				fam:fam
			}
		console.log(view);
		console.log("upload documents");
			var page = fs.readFileSync("client/partials/startcamp.html");
                      var html = mustache.to_html(page.toString(), view);
                      res.send(html);
			},200);
	}
});


app.get('/addmember',function(req,res){
	if(req.session.logged_in)
	{	
		var newmem = req.param("newmember",null);
		console.log("newmem:"+newmem);
		users.update({email:req.session.name},{$pushAll:{family:[newmem]}},{upsert:true},function(err){ console.log(err)});
                res.send(newmem);
		console.log("add family member added");

	}
});

app.post('/savedocuments',function(req,res){
	if(req.session.logged_in)
	{	
		var tags = req.param("tags",null);
		var fammember = req.param("selfam",null);
		
		users.find({email:req.session.name},function(err,curuser){
			
		var data = curuser[0].data;
			
		var ctr = 0;
		for(var i=0;i<data.length;i++)
		{
			
			if(data[i].name==fammember)
			{
				ctr++;
			}
				
		}			
			
		var tmp = req.session.name+fammember+ctr;
		setTimeout(function(){
		fs.readFile(req.files.file.path, function (err, data) {
	
			  var newPath = __dirname + "/server/img/uploads/"+tmp;
			  fs.writeFile(newPath, data, function (err) {
				console.log("Image saved");
  			});
		});},100);
		setTimeout(function(){			
			users.update({email:req.session.name},{$pushAll:{data:[{name:fammember,img:"server/img/uploads/"+tmp,tags:tags}]}},{upsert:true},function(err){ console.log("error:"+err)});
			res.send("success");
		},200);
		});
				                   

	}
});

app.get('/search',function(req,res){
	if(req.session.logged_in)
	{	
		var search = req.param("search",null);
		
		var person = req.param("person",null);
		console.log("Person"+person);
		
		searches = search.split(',');
		var count = 0;
		users.find({email:req.session.name},function(err,curuser){
			var results = new Array();
			var data = curuser[0].data;
			console.log("data:"+data);
			console.log("datalen"+data.length);
			var ctr = 0;
			for(var i=0;i<data.length;i++)
			{
				if(data[i].name==person)
				{
					var tg = data[i].tags[0];

					var tags = tg.split(",");
					
					for(var j=0;j<tags.length;j++)
					{
						for(var k=0;k<searches.length;k++)
						{
							if(searches[k]==tags[j])		
							{
								count++;								
							}
						}					
					}
					if(count==searches.length)
					{
						results[ctr++] = {img:data[i].img};
					}
				}
			}
			var view = {};
			view = {	
				results:results
				}
		      var page = fs.readFileSync("client/partials/searchresults.html");
                      var html = mustache.to_html(page.toString(), view);
                      res.send(html);
		});
		
                
		

	}
});

app.get('/showdocs',function(req,res){
	if(req.session.logged_in)
	{
		var person = req.param("person",null);		
		users.find({email:req.session.name},function(err,curuser){
			var results = new Array();
			var data = curuser[0].data;
			
			var ctr = 0;
			for(var i=0;i<data.length;i++)
			{
				if(data[i].name==person)
				{
					results[ctr++] = {img:data[i].img};
				}
			}
			var view = {};
			view = {		
				results:results
			}
			var page = fs.readFileSync("client/partials/allresults.html");
                        var html = mustache.to_html(page.toString(), view);
                        res.send(html);
		});
	}
	
});

app.get('/logout',function(req,res){
	req.session.logged_in = false;
	req.session.name = "";	
	console.log("Logged out"+req.session.logged_in);
	res.redirect("/");
});



var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
