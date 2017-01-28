var TrigAlEditBase = function() {
    var o = this;

    o.win = null;

    /* these need to be set it get_elements*/
    o.list_box = null;
    o.pattern = null;
    o.regex_checkbox = null;
    o.script_checkbox = null;
    o.text_area = null;
    o.script_area = null;
    o.code_mirror = null;
    o.code_mirror_wrapper = null;
    o.new_button = null;
    o.delete_button = null;
    o.main_split = null;

    /* these need to be overridden */
    o.get_elements = null;
    o.get_list = null;
    o.get_item = null;
    o.save_item = null;
    o.delete_item = null;

    o.set_editor_disabled = function(state) {
        o.pattern.prop('disabled', state);
        o.regex_checkbox.prop('disabled', state);
        o.script_checkbox.prop('disabled', state);
        o.text_area.prop('disabled', state);
        o.code_mirror_wrapper.prop('disabled', state);
        o.save_button.prop('disabled', state);
        o.cancel_button.prop('disabled', state);
    };

    o.select_none = function() {
        o.list_box.prop('selectedItem', 0);
        o.list_box.val([]);
    };

    o.clear_editor = function() {
        o.pattern.val('');
        o.text_area.val('');
        o.regex_checkbox.prop('checked', false);
        o.script_checkbox.prop('checked', false);
    };

    o.update_list_box = function() {
        var lst = o.get_list();
        var html = '';
        for (var i=0; i < lst.length; i++) {
            html += '<option>' + Util.raw_to_html(lst[i]) + '</option>';
        }
        o.list_box.html(html);
    };

    var handle_save_button_click = function() {
        var ind = o.list_box.prop('selectedIndex');
        var is_script = o.script_checkbox.is(':checked');

        o.save_item(
            ind,
            o.pattern.val(),
            is_script ? o.code_mirror.getValue() : o.text_area.val(),
            o.regex_checkbox.is(':checked'),
            is_script
        );

        o.select_none();
        o.clear_editor();
        o.set_editor_disabled(true);
        o.update_list_box();
    };

    var handle_cancel_button_click = function() {
        o.clear_editor();
        o.select_none();
        o.set_editor_disabled(true);
    };

    var handle_new_button_click = function() {
        o.set_editor_disabled(false);
        o.select_none();
        o.pattern.val(o.default_pattern || "INPUT PATTERN HERE");
        o.text_area.val(o.default_value || "INPUT VALUE HERE");
        o.code_mirror.setValue(o.default_script || "// INPUT SCRIPT HERE");
    };

    var handle_delete_button_click = function() {
        var ind = o.list_box.prop('selectedIndex');

        o.delete_item(ind);

        o.clear_editor();
        o.select_none();
        o.set_editor_disabled(true);
        o.update_list_box();
    };

    var show_script_input = function() {
        o.text_area.hide();
        o.code_mirror_wrapper.show();
        o.code_mirror.refresh();
    };

    var show_text_input = function() {
        o.code_mirror_wrapper.hide();
        o.text_area.show();
    };

    var handle_list_box_change = function() {
        var ind = o.list_box.prop('selectedIndex');
        var item = o.get_item(ind);

        if (!item) {
            return;
        }
        o.set_editor_disabled(false);
        o.pattern.val(item.pattern);
        if (item.is_script) {
            show_script_input();
            o.code_mirror.setValue(item.value);
            o.text_area.val('');
        } else {
            show_text_input();
            o.text_area.val(item.value);
            o.code_mirror.setValue('');
        }
        o.regex_checkbox.prop('checked', item.regex ? true : false);
        o.script_checkbox.prop('checked', item.is_script ? true : false);
    };

    var handle_script_checkbox_change = function() {
        var checked = o.script_checkbox.prop('checked');
        if (checked) {
            show_script_input();
        } else {
            show_text_input();
        }
    };

    o.create_window = function() {
        o.get_elements();

        o.win.jqxWindow({width: 600, height: 400});

        o.main_split.jqxSplitter({
            width: '100%',
            height: '100%',
            orientation: 'vertical',
            panels: [{size:'25%'},{size:'75%'}]
        });

        o.code_mirror = CodeMirror.fromTextArea(
            o.script_area[0], {
                mode: 'javascript',
                theme: 'neat',
                autoRefresh: true, // https://github.com/codemirror/CodeMirror/issues/3098
                matchBrackets: true,
                lineNumbers: true
            }
        );
        o.code_mirror_wrapper = $(o.code_mirror.getWrapperElement());
        o.code_mirror_wrapper.height('100%');
        o.code_mirror_wrapper.hide();

        o.list_box.change(handle_list_box_change);
        o.new_button.click(handle_new_button_click);
        o.delete_button.click(handle_delete_button_click);
        o.save_button.click(handle_save_button_click);
        o.cancel_button.click(handle_cancel_button_click);
        o.script_checkbox.change(handle_script_checkbox_change);
    };

    o.show = function() {
        if (!o.win) {
            o.create_window();
        }

        o.update_list_box();

        o.win.jqxWindow('open');
    };

    return o;
};