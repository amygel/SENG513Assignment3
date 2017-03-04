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
        //https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
        let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        socket.emit('adduser', cookieValue);
    });

    // update chat with new messages
    socket.on('updatechat', function(time, username, colour, msg){
        let text = '<tr><td><b>' + time + ' <span style="color:'+ colour + '">' + username + '</span>:';
        if(username === currUser) {
            text += ' ' + msg + '</b></td></tr>';
        } else{
            text += '</b> ' + msg + '</td></tr>';
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
        document.cookie = 'username='+encodeURIComponent(user)+'; expires='+getExpiryDate();
    });
});

function getExpiryDate() {
    let d = new Date();
    d.setDate(d.getDate()+7);
    return d.toUTCString() ;
}
