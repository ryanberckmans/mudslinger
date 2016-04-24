var StatWin = new (function(){
    var o = this;

    var msdp_vals = {
        'STR': null, 'STR_PERM': null,
        'INT': null, 'INT_PERM': null,
        'CON': null, 'CON_PERM': null,
        'WIS': null, 'WIS_PERM': null,
        'VIT': null, 'VIT_PERM': null,
        'DIS': null, 'DIS_PERM': null,
        'AGI': null, 'AGI_PERM': null,
        'CHA': null, 'CHA_PERM': null,
        'DEX': null, 'DEX_PERM': null,
        'LUC': null, 'LUC_PERM': null
    };

    var html;

    o.prepare_reload_layout = function() {
        html = $('#win_stat').html();
    };

    o.load_layout = function() {
        if (html) {
            // it's a reload
            $('#win_stat').html(html);
            html = null;
        }
    };

    o.update_stat_win = function() {
        var output = '';
        output +=
        output += '<h2>STATS</h2>';

        var left = false;

        function print_stat( label, val, perm) {
            var color;
            left = !left;
            if (left) {
                color = "red";
            } else {
                color = "cyan";
            }

            output += '<span style="color: '+color+';">';

            output += label + ": ";
            output += ("   " + (msdp_vals[perm] || '???')).slice(-3);
            output += "("+(("   " + (msdp_vals[val] || '???')).slice(-3))+")";

            output += "</span>"
        }

        output += '<center>';

        print_stat( "Str", "STR", "STR_PERM");
        output += '   ';
        print_stat( "Int", "INT", "INT_PERM");
        output += "<br>";

        print_stat( "Con", "CON", "CON_PERM");
        output += '   ';
        print_stat( "Wis", "WIS", "WIS_PERM");
        output += "<br>";

        print_stat( "Vit", "VIT", "VIT_PERM");
        output += '   ';
        print_stat( "Dis", "DIS", "DIS_PERM");
        output += "<br>";

        print_stat( "Agi", "AGI", "AGI_PERM");
        output += '   ';
        print_stat( "Cha", "CHA", "CHA_PERM");
        output += "<br>";

        print_stat( "Dex", "DEX", "DEX_PERM");
        output += '   ';
        print_stat( "Luc", "LUC", "LUC_PERM");
        output += "<br>";

        output += '</center>';

        $('#win_stat').html("<pre>"+output+"</pre>");
    };

    o.handle_msdp_var = function(msg) {
        if (!msg.var in msdp_vals) {
            return;
        }

        msdp_vals[msg.var] = msg.val;

        o.update_stat_win();
    };

    return o;
})();

Message.sub('prepare_reload_layout', StatWin.prepare_reload_layout);
Message.sub('load_layout', StatWin.load_layout);
Message.sub('msdp_var', StatWin.handle_msdp_var);
