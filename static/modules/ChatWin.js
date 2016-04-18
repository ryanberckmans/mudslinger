var ChatWin = new (function() {
    var o = this;

    o.handle_chat_message = function(msg) {
        var out = ansi_up.ansi_to_html(msg.data);
        $('#win_chat').append("<span>" + out + "</span>");
    };

    return o;
})();

Message.sub('chat_message', ChatWin.handle_chat_message);
