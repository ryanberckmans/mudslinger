var CommandInput = new (function() {
    var o = this;

    var cmd_history = [];
    var cmd_index = -1;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        $('#cmd_input').keydown(o.keydown);
//        $('#cmd_input').change(o.input_change);
        $('#cmd_input').bind('input propertychange', o.input_change);
        $('#cmd_input_pw').keydown(o.pw_keydown);
    };

    var echo = true;
    o.handle_set_echo = function(msg) {
        echo = msg.data;

        if (echo) {
            $('#cmd_input_pw').hide();
            $('#cmd_input').show();
            $('#cmd_input').val('');
            $('#cmd_input').focus();
        } else {
            $('#cmd_input').hide();
            $('#cmd_input_pw').show();
            $('#cmd_input_pw').focus();

            var current = $('#cmd_input').val();
            if (cmd_history.length > 0
                && current != cmd_history[cmd_history.length-1]) {
                /* If they already started typing password before getting echo command*/
                $('#cmd_input_pw').val(current);
                $('#cmd_input_pw')[0].setSelectionRange(current.length, current.length);
            } else {
                $('#cmd_input_pw').val('');
            }
        }
    };

    o.handle_telnet_connect = function() {
        o.handle_set_echo({data: true});
    };

    o.send_pw = function() {
        var pw = $('#cmd_input_pw').val();
        Message.pub('send_pw', {data: pw});
    }

    o.send_cmd = function() {
        var cmd = $("#cmd_input").val();
        var alias = AliasManager.check_alias(cmd);
        if (!alias) {
            var cmds = cmd.split(';');
            for (var i=0; i < cmds.length; i++) {
                Message.pub('send_command', {data: cmds[i]});
            }
        } else if (alias !== true) {
            var cmds = [];
            var lines = alias.replace('\r', '').split('\n');
            for (var i=0; i < lines.length; i++) {
                cmds = cmds.concat(lines[i].split(';'));
            }
            Message.pub('alias_send_commands', {orig: cmd, cmds: cmds});
        } /* else the script ran already */

        $('#cmd_input').select();

        if (cmd.trim() == '') {
            return;
        }
        if (cmd_history.length > 0
            && cmd == cmd_history[cmd_history.length-1]) {
            return;
        }

        if (echo) {
            cmd_history.push(cmd);
            cmd_history = cmd_history.slice(-20);
            o.save_history();
        }
        else {
            $('#cmd_input').val('');
        }
        cmd_index = -1;
    };

    o.pw_keydown = function(event) {
        switch (event.which) {
            case 13: // enter
                o.send_pw();
                $('#cmd_input_pw').val('');
                return false;
            default:
                return true;
        }
    };

    o.keydown = function(event) {
        switch (event.which) {
            case 13: // enter
                if (event.shiftKey) {
                    return true;
                } else {
                    o.send_cmd();
                    return false;
                }
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
    };

    o.input_change = function() {
        var input = $('#cmd_input');
        input.height('1px');
        var scrollHeight = input[0].scrollHeight;
        var new_height = 10 + scrollHeight;
        input.height(new_height + "px");
    };

    o.save_history = function() {
        localStorage.setItem('cmd_history', JSON.stringify(cmd_history));
    };

    o.load_history = function() {
        var cmds = localStorage.getItem('cmd_history');
        if (cmds) {
            cmd_history = JSON.parse(cmds);
        }
    };

    return o;
})();

Message.sub('prepare_reload_layout', CommandInput.prepare_reload_layout);
Message.sub('load_layout', CommandInput.load_layout);
Message.sub('set_echo', CommandInput.handle_set_echo);
Message.sub('telnet_connect', CommandInput.handle_telnet_connect);

$(document).ready(function() {
    CommandInput.load_history();
});