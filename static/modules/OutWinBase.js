function OutWinBase() {
    var o = this;

    o.fg_color = null
    o.bg_color = null

    o.set_fg_color = function(color) {
        o.fg_color = color;
    };

    o.set_bg_color = function(color) {
        o.bg_color = color;
    };

    // handling nested elements, always output to last one
    o.target_elems = null;
    o.target = null;
    o.root_elem = null;

    // must set root elem before actually using it
    o.set_root_elem = function(elem) {
        o.root_elem = elem;
        o.target_elems = [elem];
        o.target = elem;
    };

    // elem is the actual jquery element
    o.push_elem = function(elem) {
//        console.log(o);
//        console.log("elem pushed");
//        console.log(elem);
        o.target.append(elem);
        o.target_elems.push(elem);
        o.target = elem;
    };

    o.pop_elem = function() {
        var popped = o.target_elems.pop();
//        console.log(o);
//        console.log("elem popped");
//        console.log(popped);
        o.target = o.target_elems[o.target_elems.length-1];
    };

    o.add_text = function(txt) {
//        console.log("add text");
//        console.log(txt);
//        console.log(o.target);
        var span = $(document.createElement('span'));
        if (o.fg_color) {
            span.css('color', o.fg_color);
        }
        if (o.bg_color) {
            span.css('background-color', o.bg_color);
        }
        span.append(txt);
        span.appendTo(o.target);
//        o.target.append(span);
        o.scroll_bottom();
    };

    o.scroll_bottom = function() {
        var elem = o.root_elem;
        elem.scrollTop(elem.prop('scrollHeight'));
    };

    return o;
};
