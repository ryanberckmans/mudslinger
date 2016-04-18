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

        o._socket.on("telnet_data", this._handle_telnet_data);

        o._socket.onerror = function(msg) {
            Message.pub("ws_error", msg);
        };
    };

    o.open_telnet = function() {
        o._socket.emit("open_telnet", {});
    };

    o.handle_send_command = function(msg) {
        o._socket.emit("send_command", msg);
    };

    o._handle_telnet_data = function(msg) {
        // Eventually we will do some processing here
//        console.log(msg.data)
        Message.pub('output_data', msg);
    };

    return o;
})();

Message.sub('send_command', Socket.handle_send_command)