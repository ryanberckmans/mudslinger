function OutWinBase() {
    var o = this;

    var line_count=0;
    var max_lines = 5000;
    o.set_max_lines = function(count) {
        max_lines = count;
    }

    o.fg_color = null;
    o.bg_color = null;

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

    var scroll_lock = false; // true when we should not scroll to bottom
    var handle_scroll = function(e) {
        var scrollHeight = o.root_elem.prop('scrollHeight');
        var scrollTop = o.root_elem.scrollTop();
        var outerHeight = o.root_elem.outerHeight();
        var is_at_bottom = outerHeight + scrollTop >= scrollHeight;

        console.log("Bottom:" + is_at_bottom);
        console.log(scrollHeight);
        console.log(scrollTop);
        console.log(outerHeight);

        scroll_lock = !is_at_bottom;
    };

    // must set root elem before actually using it
    o.set_root_elem = function(elem) {
        // this may be called upon layout reload
        o.root_elem = elem;
        o.target_elems = [elem];
        o.target =  elem;

        // direct children of the root will be line containers, let's push the first one.
        o.push_elem($('<span>').appendTo(elem));

        o.root_elem.bind('scroll', handle_scroll);
    };

    // elem is the actual jquery element
    o.push_elem = function(elem) {
//        console.log(o);
//        console.log("elem pushed");
//        console.log(elem);
        o.write_buffer();

        o.target.append(elem);
        o.target_elems.push(elem);
        o.target = elem;
    };

    o.pop_elem = function() {
        o.write_buffer();

        var popped = o.target_elems.pop();
//        console.log(o);
//        console.log("elem popped");
//        console.log(popped);
        o.target = o.target_elems[o.target_elems.length-1];
        return popped;
    };

    o.handle_line = function(line) {
        // default to nothing, main output window will send it to trigger manager
    };

    var append_buffer = '';
    var line_text = ''; // track full text of the line with no escape sequences or tags
    o.add_text = function(txt) {
//        console.log("add text");
//        console.log(txt);
//        console.log(o.target);
        line_text += txt;
        var html = Util.raw_to_html(txt);
//        var span = $(document.createElement('span'));
        var span_text = '<span'
        var style = ''
        if (o.fg_color || o.bg_color) {
            style = ' style="'
            if (o.fg_color) {
                style += 'color:' + o.fg_color + ';';
            }
            if (o.bg_color) {
                style += 'background-color:' + o.bg_color + ';';
            }
            style += '"';
        }
        span_text += style + '>';
        span_text += html;
        span_text += '</span>';
        append_buffer += span_text;

        if (txt.endsWith('\n')) {
            o.target.append(append_buffer);
            append_buffer = '';
            o.new_line();
        }
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

    o.write_buffer = function() {
        o.target.append(append_buffer);
        append_buffer = '';
    };

    o.output_done = function() {
        o.write_buffer();
        o.scroll_bottom();
    };

    var scroll_requested = false;
    var _scroll_bottom = function() {
        console.time("_scroll_bottom");
        var elem = o.root_elem;
        elem.scrollTop(elem.prop('scrollHeight'));
        scroll_requested = false;
        console.timeEnd("_scroll_bottom");
    };

    o.scroll_bottom = function(force) {
        if (scroll_lock && !(force == true)) {
            return;
        }
        if (scroll_requested) {
            return;
        }
        requestAnimationFrame(_scroll_bottom);
        scroll_requested = true;
//        //if (true) {return;}
//        var elem = o.root_elem;
//        //var scrollHeight = elem.prop('scrollHeight');
//        console.log("scroll calt");
////        var scrollHeight = elem[0].scrollHeight;
//        elem.scrollTop(line_count * 20);
    };

    return o;
};
