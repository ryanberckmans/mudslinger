var Util = new (function(){

    this.strip_color_tags = function(text) {
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

    return this;
});