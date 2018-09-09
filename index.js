var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var user_list=[];
var room_name="demo_collab";

// socket connection accepting
io.on('connection', function(socket){
	console.log('a user connected');
	var harish;
	socket.on('user_join', function(roomm) {
		console.log('Client joined: ', io.sockets.adapter.rooms);
		var clientsInRoom = io.sockets.adapter.rooms[room_name];
		var totalClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
		console.log(''+totalClients);
		if(totalClients ==0){
			socket.join(room_name);
			socket.emit('createdroom', room_name, socket.id);
		    // for a real app, would be room-only (not broadcast)
		   
		}else if(totalClients ==1){
	 		socket.join(room_name);
	    	socket.emit('joinedroom', room_name, socket.id);
	        io.sockets.in(room_name).emit('ready', room_name);
	        socket.broadcast.emit('ready', room_name);
		}else{
			socket.emit('roomfull', room_name);
		}

	});

	socket.on('message', function(message) {
	    console.log('Client said: ', message);
	    // for a real app, would be room-only (not broadcast)
	    socket.broadcast.emit('message', message);
	  });
	socket.on('disconnect', function(reason) {
		console.log(`Peer or server disconnected. Reason: ${reason}.`+harish);
    //socket.broadcast.emit('bye');
	});
});

http.listen(3200, function(){
	console.log('listening on *:3200');
});
