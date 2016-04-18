var Message = {

    subs: {},

    pub: function(t, data) {
        this.subs[t] = this.subs[t] || [];
//        console.log("Pub: " + t)
        for (var i=0 ; i < this.subs[t].length ; i++) {
            this.subs[t][i](data);
        }
    },

    sub: function(t, callback) {
        this.subs[t] = this.subs[t] || [];
        this.subs[t].push(callback);
//        console.log("Sub: " + t)
    }
}