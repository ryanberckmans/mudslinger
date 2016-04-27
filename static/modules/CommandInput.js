var CommandInput = new (function() {
    var o = this;

    var cmd_history = [];
    var cmd_index = -1;

    o.blah = 3;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        $('#cmd_input').keydown(o.keydown);
    };

    o.send_cmd = function() {
        var cmd = $("#cmd_input").val();
        var alias = AliasManager.check_alias(cmd);
        Message.pub('send_command', {data: alias});

        $('#cmd_input').select();

        if (cmd.trim() == '') {
            return;
        }
        if (cmd_history.length > 0
            && cmd == cmd_history[cmd_history.length-1]) {
            return;
        }

        cmd_history.push(cmd);
        cmd_history.slice(-20);
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

    return o;
})();

Message.sub('prepare_reload_layout', CommandInput.prepare_reload_layout);
Message.sub('load_layout', CommandInput.load_layout);