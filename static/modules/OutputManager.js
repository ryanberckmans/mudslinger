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

    var xterm_cols = {
      '0': '#000000',
      '1': '#800000',
      '2': '#008000',
      '3': '#808000',
      '4': '#000080',
      '5': '#800080',
      '6': '#008080',
      '7': '#c0c0c0',

     '8': '#808080',
      '9': '#ff0000',
     '10': '#00ff00',
     '11': '#ffff00',
     '12': '#0000ff',
     '13': '#ff00ff',
     '14': '#00ffff',
     '15': '#ffffff',

     '16': '#000000',
      '17': '#00005f',
      '18': '#000087',
      '19': '#0000af',
      '20': '#0000d7',
      '21': '#0000ff',

     '22': '#005f00',
      '23': '#005f5f',
      '24': '#005f87',
      '25': '#005faf',
      '26': '#005fd7',
      '27': '#005fff',

     '28': '#008700',
      '29': '#00875f',
      '30': '#008787',
      '31': '#0087af',
      '32': '#0087d7',
      '33': '#0087ff',

     '34': '#00af00',
      '35': '#00af5f',
      '36': '#00af87',
      '37': '#00afaf',
      '38': '#00afd7',
      '39': '#00afff',

     '40': '#00d700',
      '41': '#00d75f',
      '42': '#00d787',
      '43': '#00d7af',
      '44': '#00d7d7',
      '45': '#00d7ff',

     '46': '#00ff00',
      '47': '#00ff5f',
      '48': '#00ff87',
      '49': '#00ffaf',
      '50': '#00ffd7',
      '51': '#00ffff',

     '52': '#5f0000',
      '53': '#5f005f',
      '54': '#5f0087',
      '55': '#5f00af',
      '56': '#5f00d7',
      '57': '#5f00ff',

     '58': '#5f5f00',
      '59': '#5f5f5f',
      '60': '#5f5f87',
      '61': '#5f5faf',
      '62': '#5f5fd7',
      '63': '#5f5fff',

     '64': '#5f8700',
      '65': '#5f875f',
      '66': '#5f8787',
      '67': '#5f87af',
      '68': '#5f87d7',
      '69': '#5f87ff',

     '70': '#5faf00',
      '71': '#5faf5f',
      '72': '#5faf87',
      '73': '#5fafaf',
      '74': '#5fafd7',
      '75': '#5fafff',

     '76': '#5fd700',
      '77': '#5fd75f',
      '78': '#5fd787',
      '79': '#5fd7af',
      '80': '#5fd7d7',
      '81': '#5fd7ff',

     '82': '#5fff00',
      '83': '#5fff5f',
      '84': '#5fff87',
      '85': '#5fffaf',
      '86': '#5fffd7',
      '87': '#5fffff',

     '88': '#870000',
      '89': '#87005f',
      '90': '#870087',
      '91': '#8700af',
      '92': '#8700d7',
      '93': '#8700ff',

     '94': '#875f00',
      '95': '#875f5f',
      '96': '#875f87',
      '97': '#875faf',
      '98': '#875fd7',
      '99': '#875fff',

    '100': '#878700',
     '101': '#87875f',
     '102': '#878787',
     '103': '#8787af',
     '104': '#8787d7',
     '105': '#8787ff',

    '106': '#87af00',
     '107': '#87af5f',
     '108': '#87af87',
     '109': '#87afaf',
     '110': '#87afd7',
     '111': '#87afff',

    '112': '#87d700',
     '113': '#87d75f',
     '114': '#87d787',
     '115': '#87d7af',
     '116': '#87d7d7',
     '117': '#87d7ff',

    '118': '#87ff00',
     '119': '#87ff5f',
     '120': '#87ff87',
     '121': '#87ffaf',
     '122': '#87ffd7',
     '123': '#87ffff',

    '124': '#af0000',
     '125': '#af005f',
     '126': '#af0087',
     '127': '#af00af',
     '128': '#af00d7',
     '129': '#af00ff',

    '130': '#af5f00',
     '131': '#af5f5f',
     '132': '#af5f87',
     '133': '#af5faf',
     '134': '#af5fd7',
     '135': '#af5fff',

    '136': '#af8700',
     '137': '#af875f',
     '138': '#af8787',
     '139': '#af87af',
     '140': '#af87d7',
     '141': '#af87ff',

    '142': '#afaf00',
     '143': '#afaf5f',
     '144': '#afaf87',
     '145': '#afafaf',
     '146': '#afafd7',
     '147': '#afafff',

    '148': '#afd700',
     '149': '#afd75f',
     '150': '#afd787',
     '151': '#afd7af',
     '152': '#afd7d7',
     '153': '#afd7ff',

    '154': '#afff00',
     '155': '#afff5f',
     '156': '#afff87',
     '157': '#afffaf',
     '158': '#afffd7',
     '159': '#afffff',

    '160': '#d70000',
     '161': '#d7005f',
     '162': '#d70087',
     '163': '#d700af',
     '164': '#d700d7',
     '165': '#d700ff',

    '166': '#d75f00',
     '167': '#d75f5f',
     '168': '#d75f87',
     '169': '#d75faf',
     '170': '#d75fd7',
     '171': '#d75fff',

    '172': '#d78700',
     '173': '#d7875f',
     '174': '#d78787',
     '175': '#d787af',
     '176': '#d787d7',
     '177': '#d787ff',

    '178': '#d7af00',
     '179': '#d7af5f',
     '180': '#d7af87',
     '181': '#d7afaf',
     '182': '#d7afd7',
     '183': '#d7afff',

    '184': '#d7d700',
     '185': '#d7d75f',
     '186': '#d7d787',
     '187': '#d7d7af',
     '188': '#d7d7d7',
     '189': '#d7d7ff',

    '190': '#d7ff00',
     '191': '#d7ff5f',
     '192': '#d7ff87',
     '193': '#d7ffaf',
     '194': '#d7ffd7',
     '195': '#d7ffff',

    '196': '#ff0000',
     '197': '#ff005f',
     '198': '#ff0087',
     '199': '#ff00af',
     '200': '#ff00d7',
     '201': '#ff00ff',

    '202': '#ff5f00',
     '203': '#ff5f5f',
     '204': '#ff5f87',
     '205': '#ff5faf',
     '206': '#ff5fd7',
     '207': '#ff5fff',

    '208': '#ff8700',
     '209': '#ff875f',
     '210': '#ff8787',
     '211': '#ff87af',
     '212': '#ff87d7',
     '213': '#ff87ff',

    '214': '#ffaf00',
     '215': '#ffaf5f',
     '216': '#ffaf87',
     '217': '#ffafaf',
     '218': '#ffafd7',
     '219': '#ffafff',

    '220': '#ffd700',
     '221': '#ffd75f',
     '222': '#ffd787',
     '223': '#ffd7af',
     '224': '#ffd7d7',
     '225': '#ffd7ff',

    '226': '#ffff00',
     '227': '#ffff5f',
     '228': '#ffff87',
     '229': '#ffffaf',
     '230': '#ffffd7',
     '231': '#ffffff',

    '232': '#080808',
     '233': '#121212',
     '234': '#1c1c1c',
     '235': '#262626',
     '236': '#303030',
     '237': '#3a3a3a',

    '238': '#444444',
     '239': '#4e4e4e',
     '240': '#585858',
     '241': '#606060',
     '242': '#666666',
     '243': '#767676',

    '244': '#808080',
     '245': '#8a8a8a',
     '246': '#949494',
     '247': '#9e9e9e',
     '248': '#a8a8a8',
     '249': '#b2b2b2',

    '250': '#bcbcbc',
     '251': '#c6c6c6',
     '252': '#d0d0d0',
     '253': '#dadada',
     '254': '#e4e4e4',
     '255': '#eeeeee',

    }

    var ansi_reverse = false;

    var default_ansi_fg = ["green", "low"];
    var default_ansi_bg = ["black", "low"];

    var ansi_fg = null;
    var ansi_bg = null;

    var fg_color = null;
    var bg_color = null;

    var set_fg_color = function(color) {
        fg_color = color;
        target.set_fg_color(color);
    };

    var set_ansi_fg = function(color) {
        ansi_fg = color;
        set_fg_color(ansi_fg ? (colors[ansi_fg[0]][ansi_fg[1]]) : null);
    };

    var set_bg_color = function(color) {
        bg_color = color;
        target.set_bg_color(color);
    };

    var set_ansi_bg = function(color) {
        ansi_bg = color;
        set_bg_color(ansi_bg ? (colors[ansi_bg[0]][ansi_bg[1]]) : null);
    };

    o.get_fg_color = function() {
        return fg_color || colors[default_ansi_fg[0]][default_ansi_fg[1]];
    };
    o.get_bg_color = function() {
        return bg_color || colors[default_ansi_bg[0]][default_ansi_bg[1]];
    };

    o.init_color = function() {
//        set_ansi_fg([colors.green, 'low']);
    };

    o.handle_xterm_escape = function(data) {
        var splt = data.split(';');
        var color_code = splt[2].slice(0, -1); // kill the 'm'
        color_code = parseInt(color_code).toString();
        var is_bg = (splt[0] == '\x1b[48'); // 38 is fg, 48 is bg

        var html_color = xterm_cols[color_code];

        if (is_bg) {
            ansi_bg = null;
            set_bg_color(html_color);
        } else {
            ansi_fg = null;
            set_fg_color(html_color);
        }
    };

    var ansi_fg_lookup = {
        30: 'black',
        31: 'red',
        32: 'green',
        33: 'yellow',
        34: 'blue',
        35: 'magenta',
        36: 'cyan',
        37: 'white'
    };

    var ansi_bg_lookup = {
        40: 'black',
        41: 'red',
        42: 'green',
        43: 'yellow',
        44: 'blue',
        45: 'magenta',
        46: 'cyan',
        47: 'white'
    };

    /* handles graphics mode codes http://ascii-table.com/ansi-escape-sequences.php*/
    o.handle_ansi_graphic_codes = function(codes) {
        var new_fg;
        var new_bg;

        for (var i=0; i < codes.length; i++) {

            var code = parseInt(codes[i]);

            /* all off */
            if (code == 0) {
                new_fg = null;
                new_bg = null;
                ansi_reverse = false;
                continue;
            }

            /* bold on */
            if (code == 1) {
                // On the chance that we have xterm colors, just ignore bold

                if (ansi_reverse) {
                    if (new_bg || ansi_bg || !bg_color) {
                        new_bg = new_bg || ansi_bg || default_ansi_bg.slice();
                        new_bg[1] = 'high';
                    }
                } else {
                    if (new_fg || ansi_fg || !fg_color) {
                        new_fg = new_fg || ansi_fg || default_ansi_fg.slice();
                        new_fg[1] = 'high';
                    }
                }
                continue;
            }

            /* reverse */
            if (code == 7) {
                /* TODO: handle xterm reversing */
                if (ansi_reverse) {
                    continue;
                }
                ansi_reverse = true;
                var fg = new_fg || ansi_fg || default_ansi_fg.slice();
                var bg = new_bg || ansi_bg || default_ansi_bg.slice();
                new_fg = bg;
                new_bg = fg;

                continue;
            }

            /* foreground colors */
            if (code >= 30 && code <= 37) {
                /* other clients seem to cancel reverse on any color change... */
                if (ansi_reverse) {
                    ansi_reverse = false;
                    new_bg = null;
                }

                var color_name = ansi_fg_lookup[code];
                new_fg = new_fg || default_ansi_fg.slice();
                new_fg[0] = color_name;
                continue;
            }

            /* background colors */
            if (code >= 40 && code <= 47) {
                /* other clients seem to cancel reverse on any color change... */
                if (ansi_reverse) {
                    ansi_reverse = false;
                    new_fg = null;
                }

                var color_name = ansi_bg_lookup[code];
                new_bg = new_bg || default_ansi_bg.slice();
                new_bg[0] = color_name;
                continue;
            }
        }

        if (new_fg !== undefined) {
            set_ansi_fg(new_fg);
        }
        if (new_bg !== undefined) {
            set_ansi_bg(new_bg);
        }
    };

    o.set_default_ansi_fg = function(color_name, level) {
        console.log(color_name);
        console.log(level);
        if ( !(color_name in colors) ) {
            console.log("Invalid color_name: " + color_name);
            return;
        }
	
        if ( !((['low','high']).includes(level)) ) {
            console.log("Invalid level: " + level);
            return;
        }
       
        default_ansi_fg = [color_name, level];
        $('.output_text').css('color', colors[color_name][level]);
    };

    o.handle_change_default_color = function(color_name) {
        var level = "low";

        o.set_default_ansi_fg(color_name, level);
        o.save_color_cfg();
    };

    o.save_color_cfg = function() {
        localStorage.setItem('color_cfg', JSON.stringify({
            'default_ansi_fg': default_ansi_fg
        }));
    };


    return o;
})();

Message.sub('load_layout', OutputManager.handle_load_layout);
Message.sub('change_default_color', OutputManager.handle_change_default_color);

$(document).ready(function() {
    var saved_color_cfg = localStorage.getItem("color_cfg");
    if (!saved_color_cfg) {
        return;
    } else {
        var cfg = JSON.parse(saved_color_cfg);
        var default_ansi_fg = cfg.default_ansi_fg;
        OutputManager.set_default_ansi_fg(default_ansi_fg[0], default_ansi_fg[1]);
    }
});
