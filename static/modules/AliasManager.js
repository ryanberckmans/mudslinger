var AliasManager = new (function(){
    var o = this;

    var aliases = [
        {
            alias: 'taco',
            cmd: 'chirp'
        }
    ];

    // return the alias if any, or return original cmd if no alias
    o.check_alias = function(cmd) {
        for (var i=0; i < aliases.length; i++) {
            if (cmd == aliases[i].alias) {
                return aliases[i].cmd;
            }
        }
        return cmd;
    };

    return o;
})();