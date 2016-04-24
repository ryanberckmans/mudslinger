var ChatWin = new (function() {
    var o = new OutWinBase();

    var html;

    o.prepare_reload_layout = function () {
        html = $('#win_chat').html();
    };

    o.load_layout = function () {
        o.set_root_elem($('#win_chat'));
        if (html) {
            $('#win_chat').html(html);
            html = null;
        }
    };

    return o;
})();

Message.sub('prepare_reload_layout', ChatWin.prepare_reload_layout);
Message.sub('load_layout', ChatWin.load_layout);
