var Message = new (function() {
    var o = this;

    var subs = {};

    o.pub = function(t, data) {
        subs[t] = subs[t] || [];
        for (var i=0 ; i < subs[t].length ; i++) {
            subs[t][i](data);
        }
    };

    o.sub = function(t, callback) {
        subs[t] = subs[t] || [];
        subs[t].push(callback);
    };
})();