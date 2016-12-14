// jQuery table plugin.

// Calls on a table
// sortFunctions: Sort functions for datatypes.

(function ($) {

    // Returns the resulting indices of a sort so result can be applied elsewhere (to other columns). 
    // returns array of index numbers. 
    // return[0] = a;    means "arr's 0th element is now at a"

    $.fn.sort_map = function (arr, sortFunction, reverseColumn, isReSort, sortOrder) {
        var map = [];
        var index = 0;

        var sorted;
        //        if (reverseColumn) {
        //            for (var i = arr.length - 1; i >= 0; i--) {
        //                map.push(i);
        //            }
        //        } else

        {

            sorted = arr.slice(0).sort(sortFunction);   // First, sort ascending
            // check sorting order
            if (sortOrder === $.fn.sortTable.dir.DESC) {
                sorted = sorted.reverse();
            }
            //sorted = isReSort == true ? arr.slice(0).sort(sortFunction).reverse() : arr.slice(0).sort(sortFunction);
            for (var i = 0; i < arr.length; i++) {
                index = $.inArray(arr[i], sorted);

                // if index already present in the map then look for the next index.
                // case of duplicate entries will be handled here.
                while ($.inArray(index, map) != -1) {
                    index++;
                }
                map.push(index);
            }

        }

        return map;
    };


    // apply sort_map to the array
    $.fn.apply_sort_map = function (arr, map) {
        var clone = arr.slice(0), newIndex = 0;
        for (var i = 0; i < map.length; i++) {
            newIndex = map[i];
            clone[newIndex] = arr[i];
        }
        return clone;
    };


    $.fn.sortTable = function (sortFunctions) {
        return this.each(function () {
            var $table = $(this);

            sortFunctions = sortFunctions || {};

            // Utitlity Functions


            // begin execution
            // bind event only on those THs which contain data-sort attribute.
            // do sorting when THs are clicked / entered
            $table.find('th[data-sort]').children('a').bind("click ", function (e) {//"th",  CHANGED


                //if ((e.type == "click") || (e.keyCode != undefined && e.keyCode == 13)) 
                {
                    var isReSort = false;
                    var columnToSort = $(this).parent('th'); // get the parent <th> of anchor tag to provide it as column to sort.
                    $.fn.sortsTable($table, columnToSort, sortFunctions, isReSort);

                }
            });


        });
    };


    // actual sorting is carried here.

    $.fn.sortsTable = function (tableToSort, columnToSort, sortFunctions, isResort) {



        var $this = columnToSort; // current Header column.
        var $table = tableToSort;


        //Merge sort functions with default functions
        sortFunctions = $.extend({}, $.fn.sortTable.default_sort_functions, sortFunctions);


        if ($this !== undefined && $table !== undefined) {
            var tr_all = $table.children('tbody').children('tr'); // obtains all the records from table.
            var trRheaMetadata = tr_all.find('.rhea-metadata'); // only get records that have class 'rhea-metadata' so they can be appended later. 
            tr_all = tr_all.not('.rhea-metadata');      // do not get records that have class 'rhea-metadata'.
            //var $this = $(this); 

            var th_index = 0;
            var direction = $.fn.sortTable.dir;

            // Get <th>'s
            var tableheaders = $table.find('th'); // Assumes there is only one <tr> in <thead>

            // check for multiple <tr> in <thead> (normally there's just 1 but at most there can be 2 which is for the outcome tracker)
            var theadTR_all = $table.find('thead tr');

            if (theadTR_all[1] != null)
            {
                // Found 2 <tr> in <thead> so get only the <th>'s from the second row
                tableheaders = $(theadTR_all[1]).find('th');
            }

            tableheaders.slice(0, $($this).index()).each(function () {        // determines the index of current column.
                var columns = $(this).attr('colspan') || 1;
                th_index += parseInt(columns, 10);
            });

            // Determine (and/ or reverse) sorting order, default 'ascending'
            var sortOrder = $($this).data('sort-dir') === direction.ASC ? direction.DESC : direction.ASC;

            if (isResort == true) {  // don't change the sort order for re-sorting
                sortOrder = $($this).data('sort-dir') === direction.ASC ? direction.ASC : direction.DESC;
            }

            // choose approperiate sorting function. If sorting in descending order, check for 'data-sort-desc' attribute.
            if (sortOrder == direction.DESC) {
                var type = $($this).data('sort-desc') || $($this).data('sort') || null;
            } else {
                var type = $($this).data('sort') || null;
            }



            // prevent sorting if no type defined.
            if (type === null) {
                return;
            }

            // Trigger 'beforetablesort' event that calling scripts can hook into;
            // pass paramters for sorted column index and sortingOrder
            $table.trigger('beforetablesort', { column: th_index, direction: sortOrder });

            // more reliable method of forcing the re-draw
            $table.css('display');
            $.blockUI($.zeusValidate.blockUIoptions);

            // Run sorting asynchronously on a timeout to force browser re-draw after 'beforetablesort' callback.
            // Also avoids locking up the browser.

            //setTimeout(function ()
                {
                // get the elements for this column
                var column = [];
                var sortMethod = sortFunctions[type];

                // push either the value of the 'data-order-by' attribute if specified or
                // just the text() value in this column to column[] for comparison.
                tr_all.each(function (index, tr) {
                    var $e = $(tr).children().eq(th_index);
                    var sortValue = $e.data('sort-value');
                    var orderBy = typeof (sortValue) !== 'undefined' ? sortValue : $e.text();
                    column.push(orderBy);
                });

                // Create the sort map. This column having a sort-dir implies it was the last column sorted.
                // As long as no data-sort-desc is specified, column can just be reversed.
                var reverseColumn = !!$($this).data('sort-dir') && !$($this).data('sort-desc');
                if (isResort == true) {
                    reverseColumn = false;   // always set reverseColumn to false if re-sorting.
                }
                var theMap = $.fn.sort_map(column, sortMethod, reverseColumn, isResort, sortOrder);

                // Reset siblings i.e. remove info such as sorting direction from all thable headers.
                $table.find('th').data('sort-dir', null).removeClass('sorting-desc sorting-asc');
                // add sorting info into current column.
                $($this).data('sort-dir', sortOrder).addClass('sorting-' + sortOrder);

                // Replace the content of tbody with the sortedTRs. using .Append achieves this.
                var sortedTRs = $($.fn.apply_sort_map(tr_all, theMap));

                // Append rhea-metadata rows. 
                sortedTRs.append(trRheaMetadata);

                /*
                // Loop through all the sortedTRs to remove white-space which causes I.E. to shift cells.
                if (jQuery.browser.msie && jQuery.browser.version === "9.0") {
                sortedTRs.each(function () {
                var expr = new RegExp('>[ \t\r\n\v\f]*<', 'g');
                $(this)[0].innerHTML = $(this)[0].innerHTML.replace(expr, '><'); 
                //$(this).innerHTML = $(this)[0].innerHTML.replace(/>\sortOrder+(?=<\/?(t|ctx)[hardfob])/gm, '>');
                });
                // sortedTRs = //$(sortedTRs).replace(/>\sortOrder+(?=<\/?(t|ctx)[hardfob])/gm, '>');
                }

                 OR 

                 var expression = new RegExp('>[ \t\r\n\v\f]*<', 'g');
                    document.body.innerHTML = document.body.innerHTML.replace(expression, '><');
                */

                $table.children('tbody').append(sortedTRs);

                var expr = new RegExp('>[ \t\r\n\v\f]*<', 'g');

                //$table.html( $table.html().replace(expr, '><'));


                // Trigger 'aftertablesort' event, similar to 'beforetablesort'
                $table.trigger('aftertablesort', { column: th_index, direction: sortOrder });
                // More reliable method of forcing a re-draw
                $table.css('display');
                $.unblockUI();

            }
            //, 1);


        }
    };

    // Enum containing sorting directions
    $.fn.sortTable.dir = { ASC: 'asc', DESC: 'desc' };

    // default sort functions
    $.fn.sortTable.default_sort_functions =
        {
            'int': function (a, b) {
                var aInt = parseInt(a, 10);
                var bInt = parseInt(b, 10);

                if (isNaN(aInt)) {
                    aInt = 0;
                }

                if (isNaN(bInt)) {
                    bInt = 0;
                }

                return aInt - bInt;
            },
            'float': function (a, b) {
                var aFloat = parseFloat(a);
                var bFloat = parseFloat(b);

                if (isNaN(aFloat)) {
                    aFloat = 0;
                }

                if (isNaN(bFloat)) {
                    bFloat = 0;
                }
                return aFloat - bFloat;
            },
            'string': function (a, b) {

                //Regex for removing punctuation marks for comparison
                a = a.toLowerCase().replace(/[^a-z0-9]/gi, '').replace(/[_\s]/g, '-');
                // pattern will filter the string down to just alphanumeric values and second part would replace underscores and spaces with hyphans.
                b = b.toLowerCase().replace(/[^a-z0-9]/gi, '').replace(/[_\s]/g, '-');
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            },
            'string-ins': function (a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            },
            "date": function (a, b) {
                // get values for comparison.
                var aDateValue = $.fn.sortTable.getDateDDMMYYYY(a);
                var bDateValue = $.fn.sortTable.getDateDDMMYYYY(b);
                return aDateValue - bDateValue;
            }

        };

    $.fn.sortTable.dateFromString = function (stringValue) {
        // for date pattern:  December 30, 2012
        var months = ["january", "february", "march", , "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        var pattern = "^([a-zA-Z]{3})\\s*(\\d{1,2}),\\s*(\\d{4})$"; //regEx
        var regexPattern = RegExp(pattern);
        var dateParts = regexPattern.exec(stringValue).slice(1);
        var year = dateParts[2];
        var month = $.inArray(dateParts[0].toLowerCase(), months);
        var day = dateParts[1];
        return new Date(year, month, day);
    };

    $.fn.sortTable.getDateDDMMYYYY = function (stringValue) {
        // for date pattern 01/01/1111
        return Date.parse(stringValue);
    };

})(jQuery);