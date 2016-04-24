var OutputManager = new (function(){
    var o = this;

    var target;
    var target_windows;

    o.handle_load_layout = function() {
        // Default output to OutputWin
        target_windows = [OutputWin];
        target = OutputWin;
    };

    // Redirect output to another OutWinBase until it's popped
    o.push_target = function(tgt) {
        target_windows.push(tgt);
        target = tgt;
//        console.log("Output target pushed")
//        console.log(target);
    };

    o.pop_target = function() {
        target_windows.pop();
        target = target_windows[target_windows.length-1];
//        console.log("target popped, new target");
//        console.log(target);
    };

    // propagate MXP elements to target
    o.push_mxp_elem = function(elem) {
        target.push_elem(elem);
    };

    o.pop_mxp_elem = function() {
        target.pop_elem();
    };

    o.handle_text = function(data) {
        data = Util.raw_to_html(data);

        target.add_text(data);
    };

    var color_seqs = {
        '\x1b[0;31m': 'rgb(187,  0,  0)', //red
        '\x1b[0;32m': 'rgb(  0,187,  0)', //green
        '\x1b[0;33m': 'rgb(187,187,  0)', //yellow
        '\x1b[0;34m': 'rgb(  0,  0,187)', //blue
        '\x1b[0;35m': 'rgb(187,  0,187)', //magenta
        '\x1b[0;36m': 'rgb(  0,187,187)', //cyan
        '\x1b[0;37m': 'rgb(255,255,255)', //white
        '\x1b[1;30m': 'rgb(120,120,120)', //grey
        '\x1b[1;31m': 'rgb(255,  0,  0)', //bright red
        '\x1b[1;32m': 'rgb(  0,255,  0)', //bright green
        '\x1b[1;33m': 'rgb(255,255,  0)', //bright yellow
        '\x1b[1;34m': 'rgb(  0,  0,255)', //bright blue
        '\x1b[1;35m': 'rgb(255,  0,255)', //bright magenta
        '\x1b[1;36m': 'rgb(  0,255,255)', //bright cyan
        '\x1b[1;37m': 'rgb(255,255,255)', //bright white
    }

    var fg_color = null;
    var bg_color = null;
    o.handle_ansi_escape = function(data) {

        if (data == '\x1b[0m') {
            target.set_fg_color(null);
            target.set_bg_color(null);
            return;
        } else if (data == '\x1b[7m') {
            bg_color = fg_color;
            fg_color = color_codes.black;
            target.set_fg_color(fg_color);
            target.set_bg_color(bg_color);
            return;
        } else if (!(data in color_seqs)) {
            console.log("UNEXPECTED ansi sequence: ");
            console.log(data);
            return;
        } else {
            var color = color_seqs[data];
            fg_color = color;
            target.set_fg_color(color);
            if (bg_color) {
                bg_color = null;
                target.set_bg_color(bg_color);
            }
        }
    };

    return o;
})();

Message.sub('load_layout', OutputManager.handle_load_layout);
