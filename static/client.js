var socket;
var lua_code_mirror;

var triggers={'You chirp like a little birdie.': 'dance'};

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

var chat_buffer='';
var rx;
var outlen=0;
function handle_data(msg) {
    rx = rx || ''; // preserve partial data from previous call
    rx += msg.data;


    if (rx.length < 1) { return; }


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
        
    for (var key in triggers) {
        if (rx.includes(key)) {
            socket.emit('send_command', {data: triggers[key]});
        }
    }
    
    rx = rx.replace(/\n\r/g, "<br>");
    rx = ansi_up.ansi_to_html(rx);
    rx = "<span>" + rx + "</span>";
    $("#win_output").append(rx);
    outlen += rx.length;
    
    if (outlen >= 1000000) {
        //$("#win_output").children(":lt(1000)").remove();
        //console.log("outlen: " + outlen);
        $("#win_output *").slice(0, 10000).remove();
        outlen = $("#win_output").html().length;
        //console.log("trimmmed");
        //console.log("new outlen: " + outlen);
    }

    $("#win_output").scrollTop($("#win_output").prop("scrollHeight"));
    rx = '';
    
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

function update_room_exits() {
    var output='';

    var exits = {
        northwest: '<line x1="0" y1="0" x2="25" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />', 
        north: '<line x1="50" y1="0" x2="50" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />',
        northeast: '<line x1="100" y1="0" x2="75" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />',
        east: '<line x1="75" y1="50" x2="100" y2="50" style="stroke:rgb(255,0,0);stroke-width:4" />',
        southeast: '<line x1="100" y1="100" x2="75" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        south: '<line x1="50" y1="100" x2="50" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        southwest: '<line x1="0" y1="100" x2="25" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        west: '<line x1="0" y1="50" x2="25" y2="50" style="stroke:rgb(255,0,0);stroke-width:4" />',
        up: '<line x1="112" y1="45" x2="112" y2="20" style="stroke:rgb(255,0,0);stroke-width:4" />'
            + '<polyline points="104,28 112,20 120,28" style="fill:none;stroke:rgb(255,0,0);stroke-width:4"></polyline>',
        down: '<line x1="112" y1="55" x2="112" y2="80" style="stroke:rgb(255,0,0);stroke-width:4" />'
            + '<polyline points="104,72, 112,80 120,72" style="fill:none;stroke:rgb(255,0,0);stroke-width:4"></polyline>'
    };

    var doors = {
        northwest: '<line x1="8" y1="17" x2="17" y2="8" style="stroke:rgb(0,0,0);stroke-width:3" />',
        north: '<line x1="43" y1="12" x2="57" y2="12" style="stroke:rgb(0,0,0);stroke-width:3" />',
        northeast: '<line x1="92" y1="17" x2="83" y2="8" style="stroke:rgb(0,0,0);stroke-width:3" />',
        east: '<line x1="88" y1="43" x2="88" y2="57" style="stroke:rgb(0,0,0);stroke-width:3" />',
        southeast: '<line x1="92" y1="83" x2="83" y2="92" style="stroke:rgb(0,0,0);stroke-width:3" />',
        south: '<line x1="43" y1="88" x2="57" y2="88" style="stroke:rgb(0,0,0);stroke-width:3" />',
        southwest: '<line x1="8" y1="83" x2="17" y2="92" style="stroke:rgb(0,0,0);stroke-width:3" />',
        west: '<line x1="12" y1="43" x2="12" y2="57" style="stroke:rgb(0,0,0);stroke-width:3" />',
        up: '<line x1="105" y1="35" x2="119" y2="35" style="stroke:rgb(0,0,0);stroke-width:3" />',
        down: '<line x1="105" y1="65" x2="119" y2="65" style="stroke:rgb(0,0,0);stroke-width:3" />'
    };

    console.log(exits);
    var room_ex = msdp_vals.ROOM_EXITS || {};

    for (var key in room_ex) {

        for (var i=0; i < key.length; i++) {
            console.log(key.charCodeAt(i));
        }
        output += exits[key];

        if (room_ex[key] == 'C') {
            output += doors[key];
        }
    }
    output += '<rect x="25" y="25" width="50" height="50" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)">';

    console.log(output);
    $('#svg_map').html(output);

}
on_msdp("ROOM_EXITS", update_room_exits);

function update_room_name() {
    var name = msdp_vals.ROOM_NAME || '';
    $('#room_name').html(strip_color_tags(name));
};
on_msdp("ROOM_NAME", update_room_name);

function update_stat_window() {
    var output='';
    output += '<h2>STATS</h2>';

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

var lua_edit_code;
on_msdp("LUA_EDIT", function() {
    if (lua_edit_code == null ) {
        lua_edit_code = '';
    }
    
    var val = msdp_vals['LUA_EDIT'];
    console.log(val)
    lua_edit_code += val[0];
    if (val[1] == 'true') { // continue
        socket.emit("ack_rx", "LUA_EDIT");
    } else { // done
        lua_code_mirror.setValue(lua_edit_code.replace(/\n\r/g, "\n"));
        lua_edit_code = null;
    }
});

var MAX_OLC_VAL_LEN = 1234;
var olc_sender={};

on_msdp("ACK_RX", function(vr, val) {
    if (olc_sender[vr]) {
        var val =
    }
}

$(document).ready(function() {

    $('#lua_win').jqxWindow({
        position: {x: 150, y: 150}
    });
    lua_code_mirror = CodeMirror.fromTextArea($('#lua_code').get(0), {
        lineNumbers: true,
        mode: "lua"
    });   
    
    $('#save_lua_button').click(function() {
        var val = lua_code_mirror.getValue("\n\r");
        
        socket.emit('save_lua', {data: val});
        $('#lua_win').jqxWindow('close'); 
    });

    $('#trig_win').jqxWindow({
        position: {x: 150, y: 150}
    });
    $('#trig_win').jqxWindow('close');

    $('#trig_button').click(function() {
        $('#trig_win').jqxWindow('open');
    });

    var cmd_history = [];
    var cmd_index = -1;
    var send_func = function() {
        var cmd = $("#cmd_input").val();
        socket.emit('send_command', {data: cmd});
        // have to send ansi colors here
        handle_data({data: "\x1b[1;33m"
            + cmd 
            + "\x1b[0m\n\r"});
        $('#cmd_input').select();

        if (cmd.trim() == '') {
            return;
        }
        if (cmd_history.length > 0 && cmd == cmd_history[cmd_history.length-1]) {
            return;
        }

        cmd_history.push(cmd);
        cmd_index = -1;
    };

    $('#cmd_input').keydown(function(event) {
        switch (event.which) {
            case 13: // enter
                send_func();
                return false;
            case 38: // up
                if (cmd_index == -1) {
                    cmd_index = cmd_history.length-1;
                } else {
                    cmd_index -= 1;
                    cmd_index = Math.max(cmd_index, 0);
                }
                $('#cmd_input').val(cmd_history[cmd_index]);
                $('#cmd_input').select();
                return false;
            case 40: //down
                if (cmd_index == -1) {
                    break;
                }
                cmd_index += 1;
                cmd_index = Math.min(cmd_index, cmd_history.length-1);
                $('#cmd_input').val(cmd_history[cmd_index]);
                $('#cmd_input').select();
                return false;
            default:
                cmd_index = -1;
                return true;
        }
    });

    $('#main_vert_split').jqxSplitter({
        width: '90vw',
        height: '90vh',
        orientation: 'vertical',
        panels: [{size:'75%'},{size:'25%'}]
    });
    $('#output_aff_split').jqxSplitter({
        orientation: 'vertical',
        panels: [{size:'20%'},{size:'80%'}]
    });

    $("#output_gauge_split").jqxSplitter({
        orientation: 'horizontal',
        panels: [{size:'90%'},{size:'60px'}]
    });
    $('#map_chat_split').jqxSplitter({
        orientation: 'horizontal'
    });

    function render_gauge_text(curr, max, tag) {
        
        var rtn = "<pre class='gauge_text'>"+("     " + curr).slice(-5) + " / " + ("     " + max).slice(-5) + " " + tag+"</pre>";
        return rtn;
    }
    $('#hp_bar').jqxProgressBar({ 
        width: '100%', 
        height: 20, 
        value: 50,
        showText: true,
        animationDuration: 0,
        renderText: function(text) {
            //return "     " + (msdp_vals.HEALTH || 0) + " / " + (msdp_vals.HEALTH_MAX || 0) + " hp";
            return render_gauge_text( msdp_vals.HEALTH || 0, msdp_vals.HEALTH_MAX || 0, "hp");
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
            //return (msdp_vals.MANA || 0) + " / " + (msdp_vals.MANA_MAX || 0) + " mn";
            return render_gauge_text( msdp_vals.MANA || 0, msdp_vals.MANA_MAX || 0, "mn");
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
            //return (msdp_vals.MOVEMENT || 0) + " / " + (msdp_vals.MOVEMENT_MAX || 0) + " mv";
            return render_gauge_text( msdp_vals.MOVEMENT || 0, msdp_vals.MOVEMENT_MAX || 0, "mv");
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
            //return (max-tnl) + " / " + max + " etl";
            return render_gauge_text( max-tnl, max, "etl");
        }
    });
    $('#tnl_bar .jqx-progressbar-value').css(
            "background-color", "#04B404");

    socket = io.connect('http://' + document.domain + ':' + location.port + '/telnet');
    socket.on('ws_connect', function(msg) {
        //$('#dbg').append("WebSocket connected.<br>");
    });
    socket.on('telnet_error', function(msg) {
        //$('#dbg').append("Telnet error.<br>");
        var out = "\x1b[1;36m" 
                + "[[Telnet error: " + msg.message + "]]"; 
                + "\x1b[0m\n\r";
        handle_data({data: out});
    });
    socket.on('telnet_connect', function(msg) {
        //$('#dbg').append("Telnet connect.<br>");
        handle_data({data: "\x1b[1;36m"
            + "[[Telnet connected]]"
            + "\x1b[0m\n\r"});
    });
    socket.on('telnet_disconnect', function(msg) {
        handle_data({data: "\x1b[1;36m"
            + "[[Telnet disconnected]]"
            + "\x1b[0m\n\r"});
    });
    socket.on('msdp_var', function(msg) {
        //$('#dbg').append("MSDP var: "+msg.var+" val: "+msg.val+"<br>");

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

    /* autoconnect telnet on page load */
    socket.emit('open_telnet', {} ); 
});

