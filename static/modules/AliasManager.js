var AliasManager = new (function(){
    var o = this;

    var enabled = true;
    o._get_enabled = function() {return enabled;};

    o.aliases = null;

    o.save_aliases = function() {
        localStorage.setItem('aliases', JSON.stringify(o.aliases));
    };

    o.handle_set_aliases_enabled = function(value) {
        enabled = value;
    };

    // return the result of the alias if any (string with embedded lines)
    // return true if matched and script ran
    // return null if no match
    o.check_alias = function(cmd) {
        if (!enabled) return;

        for (var i=0; i < o.aliases.length; i++) {
            var alias = o.aliases[i];

            if (alias.regex) {
                var re = alias.pattern;
                var match = cmd.match(re);
                if (!match) {
                    continue;
                }

                if (alias.is_script) {
                    var script = new JsScript(alias.value);
                    if (script) {script.RunScript(match)};
                    return true;
                } else {
                    var value = alias.value;

                    value = value.replace(/\$(\d+)/g, function(m, d) {
                        return match[parseInt(d)] || '';
                    });
                    return value;
                }
            } else {
                var re = '^' + alias.pattern + '\\s*(.*)$';
                var match = cmd.match(re);
                if (!match) {
                    continue;
                }

                if (alias.is_script) {
                    var script = new JsScript(alias.value);
                    if (script) {script.RunScript(null)};
                    return true;
                } else {
                    var value = alias.value;

                    var value = alias.value.replace("$1", match[1] || '');
                    return value;
                }
            }
        }
        return null;
    };

    return o;
})();

$(document).ready(function() {
    var saved_aliases = localStorage.getItem("aliases");
    if (!saved_aliases) {
        AliasManager.aliases = [];
    } else {
        AliasManager.aliases = JSON.parse(saved_aliases);
    }
});

Message.sub('set_aliases_enabled', AliasManager.handle_set_aliases_enabled);