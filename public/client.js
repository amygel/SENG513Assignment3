// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    let currUser = '';

    $('form').submit(function(){
	    socket.emit('sendchat', $('#m').val());
	    $('#m').val('');
	    return false;
    });

    // on connection to server, add user to server
    socket.on('connect', function(){
        socket.emit('adduser');
    });

    // update chat with new messages
    socket.on('updatechat', function(time, username, msg){
        let text = '';
        if(username === currUser) {
            text = '<tr><td><b>' + time + ' ' + username + ': ' + msg + '</b></td></tr>';
        } else{
            text = '<tr><td><b>' + time + ' ' + username + ':</b> ' + msg + '</td></tr>';
        }
        $('#messages').append(text);
    });

    // update user list
    socket.on('updateusers', function(data) {
        $('#users').empty();
        $.each(data, function(key, value) {
            $('#users').append('<li>' + key + '</li>');
        });
    });

    // update current user
    socket.on('updatecurruser', function(user) {
        currUser = user;
        $('#name').html('<i>You are '+ user + '</i>');
    });
});
