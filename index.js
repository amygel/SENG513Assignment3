// https://web.archive.org/web/20161018172034/http://socket.io/get-started/chat/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let userCount = 0;
let usernames = {};
let history = [];

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
io.on('connection', function(socket){
    // Load message history
    for (let message of history) {
        socket.emit('updatechat', message.time, message.username, message.text);
    };

    // listen to chat messages
    socket.on('sendchat', function(msg){
        let time = getCurrentTime();
        addToHistory(time, socket.username, msg);
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
    let username = 'User'+ (++userCount);
    socket.username = username;
    usernames[username] = username;
}

function getCurrentTime() {
    let d = new Date();
    let hr = d.getHours();
    let min = d.getMinutes();
    if (min < 10){
        min = "0"+min;
    }
    return "" + hr + ":" + min;
}

function addToHistory(time, user, msg) {
    if (history.length >= 200) {
        history.shift()
    }
    let fullMessage = {
        time:time,
        username:user,
        text:msg
    };
    history.push(fullMessage)
}