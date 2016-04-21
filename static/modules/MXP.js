var MXP = (function(){
    var o = this;

    var open_tag;

//    var tag_handlers = [];
//    tag_handlers.push(function(tag) {
//        var re = /^<dest comm>$/i;
//        var match = re.exec(tag);
//        if (match) {
//            open_tag = 'dest';
//            Message.pub('gag_output', {});
//            return true;
//        }
//    });
    o.handle_mxp_tag = function(msg) {

    };

    return o;
})();

Message.sub('mxp_tag', MXP.handle_mxp_tag);
