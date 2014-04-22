if (!window.CompareI18NInjector) {

    window.CompareI18NInjector = {

        /** TODO: CHANGE ALL THE REPLACE FUNCTIONS WITH THE CompareUtils.replaceAll() **/

        injectLanguage : function(json) {
            try {
                // TODO write an exception (i.e. for the country view that on is not used
                json = CompareI18NInjector.injectLanguage_Selectors(json);
            } catch (e) {
                // TODO: handle exception
            }
            try {
                json = CompareI18NInjector.injectLanguage_Objects(json);
            } catch (e) {
                // TODO: handle exception
            }
            try {
                json = CompareI18NInjector.injectLanguage_Subtitles(json);
            } catch (e) {
                // TODO: handle exception
            }
            return json;
        },

        injectLanguage_Subtitles : function(json) {
            var agg_label;
            if ( json.selectors != null ) {
                for (var i = 0 ; i < json.selectors.length ; i++) {
                    switch (json.selectors[i].type) {
                        case 'dropdown_aggregation':
                            agg_label = $.i18n.prop('_' + json.selectors[i].default_code.toLowerCase());
                            break;
                    }
                }
            }
            for (var i = 0 ; i < json.objects.length ; i++) {
                json.objects[i].subtitle = json.objects[i][FAOSTATCompare.lang + '_subtitle'];
                // Aggregation 
                if ( agg_label != null) {
                    json.objects[i].aggregation_label = agg_label;
                    if (json.objects[i].subtitle.indexOf('$_AGG') != -1) {
                        json.objects[i].subtitle = json.objects[i].subtitle.replace('$_AGG', json.objects[i].aggregation_label);
                    }
                }

                // Date
                if (json.objects[i].subtitle.indexOf('$_DATE') != -1) {
                    var date = json.objects[i].date_default_label;
                    if ( date != null ) {
                        json.objects[i].subtitle = json.objects[i].subtitle.replace('$_DATE', date);
                    }
                }
            }
            return json;
        },

        injectLanguage_Subtitles_cachedObjects : function(object, aggregation_code, date) {

            object.subtitle = object[FAOSTATCompare.lang + '_subtitle'];

            // Aggregation
            var cachedAggregationLabel = object.aggregation_label;
            if ( aggregation_code != null  ) {
                object.aggregation_label = $.i18n.prop('_' + aggregation_code.toLowerCase());
                cachedAggregationLabel = object.aggregation_label;
            }
            // this is used if it's called just one year (in that case SUM = AVG and it's not added in the subtitle)
            if ( object.show_aggregation != null && !object.show_aggregation ) {
                object.aggregation_label = "";
            }
            if (object.subtitle.indexOf('$_AGG') != -1) {
                object.subtitle = object.subtitle.replace('$_AGG', object.aggregation_label);
                object.aggregation_label = cachedAggregationLabel;
            }

            // Date
            if ( date != null ) {
                object.date_default_label = date;
            }
            if (object.subtitle.indexOf('$_DATE') != -1) {
                object.subtitle = object.subtitle.replace('$_DATE', object.date_default_label);
            }

        },

        injectLanguage_Selectors : function(json) {
            for (var i = 0 ; i < json.selectors.length ; i++) {
                if (json.selectors[i].sql != null) {

                    if (json.selectors[i].sql.query != null) {
                        json.selectors[i].sql.query = CompareUtils.replaceAll(json.selectors[i].sql.query, '_$LANG', FAOSTATCompare.lang)
                    }

                    for (var j = 0 ; j < json.selectors[i].sql.selects.length ; j++) {
                        var select = json.selectors[i].sql.selects[j];
                        if (select.column.indexOf('_$LANG') != -1)
                            select.column = select.column.replace('_$LANG', FAOSTATCompare.lang);
                    }
                    if (json.selectors[i].sql.groupBys != null) {
                        for (var j = 0 ; j < json.selectors[i].sql.groupBys.length ; j++) {
                            var groupBy = json.selectors[i].sql.groupBys[j];
                            if (groupBy.column.indexOf('_$LANG') != -1)
                                groupBy.column = groupBy.column.replace('_$LANG', FAOSTATCompare.lang);
                        }
                    }
                    if (json.selectors[i].sql.orderBys != null) {
                        for (var j = 0 ; j < json.selectors[i].sql.orderBys.length ; j++) {
                            var orderBy = json.selectors[i].sql.orderBys[j];
                            if (orderBy.column.indexOf('_$LANG') != -1)
                                orderBy.column = orderBy.column.replace('_$LANG', FAOSTATCompare.lang);
                        }
                    }
                }
            }
            return json;
        },

        injectLanguage_Objects : function(json) {
            for (var i = 0 ; i < json.objects.length ; i++) {
                if (json.objects[i].sqls != null) {
                    for (var k = 0 ; k < json.objects[i].sqls.length ; k++) {
                        if (json.objects[i].sqls[k].sql != null ) {
                            for (var j = 0 ; j < json.objects[i].sqls[k].sql.selects.length ; j++) {
                                var select = json.objects[i].sqls[k].sql.selects[j];
                                if (select.column.indexOf('_$LANG') != -1) {
                                    select.column = CompareUtils.replaceAll(select.column, '_$LANG', FAOSTATCompare.lang)
                                }
                                if (select.column.indexOf('$CHANGE') != -1)
                                    select.column = select[FAOSTATCompare.lang + '_alias'];
                                try {
                                    // If the type is a table, change/add the right alias based on the language
                                    if ( json.objects[i].type == 'table') {
                                        // TODO: if alias is null check the column name?
                                        if (select.alias.indexOf('$CHANGE') != -1)
                                            select.alias = select[FAOSTATCompare.lang + '_alias'];
                                        else
                                            select.alias = $.i18n.prop('_' + select.alias.toLowerCase().replace(/[0-9]/g, ''));
                                    }
                                }
                                catch (e) {

                                }
                            }
                            /** TODO: add the change alias dynamically also here? **/
                            if (json.objects[i].sqls[k].sql.groupBys != null) {
                                for (var j = 0 ; j < json.objects[i].sqls[k].sql.groupBys.length ; j++) {
                                    var groupBy = json.objects[i].sqls[k].sql.groupBys[j];
                                    if (groupBy.column.indexOf('_$LANG') != -1)
                                        groupBy.column = CompareUtils.replaceAll(groupBy.column, '_$LANG', FAOSTATCompare.lang)
                                }
                            }
                            if (json.objects[i].sqls[k].sql.orderBys != null) {
                                for (var j = 0 ; j < json.objects[i].sqls[k].sql.orderBys.length ; j++) {
                                    var orderBy = json.objects[i].sqls[k].sql.orderBys[j];
                                    if (orderBy.column.indexOf('_$LANG') != -1)
                                        orderBy.column = CompareUtils.replaceAll(orderBy.column, '_$LANG', FAOSTATCompare.lang)
                                }
                            }
                        }
                    }

                }
            }
            return json;
        }


    };

}