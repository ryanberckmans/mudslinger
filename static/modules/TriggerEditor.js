var TriggerEditor = new (function() {
    var o = this;

    var win;
    var trig_list_box;
    var trig_pattern;
    var trig_regex_checkbox;
    var trig_text_area;

//    var header;
//    var content;
//    var regex_checkbox;

    var create_window = function() {
        win = $('#win_trig_edit');
        trig_list_box = $('#trig_list_box');
        trig_pattern = $('#trig_pattern');
        trig_regex_checkbox = $('#trig_regex_checkbox');
        trig_text_area = $('#trig_text_area');

        win.jqxWindow({width: 600, height: 400});
//        trig_text_area.jqxTextArea({placeHolder: 'A taco'});
//        trig_regex_checkbox.jqxCheckBox();
//        $('#trig_buttons').jqxButtonGroup({mode: 'default'});

        $('#trig_main_split').jqxSplitter({
            width: '100%',
            height: '100%',
            orientation: 'vertical',
            panels: [{size:'25%'},{size:'75%'}]
        });


    };

    var load_triggers = function() {
    };

    o.show = function() {
        if (!win) {
            create_window();
        }

        load_triggers();

        win.jqxWindow('open');
    };

    return o;
})();