var CompareUIBuilderTable = function() {

    var result = {

        objStructure : '<div class="obj-box">' +

                        ' <div id="obj_header_REPLACE" class="obj-box-header">' +

                            '<div class="obj-box-header-text">' +
                                '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
                                '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
                            '</div>' +

                            '<div class="obj-box-icons">' +
                                '<div class="obj-box-icon export-icon" id="obj_export_REPLACE"></div>' +
                             '</div>' +

                        '</div>' +

                        '<div id="REPLACE"></div> ' +

                        '</div>',


        counter : 0,
        series :new Array(),

        tableDataSource: '',
        dataAdapter: '',
        height: '800px',
        autoheight: false,

        obj: '',

        appendObj : function(obj) {
            this.obj = obj;

            var suffix = obj.object_parameters.renderTo;

            var s = CompareUtils.replaceAll(this.objStructure, 'REPLACE', suffix);
            $('#content_' + suffix).append(s);

            // Loading image
            document.getElementById(suffix).innerHTML = "<div style='height:"+ this.height+"'><img src='"+ FAOSTATCompare.prefix +'images/loading.gif' +"'></div>";


//            UIUtils.fullscreen("content_" + obj.object_parameters.renderTo, 'content_' + obj.object_parameters.renderTo);

            /** Test WDS */
            this.queryDBAndCreateobj();


            document.getElementById('obj_export_' + suffix).title = $.i18n.prop('_export');
            $('#obj_export_' + suffix).powerTip({placement: 's'});

            $("#obj_export_" + suffix).click(function () {
                $("#" + suffix).jqxGrid('exportdata', 'csv', suffix );
            });

            /** Other unsed export functions **/
            /*$("#xmlExport").click(function () {
                $("#jqxgrid").jqxGrid('exportdata', 'xml', obj.object_parameters.renderTo);
            });
            $("#csvExport").click(function () {
                $("#" + obj.object_parameters.renderTo ).jqxGrid('exportdata', 'csv', obj.object_parameters.renderTo );
            });
            $("#tsvExport").click(function () {
                $("#jqxgrid").jqxGrid('exportdata', 'tsv', obj.object_parameters.renderTo);
            });
            $("#htmlExport").click(function () {
                $("#" + obj.object_parameters.renderTo ).jqxGrid('exportdata', 'html', obj.object_parameters.renderTo );
            });
            $("#jsonExport").click(function () {
                $("#" + obj.object_parameters.renderTo ).jqxGrid('exportdata', 'json', obj.object_parameters.renderTo );
            });*/

        },

        queryDBAndCreateobj : function() {
            // initialization counter
            this.counter = 0;
            this.series  = new Array([this.obj.sqls.length]);

            // getting the series
            for (var i=0; i< this.obj.sqls.length; i < i++) {

                var data = {};
                data.datasource = FAOSTATCompare.datasource;
                data.thousandSeparator = ',';
                data.decimalSeparator = '.';
                data.decimalNumbers = '2';
                data.json = JSON.stringify(this.obj.sqls[i].sql);
                data.cssFilename = 'faostat';

                var _this = this;
                /** TODO: push the array series in an ordered way **/
                $.ajax({
                    type : 'POST',
                    url : 'http://' + FAOSTATCompare.baseurl + '/wds/rest/table/json',
                    data : data,

                    success : function(response) {           ;

                        _this.counter++;
                        _this.series.push(response);

                        if (  _this.counter >= _this.obj.sqls.length ) {

//                            document.getElementById(_this.obj.object_parameters.renderTo).

                            _this.queryDBandTable(_this.obj, 'line', _this.series )
                        }

                    },
                    error : function(err, b, c) {     }
                });
            }

        },

        queryDBandTable : function(obj, type, s) {
            var data = []  ;
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

            // test if the row are minus than 30 set the table to dynamically resize **/
            if ( data.length < 30 ) {
               this.height = '';
               this.autoheight = true;
            }


            this.updateTable(data);
        },

        updateTable : function(json) {

            // prepare the data
            this.tableDataSource = {
                datatype : "json",
                datafields : [ {
                    name : '0',
                    type : 'string'
                }, {
                    name : '1',
                    type : 'string'
                }, {
                    name : '2',
                    type : 'string'
                }, {
                    name : '3',
                    type : 'string'
                }, {
                    name : '4',
                    type : 'double'
                }, {
                    name : '5',
                    type : 'string'
                }
                ],
                localdata: json

            };

            this.dataAdapter = new $.jqx.dataAdapter(this.tableDataSource);

            this.createTable();

        },


        /** TODO: internazionalization of the columns's names **/
        createTable: function() {

            $("#"+ this.obj.object_parameters.renderTo).jqxGrid({
                width : "920px",
                height: this.height,
				autoheight : this.autoheight,
                source : this.dataAdapter,
                columnsresize : true,
                sortable : true,
                filterable : true,
                pageable : false,
                groupable : true,
                showfilterrow: true,
                pagesize : 20,
                pagesizeoptions : [ '20', '50', '100' ],
                showfiltercolumnbackground : true,
                autoshowfiltericon : false,
                columns : [ {
                    text : 'Area',
                    datafield : '0',
                    filtertype : 'checkedlist',
                    filtercondition : 'contains',
                    width: 155
                }, {
                    text : 'Item',
                    datafield : '1',
                    filtertype : 'checkedlist',
                    filtercondition : 'contains',
                    width: 155
                }, {
                    text : 'Element',
                    datafield : '2',
                    filtertype : 'checkedlist',
                    filtercondition : 'contains',
                    width: 155
                }, {
                    text : 'Year',
                    datafield : '3',
                    filtertype : 'checkedlist',
                    filtercondition : 'contains',
                    width: 155
                }, {
                    text : 'Value',
                    datafield : '4',
                    width: 155
                }, {
                    text : 'Measurement Unit',
                    filtertype : 'checkedlist',
                    filtercondition : 'contains',
                    datafield : '5'
                }
                ]
            });
        }


    };


    return result;
};