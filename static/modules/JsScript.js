var JsScript = new function() {
    var _script_this = {}; /* this used for all scripts */

    return function(text) {

        /* Scripting API section */
        var send = function(cmd) {
            Message.pub('script_send_command', {data: cmd});
        };

        var print = function(message) {
            Message.pub('script_print', {data: message});
        };
        /* end Scripting API section */

        try {
            eval('var script_func = function(match) {"use strict";' + text + '}');
        }
        catch (err) {
            Message.pub('script_eval_error', {data: err});
            return null;
        }

        this.RunScript = function(match) {
            try {
                script_func.call(_script_this, match);
            }
            catch (err) {
                Message.pub('script_exec_error', {data: err});
                return;
            }
        };

        return this;
    }
}();