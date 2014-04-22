if (!window.CompareUtils) {

    window.CompareUtils = {

        WIDTH_100: '724px',
        WIDTH_66: '504px',
        WIDTH_50: '352px',
        WIDTH_33: '200px',
        WIDTH_25: '180px',
        WIDTH_20: '140px',

        replaceAll: function(text, stringToFind, stringToReplace) {
            var temp = text;
            var index = temp.indexOf(stringToFind);
            while(index != -1){
                temp = temp.replace(stringToFind,stringToReplace);
                index = temp.indexOf(stringToFind);
            }
            return temp;
        },

        setObjWidth: function (obj) {
            var width = "100%";
            if ( obj.width != null ) {
//				if ( obj.width.toUpperCase().contains("$_WIDTH")) {
                if ( obj.width.toUpperCase().indexOf("$_WIDTH") > -1) {
                    switch(obj.width) {
                        case "$_WIDTH_100": obj.width = Utils.WIDTH_100; break;
                        case "$_WIDTH_66": obj.width = Utils.WIDTH_66; break;
                        case "$_WIDTH_50": obj.width = Utils.WIDTH_50; break;
                        case "$_WIDTH_33": obj.width = Utils.WIDTH_33; break;
                    }
                }
                width = parseInt(obj.width.replace("px",""));
            }
            return width;
        }

    };

}