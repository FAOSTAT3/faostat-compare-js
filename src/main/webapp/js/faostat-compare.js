if (!window.FAOSTATCompare) {

    window.FAOSTATCompare = {

        /*
         This setting is used to integrate FAOSTAT Compare with the Gateway.
         It can't be stored in the JSON configuration file because it is
         used to locate the JSON configuration file.
         */
        prefix : 'http://168.202.28.214:8080/faostat-compare-js/',

        lang : 'E',

        datasource : '',

        baseurl : '',

        baseurl_dbms : '',

        baseurl_r : '',

        baseurl_maps : '',

        baseurl_bletchley : '',

        baseurl_images: '',

        theme : 'faostat',

        width_browse_by_domain: '',

        selectors: new Array(),

        selectorsBaseURL : 'selectors.html',

        selectorsUI : '',

        selectorsIndex : 0,


        // QUERY data

        QUERY: '',

        sql_chart_all: '',

        sql_table: '',

        sql_map: '',

        init : function(groupCode, domainCode, lang) {

            /**
             * Language: as parameter or from the URL
             */
            if (lang != null && lang.length > 0) {
                FAOSTATCompare.lang = lang;
            }
            var tmp = $.url().param('lang');
            if (tmp != null && tmp.length > 0)
                FAOSTATCompare.lang = tmp;

            /**
             * Group and Domain for the tree
             */
            FAOSTATCompare.groupCode = groupCode;
            FAOSTATCompare.domainCode = domainCode;
            /**
             * Read and store settings for web-services
             */
            $.getJSON(FAOSTATCompare.prefix + 'config/faostat-config.json', function(data) {
                FAOSTATCompare.datasource = data.datasource;
                FAOSTATCompare.baseurl = data.baseurl;
                FAOSTATCompare.baseurl_r = data.baseurl_r;
                FAOSTATCompare.baseurl_maps = data.baseurl_maps;
                FAOSTATCompare.baseurl_bletchley = data.baseurl_bletchley;
                FAOSTATCompare.width_browse_by_domain = data.width_browse_by_domain;
                FAOSTATCompare.width_browse_by_country = data.width_browse_by_country;
                FAOSTATCompare.baseurl_images   = data.baseurl_images;
                FAOSTATCompare.I18N_URL = data.I18N_URL;

                // GET Single Search HTML
                $.ajax({
                    type: "GET",
                    url: FAOSTATCompare.prefix + FAOSTATCompare.selectorsBaseURL,
                    success: function(data){
                        /** TODO: remove innerHTML **/
//                       FAOSTATCompare.selectorsUI = data.activeElement.innerHTML;
                        FAOSTATCompare.selectorsUI = data;

                        /**
                         * Initiate multi-language
                         */
                        var I18NLang = '';
                        switch (FAOSTATCompare.lang) {
                            case 'F' : I18NLang = 'fr'; break;
                            case 'S' : I18NLang = 'es'; break;
                            default: I18NLang = 'en'; break;
                        }


                        $('#container').load(FAOSTATCompare.prefix + 'compare.html', function() {
                            $.i18n.properties({
                                name: 'I18N',
                                path: FAOSTATCompare.I18N_URL,
                                mode: 'both',
                                language: I18NLang,
                                callback: function() {
                                    document.getElementById('subtitle_text').innerHTML = $.i18n.prop('_selectors');

                                    document.getElementById('pageTitle').innerHTML = $.i18n.prop('_compare_data');
                                    document.getElementById('compare_button_add_text').innerHTML = $.i18n.prop('_addselector');
                                    document.getElementById('compare_button_add_text').title = $.i18n.prop('_addselectorTooltip');
                                    $("#compare_button_add_text").powerTip({placement: 'w'});

                                    document.getElementById('compare_button_text').innerHTML = $.i18n.prop('_compare');
                                    document.getElementById('result_text').innerHTML = $.i18n.prop('_results');

                                    $('#compare_button_text').addClass('btnText');
                                    $('#compare_button_add_text').addClass('btnText');
                                    FAOSTATCompare.loadUI();
                                }
                            });
                        });

                    }
                });
            });

            $.getJSON(FAOSTATCompare.prefix + 'resources/timeserie_empty.json', function(data) {

                data = CompareI18NInjector.injectLanguage(data);
                FAOSTATCompare.QUERY = data;

                // get sql tamplate for the chart
                $.getJSON(FAOSTATCompare.prefix + 'resources/sql_chart_all.json', function(data) {
                    data = CompareI18NInjector.injectLanguage(data);

                    FAOSTATCompare.sql_chart_all = data;

                });

                // get sql tamplate for the table
                $.getJSON(FAOSTATCompare.prefix + 'resources/sql_table.json', function(data) {
                    data = CompareI18NInjector.injectLanguage(data);
                    FAOSTATCompare.sql_table = data;
                });

                // get sql tamplate for the table
                $.getJSON(FAOSTATCompare.prefix + 'resources/sql_map.json', function(data) {
                    data = CompareI18NInjector.injectLanguage(data);
                    FAOSTATCompare.sql_map = data;
                });

            });
        },

        loadUI : function(keyword) {
            //build first selector
            FAOSTATCompare.buildSelectors();

            // timerange of the years
            $("#compare_years").rangeSlider({bounds:{min: 1961, max: 2050}}, {defaultValues: {min: 1992, max: 2011}}, {step: 1});
            $("#compare_years").bind("valuesChanged", function(e, data){
                FAOSTATCompare.compare();
            });

            // todo: remove the toggle from here, add icon or ask Nicola
            /*            $("#compare_selectors_summary_showhide").on('click', function () {
             $("#compare_selectors_summary").slideToggle();
             });*/

            /*        $("#compare_button_add").jqxButton({ width: '150', theme: FAOSTATCompare.theme }); **/
            $("#compare_button_add").on('click', function () {  FAOSTATCompare.buildSelectors(); });

//            $("#compare_button_output").jqxButton({ width: '150', theme: FAOSTATCompare.theme });
            $("#compare_button_output").on('click', function () { FAOSTATCompare.compare(); });

            $("#compare_button_chart_output").jqxButton({ width: '150', theme: FAOSTATCompare.theme });
            $("#compare_button_chart_output").on('click', function () {FAOSTATCompare.createChartSQLRequest(); });

            $("#compare_button_table_output").jqxButton({ width: '150', theme: FAOSTATCompare.theme });
            $("#compare_button_table_output").on('click', function () {FAOSTATCompare.createTableQLRequest();});

            $("#compare_button_map_output").jqxButton({ width: '150', theme: FAOSTATCompare.theme });
            $("#compare_button_map_output").on('click', function () {FAOSTATCompare.createMapQLRequest();});
        },

        compare: function() {

            // Google Analytics Stats
            FAOSTAT_COMPARE_STATS.compareData('COMPARE DATA');

            $('#compare_results').show();
            $('#result_content').show();

            FAOSTATCompare.createChartSQLRequest();
            FAOSTATCompare.createTableQLRequest();
        },

        buildSelectors: function() {

            // increase index of the selector
            this.selectorsIndex++;

            // generate random ID
            var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            var id = randLetter + Date.now();

            // append selector
            $("#compare_selectors").append("<div id='compare_selectors_"+ id +"'><div>");

            // build selector summary
            //$("#compare_selectors_summary").append("<div id='compare_selectors_summary_"+ id +"'><div>");

            // create selector
            var obj = new CompareUIBuilderSelectors();
            obj.init(id, this.selectorsIndex);
            FAOSTATCompare.selectors.push(obj);

        },

        createChartSQLRequest: function() {

            var s = JSON.stringify(FAOSTATCompare.QUERY);
            var obj = $.parseJSON(s);

            obj.objects[0].sqls = [];
            for(var i=0; i < FAOSTATCompare.selectors.length; i++ ) {
                if ( FAOSTATCompare.selectors[i].isEnabled ) {
                    var sql = FAOSTATCompare.createStandardSQL(FAOSTATCompare.selectors[i], this.sql_chart_all);
                    obj.objects[0].sqls.push(sql.objects[0].sqls[0]);
                }
            }

            // Creation of the chart
            $("#output_chart").empty();
            var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            var id = randLetter + Date.now();
            $("#output_chart").append("<div id='content_"+ id +"'></div>");
            obj.objects[0].object_parameters.renderTo = id;
            var c = new CompareUIBuilderChart();
            c.appendChart(obj.objects[0]);
        },

        createStandardSQL: function(selector, sql_empty, isMap) {
            // clone
            var s = JSON.stringify(sql_empty);
            var sql = $.parseJSON(s);

            // areas
            if ( !isMap ) {
                var areas = $('#selector_area_' + selector.suffix).jqxComboBox('getCheckedItems');
                var areasValues = "";
                $.each(areas, function (index) {
                    areasValues += this.value + ",";
                });
                areasValues = areasValues.substring(0, areasValues.length-1);
                var json =  '{"datatype" : "DATE", "column" : "D.AreaCode", "operator" : "IN", "value" : null, "ins" : ['+ areasValues +']}';
                var j = $.parseJSON(json);
                sql.objects[0].sqls[0].sql.wheres.push(j);
            }

            //items
            var items = $('#selector_item_' + selector.suffix).jqxComboBox('getCheckedItems');
            var itemsValues = "";
            $.each(items, function (index) {
                itemsValues += this.value + ",";
            });
            itemsValues = itemsValues.substring(0, itemsValues.length-1);
            var json =  '{"datatype" : "DATE", "column" : "D.ItemCode", "operator" : "IN", "value" : null, "ins" : ['+ itemsValues +']}';
            var j = $.parseJSON(json);
            sql.objects[0].sqls[0].sql.wheres.push(j);

            // elements
            var elementsList = $('#selector_elementlist_' + selector.suffix).jqxComboBox('getCheckedItems');
            var elementsListValues = "";
            $.each(elementsList, function (index) {
                elementsListValues += this.value + ",";
            });
            elementsListValues = elementsListValues.substring(0, elementsListValues.length-1);
            var json =  '{"datatype" : "DATE", "column" : "D.ElementListCode", "operator" : "IN", "value" : null, "ins" : ['+ elementsListValues +']}';
            var j = $.parseJSON(json);
            sql.objects[0].sqls[0].sql.wheres.push(j);

            // years
            var years = this.getYears('compare_years');
            var json =  '{"datatype" : "DATE", "column" : "D.Year", "operator" : "IN", "value" : null, "ins" : ['+ years+']}';
            var j = $.parseJSON(json);
            sql.objects[0].sqls[0].sql.wheres.push(j);

            //  "'CC'"
            var domain = $('#selector_domain_' + selector.suffix).jqxComboBox('getSelectedItem');
            var json =  '{"datatype" : "DATE", "column" : "D.DomainCode", "operator" : "IN", "value" : null, "ins" : ["\''+ domain.originalItem.code + '\'"]}';
            var j = $.parseJSON(json);
            sql.objects[0].sqls[0].sql.wheres.push(j);


            /**var minorof = $('#selector_minorof_' + selector.suffix).jqxNumberInput('val');
             var greatherthan = $('#selector_greaterthan_' + selector.suffix).jqxNumberInput('val');

             // TODO: check if minorof is more than greater than
             if ( minorof != 0 ) {
                    var json =  '{"datatype" : "DATE", "column" : "D.Value", "operator" : "<", "value" : ' + minorof +', "ins" : []}';
                    var j = $.parseJSON(json);
                    sql.objects[0].sqls[0].sql.wheres.push(j);
                }
             if ( greatherthan != 0 ) {
                    var json =  '{"datatype" : "DATE", "column" : "D.Value", "operator" : ">", "value" : ' + greatherthan +', "ins" : []}';
                    var j = $.parseJSON(json);
                    sql.objects[0].sqls[0].sql.wheres.push(j);
                }          **/



            return sql;
        },

        createTableQLRequest: function() {

            var s = JSON.stringify(FAOSTATCompare.QUERY);
            var obj = $.parseJSON(s);

            obj.objects[0].sqls = [];
            for(var i=0; i < FAOSTATCompare.selectors.length; i++ ) {
                if ( !FAOSTATCompare.selectors[i].disable ) {
                    var sql = FAOSTATCompare.createStandardSQL(FAOSTATCompare.selectors[i], this.sql_table);
                    obj.objects[0].sqls.push(sql.objects[0].sqls[0]);
                }
            }

            // Creation of the table
            $("#output_table").empty();
            var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            var id = randLetter + Date.now();
            $("#output_table").append("<div id='content_"+ id +"'><div>");
            obj.objects[0].object_parameters.renderTo = id;
            var c = new CompareUIBuilderTable();
            c.appendObj(obj.objects[0]);
        },

        createMapQLRequest: function() {
            var s = JSON.stringify(FAOSTATCompare.QUERY);
            var obj = $.parseJSON(s);
            obj.objects[0].sqls = [];
            for(var i=0; i < FAOSTATCompare.selectors.length; i++ ) {
                if ( !FAOSTATCompare.selectors[i].disabled ) {
                    var sql = FAOSTATCompare.createStandardSQL(FAOSTATCompare.selectors[i], this.sql_map, true);
                    obj.objects[0].sqls.push(sql.objects[0].sqls[0]);
                }
            }

            // Creation of the table
            $("#output_map").empty();
            var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            var id = randLetter + Date.now();
            $("#output_map").append("<div id='content_"+ id +"'></div>");
            obj.objects[0].object_parameters.renderTo = id;
            var c = new CompareUIBuilderMap();
            c.appendObj(obj.objects[0]);
        },

        // Remove selector from the interface
        removeSelector: function(suffix) {
            if ( FAOSTATCompare.selectors.length <= 1 ) {
                alert('1 selector');
            }
            else {
                for(var i=0; i < FAOSTATCompare.selectors.length; i++ ) {
                    if ( FAOSTATCompare.selectors[i].suffix == suffix ) {
                        // remove selector from array
                        FAOSTATCompare.selectors.splice(i, 1);
                        // remove from interface
                        $('#compare_selectors_' + suffix).remove();
                        //                    $('#compare_selectors_summary_' + suffix).remove();
                        break;
                    }
                }
            }

        },

        /*
         * synchronize the combos among the selectors.
         * If there is at least one value compatible,
         * uncheck all the selected values of the combo
         * and select the values that has to be synched,
         * otherwise keep the combo as it is
         * */
        synchronizeSelectors: function(suffix, type, valuesToSync) {
            // the values are the object of jqwidget, this is to avoid a double cycle
            for(var i=0; i < FAOSTATCompare.selectors.length; i++ ) {
                if ( FAOSTATCompare.selectors[i].suffix != suffix ) {
                    var id = type + '_' + FAOSTATCompare.selectors[i].suffix;
                    // TODO: if it's possible to sync, remove all values

                    var unchecked = false;
                    // select the values syncronized values
                    var values = $("#"+ id).jqxComboBox('getItems');
                    for (var k= 0; k < values.length; k++) {
                        for (var j= 0; j < valuesToSync.length; j++) {
                            if ( values[k].originalItem.code == valuesToSync[j].originalItem.code) {
                                if ( unchecked == false ) {
                                    // uncheck all
                                    $("#" + id).jqxComboBox('uncheckAll');
                                    unchecked = true;
                                }
                                // syncronize
                                $("#" + id).jqxComboBox('checkIndex', values[k].index);
                                // break;
                            }
                        }
                    }
                }
            }
        },

        // TODO: implement function to collapse all the panels and leave open just the passed one
        collapseSelectors: function(obj) {

        },


        /** SUMMARY */
        updateSummary: function(type, obj, values) {
            var comboID = type + '_' + obj.suffix;
            var summaryID = type + '_summary_' + obj.suffix;


            $('#' + summaryID).empty();
            // TODO: should be done a remove/add method more than recreate everything

            // groups and domains
            try {
                if (values.length == null) {
                    $('#' + summaryID).append("<div class='summary-item-groupdomain'>" + values.label + "</div>") ;
                }
                else {
                    for (var i = 0; i < values.length; i++) {
                        var itemID = "summary_"+ values[i].originalItem.code +'_'+ obj.suffix;
                        // add functionality to remove item
                        var code = values[i].originalItem.code;
                        var title = "Click to remove it from the selection";
                        $('#' + summaryID).append("<div id='"+itemID +"' title='"+ title +"'' class='summary-item' code='"+ code+"'>" + values[i].originalItem.label + "</div>") ;

                        $('#' + itemID).powerTip({placement: 's'});
                        $('#' + itemID).on('click', function () {

                            // uncheck item
                            var v = $("#"+ comboID).jqxComboBox('getCheckedItems');
                            var c = $(this).attr("code");

                            if ( v.length > 1 ) {
                                // TODO: use uncheckItem insted of this
                                for (var j= 0; j < v.length; j++) {
                                    if ( v[j].originalItem.code == c ) {
                                        $("#" + comboID).jqxComboBox('uncheckItem', v[j]);
                                        break;
                                    }
                                }
                            }
                            else {
                                alert('you need at least one item selected');
                            }

                        });
                    }
                }
            }catch(err) {}
        },

        getYears: function(id) {
            var ins = new Array();
            var values = $("#" + id).rangeSlider("values");
            for(var i = values.min; i <= values.max; i++ ) {
                ins.push(i);
            }
            return ins;
        }

    };

}