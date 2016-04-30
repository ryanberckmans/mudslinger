var OutputWin = new (function(){

    var o = new OutWinBase();

    var html;
    var curr_elem;
    var fg_color;
    var bg_color;

    o.prepare_reload_layout = function() {
        html = $("#win_output").html();
    }

    o.load_layout = function() {
        o.set_root_elem($('#win_output'));
        if (html) {
            // it's a reload
            $('#win_output').html(html);
            o.scroll_bottom();
            html = null;
            console.log('asdfasd');
        }
    }

    var echo = true;
    o.handle_set_echo = function(msg) {
        echo = msg.data;
    };

    o.handle_send_command = function(msg) {
        //$('#win_output').append(
//        o.new_line();
        var cmd;
        if (echo) {
            cmd = msg.data;
        } else {
            cmd = '*'.repeat(msg.data.length);
        }
        o.target.append(
            '<span style="color:yellow">'
            + Util.raw_to_html(cmd)
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_trigger_send_commands = function(msg) {
        var html = '<span style="color:cyan">';

        for (var i=0; i < msg.cmds.length; i++) {
            if (i >= 3) {
                html += '...<br>';
                break;
            } else {
                html += Util.raw_to_html(msg.cmds[i]) + "<br>";
            }
        }
        o.target.append(html);
        o.scroll_bottom();
    };

    o.handle_alias_send_commands = function(msg) {
        var html = '<span style="color:yellow">'
        html += Util.raw_to_html(msg.orig);
        html += '</span><span style="color:cyan"> --> ';

        for (var i=0; i < msg.cmds.length; i++) {
            if (i >= 3) {
                html += '...<br>';
                break;
            } else {
                html += Util.raw_to_html(msg.cmds[i]) + "<br>";
            }
        }

        o.target.append(html);
        o.scroll_bottom();
    };

    o.handle_telnet_connect = function(msg) {
        //$('#win_output').append(
//        o.new_line();
        o.target.append(
            '<span style="color:cyan">'
            + '[[Telnet connected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_telnet_disconnect = function(msg) {
//        o.new_line();
        o.target.append(
            '<span style="color:cyan">'
            + "[[Telnet disconnected]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_telnet_error= function(msg) {
//        o.new_line();
        o.target.append(
            '<span style="color:red">'
            + "[[Telnet error]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_ws_error = function(msg) {
        o.target.append(
            '<span style="color:red">'
            + "[[Websocket error]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_line = function(line) {
        TriggerManager.handle_line(line);
    };

    return o;
})();

Message.sub('prepare_reload_layout', OutputWin.prepare_reload_layout);
Message.sub('load_layout', OutputWin.load_layout);
Message.sub('telnet_connect', OutputWin.handle_telnet_connect);
Message.sub('telnet_disconnect', OutputWin.handle_telnet_disconnect);
Message.sub('telnet_error', OutputWin.handle_telnet_error);
Message.sub('ws_error', OutputWin.handle_ws_error);
Message.sub('send_command', OutputWin.handle_send_command);
Message.sub('trigger_send_commands', OutputWin.handle_trigger_send_commands);
Message.sub('alias_send_commands', OutputWin.handle_alias_send_commands);
Message.sub('set_echo', OutputWin.handle_set_echo);
