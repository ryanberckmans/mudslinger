var TriggerManager = new (function(){
    var o = this;

    o.triggers = null;

    o.save_triggers = function() {
        localStorage.setItem('triggers', JSON.stringify(o.triggers));
    };

    o.handle_line = function(line) {
//        console.log("TRIGGER: " + line);
        for (var i=0; i < o.triggers.length; i++) {
            var trig = o.triggers[i];
            if (trig.regex) {
                var match = line.match(trig.pattern);
                if (!match) {
                    continue;
                }

                if (trig.is_script) {
                    var script = new JsScript(trig.value);
                    if (script) {script.RunScript(match)};
                } else {
                    var value = trig.value;

                    value = value.replace(/\$(\d+)/g, function(m, d) {
                        return match[parseInt(d)] || '';
                    });

                    var cmds = value.replace('\r', '').split('\n');
                    Message.pub('trigger_send_commands', {cmds: cmds});
                }
            } else {
                if (line.includes(trig.pattern)) {
                    if (trig.is_script) {
                        var script = new JsScript(trig.value);
                        if (script) {script.RunScript(null)};
                    } else {
                        var cmds = trig.value.replace('\r', '').split('\n');
                        Message.pub('trigger_send_commands', {cmds: cmds});
                    }
                }
            }
        }
    };

    return o;
})();

$(document).ready(function() {
    var saved_triggers = localStorage.getItem("triggers");
    if (!saved_triggers) {
        TriggerManager.triggers = [];
    } else {
        TriggerManager.triggers = JSON.parse(saved_triggers);
    }
});