var AliasManager = new (function(){
    var o = this;

    o.aliases = null;

    o.save_aliases = function() {
        localStorage.setItem('aliases', JSON.stringify(o.aliases));
    };

    // return the result of the alias if any (string with embedded lines) or null if not
    o.check_alias = function(cmd) {
        for (var i=0; i < o.aliases.length; i++) {
            var alias = o.aliases[i];

            if (alias.regex) {
                var re = alias.pattern;
                var match = cmd.match(re);
                if (!match) {
                    continue;
                }

                var value = alias.value;

                value = value.replace(/\$(\d+)/g, function(m, d) {
                    return match[parseInt(d)] || '';
                });
                return value;
            } else {
                var re = '^' + alias.pattern + '\\s*(.*)$';
                var match = cmd.match(re);
                if (!match) {
                    continue;
                }

                var value = alias.value;

                var value = alias.value.replace("$1", match[1] || '');
                return value;
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