var AliasEditor = new (function() {
    var o = new TrigAlEditBase();

    o.get_elements = function() {
        o.win = $('#win_alias_edit');
        o.list_box = $('#alias_list_box');
        o.pattern = $('#alias_pattern');
        o.regex_checkbox = $('#alias_regex_checkbox');
        o.text_area = $('#alias_text_area');
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

    o.save_item = function(ind, pattern, value, regex) {
        var alias = {
            pattern: pattern,
            value: value,
            regex: regex
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