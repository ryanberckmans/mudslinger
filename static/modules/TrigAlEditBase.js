var TrigAlEditBase = function() {
    var o = this;

    o.win = null;

    /* these need to be set it get_elements*/
    o.list_box = null;
    o.pattern = null;
    o.regex_checkbox = null;
    o.text_area = null;
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
        o.text_area.prop('disabled', state);
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
        o.save_item(
            ind,
            o.pattern.val(),
            o.text_area.val(),
            o.regex_checkbox.is(':checked')
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
    };

    var handle_delete_button_click = function() {
        var ind = o.list_box.prop('selectedIndex');

        o.delete_item(ind);

        o.clear_editor();
        o.select_none();
        o.set_editor_disabled(true);
        o.update_list_box();
    };

    var handle_list_box_change = function() {
        var ind = o.list_box.prop('selectedIndex');
        var item = o.get_item(ind);

        if (!item) {
            return;
        }

        o.set_editor_disabled(false);
        o.pattern.val(item.pattern);
        o.text_area.val(item.value);
        o.regex_checkbox.prop('checked', item.regex);
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

        o.list_box.change(handle_list_box_change);
        o.new_button.click(handle_new_button_click);
        o.delete_button.click(handle_delete_button_click);
        o.save_button.click(handle_save_button_click);
        o.cancel_button.click(handle_cancel_button_click);
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