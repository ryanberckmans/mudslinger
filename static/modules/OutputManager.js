var OutputManager = new (function(){
    var o = this;

    var target;
    var target_windows;

    o.handle_load_layout = function() {
        // Default output to OutputWin
        target_windows = [OutputWin];
        target = OutputWin;

        o.init_color();
    };

    o.output_done = function() {
        target.output_done();
    };

    // Redirect output to another OutWinBase until it's popped
    o.push_target = function(tgt) {
        target_windows.push(tgt);
        target = tgt;
//        console.log("Output target pushed")
//        console.log(target);
    };

    o.pop_target = function() {
        target.output_done();
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
        return target.pop_elem();
    };

    o.handle_text = function(data) {
        target.add_text(data);
    };

    var colors = {
        red: {
            low: 'rgb(187,0,0)',
            high: 'rgb(256,0,0)'
        },
        green: {
            low: 'rgb(0,187,0)',
            high: 'rgb(0,256,0)'
        },
        yellow: {
            low: 'rgb(187,187,0)',
            high: 'rgb(256,256,0)'
        },
        blue: {
            low: 'rgb(0,0,187)',
            high: 'rgb(0,0,256)'
        },
        magenta: {
            low: 'rgb(187,0,187)',
            high: 'rgb(256,0,256)'
        },
        cyan: {
            low: 'rgb(0,187,187)',
            high: 'rgb(0,256,256)'
        },
        white: {
            low: 'rgb(192,192,192)',
            high: 'rgb(256,256,256)'
        },
        black: {
            low: 'rgb(0,0,0)',
            high: 'rgb(128,128,128)'
        }
    }

    var color_seqs = {
        '\x1b[0;31m': [colors.red, 'low'],
        '\x1b[0;32m': [colors.green, 'low'],
        '\x1b[0;33m': [colors.yellow, 'low'],
        '\x1b[0;34m': [colors.blue, 'low'],
        '\x1b[0;35m': [colors.magenta, 'low'],
        '\x1b[0;36m': [colors.cyan, 'low'],
        '\x1b[0;37m': [colors.white, 'low'],
        '\x1b[1;30m': [colors.black, 'high'],
        '\x1b[1;31m': [colors.red, 'high'],
        '\x1b[1;32m': [colors.green, 'high'],
        '\x1b[1;33m': [colors.yellow, 'high'],
        '\x1b[1;34m': [colors.blue, 'high'],
        '\x1b[1;35m': [colors.magenta, 'high'],
        '\x1b[1;36m': [colors.cyan, 'high'],
        '\x1b[1;37m': [colors.white, 'high']
    }

    var fg_color = null;
    var bg_color = null;

    o.init_color = function() {
        fg_color = [colors.green, 'low'];
        target.set_fg_color(fg_color[0][fg_color[1]]);
    };

    o.handle_ansi_escape = function(data) {

        if (data == '\x1b[0m') {
            fg_color = [colors.green, 'low']
            bg_color = null;
            target.set_fg_color(fg_color[0][fg_color[1]]);
            target.set_bg_color(null);
            return;
        } else if (data == '\x1b[1m') { // bold
            fg_color[1] = 'high';
            target.set_fg_color(fg_color[0][fg_color[1]]);
        } else if (data == '\x1b[7m') { // reverse
            bg_color = fg_color;
            fg_color = [colors.black, 'low']; // black text plz
            target.set_fg_color(fg_color[0][fg_color[1]]);
            target.set_bg_color(bg_color[0][bg_color[1]]);
            return;
        } else if (!(data in color_seqs)) {
            console.log("UNEXPECTED ansi sequence: ");
            console.log(data);
            return;
        } else {
            var color = color_seqs[data];
            fg_color = color;
            target.set_fg_color(fg_color[0][fg_color[1]]);
            if (bg_color) {
                bg_color = null;
                target.set_bg_color(null);
            }
        }
    };

    return o;
})();

Message.sub('load_layout', OutputManager.handle_load_layout);
