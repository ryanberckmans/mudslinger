var socket;

var health=0;
var health_max=0;
var mana=0;
var mana_max=0;
var move=0;
var move_max=0;

var enemy_name = '';
var enemy_health = 0;
var enemy_health_max = 0;

var experience_max=0;
var experience_tnl=0;

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
    //if (rx.match(/\x1b\[1z/)) {
        //console.log("matched MXP");

        /* fix non escaped brackets */
        var new_rx='';
        for (var i=0; i<rx.length; i++)
        {
            if ( rx[i] == '<' )
            {
                if ( i >= 4 ) {
                    if ( rx.slice(i-4,i) == "\x1b\[1z" ) {
                        new_rx += rx[i];
                        continue;
                    }
                }
                new_rx += '&lt';
            }
            else if ( rx[i] == '>' )
            {
                if ( (i+4) < rx.length ) {
                    if ( rx.slice(i+1,i+5) == "\x1b\[7z" ) {
                        new_rx += rx[i];
                        continue;
                    }
                }
                new_rx += '&gt';
            }
            else
            {
                new_rx += rx[i];
            }
        }
        rx = new_rx 
        
        /* DEST tag */
        var commRe = /\x1b\[1z<DEST Comm>\x1b\[7z([^<]*)\x1b\[1z<\/DEST>/g;
        var m;
        while ((m = commRe.exec(rx)) !== null) {
            chat_buffer += m[1];
            var chat_buffer_raw = chat_buffer.replace(/\n\r/g, "<br>");
            var chat_html = ansi_up.ansi_to_html(chat_buffer_raw);
            $('#win_chat').html(chat_html);
            $('#win_chat').scrollTop($('#win_chat').prop("scrollHeight"));
        }
        rx = rx.replace(commRe, '');
        
        /* kill unsupported tags */
        //rx = rx.replace(/\x1b\[[17]z<\/[^>]*>/g
    //}

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

function update_hp_bar() {
    $('#hp_bar').jqxProgressBar({ value: 100*health/health_max });
}

function update_mana_bar() {
    $('#mana_bar').jqxProgressBar({ value: 100*mana/mana_max });
}

function update_move_bar() {
    $('#move_bar').jqxProgressBar({ value: 100*move/move_max });
}

function update_enemy_bar() {
    $('#enemy_bar').jqxProgressBar({ value: 100*enemy_health/enemy_health_max });
}

function update_tnl_bar() {
    $('#tnl_bar').jqxProgressBar({ value: 100*(experience_max - experience_tnl)/experience_max });
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

    $('#hp_bar').jqxProgressBar({ 
        width: '100%', 
        height: 20, 
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return health + " / " + health_max;
        }
    });

    $('#hp_bar .jqx-progressbar-value').css(
            "background-color", "red");
        

    $('#mana_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return mana + " / " + mana_max;
        }
    });
    $('#mana_bar .jqx-progressbar-value').css(
            "background-color", "blue");

    $('#move_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return move + " / " + move_max;
        }
    });
    $('#move_bar .jqx-progressbar-value').css(
            "background-color", "cyan");

    $('#enemy_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return enemy_name;
        }
    });
    $('#enemy_bar .jqx-progressbar-value').css(
            "background-color", "purple");

    $('#tnl_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return experience_max-experience_tnl + " / " + experience_max;
        }
    });
    $('#tnl_bar .jqx-progressbar-value').css(
            "background-color", "yellow");

    socket = io.connect('http://' + document.domain + ':' + location.port + '/telnet');
    socket.on('ws_connect', function(msg) {
        $('#dbg').append("WebSocket connected.<br>");
    });
    socket.on('telnet_error', function(msg) {
        $('#dbg').append("Telnet error.<br>");
    });
    socket.on('telnet_connect', function(msg) {
        $('#dbg').append("Telnet connect.<br>");
    })
    socket.on('msdp_var', function(msg) {
        $('#dbg').append("MSDP var: "+msg.var+" val: "+msg.val+"<br>");
        if (msg.var == "HEALTH")
        {
            health = msg.val;
            update_hp_bar();
        }
        else if (msg.var == "HEALTH_MAX")
        {
            health_max = msg.val;
            update_hp_bar();
        }
        else if (msg.var == "MANA")
        {
            mana = msg.val;
            update_mana_bar();
        }
        else if (msg.var == "MANA_MAX")
        {
            mana_max = msg.val;
            update_mana_bar();
        }
        else if (msg.var == "MOVEMENT")
        {
            move = msg.val;
            update_move_bar();
        }
        else if (msg.var == "MOVEMENT_MAX")
        {
            move_max = msg.val;
            update_move_bar();
        }
        else if (msg.var == "OPPONENT_HEALTH")
        {
            enemy_health = msg.val;
            update_enemy_bar();
        }
        else if (msg.var == "OPPONENT_HEALTH_MAX")
        {
            enemy_health_max = msg.val;
            update_enemy_bar();
        }
        else if (msg.var == "OPPONENT_NAME")
        {
            enemy_name = msg.val;
            update_enemy_bar();
        }
        else if (msg.var == "EXPERIENCE_MAX")
        {
            experience_max = msg.val;
            update_tnl_bar();
        }
        else if (msg.var == "EXPERIENCE_TNL")
        {
            experience_tnl = msg.val;
            update_tnl_bar();
        }
            
    });
    socket.on('telnet_data', handle_data);

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

});

