var AffWin = new (function(){
    var o = this;

    var output;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        if (output) {
            // it's a reload
            $('#win_aff').html(output);
        } else {
            o.show_affects([]);
        }
    };

    o.show_affects = function(affects) {
        output = "<h2>AFFECTS</h2>";

        for (var key in affects) {
            output += ("   "+affects[key]).slice(-3) + ' : ' + key + "<br>";
        }

        $('#win_aff').html(output);
    };

    o.handle_msdp_var = function(msg) {
        if (msg.var != "AFFECTS") {
            return;
        }
        o.show_affects(msg.val)
    };

    return o;
})();

Message.sub('msdp_var', AffWin.handle_msdp_var);
Message.sub('prepare_reload_layout', AffWin.prepare_reload_layout);
Message.sub('load_layout', AffWin.load_layout);