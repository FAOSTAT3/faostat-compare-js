var CompareUIBuilderMap = function() {

    var result = {

        div: '',
        iframeURL: '',

        // default values
        baselayers: 'osm,mapquest,mapquest_nasa',
        layers: 'gaul0_faostat_3857,gaul0_line_3857',
        styles: 'join,gaul0_line',
        joinboundary: 'FAOSTAT',
        enablejoingfi: true,
        joindata: '',
        classification: 'equalarea',
        mu: '',
        intervals: '8',
        decimalValues: '0',
        colorramp: 'Blues',
        zoomto: '0',
        jointype: 'shaded', // shaded, point
        ranges: '',
        colors: '',

        appendObj : function(obj) {

            var s = '<table style="position: relative; width: ' + obj.width + '; background-color: #67B2D8; border-collapse: collapse; border: 1px solid #67B2D8;">';
            s += '<tr>';
            s += '<td>';
               s += '<div class="content_title">' + obj[FAOSTATCompare.lang + '_title'] + '</div>';
              s += '<div class="content_subtitle">' + obj.subtitle + '</div>';
            s += '</td>';
            s += '<td>';
            s += '<div style="float:right">';
              //  s += '<div class="icon" style="display:inline" id="' + obj.object_parameters.renderTo + '_shaded"><img src="images/shaded.png" ></div>';
              //  s += '<div class="icon" style="display:inline" id="' + obj.object_parameters.renderTo + '_point"><img src="images/points.png"></div>';
                s += '<div class="icon" style="display:inline" id="' + obj.object_parameters.renderTo + '_export"><img src="images/export.png" ></div>';
            s += '</div>';
            s += '</td>';
            s += '</tr>';
            s += '<td colspan="2">';
            s += '<div class="icon" style="display:inline-block; position: absolute; left:50px; top:38px; vertical-align:text-center;" id="' + obj.object_parameters.renderTo + '_shaded"><img src="images/shaded.png" >Shaded</div>';
            s += '<div class="icon" style="display:inline-block; position: absolute; left:150px; top:38px;" id="' + obj.object_parameters.renderTo + '_point"><img src="images/points.png">Points</div>';
            s += '<div id="' + obj.object_parameters.renderTo + '" style="background-color: #FFF; height: ' + obj.height + '; width: ' + obj.width + ';"></div>';
            s += '</td>';
            s += '</tr>';
            s += '</table>';
            if (obj[FAOSTATCompare.lang + '_footnote'] != null && obj[FAOSTATCompare.lang + '_footnote'].length > 0) {
                s += '<table style="width: ' + obj.width + ';">';
                s += "<tr><td class='footnote'>" + obj[FAOSTATCompare.lang + "_footnote"] + "</td></tr>";
                s += '</table>';
            }
            s += '<br>';

            $('#content_' + obj.object_parameters.renderTo).append(s);

            // query and create the map
            this.queryDBandMapCreate(obj);

            // add shaded/point
            var _this = this;
            $("#" + obj.object_parameters.renderTo + "_point").bind('click', function() {
                // TODO: change style to item
                _this.refreshmap(obj, 'point');
            });

            $("#" + obj.object_parameters.renderTo + "_shaded").bind('click', function() {
                // TODO: change style to item
                _this.refreshmap(obj, 'shaded');
            });

            $("#" + obj.object_parameters.renderTo + "_export").bind('click', function() {
                // TODO: change style to item
                Export.exportDataMap(obj);
            });
        },
        refreshmap : function(obj, jointype) {

            // get div replace (take widht and height)
            this.iframeURL = this.addParameter(this.iframeURL, 'jointype', jointype);

//			console.log(this.iframeURL);

            // create new iframe add to the url the jointype=point - jointype=shaded
            this.createIframe(obj);
        },

        queryDBandMapCreate : function(obj, response) {

/*            console.log('--------------------');
            console.log(obj);*/

            var data = {};
            data.datasource = FAOSTATCompare.datasource,
             data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = this.decimalValues;
            data.json = JSON.stringify(obj.sqls[0].sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';

            var _this = this;
            //console.log(data);
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
//					console.log(response);
                    _this.getData(obj, response);
                },
                error : function(err, b, c) { }
            });
        },

        getData : function(obj, response) {
            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            this.setOptionalMapParameters(obj);
            this.mu = data[0][3];

            // data to be passed to the iframe
            var joindata = '[';
            for (var i = 0 ; i < data.length ; i++) {
                // FIXME: this should be performed at the level of WDS
                var value =  Number(data[i][2]).toFixed(this.decimalValues);
                joindata += '(';
                joindata += data[i][0] + "," + value;
                joindata += ')';
                if ( i < data.length -1) {
                    joindata += ',';
                }
            }
            joindata += ']';

            this.joindata = joindata;
            this.createIframeURL(obj);
        },
        createIframeURL: function(obj) {
            this.iframeURL = "http://" + FAOSTATCompare.baseurl_maps + "/maps/api?" +
                "baselayers=" + this.baselayers +
                "&layers=" + this.layers +
                "&styles=" + this.styles +
                "&joindata=" + this.joindata +
                "&joinboundary="+ this.joinboundary +
                "&enablejoingfi="+ this.enablejoingfi +
                "&legendtitle=" + this.mu + // should dynamic measurement unit
                "&mu=" + this.mu +
                "&classification=" + this.classification +
                "&zoomto=FAOSTAT(" + this.zoomto + ")" +
                "&jointype=" + this.jointype;


            if ( this.colors != '' )
                this.iframeURL += "&colors=" + this.colors;
            else
                this.iframeURL += "&colorramp=" + this.colorramp;

            if ( this.ranges != '' )
                this.iframeURL += "&ranges=" + this.ranges;

            if ( this.classification != 'custom' )
                this.iframeURL += "&intervals=" + this.intervals;

            // create the iframe
            this.createIframe(obj);
        },
        createIframe : function(obj) {
            $('#' + obj.object_parameters.renderTo).empty();

            var iframe = "<iframe width="+ obj.width+" height=" + obj.height + " frameBorder='0'";
            // add the this.iframeURL to iframe
            iframe += "src='" + this.iframeURL +"'";

            iframe += "'>";
            iframe += "</iframe>";
            $('#' + obj.object_parameters.renderTo).append(iframe);
        },

        setOptionalMapParameters: function(obj) {
            if ( obj.object_parameters.colors != null ) {
                this.colors = obj.object_parameters.colors;
            }

            if ( obj.object_parameters.ranges != null ) {
                this.ranges = obj.object_parameters.ranges;
            }

            if ( obj.object_parameters.ranges != null ) {
                this.classification = obj.object_parameters.classification;
            }

            if ( obj.object_parameters.colorramp != null ) {
                this.colorramp = obj.object_parameters.colorramp;
            }
        },
        addParameter: function(href, key, val){

            var newParam = key + '=' + val,
                params = '?' + newParam;

            // If the "search" string exists, then build params from it
            if (href) {
                // Try to replace an existance instance
                params = href.replace(new RegExp('[\?&]' + key + '[^&]*'), '&' + newParam);

                // If nothing was replaced, then add the new param to the end
                if (params === href) {
                    params += '&' + newParam;
                }
            }
            return params;
        }
    };

    return result;
}