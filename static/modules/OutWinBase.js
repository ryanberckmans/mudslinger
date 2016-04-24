function OutWinBase() {
    var o = this;

    var line_count=0;
    var max_lines = 5000;
    o.set_max_lines = function(count) {
        max_lines = count;
    }

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
        // this may be called upon layout reload
        o.root_elem = elem;
        o.target_elems = [elem];
        o.target =  elem;

        // direct children of the root will be line containers, let's push the first one.
        o.push_elem($('<span>').appendTo(elem));
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

    o.handle_line = function(line) {
        // default to nothing, main output window will send it to trigger manager
    };

    var line_text = ''; // track full text of the line with no escape sequences or tags
    o.add_text = function(txt) {
//        console.log("add text");
//        console.log(txt);
//        console.log(o.target);
        line_text += txt;
        var html = Util.raw_to_html(txt);
        var span = $(document.createElement('span'));
        if (o.fg_color) {
            span.css('color', o.fg_color);
        }
        if (o.bg_color) {
            span.css('background-color', o.bg_color);
        }
        span.append(html);
        span.appendTo(o.target);

        if (txt.endsWith('\n')) {
            o.new_line();
        }

        o.scroll_bottom();
    };

    o.new_line = function() {
        o.pop_elem(); // pop the old line
        o.push_elem($('<span>').appendTo(o.target));

        o.handle_line(line_text);
        line_text = '';

        line_count += 1;
        if (line_count > max_lines) {
            o.root_elem.children(":lt(" +
                (max_lines/2) +
                ")"
            ).remove();
            line_count = (max_lines/2);
        }
    }

    o.scroll_bottom = function() {
        var elem = o.root_elem;
        elem.scrollTop(elem.prop('scrollHeight'));
    };

    return o;
};
