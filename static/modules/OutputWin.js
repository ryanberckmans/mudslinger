var OutputWin = new (function(){

    var o = this;

    var replace_lt_gt = function(text) {
        var rtn = text.replace(/</g, '&lt');
        rtn = rtn.replace(/>/g, '&gt');
        return rtn;
    }

    var html;

    o.prepare_reload_layout = function() {
        html = $("#win_output").html();
    }

    o.load_layout = function() {
        if (html) {
            // it's a reload
            $('#win_output').html(html);
            o.scroll_bottom();
            html = null;
        }
    }

    o.scroll_bottom = function() {
        $("#win_output").scrollTop($("#win_output").prop("scrollHeight"));
    };

    o.handle_send_command = function(msg) {
        $('#win_output').append(
            '<span style="color:yellow">'
            + replace_lt_gt(msg.data)
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_telnet_connect = function(msg) {
        $('#win_output').append(
            '<span style="color:cyan">'
            + '[[Telnet connected]]'
            + "<br>"
            + '</span>');
        o.scroll_bottom();
    };

    o.handle_telnet_disconnect = function(msg) {
        $('#win_output').append(
            '<span style="color:cyan">'
            + "[[Telnet disconnected]]"
            + "<br>"
            + "</span>");
        o.scroll_bottom();
    };

    o.handle_output_data = function(msg) {
        var rx = msg.data;

//        var new_rx='';
//        for (var i=0; i<rx.length; i++)
//        {
//            if ( rx[i] == '<' )
//            {
//                if ( i >= 4 ) {
//                    if ( rx.slice(i-4,i) == "\x1b\[1z" ) {
//                        new_rx += rx[i];
//                        continue;
//                    }
//                }
//                new_rx += '&lt';
//            }
//            else if ( rx[i] == '>' )
//            {
//                if ( (i+4) < rx.length ) {
//                    if ( rx.slice(i+1,i+5) == "\x1b\[7z" ) {
//                        new_rx += rx[i];
//                        continue;
//                    }
//                }
//                new_rx += '&gt';
//            }
//            else
//            {
//                new_rx += rx[i];
//            }
//        }
//        rx = new_rx

//        /* DEST tag */
//        var commRe = /\x1b\[1z<DEST Comm>\x1b\[7z([^<]*)\x1b\[1z<\/DEST>/g;
//        var m;
//        while ((m = commRe.exec(rx)) !== null) {
//            Message.pub('chat_message', {data: m[1]});
////            chat_buffer += m[1];
////            var chat_buffer_raw = chat_buffer.replace(/\n\r/g, "<br>");
////            var chat_html = ansi_up.ansi_to_html(chat_buffer_raw);
////            $('#win_chat').html(chat_html);
////            $('#win_chat').scrollTop($('#win_chat').prop("scrollHeight"));
//        }
//        rx = rx.replace(commRe, '');
        rx = replace_lt_gt(rx);
        rx = rx.replace(/\n\r/g, "<br>");
        rx = ansi_up.ansi_to_html(rx);
        rx = "<span>" + rx + "</span>";
        $("#win_output").append(rx);
//        outlen += rx.length;
//
//        if (outlen >= 1000000) {
//            //$("#win_output").children(":lt(1000)").remove();
//            //console.log("outlen: " + outlen);
//            $("#win_output *").slice(0, 10000).remove();
//            outlen = $("#win_output").html().length;
//            //console.log("trimmmed");
//            //console.log("new outlen: " + outlen);
//        }

        o.scroll_bottom();
    };

    return o;
})();

Message.sub('prepare_reload_layout', OutputWin.prepare_reload_layout);
Message.sub('load_layout', OutputWin.load_layout);
Message.sub('output_data', OutputWin.handle_output_data);
Message.sub('telnet_connect', OutputWin.handle_telnet_connect);
Message.sub('telnet_disconnect', OutputWin.handle_telnet_disconnect);
Message.sub('send_command', OutputWin.handle_send_command);
