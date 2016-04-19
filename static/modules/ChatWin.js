var ChatWin = new (function() {
    var o = this;

    var html;

    o.prepare_reload_layout = function () {
        html = $('#win_chat').html();
    };

    o.load_layout = function () {
        if (html) {
            $('#win_chat').html(html);
            html = null;
        }
    };

    o.handle_chat_message = function(msg) {
        var out = ansi_up.ansi_to_html(msg.data);
        $('#win_chat').append("<span>" + out + "</span>");
    };

    return o;
})();

Message.sub('chat_message', ChatWin.handle_chat_message);
Message.sub('prepare_reload_layout', ChatWin.prepare_reload_layout);
Message.sub('load_layout', ChatWin.load_layout);
