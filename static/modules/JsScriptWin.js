var JsScriptWin = new (function() {
    var o = this;

    o.win = null;
    o.code_mirror = null;
    o.run_button = null;

    var handle_run_button_click = function() {
        var code_text = o.code_mirror.getValue();
        var script = JsScript(code_text);
        if (script) {script.RunScript()};
    };

    o.get_elements = function() {
        o.win = $('#win_js_script');
        o.run_button = $('#win_js_script_run_button')
    };

    o.create_window = function() {
        o.get_elements();

        o.win.jqxWindow({width: 600, height: 400});
        o.code_mirror = CodeMirror.fromTextArea(
            document.getElementById("win_js_script_code"),
            {
                mode: 'javascript',
                theme: 'neat',
                autoRefresh: true, // https://github.com/codemirror/CodeMirror/issues/3098
                matchBrackets: true,
                lineNumbers: true
            }
        );

        o.run_button.click(handle_run_button_click);

    };

    o.show = function() {
        if (!o.win) {
            o.create_window();
        }

        o.win.jqxWindow('open');
    };

    return o;
})();
