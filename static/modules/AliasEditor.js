var AliasEditor = new (function() {
    var o = new TrigAlEditBase();

    o.default_value =
         "Put the alias value here.\n"
        +"This can be 1 or more commands, including match parameters (e.g. $1).\n\n"
        +"For non-regex aliases, use $1 in the value to represent the full argument to the command.\n"
        +"Example: Alias pattern 'blah', alias value 'say $1', "
        +"then issue 'blah asadf dfdfa' and 'say asadf dfdfa' will be sent.\n\n"
        +"For regex aliases, use ${groupnum} to represent the matches from your regex pattern.\n"
        +"Example: Alias pattern 'blah (\\w+)', alias value 'say $1', "
        +"then issue 'blah asadf' and 'say asadf' will be sent.";

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
        +"For regex aliases, 'match' will be the javascript match array, with \n"
        +"indices according to match groups.\n";

    o.get_elements = function() {
        o.win = $('#win_alias_edit');
        o.list_box = $('#alias_list_box');
        o.pattern = $('#alias_pattern');
        o.regex_checkbox = $('#alias_regex_checkbox');
        o.script_checkbox = $('#alias_script_checkbox');
        o.text_area = $('#alias_text_area');
        o.script_area = $('#alias_script_area');
        o.new_button = $('#alias_new_button');
        o.delete_button = $('#alias_delete_button');
        o.save_button = $('#alias_save_button');
        o.cancel_button = $('#alias_cancel_button');
        o.main_split = $('#alias_main_split');
    };

    o.get_list = function() {
        var aliases = AliasManager.aliases;
        var lst = [];
        for (var i=0; i < aliases.length; i++) {
            lst.push(aliases[i].pattern);
        }

        return lst;
    };

    o.get_item = function(ind) {
        var aliases = AliasManager.aliases;
        if (ind < 0 || ind >= aliases.length) {
            return null;
        } else {
            return aliases[ind];
        }
    };

    o.save_item = function(ind, pattern, value, regex, is_script) {
        var alias = {
            pattern: pattern,
            value: value,
            regex: regex,
            is_script: is_script
        }
        if (ind < 0) {
            // New alias
            AliasManager.aliases.push(alias);
        } else {
            // Update alias
            AliasManager.aliases[ind] = alias;
        }
        AliasManager.save_aliases();
    };

    o.delete_item = function(ind) {
        AliasManager.aliases.splice(ind, 1);
        AliasManager.save_aliases();
    };

    return o;
})();