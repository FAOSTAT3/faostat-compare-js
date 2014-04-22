if (!window.FAOSTAT_COMPARE_STATS) {

    window.FAOSTAT_COMPARE_STATS = {

        track : function(category, action, label) {
            _gaq.push(['_trackEvent', category, action, label]);
        },

        compareData : function(text) {
            FAOSTAT_COMPARE_STATS.track('COMPARE', 'Compare the data', text);
        }

    };

}