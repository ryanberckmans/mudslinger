var Socket = new (function() {
    var o = this;

    var mxp_mode = null;

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

        o._socket.on("telnet_data", this._handle_telnet_data);

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
        o._socket.emit("send_command", msg);
    };

    var partial_seq;
//    var partial_mxp;
//    var partial_mxp = false;
    o._handle_telnet_data = function(msg) {
        /* Cover these cases:
            rx has no escapes
                => just send it on through
            rx has one or more escapes and they are all complete
                => just send it on through
            rx has one or more escapes and the last one is not complete
                => send everything up until the last escape sequence and save the partial sequence for next round
        */
        var rx = partial_seq || '';
        partial_seq = null;
        rx += msg.data;


//        if ((mxp_mode != 'secure line')
//            && (!rx.includes('\x1b'))) {
//            Message.pub('output_data', {data: rx});
////            console.log("Do it");
//            return;
//        }

        var output = '';
        var rx_len = rx.length;
        var max_i = rx.length-1;

        for (var i=0; i < rx_len; ) {
            var char = rx[i];

//            /* MXP tag */
//            if (mxp_mode == 'secure line') {
//                if (partial_mxp) {
//
//                }
//            }


//            if (mxp_mode == 'secure line' && char == '<') {
//                var substr = rx.slice(i);
//
//                var re;
//                var match;
//
//                re = /^<(\S+)([^>]*)>/
//                if (match) {
//                    Message.pub('mxp_tag', {tag: match[1]});
//                    i += match[0].length;
//                    continue;
//                }
////
////                partial = substr;
////                partial_mxp = True;
//                continue;
//            }

//            if (char != '\x1b') {
//                if (char == "\n") {
//                    if (mxp_mode == 'secure line') {
//                        mxp_mode = 'lock locked';
//                    }
//                }
//                i++;
//                continue;
//            }

            if (char != '\x1b') {
                output += char;
                i++;
                continue;
            }

            /* so we have an escape sequence ... */
            /* we only expect these to be color codes or MXP tags */
            var substr = rx.slice(i);

            /* ansi escapes */
            var re = /^\x1b\[\d(?:;\d+)?m/;
            var match = re.exec(substr);
            if (match) {
                i += match[0].length;
                // send along as is, will be converted to html elsewhere
                output += match[0];
                continue;
            }

            /* MXP escapes */
            re = /^\x1b\[1z(<.*?>)\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                // MXP tag. no discerning what it is or if it's opening/closing tag here
                i += match[0].length;
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

//            re = /^\x1b\[([17])z/
//            match = re.exec(substr);
//            if (match) {
//                i += match[0].length;
//                switch(match[1]) {
//                    case '1':
//                        mxp_mode = 'open_line';
//                        break;
//                    case '7':
//                        mxp_mode = 'lock locked';
//                        break;
//                }
//                continue;
//            }

            /* must be a partial */
            if (i != 0) {
                Message.pub('output_data', {data: output});
            }
            partial_seq = rx.slice(i);
            console.log("Got partial:");
            console.log(partial_seq);
            break;
        }
        if (!partial_seq) {
            /* if partial we already outputed, if not let's hit it */
            Message.pub("output_data", {data: output});
        }
    };

    return o;
})();

Message.sub('send_command', Socket.handle_send_command)