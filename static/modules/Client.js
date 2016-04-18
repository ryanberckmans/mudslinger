var Client = new (function() {
    this.load_layout = function() {
        $('#main_vert_split').jqxSplitter({
            width: '90vw',
            height: '90vh',
            orientation: 'vertical',
            panels: [{size:'75%'},{size:'25%'}]
        });

        $('#output_aff_split').jqxSplitter({
            orientation: 'vertical',
            panels: [{size:'20%'},{size:'80%'}]
        });

        $("#output_gauge_split").jqxSplitter({
            orientation: 'horizontal',
            panels: [{size:'90%'},{size:'60px'}]
        });

        $('#map_chat_split').jqxSplitter({
            orientation: 'horizontal'
        });

        return this;
    };
})();


$(document).ready(function() {
    Socket.open();
    Socket.open_telnet();

    Client.load_layout();

});