var socket;

var msdp_vals={};
var msdp_callbacks={};
function on_msdp(val, func) {
    msdp_callbacks[val] = msdp_callbacks[val] || [];
    msdp_callbacks[val].push(func)    
}

function strip_color_tags(text) {
    var rtn='';
    for (var i=0; i<text.length; i++) {
        if (text[i] == '{')
        {
            if (i == text.length-1) {
                break;
            }
            else if (text[i+1] == '{') {
                rtn += '{';
                i++;
            }
            else {
                i++;
            }
        }
        else {
            rtn += text[i];
        }
    }

    return rtn;
}

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
    var val = msdp_vals.HEALTH || 0;
    var max = msdp_vals.HEALTH_MAX || 0; 
    if ( !max || max == 0) { return; }
    $('#hp_bar').jqxProgressBar({ value: 100*val/max });
}
on_msdp("HEALTH", update_hp_bar);
on_msdp("HEALTH_MAX", update_hp_bar);


function update_mana_bar() {
    var val = msdp_vals.MANA || 0;
    var max = msdp_vals.MANA_MAX || 0;
    if ( !max || max == 0) { return; }
    $('#mana_bar').jqxProgressBar({ value: 100*val/max });
}
on_msdp("MANA", update_mana_bar);
on_msdp("MANA_MAX", update_mana_bar);

function update_move_bar() {
    var val = msdp_vals.MOVEMENT || 0;
    var max = msdp_vals.MOVEMENT_MAX || 0;
    if ( !max || max == 0) { return; }
    $('#move_bar').jqxProgressBar({ value: 100*val/max });
}
on_msdp("MOVEMENT", update_move_bar);
on_msdp("MOVEMENT_MAX", update_move_bar);

function update_enemy_bar() {
    var val = msdp_vals.OPPONENT_HEALTH || 0;
    var max = msdp_vals.OPPONENT_HEALTH_MAX || 0;
    if ( !max || max == 0) { return; }
    $('#enemy_bar').jqxProgressBar({ value: 100*val/max });
}
on_msdp("OPPONENT_HEALTH", update_enemy_bar);
on_msdp("OPPONENT_HEALTH_MAX", update_enemy_bar);
on_msdp("OPPONENT_NAME", update_enemy_bar);

function update_tnl_bar() {
    var val = msdp_vals.EXPERIENCE_TNL || 0;
    var max = msdp_vals.EXPERIENCE_MAX || 0;
    if ( !max || max == 0) { return; }
    $('#tnl_bar').jqxProgressBar({ value: 100*(max - val)/max });
}
on_msdp("EXPERIENCE_TNL", update_tnl_bar);
on_msdp("EXPERIENCE_MAX", update_tnl_bar);

function update_affects_win() {
    var affects = msdp_vals.AFFECTS || {};

    var output = "<h2>AFFECTS</h2>";

    for (var key in affects) {
        output += ("   "+affects[key]).slice(-3) + ' : ' + key + "<br>";
    }

    $('#win_aff').html(output);
}
on_msdp("AFFECTS", update_affects_win);

function update_stat_window() {
    var output='';
    output += '<h1><center>STATS</center></h1>';

    var left = false;

    function print_stat( label, val, perm) {
        var color;
        left = !left;
        if (left) {
            color = "red";
        } else {
            color = "cyan";
        }

        output += '<span style="color: '+color+';">';

        output += label + ": ";
        output += ("   " + (msdp_vals[perm] || '???')).slice(-3);
        output += "("+(("   " + (msdp_vals[val] || '???')).slice(-3))+")";

        output += "</span>"
    }

    output += '<center>';

    print_stat( "Str", "STR", "STR_PERM");
    output += '   ';
    print_stat( "Int", "INT", "INT_PERM");
    output += "<br>";
    
    print_stat( "Con", "CON", "CON_PERM");
    output += '   ';
    print_stat( "Wis", "WIS", "WIS_PERM");
    output += "<br>";

    print_stat( "Vit", "VIT", "VIT_PERM");
    output += '   ';
    print_stat( "Dis", "DIS", "DIS_PERM");
    output += "<br>";

    print_stat( "Agi", "AGI", "AGI_PERM");
    output += '   ';
    print_stat( "Cha", "CHA", "CHA_PERM");
    output += "<br>";

    print_stat( "Dex", "DEX", "DEX_PERM");
    output += '   ';
    print_stat( "Luc", "LUC", "LUC_PERM");
    output += "<br>";

    output += '</center>';

    $('#win_stat').html("<pre>"+output+"</pre>");
}

var stats = ['STR', 'CON', 'VIT', 'AGI', 'DEX',
             'INT', 'WIS', 'DIS', 'CHA', 'LUC'];

for (var i=0; i < stats.length; i++) {
    on_msdp(stats[i], update_stat_window);
    on_msdp(stats[i]+"_PERM", update_stat_window);
}

on_msdp("STR", update_stat_window);
on_msdp("STR_PERM", update_stat_window);

on_msdp("INT", update_stat_window);
on_msdp("INT_PERM", update_stat_window);

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
    $('#output_aff_split').jqxSplitter({
        orientation: 'vertical',
        panels: [{size:'10%'},{size:'90%'}]
    });

    $("#output_gauge_split").jqxSplitter({
        orientation: 'horizontal',
        panels: [{size:'90%'},{size:'60px'}]
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
            return (msdp_vals.HEALTH || 0) + " / " + (msdp_vals.HEALTH_MAX || 0);
        }
    });

    $('#hp_bar .jqx-progressbar-value').css(
            "background-color", "#DF0101");
        

    $('#mana_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return (msdp_vals.MANA || 0) + " / " + (msdp_vals.MANA_MAX || 0);
        }
    });
    $('#mana_bar .jqx-progressbar-value').css(
            "background-color", "#2E64FE");

    $('#move_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return (msdp_vals.MOVEMENT || 0) + " / " + (msdp_vals.MOVEMENT_MAX || 0);
        }
    });
    $('#move_bar .jqx-progressbar-value').css(
            "background-color", "#04B4AE");

    $('#enemy_bar').jqxProgressBar({
        width: '100%',
        height: 20,
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            return strip_color_tags(msdp_vals.OPPONENT_NAME || '');
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
            var tnl=msdp_vals.EXPERIENCE_TNL || 0;
            var max=msdp_vals.EXPERIENCE_MAX || 0;
            return (max-tnl) + " / " + max;
        }
    });
    $('#tnl_bar .jqx-progressbar-value').css(
            "background-color", "#04B404");

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

        msdp_vals[msg.var] = msg.val;

        var funcs = msdp_callbacks[msg.var];
        if (funcs) {
            for (var i=0; i < funcs.length; i++) {
                funcs[i](msg.var, msg.val);
            }
        }
            
    });
    socket.on('telnet_data', handle_data);

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

});

