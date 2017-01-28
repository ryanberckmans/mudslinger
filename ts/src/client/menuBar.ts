var MenuBar = new (function() {
    var o = this;

    o.prepare_reload_layout = function() {
        // nada
    };

    o.load_layout = function() {
        $('#menu_bar').jqxMenu({ width: '100%', height: '4%'});
        $('#menu_bar').on('itemclick', o.handle_click);

        $('#chk_enable_trig').change(function() {
            Message.pub('set_triggers_enabled', this.checked);
        });

        $('#chk_enable_alias').change(function() {
            Message.pub('set_aliases_enabled', this.checked);
        });
    };

    var click_funcs = {};
    click_funcs['Reload Layout'] = function() {
        console.log("OMG reload");
        Client.reload_layout();
    };

    click_funcs['Connect'] = function() {
        Socket.open_telnet();
    };

    click_funcs['Disconnect'] = function() {
        Socket.close_telnet();
    };

    click_funcs['Aliases'] = function() {
        AliasEditor.show();
    };

    click_funcs['Triggers'] = function() {
        TriggerEditor.show();
    };

    click_funcs['Test socket response'] = function() {
        Socket.test_socket_response();
    };

    click_funcs['Green'] = function() {
        Message.pub('change_default_color', 'green');
    };

    click_funcs['White'] = function() {
        Message.pub('change_default_color', 'white');
    };

    click_funcs['Script'] = function() {
        JsScriptWin.show();
    };

    o.handle_click = function(event) {
        var item = event.args;
        var text = $(item).text();
        if (text in click_funcs) {
            click_funcs[text]();
        }
    };

    return o;
})();

Message.sub('prepare_reload_layout', MenuBar.prepare_reload_layout);
Message.sub('load_layout', MenuBar.load_layout);