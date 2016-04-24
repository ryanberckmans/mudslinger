var OutputWin = new (function(){

    var o = new OutWinBase();

    var html;
    var curr_elem;
    var fg_color;
    var bg_color;

    o.prepare_reload_layout = function() {
        html = $("#win_output").html();
    }

    o.load_layout = function() {
        o.set_root_elem($('#win_output'));
        if (html) {
            // it's a reload
            $('#win_output').html(html);
            o.scroll_bottom();
            html = null;
            console.log('asdfasd');
        }
    }

    o.handle_send_command = function(msg) {
        //$('#win_output').append(
//        o.new_line();
        o.target.append(
            '<span style="color:yellow">'
            + Util.raw_to_html(msg.data)
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_trigger_send_command = function(msg) {
        o.target.append(
            '<span style="color:cyan">'
            + Util.raw_to_html(msg.data)
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_telnet_connect = function(msg) {
        //$('#win_output').append(
//        o.new_line();
        o.target.append(
            '<span style="color:cyan">'
            + '[[Telnet connected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_telnet_disconnect = function(msg) {
//        o.new_line();
        o.target.append(
            '<span style="color:cyan">'
            + "[[Telnet disconnected]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_line = function(line) {
        TriggerManager.handle_line(line);
    };

//    o.add_text = function(text) {
//        curr_elem = $(document.createElement('span'));
//        if (bg_color) {
//            curr_elem.css('background-color', bg_color);
//        }
//        if (fg_color) {
//            curr_elem.css('color', fg_color);
//        }
//        curr_elem.append(text);
//        $('#win_output').append(curr_elem);
//        o.scroll_bottom();
//    };

//    o.set_fg_color = function(color) {
//        fg_color = color;
//    };
//
//    o.set_bg_color = function(color) {
//        bg_color = color;
//    };

//    o.handle_output_data = function(msg) {
//        if (gag_output) {
//            return;
//        }
//        var rx = msg.data;
//
//        $("#win_output").append(Util.raw_to_html(rx));
////        outlen += rx.length;
////
////        if (outlen >= 1000000) {
////            //$("#win_output").children(":lt(1000)").remove();
////            //console.log("outlen: " + outlen);
////            $("#win_output *").slice(0, 10000).remove();
////            outlen = $("#win_output").html().length;
////            //console.log("trimmmed");
////            //console.log("new outlen: " + outlen);
////        }
//
//        o.scroll_bottom();
//    };
//
//    o.handle_output_html = function(msg) {
//        if (gag_output) {
//            return;
//        }
//        $('#win_output').append(msg.data);
//    };

    return o;
})();

Message.sub('prepare_reload_layout', OutputWin.prepare_reload_layout);
Message.sub('load_layout', OutputWin.load_layout);
Message.sub('telnet_connect', OutputWin.handle_telnet_connect);
Message.sub('telnet_disconnect', OutputWin.handle_telnet_disconnect);
Message.sub('send_command', OutputWin.handle_send_command);
Message.sub('trigger_send_command', OutputWin.handle_trigger_send_command);
