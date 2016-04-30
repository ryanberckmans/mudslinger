var TriggerEditor = new (function() {
    var o = this;

    var win;
    var trig_list_box;
    var trig_pattern;
    var trig_regex_checkbox;
    var trig_text_area;
    var trig_new_button;
    var trig_delete_button;

    var set_editor_disabled = function(state) {
        trig_pattern.prop('disabled', state);
        trig_regex_checkbox.prop('disabled', state);
        trig_text_area.prop('disabled', state);
        trig_save_button.prop('disabled', state);
        trig_cancel_button.prop('disabled', state);
    };

    var select_none = function() {
        trig_list_box.prop('selectedItem', 0);
        trig_list_box.val([]);
    };

    var clear_editor = function() {
        trig_pattern.val('');
        trig_text_area.val('');
        trig_regex_checkbox.prop('checked', false);
    };

    var update_list_box = function() {
//        trig_list_box.empty();
        var triggers = TriggerManager.triggers;
        var html = '';
        for (var i=0; i < triggers.length; i++) {
            html += '<option>' + Util.raw_to_html(triggers[i].pattern) + '</option>';
        }
        trig_list_box.html(html);
    };

    var handle_save_button_click = function() {
        console.log("taco");
        var triggers = TriggerManager.triggers;
        var ind = trig_list_box.prop('selectedIndex');

        var trigg = {
                pattern: trig_pattern.val(),
                value: trig_text_area.val(),
                regex: trig_regex_checkbox.is(':checked')
        };

        if (ind < 0 || ind >= triggers.length) {
            console.log('Adding trigg');
            triggers.push(trigg);
        } else {
            console.log("Updating trigg");
            triggers[ind] = trigg;
        }

        select_none();
        clear_editor();
        set_editor_disabled(true);
        update_list_box();
        TriggerManager.save_triggers();
    };

    var handle_cancel_button_click = function() {
        clear_editor();
        select_none();
        set_editor_disabled(true);
    };

    var handle_new_button_click = function() {
        set_editor_disabled(false);
        select_none();
        trig_pattern.val("INPUT PATTERN HERE");
        trig_text_area.val("INPUT VALUE HERE");
    };

    var handle_delete_button_click = function() {
        var ind = trig_list_box.prop('selectedIndex');
        var triggers = TriggerManager.triggers;
        if (ind < 0 || ind >= triggers.length) {
            return;
        }

        var c = confirm('Delete trigger?');
        if (!c) {
            return;
        }

        triggers.splice(ind, 1);

        clear_editor();
        select_none();
        set_editor_disabled(true);
        update_list_box();
        TriggerManager.save_triggers();
    };

    var handle_list_box_change = function() {
        var ind = trig_list_box.prop('selectedIndex');
        var triggers = TriggerManager.triggers;
        if (ind < 0 || ind >= triggers.length) {
            return;
        }

        var trig = triggers[ind];
        set_editor_disabled(false);
        trig_pattern.val(trig.pattern);
        trig_text_area.val(trig.value);
        trig_regex_checkbox.prop('checked', trig.regex);
    };

    var create_window = function() {
        win = $('#win_trig_edit');
        trig_list_box = $('#trig_list_box');
        trig_pattern = $('#trig_pattern');
        trig_regex_checkbox = $('#trig_regex_checkbox');
        trig_text_area = $('#trig_text_area');
        trig_new_button = $('#trig_new_button');
        trig_delete_button = $('#trig_delete_button');
        trig_save_button = $('#trig_save_button');
        trig_cancel_button = $('#trig_cancel_button');

        win.jqxWindow({width: 600, height: 400});

        $('#trig_main_split').jqxSplitter({
            width: '100%',
            height: '100%',
            orientation: 'vertical',
            panels: [{size:'25%'},{size:'75%'}]
        });

        trig_list_box.change(handle_list_box_change);
        trig_new_button.click(handle_new_button_click);
        trig_delete_button.click(handle_delete_button_click);
        trig_save_button.click(handle_save_button_click);
        trig_cancel_button.click(handle_cancel_button_click);
    };

    o.show = function() {
        if (!win) {
            create_window();
        }

        update_list_box();

        win.jqxWindow('open');
    };

    return o;
})();