// https://web.archive.org/web/20161018172034/http://socket.io/get-started/chat/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let onlineUsernames = {};
let allUsernames = {};
let history = [];
let colours = ['FF0000', '0000FF', '00CC00', 'FF8000', '9933FF'];
let colourCount = 0;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
io.on('connection', function(socket){
    // listen to chat messages
    socket.on('sendchat', function(msg){
        if(msg.includes('/nickcolor ')) {
            updateColour(socket, msg);
            return;
        }
        if(msg.includes('/nick ')) {
            updateUsername(socket, msg);
            return;
        }
        let time = getCurrentTime();
        addToHistory(time, socket.username, socket.colour, msg);
	    io.emit('updatechat', time, socket.username, socket.colour, msg);
    });

    // listen to added users
    socket.on('adduser', function(username){
        if (!username) {
            username = defaultUsername();
        }
        setupSocketUsername(socket, username);
        setupDefaultSocketColour(socket);
        let time = getCurrentTime();
        socket.emit('updatecurruser', socket.username);
        io.sockets.emit('updateusers', onlineUsernames);

        // Load message history
        loadHistory(socket);
    });

    // listen for user disconnect
    socket.on('disconnect', function(){
        delete onlineUsernames[socket.username];
        let time = getCurrentTime();
        io.sockets.emit('updateusers', onlineUsernames);
    });
});

function defaultUsername() {
    let num = Object.keys(allUsernames).length + 1;
    let username = 'User' + num;
    while (allUsernames.hasOwnProperty(username)) {
        num++;
        username = 'User' + num;
    }
    return username;
}

function setupSocketUsername(socket, name) {
    socket.username = name;
    onlineUsernames[name] = name;
    allUsernames[name] = name;
}

function setupDefaultSocketColour(socket) {
    let num = colourCount % 5;
    socket.colour = colours[num];
    colourCount++;
}

function updateUsername(socket, msg) {
    let newName = msg.replace('/nick ','');
    if (allUsernames.hasOwnProperty(newName)) {
        let time = getCurrentTime();
        socket.emit('updatechat', time, 'ERROR', '000000',
            'Username already exists. Please try again.');
        return;
    }
    delete onlineUsernames[socket.username];
    delete allUsernames[socket.username];
    setupSocketUsername(socket, newName);
    socket.emit('updatecurruser', socket.username);
    io.sockets.emit('updateusers', onlineUsernames);
}

function updateColour(socket, msg) {
    let newColour = msg.replace('/nickcolor ','');
    socket.colour = newColour;
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

function addToHistory(time, user, colour, msg) {
    if (history.length >= 200) {
        history.shift()
    }
    let fullMessage = {
        time:time,
        username:user,
        colour:colour,
        text:msg
    };
    history.push(fullMessage)
}

function loadHistory(socket) {
    for (let message of history) {
        socket.emit('updatechat',
            message.time, message.username, message.colour, message.text);
    }
}