/*
filterTable: jQuery plugin to allow filtering of the table.

Author: Nikhil Deshpande

Requires: jQuery 1.8 or higher

Usage: Apply the filterTable() on the jQuery table object that requires filtering.

Options:

// List all the options.
****************************************************************
Option_Name                 DEFAULT                 DESCRIPTION
****************************************************************
placeInsideTable:           false                   Whether to place filter input inside table or outside.
columnNameAttribute         OPTIONAL                MUST BE SPECIFIED if placeInsideTable is true, e.g. <th data-col-name='ColumnY'>
columnHeadingSelector       OPTIONAL                placeInsideTable MUST BE TRUE. If supplied, only these columns will contain filter text-field e.g. 'th[filtering-allowed=true]'.
labelText:                  Filter:                 label Text
labelHiddenText:            labelText               Hidden text and ALT text for <input>.
searchResultText:           default-->              {0} record(s) matched out of {1}
searchForComplexCells:      false                   Whether to search through the table cells that contain other html form elements.
hightlight:                 false                   Whether to highlight matched text. Only allowed if 'searchForComplexCells' is false.
matchFirstOccurrenceOnly:   true                    Whether to ignore other table cells if one is matched in the given row.
escapeToClear:              true                    Whether Escape key clears the filter text and restores the table.
ignoreHiddenElements:       true                    Whether to skip the hidden rows and cells while searching.
contentChangedEvent:        table-content-changed   When this event triggers, grid is filtered again.
filterCompletedEvent:       table-filtered          When table is filtered, this event is triggered.
filterAction:               OPTIONAL                When supplied, filtering will be done using AJAX call to this action which is expected to return records.
filterActionParameters:     OPTIONAL                If filterAction is supplied, then this value must be an array containing parameters that will be supplied to filterAction.
headers:                    OPTIONAL                If filterAction is supplied, the value will be passed as header to AJAX call.
inputFieldCSS:              zeus-grid-filter        Class on input field. Multiple class can be supplied separated by space.
animation:                  false                   Whether to show fade effect when filtering is completed.

----------------------------------------------


API

filterAction:
    Your filterAction at minimum must accept a parameter of string type that will be populated based on search value entered.
    
            public ActionResult FilterClaims(ClaimMetadata metadata, string filterValues){}

    In action in example above, accepts an additional metadata property which is passed because it is specified in 'filterActionParameters'.




*/



$.fn.filterTable = function(_options) {

    $.fn.filterTable.defaultOptions = {
        placeInsideTable: false,
        columnHeadingSelector: undefined,
        labelText: 'Filter:',
        labelHiddenText: 'Type search text and press Enter',
        searchResultText: ' record(s) matched out of ',
        searchForComplexCells: false,
        hightlight: false,
        matchFirstOccurrenceOnly: true,
        escapeToClear: true,
        animation: false,
        ignoreHiddenElements: true,
        contentChangedEvent: 'table-content-changed',
        filterCompletedEvent: 'table-filtered',
        hiddenClass: 'zeus-filter-hide',
        inputFieldCSS: 'zeus-grid-filter',
        filterAction: undefined,
        filterActionParameters: undefined,
        headers: undefined,
        columnNameAttribute: undefined
    };

    if (!_options) {
        _options = $.fn.filterTable.defaultOptions;
    } else {
        _options = $.extend($.fn.filterTable.defaultOptions, _options);
    }

    // Set dependencies:
    if (_options.searchForComplexCells) {
        _options.hightlight = false;
    }

    var table = $(this);
    var thead = table.find('thead')
    var tableBody = table.find('tbody');
    var tableBodyBackup = tableBody.html();
    var id = 'filter-' + table.attr('id');
    var label = $('<label for=' + id + '>' + _options.labelText + '<span class="sr-only">' + _options.labelHiddenText + '</span></label>');
    var filterField = $("<input maxlength='50' placeholder='" + _options.labelHiddenText + "' class='form-control " + _options.inputFieldCSS + "' id=filter-" + id + " type=text  value=''>");
    var searchIcon = '';//$("<div class='input-group-addon' aria-hidden='true'>$</div>");
    var searchResultSpan = $("<span class='search-result-text'>");
    var inputGroup = $("<div class='form-group'>").prepend(searchResultSpan).prepend(filterField).prepend(label);
    var isSeverSideSearch = false;
    var filteredCellAttribute = 'zeus-filtered';
    var formFieldContainer = $("<div class='form-inline'>").prepend(inputGroup);
    var tableFiltered = false; // a flag that indicates whether table has been filtered or restored.
    var filterCriteria = ''; // the field stores the last text entered for filter. When then compare this value when filtering to ensure that we don't filter on same text again.

    // Placement
    if (_options.placeInsideTable) {
        var tableHeader = thead.find('tr').first();
        var columns = tableHeader.find('th');
        if (isNotUndefinedNorEmpty(_options.columnHeadingSelector)) {
            columns = tableHeader.find(_options.columnHeadingSelector);
        }
        inputGroup.find(searchResultSpan).remove();
        table.before(searchResultSpan);
        columns.each(function () {
            var col = $(this);
            var copy = formFieldContainer;
            // update ID and label.
            var newid = id + '-' + col.attr(_options.columnNameAttribute);
            copy.find('input').attr('id', newid);
            copy.find('label').attr('for', newid);
            col.html(col.html() + copy[0].outerHTML);
        });
            
        //var filterRow = $('<tr><th>' + _options.labelText + '</th><th colspan=' + (tableHeader.find('th:not(.hidden)').length - 1) + '>' + '</th></tr>');
        //filterRow.find('th[colspan]').prepend(searchResultSpan).prepend(filterField);
        //filterRow.appendTo(thead);
    } else {
        formFieldContainer.insertBefore(table);
    }

    // Bind events
    var input = _options.placeInsideTable ? table.find('input.'+_options.inputFieldCSS) : filterField;
    input.off('keydown.zeus-grid-filter-enter');
    input.on('keydown.zeus-grid-filter-enter', function (e) {
        var input = $(this);
        if (e.keyCode == 13 || e.keyCode == 10) {
            e.preventDefault();
            e.stopPropagation();
            var searchText = input.val();
            if (filterCriteria != searchText) { // ensure that we do not apply filter if the value in the text field matches the previous filter text.
                filter(searchText);
            }
        } else if (_options.escapeToClear && e.keyCode == 27) {
            // Handle escape so it clears the text and restores the table.
            restoreTable();
            input.val('');
        }

    });
    input.off('input.zeus-grid-filter-input');
    input.on('input.zeus-grid-filter-input', function (e) {
        // When user presses backspace and empties the search field.
        if (filterField.val() == '') {
            restoreTable();
        }
    });

    // Bind to contentChangedEvent
    if (isNotUndefinedNorEmpty(_options.contentChangedEvent)) {
        table.off(_options.contentChangedEvent);
        table.on(_options.contentChangedEvent, filter);
    }

    // This method gets fired when '_options.contentChangedEvent' is fired. Therefore it should not really take any parameters. Previously we had 'searchText' as a parameter,
    // but the value for this parameters comes to be of type object, when the event is triggered. We will always obtain value from the field.
    function filter() {
        var searchText = filterField.val();        
        if (isNotUndefinedNorEmpty(searchText)) {            
            searchResultSpan.text('Filtering....');
            if (_options.animation) {
                table.hide();
            }
            setTimeout(function () {
                if (isNotUndefinedNorEmpty(_options.filterAction)) {
                    filterCriteria = searchText;
                    filterServerSide(searchText);
                    isSeverSideSearch = true;
                } else {
                    restoreTable(); // ensure table is set to default so search is carried out on entire table ONLY FOR CLIENT SIDE FILTERING.
                    filterCriteria = searchText; // because restoreTable() sets this field to empty.
                    filterClientSide(searchText);
                    triggerFilterCompletedEvent();
                    tableFiltered = true;

                    if (_options.animation) {
                        table.fadeIn(300);
                    }
                }
            }, 10);
        }
    }

    function triggerFilterCompletedEvent() {
        if (isNotUndefinedNorEmpty($.fn.filterTable.defaultOptions.filterCompletedEvent)) {
            table.trigger($.fn.filterTable.defaultOptions.filterCompletedEvent);
        }
    }

    function filterServerSide(searchText) {
        var filterValues = undefined;
        var tableToRestore = false;
        if (isNotUndefinedNorEmpty(searchText)) {
            if (_options.placeInsideTable) {
                filterValues = {};
                filterValues.value = searchText; // TODO: get filter values for each column and form this dictionary.
                table.find('.' + _options.inputFieldCSS.split(' ')[0]).each(function () {
                    var currentFilterInput = $(this);
                    var text = currentFilterInput.val();
                    var th = currentFilterInput.closest('th');
                    var column = isNotUndefinedNorEmpty(_options.columnNameAttribute) ? th.attr(_options.columnNameAttribute) : $.trim(th.text());
                    filterValues.column = text;
                });
            } else {
                filterValues = searchText;
            }
        } else {// In case of reset, this value will be empty.
            filterValues = "restore";
            tableToRestore = true;
        }
        var data = $.extend(_options.filterActionParameters, { filterValues: filterValues});
        $.ajax({
            url: _options.filterAction,
            data: data,
            cache: false,
            global: true,
            type: 'GET',
            dataType: 'html',
            headers: _options.headers
        }).done(function (data) {
            if (isNotUndefinedNorEmpty(data)) {
                var newContent = $(data);
                var tbody = table.find('tbody');
                tbody.empty();
                tbody.append(newContent);
                triggerFilterCompletedEvent();
                var recordsReturned = ($('<div>').append($(data))).find('tr:not(.hidden)').length;
                searchResultSpan.text(tableToRestore ? '': 'Filter applied.');
                if (_options.animation) {
                    table.fadeIn(300);
                }
            }
            if (!tableToRestore) {
                tableFiltered = true; // if table was filtered (not restored) then set this flag to true.
            }
        }).fail(function (xhr, status, data) {
            console.log('filter failed (responseText:)' + xhr.responseText);
        });
    }

    function filterClientSide(searchText) {
        var rowsMatched = 0, totalRecords = 0;
        tableBody.find('tr').each(function () {
            var currentRow = $(this);
            if (currentRow.hasClass('hidden') && _options.ignoreHiddenElements) {
                return true;
            }
            totalRecords++;
            var hideCurrentRow = true;
            currentRow.find('td,th').each(function () {
                var currentCell = $(this);
                if (matchCell(currentCell, searchText)) {
                    rowsMatched++;
                    if (_options.hightlight) {
                        var cellText = currentCell.text();
                        // TODO: how to ensure that we don't change the case of the matched text??
                        currentCell.html(cellText.replace(new RegExp($.zeusValidate.escapeRegex(searchText), "ig"), '<b>' + searchText.toUpperCase() + '</b>')); // RegEx i --> ignore case, g--> match more than one instance.
                        currentCell.attr(filteredCellAttribute, true);
                    }
                    hideCurrentRow = false;
                    if (_options.matchFirstOccurrenceOnly) {
                        return false; // If a match has been found, don't look for next cell.
                    }
                }
            });
            if (hideCurrentRow) {
                currentRow.addClass($.fn.filterTable.defaultOptions.hiddenClass);
            }
        });
        searchResultSpan.text(rowsMatched + _options.searchResultText + totalRecords); console.log('"' + searchText + '" matched rows:' + rowsMatched);
    }


    function matchCell(cell, searchText) {
        var found = false;
        var text = cell.text().toLowerCase();
        if (_options.searchForComplexCells && cell.children().length) {
            // Go through cell elements, starting off with popular ones.
            // RULE: If there are multiple input elements within a cell, we only match first one.
            var input = cell.find('input:not([type=hidden],[style*="display:none"],[style*="display: none"]):visible');
            input.each(function () {
                found = simpleSearch($(this).val());
                return found ? false : true;
            });
            // <button>
            if (!found) {
                var button = cell.find('button:not(.hidden,[style*="display:none"],[style*="display: none"]):visible');
                button.each(function () {
                    found = searchTextNodeOnly($(this));// simpleSearch(.text());
                    return found ? false : true;
                });
            }
            // <anchor>
            if (!found) {
                var anchors = cell.find('a:not(.hidden,[style*="display:none"],[style*="display: none"])'); // :Visible selector does not work.
                anchors.each(function () {
                    var link = $(this);
                    if (!link.closest('.hidden').length) { // ensure that this anchor is not inside of a hidden element (span).
                        found = searchTextNodeOnly(link);
                    }
                    return found ? false : true;
                });
            }
            // <span> Mainly for Outcome Tracker.
            if (!found) {
                var spans = cell.find('span:not(.hidden,[style*="display:none"],[style*="display: none"]):visible');
                spans.each(function () {
                    found = searchTextNodeOnly($(this));
                    return found ? false : true;
                });
            }
            // <dl> Mainly for Responsive table rows.
            if (!found) {
                var definitionLists = cell.find('dl:not(.hidden,[style*="display:none"],[style*="display: none"]):visible');
                definitionLists.each(function () {
                    found = simpleSearch($(this).text());
                    return found ? false : true;
                });
            }
            // Lastly if no match is found, do a simpleSearch to see if <td> cell contains any text.
            if (!found) {
                found = searchTextNodeOnly(cell); //simpleSearch(text); Instead of looking at text() which will get the inner text of inner elements, we only look at text node of this cell.
            }
        }
        else {
            found = simpleSearch(text);
        }
        return found;

        function searchTextNodeOnly(element) {
            // check if element has text node usually nodeType = 3.
            var textNode = element.contents().filter(function () { return this.nodeType == 3; });// contents() is similar to children() but also includes the text node of the actual element which is what we want.
            return simpleSearch(textNode.text());
        }

        function simpleSearch(textToSearch) {
            if (typeof (textToSearch) == 'string' && typeof (searchText) == 'string') {
                return textToSearch.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
            }
            return false;
        }
    }


    // Restores the table
    function restoreTable() {
        // Only restore when table is filtered.
        if (tableFiltered) {
            // Empty the search result text.
            searchResultSpan.text('');
            if (isSeverSideSearch) {
                filterServerSide(''); // provide empty search text to restore the table.
            }
            else {                
                // Reset filter criteria.
                filterCriteria = '';
                // Unhide the hidden rows.
                tableBody.find('tr').each(function () {
                    var currentRow = $(this);
                    //currentRow.fadeIn(100);
                    currentRow.removeClass($.fn.filterTable.defaultOptions.hiddenClass);
                    if (_options.hightlight) {
                        currentRow.find('td[' + filteredCellAttribute + '=true]').each(function () {
                            var cell = $(this);
                            cell.removeAttr(filteredCellAttribute);
                            cell.html(cell.text()); // remove <b>
                        });
                    }
                });
            }
            tableFiltered = false;
        }
    }

    function isNotUndefinedNorEmpty(value) {
        return value != undefined && value != '';
    }

}