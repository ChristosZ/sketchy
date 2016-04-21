var fs = require('fs'),
	colors = require('colors'),
	express = require('express'),
	engines = require('consolidate'),
	http = require('http'),
	parser = require('body-parser');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.engine('html', engines.hogan); // tell Express to run .html files through Hogan
app.set('views', __dirname);

app.use(express.static(__dirname));


//global arrays? should be using a database for this...
var rooms;


//ROUTING
//main page 
app.get('/', function(req, res){
	console.log('- Request received:', req.method.cyan, req.url.underline);
	
	//render index.html
	res.render("sketcher.html");

	//join, redirects to /newuser

	//create, redirects to /create
});

app.get('/create', function(req, res) {
	console.log('- Request received:', req.method.cyan, req.url.underline);
	res.render("create.html");

	//creat host user
	//create room, add it to db


	//array of submited pictures, with url for image and the user who submitted it

	//array of users, which includes arrays of each [user, tribe, sketch]
	

});

app.get('/newuser', function(req, res) {
	console.log('- Request received:', req.method.cyan, req.url.underline);
	res.render("newuser.html");//this is the generic join room page

});

app.get('/rooms', function(req, res) {
	console.log('- Request received:', req.method.cyan, req.url.underline);
	res.render("rooms.html"); //add list of rooms to this page
	//get the user and tribe from meta params, and update the rooms page
	// every 30 seconds from the array of rooms
});




app.get('/:roomName/:user', function(req, res) {
	var roomName = req.params.roomName;
	var user = req.params.user;

	console.log('- Request received:', req.method.cyan, req.url.underline);
	res.render("sketcher.html");

});


//need this to emit sketches to other people?
app.post('/:roomName/images', function(req, res) {

});

//catch all, unnecessary
app.get('*', function(req, res){
	console.log('- Request received:', req.method.cyan, req.url.underline);
	res.render("sketcher.html");
});


server.listen(8080, function(){
    console.log('- Server listening on port 8080'.grey);
});


//SOCKETS
io.sockets.on('connection', function(socket) {

	socket.on('join', function(room, user, tribe) {
		socket.join(room);
		socket.nickname = user;

	});

	socket.on('sketch', function(room, user, arr) {

		//take the users sketch and add the updates to the global array
		//emit the changes to the client (:/roomName/images)
	});

	socket.on('submit', function(room, user) {

		//push the final image to the room's submitted array

		//clear the canvas for the user
		//clearDrawing(room, user);

	});

	socket.on('disconnect', function(){
        // Leave the room
    });
});