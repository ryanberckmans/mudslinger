var MXP = new (function(){
    var o = this;

    var open_tags = [];
    var tag_handlers = [];

    tag_handlers.push(function(tag) {
        /* handle dest tags */
        var re = /^<dest comm>$/i;
        var match = re.exec(tag);
        if (match) {
            open_tags.push('dest');
            OutputManager.push_target(ChatWin);
            return true;
        }

        re = /^<\/dest>$/i;
        match = re.exec(tag);
        if (match) {
            if (open_tags[open_tags.length - 1] != 'dest') {
                /* We actually expect this to happen because the mud sends newlines inside DEST tags right now... */
                //console.log("Got closing dest tag with no opening tag.");
            } else {
                open_tags.pop();
                OutputManager.pop_target();
            }
            return true;
        }
    });
    tag_handlers.push(function(tag) {
        var re = /^<a /i;
        var match = re.exec(tag);
        if (match) {
            open_tags.push('a');
            var elem = $(tag);
            elem.attr('target', '_blank');
            OutputManager.push_mxp_elem(elem);
            return true;
        }

        re = /^<\/a>/i;
        match = re.exec(tag);
        if (match) {
            if (open_tags[open_tags.length - 1] != 'a') {
                /* We actually expect this to happen because the mud sends newlines inside DEST tags right now... */
                console.log("Got closing a tag with no opening tag.");
            } else {
                open_tags.pop();
                OutputManager.pop_mxp_elem();
            }
            return true;
        }
    });
    tag_handlers.push(function(tag) {
        var re = /^<([bius])>/i;
        var match = re.exec(tag);
        if (match) {
            open_tags.push(match[1]);
            var elem = $(tag);
            OutputManager.push_mxp_elem(elem);
            return true;
        }

        re = /^<\/([bius])>/i;
        match = re.exec(tag);
        if (match) {
            if (open_tags[open_tags.length - 1] != match[1]) {
                console.log("Got closing " + match[1] + " tag with no opening tag.");
            } else {
                open_tags.pop();
                OutputManager.pop_mxp_elem();
            }
            return true;
        }
    });

    o.handle_mxp_tag = function(msg) {
        var handled = false;
        for (var i=0; i < tag_handlers.length; i++) {
            /* tag handlers will return true if it's a match */
            if (tag_handlers[i](msg.data)) {
                handled = true;
                break;
            }
        }

        if (!handled) {
            console.log("Unsupported MXP tag: " + msg.data);
        }
    };

    // Need to close any remaining open tags whe we get newlines
    o.handle_newline = function() {
        if (open_tags.length<1) {
            return;
        }

        for (var i=open_tags.length-1; i >= 0; i--) {
            if (open_tags[i] == 'dest') {
                OutputManager.pop_target();
            } else {
                OutputManager.pop_mxp_elem();
            }
        }
        open_tags = [];
    };

    return o;
})();

Message.sub('mxp_tag', MXP.handle_mxp_tag);
