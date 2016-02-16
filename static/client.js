var socket;
 
var output_buffer='';
var chat_buffer='';
var rx;
var get_mxp_tag=false;
var redirect_to_chat=false;
function handle_data(msg) {
    //output_buffer+=msg.data
    rx = rx || ''; // preserve partial data from previous call
    rx += msg.data;

    //output_buffer += "[|";

    if (rx.length < 1) { return; }

    /*
    if ( get_mxp_tag ) {
        
    }

    for ( i=0 ; i<rx.length ; i++ ) {
        if (rx[i] == '\033') {
            // Check if MXP escape (\0331z)
            // if not long enough to chec, wait til it is
            var seq = rx.slice(i);
            if (seq.length < 4) { 
                rx = seq; 
                return; 
            }

            if (seq.slice(0,3) == '\033[1z') {
                mxp_open = true;
                rx = seq.slice(4);
                handle_data({data: ''});
                return;
            }
        }
            
        if (rx[i] == '<') {
            output_buffer += '&lt;';
        } else if (rx[i] == '>') {
            output_buffer += '&gt;';
        } else {
            output_buffer += rx[i];
        }
    }
    rx = '';
*/
    if (rx.match(/\x1b\[1z/)) {
        console.log("matched MXP");
        var m = rx.match(/\x1b\[1z<DEST Comm>\x1b\[7z([^<]*)/);
        console.log( 'm: ' + m );
        if ( m ) {
            console.log("matched dest");
            chat_buffer += m[1];
            var chat_buffer_raw = chat_buffer.replace(/\n\r/g, "<br>");
            var chat_html = ansi_up.ansi_to_html(chat_buffer_raw);
            $('#win_chat').html(chat_html);
            $('#win_chat').scrollTop($('#win_chat').prop("scrollHeight"));
        }
    }

    //output_buffer += "|]";
    output_buffer += rx;
    rx = '';
    var output_raw=output_buffer.replace(/\n\r/g, "<br>");
    var output_html=ansi_up.ansi_to_html(output_raw);

    var win_output=$('#win_output');

    win_output.html(output_html);
    win_output.scrollTop(win_output.prop("scrollHeight"));
}

function handle_mxp_escape(esc) {
    
}
    

$(document).ready(function() {
    $('a#open_telnet').bind('click', function() {
        socket.emit('open_telnet', {} ); 
        return false;
    });
    $('form#send1').submit(function(event) {
        socket.emit('send_command', {data: $('#send_command').val()});
        $('#send_command').select();
        return false;
    });

    $('#main_vert_split').jqxSplitter({
        width: '90vw',
        height: '90vh',
        orientation: 'vertical',
        panels: [{size:'75%'},{size:'25%'}]
    });
    $("#output_gauge_split").jqxSplitter({
        orientation: 'horizontal',
        panels: [{size:'85%'},{size:'15%'}]
    });
    $('#map_chat_split').jqxSplitter({
        orientation: 'horizontal'
    });


        


    socket = io.connect('http://' + document.domain + ':' + location.port + '/telnet');
    socket.on('ws_connect', function(msg) {
        $('#dbg').append("WebSocket connected.<br>");
    });
    socket.on('ws_disconnect', function(msg) {
        $('#dbg').append("WebSocket disconnected.<br>");
    });
    socket.on('telnet_error', function(msg) {
        $('#dbg').append("Telnet error.<br>");
    });
    socket.on('telnet_connect', function(msg) {
        $('#dbg').append("Telnet connect.<br>");
    });
    socket.on('telnet_data', handle_data);

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

});

