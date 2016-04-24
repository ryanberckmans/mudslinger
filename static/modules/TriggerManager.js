var TriggerManager = new (function(){
    var o = this;

    var triggers = [
        {
            pattern: 'You gossip',
            regex: false,
            send: 'dance'
        }
    ];

    o.handle_line = function(line) {
//        console.log("TRIGGER: " + line);
        for (var i=0; i < triggers.length; i++) {
            var trig = triggers[i];
            if (line.includes(trig.pattern)) {
                Message.pub('trigger_send_command', {data: trig.send});
            }
        }
    };

    return o;
})();