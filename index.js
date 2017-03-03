// https://web.archive.org/web/20161018172034/http://socket.io/get-started/chat/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
// usernames which are currently connected to the chat
var usernames = {};

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
io.on('connection', function(socket){
    // listen to chat messages
    socket.on('sendchat', function(msg){
        let time = getCurrentTime();
	    io.emit('updatechat', time, socket.username, msg);
    });
    // listen to added users
    socket.on('adduser', function(){
        setupSocketUsername(socket);
        let time = getCurrentTime();
        socket.emit('updatechat', time, 'SERVER', 'you have connected');
        socket.broadcast.emit('updatechat', time, 'SERVER', socket.username + ' has connected');
        io.sockets.emit('updateusers', usernames);
    });
    // listen for user disconnect
    socket.on('disconnect', function(){
        delete usernames[socket.username];
        let time = getCurrentTime();
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', time, 'SERVER', socket.username + ' has disconnected');
    });
});

function setupSocketUsername(socket) {
    let num = Object.keys(usernames).length + 1;
    let username = 'User'+num;
    socket.username = username;
    usernames[username] = username;
}

function getCurrentTime() {
    var d = new Date();
    let hr = d.getHours(); // => 9
    let min = d.getMinutes(); // =>  30
    return "" + hr + ":" + min;
}