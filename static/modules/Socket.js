var Socket = new (function() {
    var o = this;

    o.open = function() {
        o._socket = io.connect('http://' + document.domain + ':' + location.port + '/telnet');

        o._socket.on("telnet_connect", function(msg) {
            Message.pub('telnet_connect', msg);
        });

        o._socket.on("telnet_disconnect", function(msg) {
            Message.pub('telnet_disconnect', msg);
        });

        o._socket.on("telnet_error", function(msg) {
            Message.pub('telnet_error', msg);
        });

        o._socket.on("msdp_var", function(msg) {
            Message.pub('msdp_var', msg);
        });

        o._socket.on("telnet_data", o._handle_telnet_data);

        o._socket.onerror = function(msg) {
            Message.pub("ws_error", msg);
        };
    };

    o.open_telnet = function() {
        o._socket.emit("open_telnet", {});
    };

    o.close_telnet = function() {
        o._socket.emit("close_telnet", {});
    };

    o.handle_send_command = function(msg) {
        console.time('send_command');
        console.time('command_resp');
        o._socket.emit("send_command", msg, function(){
            console.timeEnd('send_command');
        });
    };

    o.handle_trigger_send_command = function(msg) {
        o._socket.emit("send_command", msg);
    };

    var partial_seq;
    o._handle_telnet_data = function(msg) {
        console.timeEnd('command_resp');
        console.time("_handle_telnet_data");

        var rx = partial_seq || '';
        partial_seq = null;
        rx += msg.data;


        var output = '';
        var rx_len = rx.length;
        var max_i = rx.length-1;

        for (var i=0; i < rx_len; ) {
            var char = rx[i];

            /* strip line feeds while we're at it */
            if (char == '\r') {
                i++; continue;
            }

            /* Always snip at a newline so other modules can more easily handle logic based on line barriers */
            if (char == '\n') {
                output += char;
                i++;

                OutputManager.handle_text(output);
                output = '';

                // MXP needs to force close any open tags on newline
                MXP.handle_newline();

                continue;
            }

            if (char != '\x1b') {
                output += char;
                i++;
                continue;
            }

            /* so we have an escape sequence ... */
            /* we only expect these to be color codes or MXP tags */
            var substr = rx.slice(i);
            var re;
            var match;

            /* ansi escapes */
            re = /^\x1b\[\d(?:;\d+)?m/;
            match = re.exec(substr);
            if (match) {
                OutputManager.handle_text(output);
                output = '';

                i += match[0].length;
                OutputManager.handle_ansi_escape(match[0]);
                continue;
            }

            /* MXP escapes */
            re = /^\x1b\[1z(<.*?>)\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                // MXP tag. no discerning what it is or if it's opening/closing tag here
                i += match[0].length;
                OutputManager.handle_text(output);
                output = '';
                Message.pub('mxp_tag', {data: match[1]});
                continue;
            }

            re = /^\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                /* this gets sent once at the beginning to set the line mode. We don't need to do anything with it */
                i += match[0].length;
                continue;
            }

            /* need to account for malformed tags or sequences somehow... for now just treat a newline as a barrier */
            var nl_ind = substr.indexOf('\n');
            if (nl_ind != -1) {
                var bad_stuff = substr.slice(0, nl_ind+1);
                i += bad_stuff.length;
                console.log("Malformed sequence or tag");
                console.log(bad_stuff);
                continue;
            }

            /* If we get here, must be a partial sequence
                Send away everything up to the sequence start and assume it will get completed next time
                we receive data...
             */
            if (i != 0) {
                OutputManager.handle_text(output);
            }
            partial_seq = rx.slice(i);
            console.log("Got partial:");
            console.log(partial_seq);
            break;
        }
        if (!partial_seq) {
            /* if partial we already outputed, if not let's hit it */
            OutputManager.handle_text(output);
        }
        OutputManager.output_done();
//        console.timeEnd("_handle_telnet_data");
//        requestAnimationFrame(function() {
            console.timeEnd("_handle_telnet_data");
//        });
    };

    o.test_socket_response = function() {
        console.time('test_socket_response');
        o._socket.emit('request_test_socket_response', {}, function() {
            console.timeEnd('test_socket_response');
        });
    };

    return o;
})();

Message.sub('send_command', Socket.handle_send_command)
Message.sub('trigger_send_command', Socket.handle_trigger_send_command)
