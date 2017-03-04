// shorthand for $(document).ready(...)
$(function() {
    var socket = io();

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
        $('#messages').append('<tr><td><b>' + time + ' ' + username + ':</b> ' + msg + '</td></tr>');
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
        $('#name').html('<i>You are '+ user + '</i>');
    });
});
