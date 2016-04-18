var AffWin = new (function(){
    var o = this;

    var affects;

    o.handle_msdp_var = function(msg) {
        if (msg.var != "AFFECTS") {
            return;
        }
        var affects = msg.val;

        var output = "<h2>AFFECTS</h2>";

        for (var key in affects) {
            output += ("   "+affects[key]).slice(-3) + ' : ' + key + "<br>";
        }

        $('#win_aff').html(output);
    };

    return o;
})();

Message.sub('msdp_var', AffWin.handle_msdp_var);