var GaugeWin = new (function() {
    var GAUGE_HEIGHT = '18%';
    var GAUGE_WIDTH = '100%';

    var o = self;

    var msdp_vals = {};
    var update_funcs = {};

    var render_gauge_text = function(curr, max, tag) {
        var rtn = "<pre class='gauge_text'>"+("     " + curr).slice(-5) + " / " + ("     " + max).slice(-5) + " " + tag+"</pre>";
        return rtn;
    };

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        $('#hp_bar').jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: function(text) {
                return render_gauge_text( msdp_vals.HEALTH || 0, msdp_vals.HEALTH_MAX || 0, "hp ");
            }
        });

        $('#hp_bar .jqx-progressbar-value').css(
            "background-color", "#DF0101");

        $('#mana_bar').jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: function(text) {
                //return (msdp_vals.MANA || 0) + " / " + (msdp_vals.MANA_MAX || 0) + " mn";
                return render_gauge_text( msdp_vals.MANA || 0, msdp_vals.MANA_MAX || 0, "mn ");
            }
        });
        $('#mana_bar .jqx-progressbar-value').css(
                "background-color", "#2E64FE");

        $('#move_bar').jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: function(text) {
                //return (msdp_vals.MOVEMENT || 0) + " / " + (msdp_vals.MOVEMENT_MAX || 0) + " mv";
                return render_gauge_text( msdp_vals.MOVEMENT || 0, msdp_vals.MOVEMENT_MAX || 0, "mv ");
            }
        });
        $('#move_bar .jqx-progressbar-value').css(
                "background-color", "#04B4AE");

        $('#enemy_bar').jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 0,
            showText: true,
            animationDuration: 0,
            renderText: function(text) {
                return Util.strip_color_tags(msdp_vals.OPPONENT_NAME || '');
            }
        });
        $('#enemy_bar .jqx-progressbar-value').css(
                "background-color", "purple");

        $('#tnl_bar').jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: function(text) {
                var tnl=msdp_vals.EXPERIENCE_TNL || 0;
                var max=msdp_vals.EXPERIENCE_MAX || 0;
                return render_gauge_text( max-tnl, max, "etl");
            }
        });
        $('#tnl_bar .jqx-progressbar-value').css(
                "background-color", "#04B404");

        for (var k in update_funcs) {
            update_funcs[k]();
        }
    };


    update_funcs.HEALTH = function() {
        var val = msdp_vals.HEALTH || 0;
        var max = msdp_vals.HEALTH_MAX || 0;
        if ( !max || max == 0) { return; }
        $('#hp_bar').jqxProgressBar({ value: 100*val/max });
    };
    update_funcs.HEALTH_MAX = update_funcs.HEALTH;

    update_funcs.MANA = function() {
        var val = msdp_vals.MANA || 0;
        var max = msdp_vals.MANA_MAX || 0;
        if ( !max || max == 0) { return; }
        $('#mana_bar').jqxProgressBar({ value: 100*val/max });
    }
    update_funcs.MANA_MAX = update_funcs.MANA;

    update_funcs.MOVEMENT = function() {
        var val = msdp_vals.MOVEMENT || 0;
        var max = msdp_vals.MOVEMENT_MAX || 0;
        if ( !max || max == 0) { return; }
        $('#move_bar').jqxProgressBar({ value: 100*val/max });
    }
    update_funcs.MOVEMENT_MAX = update_funcs.MOVEMENT;

    update_funcs.OPPONENT_HEALTH = function() {
        var val = msdp_vals.OPPONENT_HEALTH || 0;
        var max = msdp_vals.OPPONENT_HEALTH_MAX || 0;
        if ( !max || max == 0) { return; }
        $('#enemy_bar').jqxProgressBar({ value: 100*val/max });
    }
    update_funcs.OPPONENT_HEALTH_MAX = update_funcs.OPPONENT_HEALTH;
    update_funcs.OPPONENT_NAME = update_funcs.OPPONENT_HEALTH;

    update_funcs.EXPERIENCE_TNL = function() {
        var val = msdp_vals.EXPERIENCE_TNL || 0;
        var max = msdp_vals.EXPERIENCE_MAX || 0;
        if ( !max || max == 0) { return; }
        $('#tnl_bar').jqxProgressBar({ value: 100*(max - val)/max });
    }
    update_funcs.EXPERIENCE_MAX = update_funcs.EXPERIENCE_TNL;


    o.handle_msdp_var = function(msg) {
        if (msg.var in update_funcs) {
            msdp_vals[msg.var] = msg.val;
            update_funcs[msg.var]();
        }
    };

    return o;

})();

//$(document).ready(function() {
//    GaugeWin.load_layout();
//});


Message.sub('msdp_var', GaugeWin.handle_msdp_var);
Message.sub('prepare_reload_layout', GaugeWin.prepare_reload_layout);
Message.sub('load_layout', GaugeWin.load_layout);