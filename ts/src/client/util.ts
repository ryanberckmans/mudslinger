var Util = new (function(){

    var o = self;

    o.replace_lt_gt = function(text) {
        return text.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    };

    o.replace_amp = function(text) {
        return text.replace(/&/g, '&amp;');
    };

    o.replace_lf = function(text) {
        // We are presumably already stripping out CRs before this
        return text.replace(/\n/g, '<br>');
    };

    o.raw_to_html = function(text) {
        return o.replace_lf(
                o.replace_lt_gt(
                 o.replace_amp(text)));
    };

    o.strip_color_tags = function(text) {
        var rtn='';
        for (var i=0; i<text.length; i++) {
            if (text[i] == '{')
            {
                if (i == text.length-1) {
                    break;
                }
                else if (text[i+1] == '{') {
                    rtn += '{';
                    i++;
                }
                else {
                    i++;
                }
            }
            else {
                rtn += text[i];
            }
        }

        return rtn;
    };

    return o;
})();