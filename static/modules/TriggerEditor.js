var TriggerEditor = new (function() {
    var o = new TrigAlEditBase();

    o.get_elements = function() {
        o.win = $('#win_trig_edit');
        o.list_box = $('#trig_list_box');
        o.pattern = $('#trig_pattern');
        o.regex_checkbox = $('#trig_regex_checkbox');
        o.text_area = $('#trig_text_area');
        o.new_button = $('#trig_new_button');
        o.delete_button = $('#trig_delete_button');
        o.save_button = $('#trig_save_button');
        o.cancel_button = $('#trig_cancel_button');
        o.main_split = $('#trig_main_split');
    };

    o.get_list = function() {
        var triggers = TriggerManager.triggers;
        var lst = [];
        for (var i=0; i < triggers.length; i++) {
            lst.push(triggers[i].pattern);
        }

        return lst;
    };

    o.get_item = function(ind) {
        var triggers = TriggerManager.triggers;
        if (ind < 0 || ind >= triggers.length) {
            return null;
        } else {
            return triggers[ind];
        }
    };

    o.save_item = function(ind, pattern, value, regex) {
        var trig = {
            pattern: pattern,
            value: value,
            regex: regex
        }
        if (ind < 0) {
            // New trigger
            TriggerManager.triggers.push(trig);
        } else {
            // Update trigger
            TriggerManager.triggers[ind] = trig;
        }
        TriggerManager.save_triggers();
    };

    o.delete_item = function(ind) {
        TriggerManager.triggers.splice(ind, 1);
        TriggerManager.save_triggers();
    };

    return o;
})();