if (!window.FAOSTATCompareUIUtils) {

    window.FAOSTATCompareUIUtils = {

        noValuesFoundPanel : function(id) {
            $("#" + id).empty();
            $("#" + id).append("<div class='no-value-panel'>No data to display - Please make another selection</div>")
            // TODO: the css should be in the css style sheet
        }

    };

}