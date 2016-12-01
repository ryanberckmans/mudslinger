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
            o.scroll_bottom(true);
            html = null;
        }
    }

    o.handle_send_pw = function(msg) {
        var stars = '*'.repeat(msg.data.length);

        o.target.append(
            '<span style="color:yellow">'
            + stars
            + "<br>"
            + '</span>');
        o.scroll_bottom(true);
    };

    o.handle_send_command = function(msg) {
        if (msg.no_print) {
            return;
        }
        var cmd = msg.data;
        o.target.append(
            '<span style="color:yellow">'
            + Util.raw_to_html(cmd)
            + "<br>"
            + '</span>');
        o.scroll_bottom(true);
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
        o.scroll_bottom(true);
    };

    o.handle_telnet_connect = function(msg) {
        o.target.append(
            '<span style="color:cyan">'
            + '[[Telnet connected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom(true);
    };
    o.handle_telnet_disconnect = function(msg) {
        o.target.append(
            '<span style="color:cyan">'
            + '[[Telnet disconnected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom(true);
    };
    o.handle_ws_connect = function(msg) {
        o.target.append(
            '<span style="color:cyan">'
            + '[[Websocket connected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_ws_disconnect = function(msg) {
        o.target.append(
            '<span style="color:cyan">'
            + "[[Websocket disconnected]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_telnet_error= function(msg) {
        o.target.append(
            '<span style="color:red">'
            + "[[Telnet error" + "<br>"
            + msg.data + "<br>"
            + "]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom(true);
    };

    o.handle_ws_error = function(msg) {
        o.target.append(
            '<span style="color:red">'
            + "[[Websocket error]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom(true);
    };

    o.handle_window_error = function(message, source, lineno, colno, error) {
        o.target.append(
            '<span style="color:red">'
            + "[[Web Client Error<br>"
            + message + "<br>"
            + source + "<br>"
            + lineno + "<br>"
            + colno + "<br>"
            + ']]'
            + '<br>'
            + '</span>'
        );
        o.scroll_bottom(true);
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
Message.sub('ws_connect', OutputWin.handle_ws_connect);
Message.sub('ws_disconnect', OutputWin.handle_ws_disconnect);
Message.sub('send_command', OutputWin.handle_send_command);
Message.sub('send_pw', OutputWin.handle_send_pw);
Message.sub('trigger_send_commands', OutputWin.handle_trigger_send_commands);
Message.sub('alias_send_commands', OutputWin.handle_alias_send_commands);

$(document).ready(function() {
    window.onerror = OutputWin.handle_window_error;
});
