var TriggerEditor = new (function() {
    var o = new TrigAlEditBase();

    o.default_value =
         "Put the trigger value here.\n"
        +"This can be 1 or more commands, including match parameters (e.g. $1) for regex triggers.\n\n"
        +"For regex triggers, use ${groupnum} to represent the matches from your regex pattern.\n"
        +"Example: Trigger pattern '(\\w+) has arrived.', trigger value 'say Hi $1', "
        +"then if 'Vodur has arrived' comes through, 'say hi Vodur' will be sent.";

    o.default_script =
         "/* Put the script here.\n"
        +"This is javascript code that will run when the trigger fires.\n"
        +"You are prevented from creating global variables.\n"
        +"Use 'var' keyword to create local variables.\n"
        +"Add values to the 'this' object to share persistent data between scripts.\n"
        +"Example: this.my_val = 123;\n"
        +"Every script that runs has the same 'this' object.\n"
        +"\n"
        +"Use the send() function to send commands to the mud. Example: send('kill orc');\n"
        +"For regex triggers, 'match' will be the javascript match array, with \n"
        +"indices according to match groups.\n";

    o.get_elements = function() {
        o.win = $('#win_trig_edit');
        o.list_box = $('#trig_list_box');
        o.pattern = $('#trig_pattern');
        o.regex_checkbox = $('#trig_regex_checkbox');
        o.script_checkbox = $('#trig_script_checkbox');
        o.text_area = $('#trig_text_area');
        o.script_area = $('#trig_script_area');
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

    o.save_item = function(ind, pattern, value, regex, is_script) {
        var trig = {
            pattern: pattern,
            value: value,
            regex: regex,
            is_script: is_script
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