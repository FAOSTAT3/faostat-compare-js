var CompareUIBuilderSelectors = function() {

    var result = {

        index: '',

        suffix: '',

        sql: '',

        ddWidth: 150,

        ddHeight: '21px',

        ddYearsWidth: 125,

        isOpen: true,

        isEnabled: true,

        init: function(suffix, index) {
            var _this = this;
            this.suffix = suffix;
            this.index = index;

            $.getJSON(FAOSTATCompare.prefix + 'resources/sql_chart_all.json', function(data) {
                data = CompareI18NInjector.injectLanguage(data);
                _this.sql = data;
            });

            /**
             * Load the interface HTML and replace the ID's
             */
            $('#compare_selectors_' + suffix).append(FAOSTATCompare.selectorsUI);

            // this on replaces the default selectors
            this.replaceIDs(suffix);


            // this on load the summary
/*            $('#compare_selectors_summary_' + suffix).load(FAOSTATCompare.prefix + 'selector_summary.html', function() {
                _this.replaceIDs(suffix);
            });*/
        },

        replaceIDs: function(suffix) {
            this.suffix = suffix;
            /**
             * Change ID's suffix with the user's one
             */
            var ids = $('[id$="_REPLACE"]');
            for (var i = 0 ; i < ids.length ; i++) {
                var old = ids[i].id;
                var id = old.substring(0, old.indexOf('_REPLACE')) + '_' + suffix;
                $('#' + ids[i].id).attr('id', id);
            }

            this.loadUI(suffix);
        },

        loadUI: function(suffix) {
            var _this = this;

            // add multilingual
            $("#compare_title_index_" + suffix).append(this.index);


            // slide toggle of the summary panel
            $("#compare_title_showhide_summary_" + suffix).on('click', function () {
                $("#compare_selectors_summary_" + suffix).slideToggle();
            });

            // slide toggle of the selector panel
            $("#compare_showhide_" + suffix).on('click', function () {
                //_this.showHideSelectorContent();
                _this.showHideSelector();
            });


            $("#selector_main_" + suffix).hover(function () {
                     _this.showHideSelectorContentHover(true);
                }, function () {
                     _this.showHideSelectorContentHover(false);
            });


            var _this = this;
            $('#compare_remove_' + suffix).on('click', function () {
                _this.removeSelector();
            });
            $('#compare_enabledisable_' + suffix).on('click', function () {
                _this.disableSelectorToggle();
            });


/*            $('#selector_minorof_' + suffix).jqxNumberInput({ width: '100', theme: FAOSTATCompare.theme });
            $('#selector_greaterthan_' + suffix).jqxNumberInput({ width: '100', theme: FAOSTATCompare.theme });*/

            // syncronization
            $('#selector_area_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_area');});
            $('#selector_elementlist_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_elementlist');});
            $('#selector_item_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_item');});


            /**
             * Initiate the combos
             */
            this.populateGroup();
        },

        showHideSelector:function() {
            this.isOpen = !this.isOpen;
            if ( this.isOpen ) {
                $("#selector_" + this.suffix).slideDown();
                $("#compare_selectors_summary_" + this.suffix).slideDown();
            }
            else {
                $("#selector_" + this.suffix).slideUp();
                $("#compare_selectors_summary_" + this.suffix).slideUp();
            }
            this.showHideSelectorContentHover(true);
        },

        bindElements: function() {
            $('#selector_area_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_area');});
            $('#selector_elementlist_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_elementlist');});
            $('#selector_item_synchronize_' + suffix).on('click', function () {_this.synchronizeObject('selector_item');});
        },

        showHideSelectorContentHover: function(isHover) {
            this.removeStyleToshowHide();
            if ( isHover) {
                // showhide
                if ( !this.isOpen )
                    $("#compare_showhide_" + this.suffix).addClass('compare-showhide-down-over');
                else
                    $("#compare_showhide_" + this.suffix).addClass('compare-showhide-up-over');

                // remove
                $("#compare_remove_" + this.suffix).addClass('compare-remove-over');

                // enable/disable
                if ( this.isEnabled )
                    $("#compare_enabledisable_" + this.suffix).addClass('compare-enable-over');
                else
                    $("#compare_enabledisable_" + this.suffix).addClass('compare-disable-over');
            }
            else {
                // showhide
                if ( !this.isOpen )
                    $("#compare_showhide_" + this.suffix).addClass('compare-showhide-down-none');
                else
                    $("#compare_showhide_" + this.suffix).addClass('compare-showhide-up-none');

                // remove
                $("#compare_remove_" + this.suffix).addClass('compare-remove-none');

                // enable/disable
                if ( this.isEnabled )
                    $("#compare_enabledisable_" + this.suffix).addClass('compare-enable-none');
                else
                    $("#compare_enabledisable_" + this.suffix).addClass('compare-disable-none');
            }
        },

        removeStyleToshowHide:function() {
            $("#compare_showhide_" + this.suffix).removeClass('compare-showhide-up-over');
            $("#compare_showhide_" + this.suffix).removeClass('compare-showhide-down-none');
            $("#compare_showhide_" + this.suffix).removeClass('compare-showhide-up-none');
            $("#compare_showhide_" + this.suffix).removeClass('compare-showhide-down-over');

            $("#compare_enabledisable_" + this.suffix).removeClass('compare-enable-over');
            $("#compare_enabledisable_" + this.suffix).removeClass('compare-enable-none');
            $("#compare_enabledisable_" + this.suffix).removeClass('compare-disable-none');
            $("#compare_enabledisable_" + this.suffix).removeClass('compare-disable-over');

            $("#compare_remove_" + this.suffix).removeClass('compare-remove-over');
            $("#compare_remove_" + this.suffix).removeClass('compare-remove-none');
        },

        populateGroup: function () {
            var query = 'SELECT GroupCode, GroupName' + FAOSTATCompare.lang +
                ' FROM Domain ' +
                ' GROUP BY GroupCode, GroupName'  + FAOSTATCompare.lang + ', Ord ' +
                ' ORDER BY Ord, GroupName'  + FAOSTATCompare.lang;
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';

            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);

                    var data = [];
                    var selectedIndex = 0;
                    var current = '';
                    for (var i = 0 ; i < json.length ; i++) {
                        // this is used as blacklist
                        // TODO: make a configurable blacklist file
                        // TODO: remove trade matrix etc
                        if ( json[i][0] != 'Z') {
                            if ( current != json[i][0]) {
                                current =  json[i][0];
                                var tmp = {};
                                tmp.code = json[i][0];
                                tmp.label = json[i][1];
                                data.push(tmp);
                            }
                        }
                    }


                    // inizialize combo
                    $('#selector_group_' + _this.suffix).jqxComboBox({ source: data, selectedIndex: selectedIndex, width: _this.ddWidth, height: _this.ddHeight, theme: FAOSTATCompare.theme });

                    // update grounp
                    _this.populateDomain(data[selectedIndex].code);

                    // update group con selection change
                    $('#selector_group_' + _this.suffix).on('change', function (event) {
                        var args = event.args;
                        if (args) {
                            var item = args.item;
                            _this.populateDomain(item.originalItem.code);
                            // update summary
                            FAOSTATCompare.updateSummary('selector_group', _this, item.originalItem);
                        }
                    });

                    // update summary
                    FAOSTATCompare.updateSummary('selector_group', _this, data[selectedIndex]);
                },
                error : function(err, b, c) {
                    alert(err + ' | ' + b + ' | ' + c)
                }
            });
        },

        updateHeaderTitle: function() {

            var domain = $('#selector_domain_' + this.suffix).jqxComboBox('getSelectedItem');
            var domainname =  domain.originalItem.label;

            var group = $('#selector_group_' + this.suffix).jqxComboBox('getSelectedItem');
            var groupname =  group.originalItem.label;

            $('#compare_title_' + this.suffix).empty();
            var gn = '<div class="compare-title compare-title-group">'+ groupname +'</div>'
            var dn = '<div class="compare-title compare-title-domain">'+ domainname +'</div>'
            $('#compare_title_' + this.suffix).append(gn + ' - ' + dn) ;


        },

        populateDomain: function (groupcode) {
            var query = "SELECT DomainCode, DomainName" + FAOSTATCompare.lang + ', Ord ' +
                " FROM Domain " +
                " WHERE GroupCode IN('" + groupcode + "') " +
                " GROUP BY DomainCode, DomainName"  + FAOSTATCompare.lang  + ', Ord ' +
                " ORDER BY Ord, DomainName"  + FAOSTATCompare.lang;
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';


            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);
                    var data = [];
                    var selectedIndex = 0;
                    for (var i = 0 ; i < json.length ; i++) {
                        var tmp = {};
                        tmp.code = json[i][0];
                        tmp.label = json[i][1];
                        data.push(tmp);
                    }

                    $('#selector_domain_' + _this.suffix).jqxComboBox({  source: data, selectedIndex: selectedIndex, width: _this.ddWidth, height: _this.ddHeight,theme: FAOSTATCompare.theme});

                    _this.populateItem(data[selectedIndex].code);
                    _this.populateElemenList(data[selectedIndex].code);
                    _this.populateCountries(data[selectedIndex].code);
                    _this.populateYears(data[selectedIndex].code);

                    $('#selector_domain_' + _this.suffix).on('change', function (event) {
                        var args = event.args;
                        if (args) {
                            var item = args.item;

                            // update summary
                            FAOSTATCompare.updateSummary('selector_domain', _this, item.originalItem);

                            _this.populateItem(item.originalItem.code);
                            _this.populateElemenList(item.originalItem.code);
                            _this.populateCountries(item.originalItem.code);
                            _this.populateYears(item.originalItem.code);

                            _this.updateHeaderTitle();
                        }
                    });

                    // update summary
                    FAOSTATCompare.updateSummary('selector_domain', _this, data[selectedIndex]);
                    _this.updateHeaderTitle();

                },
                error : function(err, b, c) {
                }
            });
        },


        populateItem: function (domaincode) {

            var query = "SELECT I.Itemcode, I.Itemname" + FAOSTATCompare.lang +
                " FROM DomainItem DI, Item I " +
                " WHERE DI.ItemCode = I.ItemCode " +
                " AND DI.DomainCode IN('" + domaincode + "') " +
                " GROUP BY I.Itemcode, I.Itemname" + FAOSTATCompare.lang +
                " ORDER BY I.Itemname"  + FAOSTATCompare.lang;
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';

            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    _this.populateCheckBoxSelector('selector_item', response, _this.ddWidth);
                },
                error : function(err, b, c) {

                }
            });
        },

        populateElemenList: function (domaincode) {

            var query = "SELECT E.elementlistcode, E.elementlistname" + FAOSTATCompare.lang +
                " FROM DomainElement DE, Element E " +
                " WHERE DE.elementcode = E.elementcode " +
                " AND DE.DomainCode IN('" + domaincode + "') " +
                " GROUP BY E.elementlistcode, E.elementlistname" + FAOSTATCompare.lang +
                " ORDER BY E.elementlistname"  + FAOSTATCompare.lang;
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';

            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    _this.populateCheckBoxSelector('selector_elementlist', response, _this.ddWidth);
                },
                error : function(err, b, c) {

                }
            });
        },

        populateCountries: function (domaincode) {

            var query = "SELECT DISTINCT A.Areacode, A.Areaname" + FAOSTATCompare.lang +
                " FROM DomainAreaList AS DA, Area AS A  " +
                " WHERE DA.DomainCode IN('" + domaincode + "') " +
                " AND (A.AreaCode = DA.AreaCode )" +
                " ORDER BY A.Areaname"  + FAOSTATCompare.lang + " ASC";
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';

            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    _this.populateCheckBoxSelector('selector_area', response, _this.ddWidth);
                },
                error : function(err, b, c) {

                }
            });
        },

        populateYears: function (domaincode) {

            var query = "SELECT D.StartYear, D.Endyear " +
                " FROM Domain D " +
                " WHERE D.DomainCode IN('" + domaincode + "') " +
                " GROUP BY D.StartYear, D.Endyear ";
            query = query.replace(/\n/g, ' ');

            var data = {};
            var sql = {};

            sql.limit = null;
            sql.query = query;
            sql.frequency = "NONE";

            data.datasource = FAOSTATCompare.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(sql);
            data.cssFilename = 'faostat';

            var _this = this;
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    var r = response;
                    if (typeof r == 'string')    {
                        r = $.parseJSON(response);
                    }

                    var json = [];
                    for(var i=r[0][1]; i>=r[0][0]; i--) {
                        var a = [''+i + '','' + i + ''];
                        json.push(a);
                    }
                    // create dates
                    _this.populateCheckBoxSelector('selector_year', json, _this.ddYearsWidth);

                    // select latest 10 years by default
                    //for(var i=0 ; i <10; i++ )
                    for(var i=0 ; i <10; i++ )
                        $('#selector_year_' + _this.suffix).jqxComboBox('checkIndex', i);

                    // update summary after the default years are set
                    FAOSTATCompare.updateSummary('selector_year', _this, $('#selector_year_' + _this.suffix).jqxComboBox('getCheckedItems'));
                },
                error : function(err, b, c) {

                }
            });
        },

        populateCheckBoxSelector: function(id, response, width) {

            var comboID = id + "_" + this.suffix;
            var summaryID  = id + "_summary_" + this.suffix;

            var json = response;
            if (typeof json == 'string')    {
                json = $.parseJSON(response);
            }

            var data = new Array();
            var selectedIndex = 0;
            for (var i = 0 ; i < json.length ; i++) {
                var row = {};
                row["code"] =  json[i][0];
                row["label"] = json[i][1];
                data[i] = row;
            }

            var source = {
                localdata: data,
                datatype: "array"
            };
            var dataAdapter = new $.jqx.dataAdapter(source);

            $('#' + comboID).jqxComboBox({checkboxes: true,source: dataAdapter, displayMember: "label",valueMember: "code", width: width,height: this.ddHeight, theme:  FAOSTATCompare.theme});

            $('#' + comboID).jqxComboBox('checkIndex', 0);

            // update summary
            FAOSTATCompare.updateSummary(id, this,  $("#"+ comboID).jqxComboBox('getCheckedItems'));

            var _this = this;
            $('#' + comboID).on('checkChange', function (event){
                // TODO: should be passed just the value to update
                FAOSTATCompare.updateSummary(id, _this, $("#"+ comboID).jqxComboBox('getCheckedItems'));

                // TODO: update the chart as well?
                // FAOSTATCompare.compare();
            });
        },

        removeSelector: function() {

            FAOSTATCompare.removeSelector(this.suffix);

            // if the box was not enabled, compare everything again after the remove of the box
            if ( !this.isEnabled)
                FAOSTATCompare.compare();
        },

        uncheckItem: function(id, item) {

        },

        disableSelectorToggle: function() {
            this.isEnabled = !this.isEnabled;

            // div used to disable the selectors
            if ( this.isEnabled )
                $("#selector_disable_" + this.suffix).removeClass('compare-disable second-level');
            else
                $("#selector_disable_" + this.suffix).addClass(' compare-disable second-level');


            this.showHideSelectorContentHover(true);
            FAOSTATCompare.compare();
        },

        // this method is called to synchronize the comboboxes among the selectors
        synchronizeObject: function(type) {
            // get all selected values
            var id = "#"+ type + '_' + this.suffix;
            var values = $("#"+ type + '_' + this.suffix).jqxComboBox('getCheckedItems');
            // call the sync method
            FAOSTATCompare.synchronizeSelectors(this.suffix, type, values);
        }

    };
    return result;
};