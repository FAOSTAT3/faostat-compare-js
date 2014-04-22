var CompareUIBuilderChart = function() {

    var result = {

    obj : '<div class="obj-box">' +
            ' <div id="obj_header_REPLACE" class="obj-box-header">' +

                '<div class="obj-box-header-text">' +
                    '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
                    '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
                '</div>' +

                '<div class="obj-box-icons">' +
//                    '<div class="obj-box-icon" id="obj_export_REPLACE"><img src="' + FAOSTATCompare.baseurl_images +'infoIcon.png"></div>' +
                    '<div class="obj-box-icon chart-line" id="obj_line_REPLACE"></div>' +
                     '<div class="obj-box-icon chart-bar-vert" id="obj_column_REPLACE"></div>' +
                    '<div class="obj-box-icon chart-bar-hor" id="obj_bar_REPLACE"></div>' +
                    '<div class="obj-box-icon chart-area" id="obj_area_REPLACE"></div>' +
                    '<div class="obj-box-icon chart-spline" id="obj_spline_REPLACE"></div>' +
                '</div>' +

            '</div>' +

            '<div id="REPLACE"></div> ' +

            '<div id="obj_footer_REPLACE" class="obj-box-footer"></div> ' +
        '</div>',


        counter : 0,
        series :new Array(),
        chart: '',

        appendChart : function(chart) {
            this.chart = chart;

            var s = CompareUtils.replaceAll(this.obj, 'REPLACE', chart.object_parameters.renderTo);
            $('#content_' + chart.object_parameters.renderTo).append(s);

            $('#obj_title_' + chart.object_parameters.renderTo).append(chart[FAOSTATCompare.lang + '_title']);
            $('#obj_footnote_' + chart.object_parameters.renderTo).append( chart[FAOSTATCompare.lang + '_footnote']);

            // Loading image
            document.getElementById(chart.object_parameters.renderTo).innerHTML = "<div style='height:"+ chart.height+"'><img src='"+ FAOSTATCompare.prefix +'images/loading.gif' +"'></div>";

            var _this = this;
            $("#" + chart.object_parameters.renderTo + "_export").bind('click', function() {
                // TODO: change style to item
                //Export.exportData(obj);
               // Export.exportPlainData(chart);
            });

            // refreshing based on chart type
            $("#obj_line_" + chart.object_parameters.renderTo).bind('click', function() {_this.refreshChart('line');});
            $("#obj_bar_" + chart.object_parameters.renderTo).bind('click', function() { _this.refreshChart('bar'); });
            $("#obj_column_" + chart.object_parameters.renderTo).bind('click', function() {_this.refreshChart('column');});
            $("#obj_area_" + chart.object_parameters.renderTo).bind('click', function() {_this.refreshChart('area');});
            $("#obj_pie_" + chart.object_parameters.renderTo).bind('click', function() { _this.refreshChart('pie');});
            $("#obj_spline_" + chart.object_parameters.renderTo).bind('click', function() { _this.refreshChart('spline');});

            /** Query the DB */
            this.queryDBAndCreateChart();
        },

        queryDBAndCreateChart : function() {

            // initialization counter
            this.counter = 0;
            this.series  = new Array([this.chart.sqls.length]);

            // getting the series
            for (var i=0; i< this.chart.sqls.length; i < i++) {

                var data = {};
                data.datasource = FAOSTATCompare.datasource;
                data.thousandSeparator = ',';
                data.decimalSeparator = '.';
                data.decimalNumbers = '2';
                data.json = JSON.stringify(this.chart.sqls[i].sql);
                data.cssFilename = 'faostat';

                var _this = this;
                /** TODO: push the array series in an ordered way **/
                $.ajax({
                    type : 'POST',
                    url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                    data : data,
                    success : function(response) {
                        _this.counter++;
                        _this.series.push(response);

                        // if all the async calls are returned create the timeserie
                        if (  _this.counter >= _this.chart.sqls.length ) {

                            // set default color
                            //$('#' + _this.chart.object_parameters.renderTo).css({"background-color": "#67B2D8"});

                            // create the chart
                            _this.createChartTimeserie(_this.chart, 'line', _this.series );
                        }
                    },
                    error : function(err, b, c) { }
                });
            }

        },

        refreshChart: function(type) {
            this.createChartTimeserie(this.chart, type, this.series );
        },

        /**
         * @param chart Parameters stored in the JSON
         * @param type 'column', 'line'
         * @param response Data fetch through WDS
         */
        createChartTimeserie : function(chart, type, s) {

/*            console.log("-----------");
            console.log(s);
            console.log("-----------");*/

            var data = [];
            for (var i=1; i < s.length; i++) {
                var obj = s[i];
                if (typeof s[i] == 'string')    {
                    obj = $.parseJSON(s[i]);
                }
                //var obj = jQuery.parseJSON(s[i]);
                for (var j=0; j < obj.length; j++) {
                    data.push(obj[j]);
                }
            }
          /*  console.log("DATA----------: " + data[0]);
            console.log(data);
            console.log("DATA");*/
            if ( data.length <=0 ) {
               // no series found.
                FAOSTATCompareUIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {
                var series = [];
                var yAxis = [];

                /** Initiate variables */
                var check = [];
                var mus = [];
                var ind = data[0][1];
                var count = 0;
                var maxLength = 0;
                var maxLengthIND = data[0][1];

                /** Re-shape data into 'vectors' */
                var vectors = {};
                vectors[ind] = {};
                vectors[ind].dates = [];
                vectors[ind].mus = [];
                vectors[ind].values = new Hashtable();


                /** Create a vector for each indicator */
                for (var i = 0 ; i < data.length ; i++) {
//                    console.log("data[i][1]: " + data[i][1] + " " + ind);
                    if (data[i][1] == ind) {
                        count++;
                        vectors[ind].dates.push(data[i][0]);
                        vectors[ind].mus.push(data[i][3]);
                        vectors[ind].values.put(data[i][0], data[i][2]);
                    } else {
                        check.push(count);
                        if (count > maxLength) {
                            maxLength = count;
                            maxLengthIDX = check.length - 1;
                            maxLengthIND = ind;
                        }
                        ind = data[i][1];
                        vectors[ind] = [];
                        vectors[ind].dates = [];
                        vectors[ind].mus = [];
                        vectors[ind].values = new Hashtable();
                        count = 1;
                        vectors[ind].dates.push(data[i][0]);
                        vectors[ind].mus.push(data[i][3]);
                        vectors[ind].values.put(data[i][0], data[i][2]);
                    }
                }
                check.push(count);
//                console.log("END DATA");
//                console.log("count: " + count);
//                console.log("maxLengthIND: " + maxLengthIND);
//                console.log("---- VECTORS ----");
//                console.log(vectors);

                /** Collect all the years */
                var y = new Hashtable();
                var yearsList = [];
                for(key in vectors) {
//                    console.log(key);
                    for (var i = 0 ; i < vectors[key].dates.length ; i++) {
//                        console.log(vectors[key]);
                        // if the year still is not in the hashmap, add it
                        if (y.get(vectors[key].dates[i]) == null ) {
                            y.put(vectors[key].dates[i], vectors[key].dates[i]);
                            yearsList.push(parseInt(vectors[key].dates[i]));
                        }
                    }
                }

                /** TODO: get min year, get max year. check if the years are always sorted**/
//               console.log("---- YEARS ----");
//                console.log(yearsList);
                yearsList = yearsList.sort();
                var years = []
                for(var i=yearsList[0]; i <= yearsList[yearsList.length -1 ]; i++) {
                    years.push(i.toString());
                }

                // check if it's just one year (X-axis), in that case force to bar chart (if it's not column/bar)
                if ( years.length <= 1 && type != 'bar' && type != 'column') {
                    $("#" + chart.object_parameters.renderTo + "_area").hide();
                    $("#" + chart.object_parameters.renderTo + "_line").hide();
                    $("#" + chart.object_parameters.renderTo + "_spline").hide();
                    type = 'column';
                }

                /** TODO: Collect the MUs in the other cycle, Collect measurement units */
                $.each(vectors, function(k, v) {
                    if ($.inArray(vectors[k].mus[0], mus) < 0)
                        mus.push(vectors[k].mus[0]);
                });

               $.each(vectors, function(k, v) {
                    var s = {};
                   // s.name = k;
                    s.name = CompareUtils.replaceAll(k, '_', '<br>');
                    s.type = type;
                    s.yAxis = $.inArray(vectors[k].mus[0], mus);

                   // data should be the same length of the years
                    s.data = [];
                   // if the data is contained in the hashmap
                   for(var i =0; i < years.length; i++) {
                       if (vectors[k].values.get(years[i]) != null ) {
                           s.data.push(parseFloat(vectors[k].values.get(years[i])));
                       }
                       else
                           s.data.push(null);
                   }
                    series.push(s);
                });

/*                console.log("---- SERIES ----");
                console.log(series);*/

                /** Create a Y-Axis for each measurement unit */
                for (var i = 0 ; i < mus.length ; i++) {
                    var a = {};
                    a.title = {};
                    a.title.text = mus[i];
                    a.title.style = {};
                    a.title.style.color = FENIXCharts.COLORS[i];
                    if (i > 0)
                        a.opposite = true;
                    a.labels = {};
                    a.labels.style = {};
                    a.labels.style.color = FENIXCharts.COLORS[i];
                    yAxis.push(a);
                }

                /** Create chart */
                var chart_payload = {};
                chart_payload.engine = chart.object_parameters.engine;
                //chart_payload.keyword = chart.object_parameters.keyword;
                chart_payload.keyword = 'FAOSTAT_DEFAULT_DOUBLE_AXES_BAR';
                chart_payload.renderTo = chart.object_parameters.renderTo;
                chart_payload.categories = years;
                chart_payload.title = '';
                chart_payload.credits = chart.object_parameters.credits;
                chart_payload.yaxis = {};
                chart_payload.yaxis = yAxis;
                chart_payload.xaxis = {};
                if (chart.object_parameters.xaxis != null) {
                    chart_payload.xaxis.rotation = chart.object_parameters.xaxis.rotation;
                    chart_payload.xaxis.fontSize = chart.object_parameters.xaxis.fontSize;
                }


/*                console.log("years: " + years);
                console.log("yAxis: " + yAxis);
                console.log("chart.object_parameters.renderTo: " + chart_payload.renderTo);
                console.log("chart_payload.keyword: " +chart_payload.keyword);*/


                chart_payload.series = series;
                FENIXCharts.plot(chart_payload);
            }

        }
    };

    return result;
};