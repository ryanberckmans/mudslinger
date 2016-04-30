var CommandInput = new (function() {
    var o = this;

    var cmd_history = [];
    var cmd_index = -1;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        $('#cmd_input').keydown(o.keydown);
    };

    var echo = true;
    o.handle_set_echo = function(msg) {
        echo = msg.data;

        if (echo) {
            $('#cmd_input')[0].setAttribute('type', 'text');
        } else {
            $('#cmd_input')[0].setAttribute('type', 'password');
        }
    };

    o.send_cmd = function() {
        var cmd = $("#cmd_input").val();
        var alias = AliasManager.check_alias(cmd);
        if (!alias) {
            Message.pub('send_command', {data: cmd});
        } else {
            Message.pub('alias_send_commands', {orig: cmd, cmds: alias.replace('\r', '').split('\n')});
        }

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
            o.save_history();
            cmd_history.slice(-20);
        }
        else {
            $('#cmd_input').val('');
        }
        cmd_index = -1;
    };

    o.keydown = function(event) {
        switch (event.which) {
            case 13: // enter
                o.send_cmd();
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

$(document).ready(function() {
    CommandInput.load_history();
});