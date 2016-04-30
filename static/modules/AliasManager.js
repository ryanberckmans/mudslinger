var AliasManager = new (function(){
    var o = this;

    o.aliases = null;

    o.save_aliases = function() {
        localStorage.setItem('aliases', JSON.stringify(o.aliases));
    };

    // return the alias if any, or return original cmd if no alias
    o.check_alias = function(cmd) {
        for (var i=0; i < o.aliases.length; i++) {
            if (cmd == o.aliases[i].pattern) {
                return o.aliases[i].value;
            }
        }
        return null;
    };

    return o;
})();

$(document).ready(function() {
    var saved_aliases = localStorage.getItem("aliases");
    console.log(saved_aliases);
    console.log(typeof(saved_aliases));
    if (!saved_aliases) {
        AliasManager.aliases = [];
    } else {
        AliasManager.aliases = JSON.parse(saved_aliases);
    }
});