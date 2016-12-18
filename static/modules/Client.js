var Client = new (function() {
    var o = this;

    var html_base;

    o.load_layout = function() {
        // If it's the first load, grab the base html so we can
        // use it for reloads
        if (!html_base) {
            html_base = $('#client').html();
//            console.log(html_base);
        } else {
            // it's a reload
            $('#client').html(html_base);
        };

        // do the high level layout
        $('#main_vert_split').jqxSplitter({
            width: '100%',
            height: '100%',
            orientation: 'vertical',
            panels: [{size:'75%'},{size:'25%'}]
        });

        // let the other guys do their thing
        Message.pub("load_layout", null);
    };

    o.reload_layout = function() {
        // Let the other guys prepare
        Message.pub("prepare_reload_layout", {});
        o.load_layout();
    }

    return o;
})();


$(document).ready(function() {
    Socket.open();
    Socket.open_telnet();

//    $(window).resize(Client.reload_layout);
    Client.load_layout();
});