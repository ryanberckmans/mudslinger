var MXP = new (function(){
    var o = this;

    var open_tags = [];
    var tag_handlers = [];

    tag_handlers.push(function(tag) {
        var re = /^<version>$/i;
        var match = re.exec(tag);
        if (match) {
            Message.pub('send_command', {
               data: '\x1b[1z<VERSION CLIENT=ArcWeb MXP=0.01>', // using closing line tag makes it print twice...
               no_print: true
            });
            return true;
        }
        return false;
    });

    tag_handlers.push(function(tag) {
        /* hande image tags */
        var re = /^<image\s*(\S+)\s*url="(.*)">$/i;
        var match = re.exec(tag);
        if (match) {
            /* push and pop is dirty way to do this, clean it up later */
            var elem = $('<img src="' + match[2] + match[1] + '">');
            OutputManager.push_mxp_elem(elem);
            OutputManager.pop_mxp_elem();
            return true;
        }
    });

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
            var color = OutputManager.get_fg_color();
            elem.css('border-bottom', '1px solid ' + color);
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
    tag_handlers.push(function(tag) {
        var re = /^<send/i;
        var match = re.exec(tag);
        if (match) {
            /* match with explicit href */
            var tag_re = /^<send (?:href=)?['"](.*)['"]>$/i;
            var tag_m = tag_re.exec(tag);
            if (tag_m) {
                var cmd = tag_m[1];
                var html_tag = '<a href="#" title="' + cmd + '">';
                var elem = $(html_tag);
                var color = OutputManager.get_fg_color() || elem.css('color');
                elem.css('border-bottom', '1px solid ' + color);
                elem.click(function() {
                    Message.pub('send_command', {data: tag_m[1]});
                });
                open_tags.push('send');
                OutputManager.push_mxp_elem(elem);
                return true;
            }

            /* just the tag */
            tag_re = /^<send>$/i;
            tag_m = tag_re.exec(tag);
            if (tag_m) {
                open_tags.push('send');
                var html_tag = '<a href="#">';
                var elem = $(html_tag);
                var color = OutputManager.get_fg_color() || elem.css('color');
                elem.css('border-bottom', '1px solid ' + color);
                OutputManager.push_mxp_elem(elem);
                return true;
            }
        }

        re = /^<\/send>/i;
        match = re.exec(tag);
        if (match) {
            if (open_tags[open_tags.length - 1] != 'send') {
                console.log("Got closing send tag with no opening tag.");
            } else {
                open_tags.pop();
                var elem = OutputManager.pop_mxp_elem();
                if (!elem[0].hasAttribute('title')) {
                    /* didn't have explicit href so we need to do it here */
                    var txt = elem.text();
                    elem[0].setAttribute('title', txt);
                    elem.click(function() {
                        Message.pub('send_command', {data: txt});
                    })
                }
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
