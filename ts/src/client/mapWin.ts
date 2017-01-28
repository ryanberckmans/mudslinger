var MapWin = new (function() {
    var o = this;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        o.update_grid();
        o.update_room_name();
    };

    var exits = {
        northwest: '<line x1="0" y1="0" x2="25" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />',
        north: '<line x1="50" y1="0" x2="50" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />',
        northeast: '<line x1="100" y1="0" x2="75" y2="25" style="stroke:rgb(255,0,0);stroke-width:4" />',
        east: '<line x1="75" y1="50" x2="100" y2="50" style="stroke:rgb(255,0,0);stroke-width:4" />',
        southeast: '<line x1="100" y1="100" x2="75" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        south: '<line x1="50" y1="100" x2="50" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        southwest: '<line x1="0" y1="100" x2="25" y2="75" style="stroke:rgb(255,0,0);stroke-width:4" />',
        west: '<line x1="0" y1="50" x2="25" y2="50" style="stroke:rgb(255,0,0);stroke-width:4" />',
        up: '<line x1="112" y1="45" x2="112" y2="20" style="stroke:rgb(255,0,0);stroke-width:4" />'
            + '<polyline points="104,28 112,20 120,28" style="fill:none;stroke:rgb(255,0,0);stroke-width:4"></polyline>',
        down: '<line x1="112" y1="55" x2="112" y2="80" style="stroke:rgb(255,0,0);stroke-width:4" />'
            + '<polyline points="104,72, 112,80 120,72" style="fill:none;stroke:rgb(255,0,0);stroke-width:4"></polyline>'
    };

    var doors = {
        northwest: '<line x1="8" y1="17" x2="17" y2="8" style="stroke:rgb(0,0,0);stroke-width:3" />',
        north: '<line x1="43" y1="12" x2="57" y2="12" style="stroke:rgb(0,0,0);stroke-width:3" />',
        northeast: '<line x1="92" y1="17" x2="83" y2="8" style="stroke:rgb(0,0,0);stroke-width:3" />',
        east: '<line x1="88" y1="43" x2="88" y2="57" style="stroke:rgb(0,0,0);stroke-width:3" />',
        southeast: '<line x1="92" y1="83" x2="83" y2="92" style="stroke:rgb(0,0,0);stroke-width:3" />',
        south: '<line x1="43" y1="88" x2="57" y2="88" style="stroke:rgb(0,0,0);stroke-width:3" />',
        southwest: '<line x1="8" y1="83" x2="17" y2="92" style="stroke:rgb(0,0,0);stroke-width:3" />',
        west: '<line x1="12" y1="43" x2="12" y2="57" style="stroke:rgb(0,0,0);stroke-width:3" />',
        up: '<line x1="105" y1="35" x2="119" y2="35" style="stroke:rgb(0,0,0);stroke-width:3" />',
        down: '<line x1="105" y1="65" x2="119" y2="65" style="stroke:rgb(0,0,0);stroke-width:3" />'
    };

    o.dirs = {};
    o.room_name = '';
    o.room_vnum = null;
    o.room_sector = null;

    o.edit_mode = null;
    o.edit_vnum = null;

    o.update_grid = function() {
        var output='';

        var room_ex = o.dirs;

        for (var key in room_ex) {

//            for (var i=0; i < key.length; i++) {
//                console.log(key.charCodeAt(i));
//            }
            output += exits[key];

            if (room_ex[key] == 'C') {
                output += doors[key];
            }
        }
        output += '<rect x="25" y="25" width="50" height="50" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)">';

//        console.log(output);
        $('#svg_cont').html('<center><svg height="100%" width="100%">' + output + '<</svg></center>');
    };

    o.update_room_name = function() {
        var room_name = Util.strip_color_tags(o.room_name);
        if (o.room_vnum && o.room_sector) {
            room_name += ' [Room ' + o.room_vnum + ' ' + o.room_sector + ']';
        }
        $('#room_name').html(room_name);
    };

    o.update_olc_status = function() {
        if (!o.edit_mode || !o.edit_vnum) {
            return;
        }
        $('#olc_status').html(o.edit_mode + ' ' + o.edit_vnum);
    };

    o.handle_msdp_var = function(msg) {
        switch(msg.var) {
            case 'EDIT_MODE':
                o.edit_mode = msg.val;
                o.update_olc_status();
                break
            case 'EDIT_VNUM':
                o.edit_vnum = msg.val;
                o.update_olc_status();
                break;
            case 'ROOM_NAME':
                o.room_name = msg.val;
                o.update_room_name();
                break;
            case 'ROOM_VNUM':
                o.room_vnum = msg.val;
                o.update_room_name();
                break;
            case 'ROOM_SECTOR':
                o.room_sector = msg.val;
                o.update_room_name();
                break;
            case 'ROOM_EXITS':
                var val;
                if (msg.val == '') {
                    val = {};
                } else {
                    val = msg.val;
                }
                o.dirs = $.extend({}, val);
                o.update_grid();
                break;
            default:
                return;
        }

    };

    return o;
})();

Message.sub("msdp_var", MapWin.handle_msdp_var);
Message.sub('prepare_reload_layout', MapWin.prepare_reload_layout);
Message.sub('load_layout', MapWin.load_layout);