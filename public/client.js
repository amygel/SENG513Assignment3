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
    socket.on('updatechat', function(username, msg){
        $('#messages').append($('<b>'+username + ':</b> ' + msg + '<br>'));
    });
    // update user list
    socket.on('updateusers', function(data) {
        $('#users').empty();
        $.each(data, function(key, value) {
            $('#users').append('<div>' + key + '</div>');
        });
    });
});
