/* Colors taken from dashboard.js of the Color admin theme */
var blue = '#348fe2',
    blueLight = '#5da5e8',
    blueDark = '#1993E4',
    aqua = '#49b6d6',
    aquaLight = '#6dc5de',
    aquaDark = '#3a92ab',
    green = '#00acac',
    greenLight = '#33bdbd',
    greenDark = '#008a8a',
    orange = '#f59c1a',
    orangeLight = '#f7b048',
    orangeDark = '#c47d15',
    dark = '#2d353c',
    grey = '#b6c2c9',
    purple = '#727cb6', 
    purpleLight = '#8e96c5',
    purpleDark = '#5b6392',
    red = '#ff5b57';

// Determines whether the calendar tooltip has gone off screen.
jQuery.expr.filters.toolTipOffscreen = function (element) {
    var offScreen = { topNeg: true, topPos: true, leftPos: true, leftNeg: true };
    var viewPort = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
    viewPort.right = viewPort.left + window.innerWidth;
    viewPort.bottom = viewPort.top + window.innerHeight;
    var elementBounds = $(element).offset();
    elementBounds.right = elementBounds.left + $(element).outerWidth();
    elementBounds.bottom = elementBounds.top + $(element).outerHeight();
    
    if (viewPort.right >= elementBounds.left) {
        offScreen.leftPos = false;
    }
    if (viewPort.left <= elementBounds.right) {
        offScreen.leftNeg = false;
    }
    if (viewPort.bottom >= elementBounds.top) {
        offScreen.topPos = false; // in screen
    }
    if (viewPort.top <= elementBounds.bottom) {
        offScreen.topNeg = false;  // off screen
    }
};

// Custom attribute selector that ignores case. Usage: input:caseInsensitive(' + fullDataTypes.GridFilterExclude + ',true)
$.expr[":"].caseInsensitive = function (node, stackIndex, properties) {
    var attributeNode = properties[3].split(',');
    var attribute = attributeNode[0];
    var value = attributeNode[1];
    return $(node).attr(attribute).toLowerCase() == value.toLowerCase();
};

// Static counter for jumpList
var jumpListCounter = 0;

(function ($) {

    // Custom function to check if an event is already bound on an element
    $.fn.hasEvent = function (event) {

        if ($._data(this[0], 'events') != undefined) {

            var firstSeparator = event.indexOf('.');
            
            if (firstSeparator > 0) {
                var namespace = event.substring(firstSeparator + 1, event.length);
                event = event.substring(0, firstSeparator);

                if ($._data(this[0], 'events')[event] != undefined) {
                    for (var i = 0; i < $._data(this[0], 'events')[event].length; i++) {
                        if ($._data(this[0], 'events')[event][i].namespace == namespace) {
                            return true;
                        }
                    }
                }

                return false;
            }
            
            return $._data(this[0], 'events')[event] != undefined;
        }

        return false;
    };
})(jQuery);

; (function ($, window, document, undefined) {

    $.zeusValidate = function() { };

    $.zeusValidate.userSettings = { FixedHeader: true, ResponsiveTable: true, ColourScheme: 0};

    // Gets the error message from exception thrown in AJAX action.
    $.zeusValidate.getErrorInAjax = function (xhr) {
        var returnValue = undefined;
        if (xhr != undefined && xhr.responseText != undefined) {
            try {
                var parsedJson = JSON.parse(xhr.responseText);
                if (parsedJson != undefined && parsedJson.Result != undefined && parsedJson.Result.toLowerCase().indexOf('<html') == -1 && parsedJson.Result.toLowerCase().indexOf('<body') == -1) {
                    returnValue = parsedJson.Result;
                }
            } catch (error) {

            }
        }
        return returnValue;
    };

    // Adjust the TOP position of X element when container is scolled (applied on max-length indicator, calendar in date picker).
    $.zeusValidate.adjustPostionOnScroll = function (element, eventToBindTo, elementToAdjustPositionOf) {
        var root = this.element || $(document);
        // Get the scrollable containers within which this element resides.
        var otherScrollableContainers = element.parents('.full-height-scrollable, .full-height-grid-scrollable, [class*="group-height-"] .panel-body'); // If element is inside one of these (as closest will only return first matched element, but we would like to bind scroll event for each of these containers we use parents()).
        var scrollContainer = root.find('div#page-container');
        scrollContainer.off(eventToBindTo);
        scrollContainer.on(eventToBindTo, function (event) {
            root.find(elementToAdjustPositionOf).each(function () {
                setTop($(this));
            });
        });
        if (otherScrollableContainers.length) {
            otherScrollableContainers.each(function () {
                $(this).off(eventToBindTo + '-other');
                $(this).on(eventToBindTo + '-other', function (event) {
                    root.find(elementToAdjustPositionOf).each(function () {
                        setTop($(this));
                    });
                });
            });
        }

        function setTop(elementToAdjust) {
            // readjust the top based on current Top position of the input and its outer height.
            elementToAdjust.css({ top: element.offset().top + element.outerHeight() });//Math.abs(top - (scrollTop - initialScrollTop)) 
        }
    };

    $.zeusValidate.extractNumber = function (value, element) {
        if (!$(element).hasClass('rhea-numeric')) {
            return value;
        }

        // Ignore '$', '-', and ',' characters
        value = value.replace(/[(\,|\-|\$)]/g, "");

        // Ignore decimals as we only want to check the whole number for length validation
        var decimals = parseInt($(element).data(dataTypes.Decimal));

        if (decimals > 0) {
            var decimalStart = value.indexOf('.');
            if (decimalStart > 0) {
                value = value.substr(0, decimalStart);
            }
        }

        return value;
    };

    $.zeusValidate.handleDateValidation = function (input, errorTip, errorMessageSpanSelector, errorClasses) {
        var dateEntered = input.val();
        var valid = (dateEntered != '') ? $.zeusValidate.parseDateValue(dateEntered) != undefined : true;
        if (!valid) {
            // Show error tip.
            if (errorTip.find(errorMessageSpanSelector).length == 0) {
                errorTip.append('<span generated=\'true\' >Please enter valid date.</span>');
            }
            errorTip.css('display', 'inline-block');
        } else {
            // Hide error tip.
            errorTip.find(errorMessageSpanSelector).remove();
            errorTip.hide();
            input.removeClass(errorClasses);
        }
    };

    $.zeusValidate.focusErrorOnElement = function (element) {
        // Cater for 'select' element which has different ID. DEFECT 10586.
        if (element.length == 1) {
            // Check if element is inside modal, if so then we do no need to scroll.
            var scroll = element.closest('.modal-dialog').length == 0;
            var scrollContainer = $('div#page-container');
            if (element[0].tagName == 'SELECT') {
                var container = element.data('ariaSelectReference');
                if (container.length == 1) {
                    if (scroll) {
                        scrollContainer.animate({
                            scrollTop: $(container).offset().top - scrollContainer.offset().top + scrollContainer.scrollTop() - 35
                        }, 500);
                    }
                    container.focus();
                }
            } else {
                if (scroll) {
                    scrollContainer.animate({
                        scrollTop: $(element).offset().top - scrollContainer.offset().top + scrollContainer.scrollTop() - 35
                    }, 500);
                }
                element.focus();
            }
        }
    }

    $.zeusValidate.parseDateUsingMoment = function(value) {
        return moment(value, [
                   'D/MM/YYYY',   // 1/2/1980 12:00 AM or 1/02/1980 12:00 AM
                   'D-MM-YYYY',   // 1-2-1980 12:00 AM or 1-02-1980 12:00 AM
                   'DD/MM/YY'//  01/01/1970 12:00 AM
                 //  'D MMM YYYY'// 1 FEB 1980 12:00 AM
        ]);
    }


    $.zeusValidate.parseDateTimeUsingMoment = function (value) {
        return moment(value, [
        'D/MM/YYYY h:mm A',   // 1/2/1980 12:00 AM or 1/02/1980 12:00 AM
        'D-MM-YYYY h:mm A',   // 1-2-1980 12:00 AM or 1-02-1980 12:00 AM
        'DD/MM/YY h:mm a'//  01/01/1970 12:00 AM
        ]);
    }

    
    // This function parses a date value by checking that it is in 'DD/MM/YYYY' format.
    $.zeusValidate.parseDateValue = function(dateCandidate) {
        var dateParsed = undefined;
        // Check if the dateCandidate is a string.
        if (dateCandidate != undefined && typeof(dateCandidate) == 'string' && dateCandidate.indexOf("/") >= 0) {
            var dateParts = dateCandidate.split("/");
            if (dateParts.length == 3) {
                var yearPart = dateParts[2];
                var monthPart = dateParts[1];
                var dayPart = dateParts[0];
                if ($.zeusValidate.isNumericInput(yearPart) && $.zeusValidate.isNumericInput(monthPart) && $.zeusValidate.isNumericInput(dayPart)) {
                    if (yearPart.length == 4 && monthPart.length > 0 && monthPart.length <= 2 && dayPart.length > 0 && dayPart.length <= 2) { // Date can be in the format dd/mm/yyyy or d/MM/yyyy
                            dateParsed = new Date(yearPart, monthPart - 1, dayPart, 0, 0, 0, 0); // For some reason Month value is 0 based.
                        }
                    }
                }
            }
        return dateParsed;
    }

    $.zeusValidate.isNumericInput = function(input) {
        return isFinite(input) && !isNaN(parseFloat(input));
    }
    
    // Substitute for using the jQuery val() function to get input values since the return type of that can vary.
    $.zeusValidate.getValueFromInput = function (input) {
        var paramValue = "";
        if (input.attr('type') == 'checkbox') {
            paramValue = input[0].checked;
        }
        else if (input.attr('type') == 'radio') {
            // Check if there are other radio buttons in parent div.
            var parentContainer = input.closest('form');
            var inputName = input.attr('name');
            var selectedRadioButton = parentContainer.find('input[name="' + inputName + '"][type="radio"]:not(:disabled):checked');
            if (selectedRadioButton.length == 1) {
                paramValue = selectedRadioButton.val();
            }
        }
        else {
            paramValue = input.val();

            paramValue = $.zeusValidate.stripCurrencyCharacters(paramValue);

            if (paramValue == null) {
                paramValue = '';
            }
            else if ($.isArray(paramValue)) {
                paramValue = paramValue.join(",");
            }
        }
        return paramValue;
    }

    $.zeusValidate.getParameterElementsForElement = function (element) {
        var prefix = element.data(dataTypes.FieldPrefix);
        var parameterData = element.data(dataTypes.Parameters);

        var parameters = [];
        if (parameterData != undefined && parameterData.length > 0) {
            parameters = parameterData.split(',');

            //Defect 7967 --> AJAX Selection not working inside editable grids.
            // Get the closest table.
            //  Check for the _0__ pattern in Id.
            if (IsElementInsideGrid(element)) {
                var elementId = element.attr('id');
                if (elementId){ // Check if elementId is not undefined
                    prefix = elementId.substr(0, elementId.lastIndexOf('_')); // don't include the last underscore as it is done when forming targetId.
                }
            }
        }
        var results = [];

        // Include values of parameters
        for (var i = 0; i < parameters.length; i++) {
            var key = parameters[i];
            var targetId = (prefix != undefined && prefix.length > 0) ? prefix + '_' + key : key;
            results.push($('#' + targetId));
        }
        return results;
    }

    // This function determines whether element is inside table.
    function IsElementInsideGrid(element) {
        var table = element.closest('table');
        if (table != undefined && table.length > 0) {
            var closestTd = element.closest('td');
            var elementId = element.attr('id');
            var patternForId = new RegExp('_[0-9]+__'); // "Rows_0__Postcode"
            if (elementId != undefined && patternForId.test(elementId)) {
                return true;
            }else if (closestTd != undefined && closestTd.data(dataTypes.CurrentRowPrefix) != undefined) {
                return true;
            }

        }
        return false;
    }

    // Before Posting the form ensure that if there are CKEDITORs, update their corresponding 'textarea' elements. Applicable on AJAX POST only.
    $.zeusValidate.updateCkeditorInstances = function(element) {
        if (element != undefined) {
            element.find('div[' + fullDataTypes.RichTextArea + '=true]').each(function () {
                var container = $(this);
                var textArea = container.find('textarea');
                var editorInstance = CKEDITOR.instances[textArea.attr('id')];
                if (editorInstance != undefined) {
                    editorInstance.updateElement();
                }
            });
        }
    }

    $.zeusValidate.getParameterMapForElement = function (element) {
        var prefix = element.data(dataTypes.FieldPrefix);
        var parameterData = element.data(dataTypes.Parameters);

        var parameters = [];
        if (parameterData != undefined && parameterData.length > 0) {
            parameters = parameterData.split(',');
            //Defect 7967 --> AJAX Selection not working inside editable grids.
            // Get the closest table.
            //  Check for the _0__ pattern in Id.
            if (IsElementInsideGrid(element)) {
                var elementId = element.attr('id');
                if (elementId == undefined || elementId == '') {
                    // Cater for anchor tags inside grid (as they don't have Id).
                    var closestTd = element.closest('td');
                    prefix = closestTd.data(dataTypes.CurrentRowPrefix);
                    prefix = prefix.substr(0, prefix.lastIndexOf('_'));
                } else {
                    prefix = elementId.substr(0, elementId.lastIndexOf('_')); // don't include the last underscore as it is done when forming targetId.
                }
            }
        }

        var results = {};

        // Include values of parameters
        for (var i = 0; i < parameters.length; i++) {
            var key = parameters[i];
            var targetId = (prefix != undefined && prefix.length > 0) ? prefix + '_' + key : key;
            var lowerCamelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
            results[lowerCamelCaseKey] = $.zeusValidate.getValueFromInput($('#' + targetId));
        }

        return results;
    }

    $.zeusValidate.handleDateTimeComparison = function (currentProperty, currentPropertyValue, dependentProperty, dependentPropertyValue) {
        
        var currentDateTime = $.zeusValidate.parseDateTimeValue(currentProperty, currentPropertyValue);
        var dependentDateTime = $.zeusValidate.parseDateTimeValue(dependentProperty, dependentPropertyValue);
        
        var result = { };
        
        result.currentProperty = currentProperty;
        result.currentPropertyValue = currentDateTime.value;
        
        result.dependentProperty = dependentProperty;
        result.dependentPropertyValue = dependentDateTime.value;
        
        // Handle comparing Date Time
        if (currentDateTime.datatype != 'other' && currentDateTime.datatype != 'other') {
            // If comparing Date against DateTime (or vice-versa), reset Time component to effectively ignore it
            if ((currentDateTime.datatype == 'date' && dependentDateTime.datatype == 'datetime')
                || (currentDateTime.datatype == 'datetime' && dependentDateTime.datatype == 'date')) {
                var currentDate = new Date(currentDateTime.value);
                
                currentDate.setHours(0);
                currentDate.setMinutes(0);
                currentDate.setSeconds(0);
                currentDate.setMilliseconds(0);
                
                result.currentPropertyValue = Date.parse(currentDate.toString());
                
                var dependentDate = new Date(dependentDateTime.value);
                
                dependentDate.setHours(0);
                dependentDate.setMinutes(0);
                dependentDate.setSeconds(0);
                dependentDate.setMilliseconds(0);

                result.dependentPropertyValue = Date.parse(dependentDate.toString());
                
                // If comparing Time against DateTime (or vice-versa), reset Date component to effectively ignore it
            } else if ((currentDateTime.datatype == 'time' && dependentDateTime.datatype == 'datetime')
                || (currentDateTime.datatype == 'datetime' && dependentDateTime.datatype == 'time')) {
                var currentDate = new Date(currentDateTime.value);

                currentDate.setFullYear(1970);
                currentDate.setMonth(1);
                currentDate.setDate(1);

                result.currentPropertyValue = Date.parse(currentDate.toString());
                
                var dependentDate = new Date(dependentDateTime.value);
                
                dependentDate.setFullYear(1970);
                dependentDate.setMonth(1);
                dependentDate.setDate(1);

                result.dependentPropertyValue = Date.parse(dependentDate.toString());
            }
            // if both are datetime(s).
            else if (currentDateTime.datatype == 'datetime' && dependentDateTime.datatype == 'datetime') {
                result.currentPropertyValue = $.zeusValidate.parseDateTime(currentDateTime.value); // This value will be string containing date and time portion.
                result.dependentPropertyValue = $.zeusValidate.parseDateTime(dependentDateTime.value);
            }
        }

        return result;
    };

    $.zeusValidate.parseDateTime = function(value) {
        if (value != null) {
            var dateParts = value.split('/');
            if (dateParts.length == 3) {
                // Handle time -- i.e. the value also contains time 20/07/2015 12:00 AM
                var yearPart = dateParts[2];
                if (yearPart.indexOf(':') == -1) {
                    return new Date(yearPart, dateParts[1] - 1, dateParts[0]); // Month index starts at 0.}
                } else {
                    var parts = yearPart.split(' ');
                    if (parts.length == 3) {
                        var meridian = parts[2];
                        var year = parts[0];
                        var timeParts = parts[1].split(':');
                        if (timeParts.length == 2) {
                            var hour = timeParts[0];
                            return new Date(year, dateParts[1] - 1, dateParts[0], meridian == 'AM' ? (parseInt(hour) == 12 ? 0 : hour) : (parseInt(hour) == 12 ? hour : hour + 12), timeParts[1]);
                        }
                    }
                }
            }
        }
        return null;
    };
    
    // Convert a DateTime/Date/Time to its parsed date value
    $.zeusValidate.parseDateTimeValue = function(element, value) {
        var datePicker = $(element).data(dataTypes.DatePicker);
        var dateTimePicker = $(element).data(dataTypes.DateTimePicker);
        var timePicker = $(element).data(dataTypes.TimePicker);
        var datetimeticks = $(element).data(dataTypes.DateTimeTicks);
        var datetimetype = $(element).data(dataTypes.DateTimeType);
        
        var result = { };

        result.datatype = 'other';
        result.value = value;
        
        if (datePicker != undefined) {
            result.datatype = 'date';
            result.value = datePicker.selectedValue != null ? datePicker.selectedValue.getTime() / 1000 : value;
        } else if (dateTimePicker != undefined) {
            result.datatype = 'datetime';
            result.value = dateTimePicker.selectedValue != null ? dateTimePicker.selectedValue.getTime() / 1000 : value;
        } else if (timePicker != undefined) {
            result.datatype = 'time';
            result.value = timePicker.selectedValue != null ? timePicker.selectedValue.getTime() / 1000 : value;
        } else if (datetimeticks != undefined && datetimetype != undefined) {
            result.datatype = datetimetype;
            result.value = parseInt(datetimeticks);
        }

        // Revert to original value if not parsed correctly
        if (isNaN(result.value)) {
            result.value = value;
        }
        
        return result;
    };
    
    $.zeusValidate.is = function (value1, operator, value2, passOnNull, failOnNull) {
        
        value1 = $.zeusValidate.stripCurrencyCharacters(value1);
        value2 = $.zeusValidate.stripCurrencyCharacters(value2);

        if ( /^true$/i .test(passOnNull)) {

            var value1nullish = this.isNullish(value1);
            var value2nullish = this.isNullish(value2);

            if (value1nullish || value2nullish) {
                return true;
            }
        }

        if ( /^true$/i .test(failOnNull)) {

            var value1nullish = this.isNullish(value1);
            var value2nullish = this.isNullish(value2);

            if (value1nullish || value2nullish) {
                return false;
            }
        }

        // Treat null and empty string as the same
        if (value1 == '') {
            value1 = null;
        }

        if (value2 == '') {
            value2 = null;
        }

        var values1Array = [];
        if ($.isArray(value1)) {
            values1Array = value1;
        } else {
            values1Array.push(value1);
        }

        var values2Array = [];
        if ($.isArray(value2)) {
            values2Array = value2;
        } else {
            values2Array.push(value2);
        }
        var results = [];

        for (var i = 0; i < values1Array.length; i++) {
            for (var j = 0; j < values2Array.length; j++) {
                results.push(this.comparisonTest(values1Array[i], operator, values2Array[j]));
                //results.push(this.comparisonTest(value1, operator, value2[i]));
                
            }
        }

        if (operator == "NotEqualTo") {
            // Negative AND validation (all must be true)
            return $.inArray(false, results) == -1; // array must not contain false.
        } else {
            // Positive OR validation (at least one must be true)
            return $.inArray(true, results) != -1;  // array must at least contain one true.
        }


       
    };
    
    $.zeusValidate.comparisonTest = function(value1, operator, value2) {

        function parseDate(value) {
            if (value != null) {
                var dateParts = value.split('/');
                if (dateParts.length == 3) {
                    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // Month index starts at 0.
                } else {
                    return null;
                }
            }
            return null;
        }

        if (this.isDate(value1)) {
            value1 = isNaN(Date.parse(value1)) ? Date.parse('01/01/0001 ' + value1) : parseDate(value1);
            value2 = isNaN(Date.parse(value2)) ? Date.parse('01/01/0001 ' + value2) : parseDate(value2);
        } else if (this.isBool(value1)) {
            if (/^true$/i.test(value1)) {
                value1 = true;
            } else if (/^false$/i.test(value1)) {
                value1 = false;
            }
            
            if (/^true$/i.test(value2)) {
                value2 = true;
            } else if (/^false$/i.test(value2)) {
                value2 = false;
            }
            
            value1 = !!value1;
            value2 = !!value2;
        } else if (this.isNumeric(value1)) {
            value1 = parseFloat(value1);
            value2 = parseFloat(value2);
        }

        switch (operator) {
            case "EqualTo":
                if (value1 == value2) return true;
                break;
            case "NotEqualTo":
                if (value1 != value2) return true;
                break;
            case "GreaterThan":
                if (value1 > value2) return true;
                break;
            case "LessThan":
                if (value1 < value2) return true;
                break;
            case "GreaterThanOrEqualTo":
                if (value1 >= value2) return true;
                break;
            case "LessThanOrEqualTo":
                if (value1 <= value2) return true;
                break;
            case "RegExMatch":
                return (new RegExp(value2)).test(value1);
                break;
            case "NotRegExMatch":
                return !(new RegExp(value2)).test(value1);
                break;
        }

        return false;
    };

    $.zeusValidate.stripCurrencyCharacters = function(input) {
        var currencyRegex = /^[-]?\$[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/;
        if (currencyRegex.test(input)) {
            if ($.zeusValidate.isNullish(input))
            {
                return input;
            }

            // Remove negative
            input = input.replace('-', '');

            // Remove dollar
            input = input.replace('$', '');

            // Remove thousands separator
            input = input.split(',').join('');
        }

        return input;
    };

    $.zeusValidate.getId = function(element, dependentProperty) {
        var pos = element.id.lastIndexOf("_") + 1;
        return element.id.substr(0, pos) + dependentProperty;
    };

    $.zeusValidate.getName = function(element, dependentProperty) {
        var pos = element.name.lastIndexOf(".") + 1;
        return element.name.substr(0, pos) + dependentProperty;
    };

    $.zeusValidate.isNullish = function(input) {
        return input == null || input == undefined || $.trim(input) == "";
    };

    $.zeusValidate.isNumeric = function(input) {
        return (input - 0) == input && input.length > 0;
    };

    $.zeusValidate.isInteger = function(input) {
        return /^\d+$/ .test(input);
    };

    $.zeusValidate.isFloat = function(input) {
        return /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/ .test(input);
    };

    $.zeusValidate.isDate = function(input) {
        var dateTest = new RegExp( /^(?=\d)(?:(?!(?:(?:0?[5-9]|1[0-4])(?:\.|-|\/)10(?:\.|-|\/)(?:1582))|(?:(?:0?[3-9]|1[0-3])(?:\.|-|\/)0?9(?:\.|-|\/)(?:1752)))(31(?!(?:\.|-|\/)(?:0?[2469]|11))|30(?!(?:\.|-|\/)0?2)|(?:29(?:(?!(?:\.|-|\/)0?2(?:\.|-|\/))|(?=\D0?2\D(?:(?!000[04]|(?:(?:1[^0-6]|[2468][^048]|[3579][^26])00))(?:(?:(?:\d\d)(?:[02468][048]|[13579][26])(?!\x20BC))|(?:00(?:42|3[0369]|2[147]|1[258]|09)\x20BC))))))|2[0-8]|1\d|0?[1-9])([-.\/])(1[012]|(?:0?[1-9]))\2((?=(?:00(?:4[0-5]|[0-3]?\d)\x20BC)|(?:\d{4}(?:$|(?=\x20\d)\x20)))\d{4}(?:\x20BC)?)(?:$|(?=\x20\d)\x20))?((?:(?:0?[1-9]|1[012])(?::[0-5]\d){0,2}(?:\x20[aApP][mM]))|(?:[01]\d|2[0-3])(?::[0-5]\d){1,2})?$/ );
        
        return dateTest.test(input);
    };

    $.zeusValidate.isBool = function(input) {
        return /^true$/i.test(input) || /^false$/i.test(input);
    };

    $.zeusValidate.isJSON = function(input) {
        try {
            var parsedValue = $.parseJSON(input);
            if(typeof parsedValue != 'object')
            {
                return false;
            }
        } catch(e) {
            return false;
        }
        
        return true;
    };
    
    $.zeusValidate.getFieldPrefixFromName = function(property, name) {
        var delimiter = '.';
        var prefix = '';

        if (property.name.lastIndexOf(delimiter) != -1) {
            prefix = property.name.substring(0, property.name.lastIndexOf(delimiter) + 1);
        }

        return prefix + name;
    };

    $.zeusValidate.getFieldPrefixFromId = function(property, id) {

        var propertyId = property.id;
        
        // Strip suffix number for radio button elements
        if (propertyId.indexOf('ContainerFor-') == - 1 && propertyId.lastIndexOf('-') != - 1) {
            propertyId = propertyId.substring(0, propertyId.lastIndexOf('-'));
        }

        var delimiter = '_';
        var prefix = '';

        if (propertyId.lastIndexOf(delimiter) != -1) {
            prefix = propertyId.substring(0, propertyId.lastIndexOf(delimiter) + 1);
        }

        return prefix + id;
    };
    
    $.zeusValidate.replaceAll = function(text, target, replacement) {
        while (text.indexOf(target) != -1) {
            text = text.replace(target, replacement);
        }

        return text;
    };

    // Ensures that if string contains reserved chars for RegEx, then they are escaped.
    $.zeusValidate.escapeRegex = function (str) {
        return (str + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"); // http://stackoverflow.com/questions/2593637/how-to-escape-regular-expression-in-javascript
    };

    $.zeusValidate.extractTitle = function(text) {
        var responseText = text != undefined ? text.toLowerCase() : '';

        var titleOpenTag = '<title>';
        var titleCloseTag = '</title>';
        var titleOpenIndex = responseText.indexOf(titleOpenTag);
        var titleCloseIndex = responseText.indexOf(titleCloseTag);
        var title = false;
        
        if (titleOpenIndex > -1 && titleCloseIndex > -1) {
            var start = titleOpenIndex + titleOpenTag.length;
            var end = titleCloseIndex - start;
                    
            title = responseText.substr(start, end);
        }

        return title;
    };

    $.zeusValidate.guid = function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    };

    $.zeusValidate.addError = function (error, startingContainer, clear) {
        if (error == undefined) {
            return;
        }

        if (clear == undefined) {
            clear = true;
        }

        // Remove leading and trailing whitespace
        error = $.trim(error);

        // Replace multiple .'s with a single .
        error = $.zeusValidate.replaceAll(error, '..', '.');

        // Ensure last character is a .
        if (error[error.length - 1] != '.') {
            error = error + '.';
        }

        if (startingContainer == undefined) {
            startingContainer = $('#main_form');
        }
        var container = startingContainer.find("#validation-error-summary"),//[data-valmsg-summary=true]
            list = container.find("ul");
         
        if (clear) {
            list.empty();
        }

        $("<li />").append(error).appendTo(list);

        if (container.hasClass('validation-summary-valid')) {
            container.addClass("validation-summary-errors")
                .addClass("alert")
                .addClass("alert-danger")
                .removeClass("validation-summary-valid")
                .removeClass("noErrors");
        }
    };
    
    $.zeusValidate.addPropertyError = function(propertyId, propertyName, error) {
        var container = $('#main_form').find("[data-valmsg-summary=true]"),
            list = container.find("ul");
        //alert('adding property error');
        list.empty();
        //alert('add Property error');
        $("<li />").append('<a href="#' + propertyId + '">' + propertyName + '</a> - ' + error).appendTo(list);

        if (container.hasClass('validation-summary-valid')) {
            container.addClass("validation-summary-errors")
                .addClass("alert")
                .addClass("alert-danger")
                .removeClass("noErrors")
                .removeClass("validation-summary-valid");
        }
    };

    $.zeusValidate.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $.zeusValidate.doCallback = true;
    $.zeusValidate.preventDefaultOnNextFormSubmit = false;
    $.zeusValidate.ignoreLastClicked = false;
    $.zeusValidate.windowReloading = false;
    $.zeusValidate.ignoreDirty = false;
    $.zeusValidate.alwaysIgnoreDirty = false;
    $.zeusValidate.initialContentHTML = undefined;
    $.zeusValidate.skipNextFocusErrors = false;
    var colourScheme = $.zeusValidate.readCookie('ColourScheme');
    var useHighContrast = colourScheme == 'black' || colourScheme == "white" || colourScheme == "dark";
    $.zeusValidate.blockUIoptions = {message: '<div class="msgInfo">Sending data please wait</div>', overlayCSS: { backgroundColor: 'transparent' }, css: { padding:'15px 15px 15px 15px', backgroundColor: (useHighContrast ? '#5E8E3F' : '#ffffff'), border:'solid 1px ' + (useHighContrast ? '#5E8E3F' : '#b3c3ce'), color: (useHighContrast ? '#000000' : '#446C86') } };
    $.zeusValidate.blockUIdefaultMessage = '<div class="msgInfo">Retrieving data please wait</div>';

    $.zeusValidate.sessionExpired = function (request) {
        if ($.zeusValidate.windowReloading) {
            return true;
        }
        
        var title = $.zeusValidate.extractTitle(request.responseText);

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        // When the response text contains a <title>
        // and it is not from an application error,
        // and the title does not end with the expected "| ESS Web" title ending,
        // then we assume the users security token has expired and the response is the STS sign in page.
        // So, reload current page to trigger the STS sign in process in full.
        if (title !== false && request.status != 500 && !endsWith(title, "| ESS Web")) {
            $.zeusValidate.addError('Your session has timed out. Please log in again.');
            $.zeusValidate.alwaysIgnoreDirty = true; // Ignore dirty check
            $.zeusValidate.windowReloading = true;
            window.location.reload();

            return true;
        }

        return false;
    };


    var pluginName = 'zeus',
        defaultOptions = {};

    // Zeus header types for use in ajax calls
    var headerTypes = {
        ParentType: 'z-pt',
        PropertyNameInParent: 'z-pnip',
        FullPropertyNameInParent: 'z-fpnip',
        RowNumber: 'z-rn',
        Ajax: 'z-a',
        AjaxForm: 'z-af',
        AjaxConfirmation: 'z-ac',
        GridFilter: 'z-gf',
        DataSetEnabled: 'z-dse',
        ColumnSelections: 'z-cs',
        SelectionType: 'z-gst',
    };

    // Data types that include the 'data-' prefix
    var fullDataTypes = {
        FieldPrefix: 'data-zfp',
        ApplyActionForDependency: 'data-aafd',
        ActionForDependencyType: 'data-zadt',
        DependentProperty: 'data-zdp',
        ComparisonType: 'data-zct',
        DependentValue: 'data-zdv',
        Type: 'data-zt',
        Callback: 'data-cb',
        CallbackSignature: 'data-cbs',
        ContingentVisibleIf: 'data-zcvi',
        ContingentEditableIf: 'data-zcei',
        ContingentReadOnlyIf: 'data-zcroi',
        ContingentClearIf: 'data-zcci',
        ContingentRequiredIf: 'data-zcri',
        //ContingentAjaxLoadIf: 'data-zcali',
        DependentPropertyAjaxLoadIf: 'data-zdpal',
        ComparisonTypeAjaxLoadIf: 'data-zctal',
        DependentValueAjaxLoadIf: 'data-zdval',
        PassOnNullAjaxLoadIf: 'data-zpnal',
        FailOnNullAjaxLoadIf: 'data-zfnal',
        AlwaysAjaxLoadIf: 'data-zaal',
        DependentPropertyGst: 'data-zdpg',
        ExclusiveGst: 'data-zeg',
        DependentPropertyAge: 'data-zdpa',
        DependentPropertyAgeFormatString: 'data-zdpafs',
        DependentPropertiesCopy: 'data-zdpsc',
        DependentPropertyDate: 'data-zdpd',
        ReadOnlyType: 'data-zrot',
        SubmitName: 'data-zsn',
        SubmitType: 'data-zst',
        Url: 'data-zu',
        AutoLoadUrl: 'data-zalu',
        LatitudeLongitude: 'data-zll',
        IsNullable: 'data-zin',
        Decimal: 'data-zde',
        IsComplexType: 'data-zict',
        Parameters: 'data-zp',
        SkipLink: 'data-zsl',
        SkipLinkTable: 'data-zslt',
        RadioButtonGroup: 'data-zrbg',
        CheckboxList: 'data-zcl',
        PinnedCount: 'data-zpc',
        PropertyIdGrid: 'data-zpig',
        Countdown: 'data-zcd',
        PagedMetadata: 'data-zpm',
        ObjectValues: 'data-zov',
        HistoryType: 'data-zht',
        HistoryDescription: 'data-zhd',
        ButtonClear: 'data-zbcl',
        IsDownload: 'data-zid',
        Toggle: 'data-toggle',
        ErrorTipFor: 'data-zet',
        DisplayName: 'data-zdn',
        DependentPropertyId: 'data-zdpi',
        DependentValueAdw: 'data-zdva',
        ExcludeValues: 'data-zev',
        Code: 'data-zc',
        Dominant: 'data-zd',
        OrderType: 'data-zot',
        DisplayType: 'data-zdt',
        MaximumSelections: 'data-zms',
        EmptyMessage: 'data-zem',
        Switcher: 'data-zs',
        SwitcherChecked: 'data-zsc',
        SwitcherUnchecked: 'data-zsu',
        PagedMetadataPropertyId: 'data-zpmpi',
        PagedHasMore: 'data-zphm',
        SkipUnsavedChanges: 'data-zsuc',
        SkipValidation: 'data-zsv',
        DatePicker: 'data-zdpic',
        TimePicker: 'data-ztpi',
        DateTimePicker: 'data-zdtpi',
        DateTimeTicks: 'data-zdtti',
        DateTimeType: 'data-zdtty',
        DateTime: 'data-zdate',
        Click: 'data-zck',
        PropertyNameForAjax: 'data-zpnfa',
        PropertyNamesWithAjaxLoadToTrigger: 'data-pnwalt',
        GraphTopLevelUrl: 'data-zgtlu',
        GraphDrillDownUrl: 'data-zgddu',
        GraphDrillDownNewPage: 'data-zgddnp',
        GraphDrillDownElementNewPage: 'data-zgddenp',
        GraphDrillDownElementUrl: 'data-zgddeu',
        GraphDataSetEnabled: 'data-zgdse',
        GraphCheckboxesHidden: 'data-zgcbh',
        GraphType: 'data-zgt',
        WidgetContext: 'data-zwc',
        WidgetView: 'data-zwv',
        WidgetDataContext: 'data-zwdc',
        WidgetDefaultLayout: 'data-zwdl',
        CalendarCategory: 'data-zcalc',
        CalendarData: "data-zcald",
        CalendarCategoryEventList: 'data-zcalj',
        CalendarRendered: 'data-zcal',
        CalendarDefaultView: 'data-zcalv',
        CalendarDragResizeAction: 'data-zucdr',
        CalendarEventAddBtn: 'data-zcal-add',
        CalendarGoToDate : 'data-zcgtd',
        AjaxRoutes: 'data-zr',
        ButtonConfirmation: 'data-zbc',
        ButtonConfirmationParameters: 'data-zbcp',
        CalendarToolTipTag: 'data-zu-id',// stores the id of the event for which the tooltip  is displayed.
        CalendarDisablePastDates: 'data-zcal-dpd',
        CalendarDefaultSessionTime: 'data-zdst',
        CalendarMinDateToShow: 'data-zcmin',
        CalendarMaxDateToShow: 'data-zcmax',
        CalendarHideList: 'data-zchcl',
        CalendarShowWeekends: 'data-zcw',
        IsCategoryItemClickable: 'data-zcic',
        CalendarConfirmationMessage: 'data-zcc',
        CalendarAllowEventAddCategory: 'data-zcec',
        CalendarBackgroundEventColour: 'data-zcbc',
        ReadOnlyViewRow: 'data-zdr',
        DateList: 'data-zdl',
        AjaxGridRow: 'data-zagr',
        AjaxGridInline: 'data-zagi',
        AjaxGridModal: 'data-zagm',
        ParentType: 'data-zpt',
        PropertyNameInParent: 'data-zpnip',
        FullPropertyNameInParent: 'data-zfpnip',
        GridInlineEditedState: 'data-zgies',
        RichTextArea: 'data-zrtb',
        RichTextBoxOptions: 'data-zrto',
        UserDefaultKey: 'data-zudk',
        ContractsForContractModal: 'data-zcfcm',
        CurrentContract: 'data-zcty',
        Collapsed: 'data-zclp',
        CollapsedProperty: 'data-zgpu',
        DeletedRow: 'data-zgdr', // used just for styling
        ActualDeletedRow: 'data-zgadr', // denotes row deleted by user
        ActualAddedRow: 'data-zgaar', // denotes row added by user
        EditedRow: 'data-zger',
        RowSelector: 'data-zgrs',
        GridPage: 'data-zgp',
        BackgroundColour: 'data-bg',
        AddressAutocomplete: 'data-addr',
        DataKey: 'data-key',
        DataText: 'data-text',
        LazyLoad: 'data-zlz',
        NeverCache: 'data-znc',
        NoDeselect: 'data-zds',
        SearchModalButtonName: 'data-smbn',
        CurrentRowPrefix: 'data-crp',
        DefaultValue: 'data-dv',
        CalendarOpenInNewTab: 'data-zcont',
        StoredRouteValues: 'data-srv',
        AlwaysShowUnsavedChanges: 'data-asuc',
        CurrentCodesOnlyAdw: 'data-ccoa',
        AccessKeys: 'data-ak',
        GridFilterStatus: 'data-zgfe',
        GridFilterColumn: 'data-zgfc',
        IgnoreDirtyCheck: 'data-zidc',
        Tooltip: 'data-ztt',
        TreeviewShowTrash: 'data-ztvtrash',
        TreeviewShowAdd: 'data-ztvadd',
        TreeviewActionType: 'data-ztvaction',
        TreeviewNodeId: 'data-ztvid',
        TreeviewNodeExpanded: 'data-ztv-expanded',
        TreeviewNodeSelected: 'data-ztv-selected',
        TreeviewNodeCustomAction: 'data-ztv-customaction',
        ActionName: 'data-zan',
        ControllerName: 'data-zcn',
        AreaName: 'data-zarn',
        AlwaysReadOnly: 'data-zaro',
        SelectionType: 'data-zgst',
        HttpPost: 'data-zhp',
        DocumentStoreWebApiUrl: 'data-dswau',
    };

    var rotatingSpinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
    var loader = $('<div class="panel-loader"></div>');

    // Same as fullDataTypes but without the 'data-' prefix (populated in constructor)
    var dataTypes = {};

    function Zeus(element, options) {
        
        this.element = element;
        
        // Merge passed options with default options
        this.options = $.extend({}, defaultOptions, options);

        this._defaultOptions = defaultOptions;
        this._name = pluginName;

        // Populate dataTypes from fullDataTypes but without 'data-' prefix
        dataTypes = $.extend({}, fullDataTypes);
        for (var dataType in dataTypes) {
            dataTypes[dataType] = dataTypes[dataType].replace(/^data-/, '');
        }

        // Make data types accessible via jQuery
        $.zeusFullDataTypes = fullDataTypes;
        $.zeusDataTypes = dataTypes;

        this.init();

        $.zeus = this;
    }

    Zeus.prototype = {

        init: function () {
            this.globalAjaxHandlers();
            this.prepareReset();
            App.init(); // Color admin theme initialiser. This may need to be removed eventually.
            this.callback();
            this.applyBehaviours(false);
            this.postApplyBehavioursInit();
        },

        // Once only function to register ajax handlers that display messages on blocking ajax calls
        globalAjaxHandlers: function () {
            // Ensure Anti-Forgery token is sent on all Ajax calls
            //$.ajaxSetup({ data: { '__RequestVerificationToken': $('input[name=__RequestVerificationToken]').val() } });

            // Ajax indicator bound to ajax start/stop document events
            $(document).ajaxStart(function () {
                $.blockUI($.zeusValidate.blockUIoptions);
            });

            $(document).ajaxSend(function () {
                $.blockUI($.zeusValidate.blockUIoptions);
            });

            $(document).ajaxComplete(function (event, request, settings) {
                $.zeusValidate.sessionExpired(request);

                $.unblockUI();
                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
            });

            $(document).ajaxStop(function (event, request, settings) {
                $.unblockUI();
                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
            });

            $(document).ajaxSuccess(function (event, request, settings) {
                $.unblockUI();
                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
            });

            $(document).ajaxError(function (event, request, settings) {
                // Handle application error (status 500)
                if (request.status == 500) {
                    var errorText = $.zeusValidate.getErrorInAjax(request);
                    errorText = errorText != undefined ? errorText : 'The server encountered an internal error and was unable to process your request. Please try again later.';
                    $.zeusValidate.addError(errorText);
                }

                $.unblockUI();
                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
            });
        },
        
        prepareReset: function () {
            // Store current #content HTML for use during reset()
            var content = $('#content');

            if (content.length > 0) {
                $.zeusValidate.initialContentHTML = content.html();
            }
        },


        callback: function () {

            // Setup callback when leaving page
            var unloadCallback = function () {
                var element = $(document).find('body');

                // Check if action has [Callback]
                var enabled = (/^true$/i.test(element.data(dataTypes.Callback))) ? true : false;
                
                if (!enabled) {
                    window.sessionStorage.removeItem('callback.last.window.signature');
                    window.sessionStorage.removeItem('callback.last.window.ajaxOptions');
                    return;
                }

                // Store callback signature
                window.sessionStorage['callback.last.window.signature'] = element.data(dataTypes.CallbackSignature);

                var url = element.data(dataTypes.Url);
                var parameters = $.zeusValidate.getParameterMapForElement(element);

                var headers = {};
                headers[headerTypes.Ajax] = true;

                var ajaxOptions = {
                    type: 'GET',
                    dataType: 'html',
                    global: false,
                    url: url,
                    cache: false,
                    headers: headers,
                    data: parameters
                };

                // Store ajax options so callback can be made on next page load
                window.sessionStorage['callback.last.window.ajaxOptions'] = JSON.stringify(ajaxOptions);
            };

            // On next page, check if a callback needs to be done
            var callback = function () {
                var element = $(document).find('body');

                var signature = element.data(dataTypes.CallbackSignature);
                
                // Get details for callback
                var lastSignature = window.sessionStorage['callback.last.window.signature'];
                var ajaxOptions = $.parseJSON(window.sessionStorage['callback.last.window.ajaxOptions']);

                // Initialize session depth
                if (window.sessionStorage['callback.session.depth'] == undefined) {
                    window.sessionStorage['callback.session.depth'] = 1;
                }

                // First page so not possible for a callback to be needed (user has almost certainly opened this page in a new tab/window)
                if (window.history.length == 1) {
                    window.sessionStorage['callback.session.depth']++;

                    return;
                }

                // TODO: Decide whether we want to prevent callbacks when session depth is greater than 1 and user is on the same url as the parent session

                // Callback if we now have a different signature, as we know the user has navigated away to a different page (so not a postback)
                if (lastSignature != undefined && lastSignature != signature && ajaxOptions != null) {
                    $.ajax(ajaxOptions).done(function (data, textStatus, request) {
                        // Callback completed
                    });
                }
            };

            callback();

            $(window).off('unload.callback');
            $(window).on('unload.callback', unloadCallback);
        },

        // Gets new content for the provided contentContainer, contained within the given panel using an ajax request to the provided url.
        // The content container might be the panel-body if you're refreshing the entire panel, or a subcontainer within it.
        // This function also calls prepareNewContent on the returned content to apply behaviours to elements.
        // data should be in JSON form
        getNewContentForPanel: function (panel, contentContainer, url, data, headers) {
            var $rhea = this;
            if (!panel.hasClass('panel-loading')) {
                var spinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
                var loader = $('<div class="panel-loader"></div>');
                panel.addClass('panel-loading');
                panel.find('.panel-body').first().prepend(spinner);
                panel.find('.panel-footer').first().prepend(loader);

                if (headers == undefined || headers == null) {
                    headers = {};
                }

                if (headers[headerTypes.Ajax] == undefined || headers[headerTypes.Ajax] == null) {
                    headers[headerTypes.Ajax] = true;
                }
                
                var ajaxOptions = {
                    url: url,
                    global: false, // Prevents the "Please wait" notices set in $.ajaxStart(), $.ajaxSend(), etc. being triggered, as the loading spinner makes them redundant.
                    type: 'GET',
                    headers: headers,
                    success: function (data, textStatus, request) {
                        if ($.zeusValidate.sessionExpired(request)) {
                            return;
                        }
                        spinner.remove();
                        loader.remove();
                        panel.removeClass('panel-loading');
                        contentContainer.html(data);
                        $rhea.prepareNewContent(contentContainer);
                    }
                };
                if (data !== undefined) {
                    $.extend(ajaxOptions, {
                        type: 'POST',
                        data: data,
                        contentType: 'application/json; charset=utf-8',
                    });
                }
                $.ajax(ajaxOptions).fail(function(xhr, status, data) {

                    // Can't do this here. This assumes that any failure is a session expied, which simply isn't true. Causes invalid page reloads.
                    //if ($.zeusValidate.sessionExpired(data)) {
                    //    return;
                    //}
                    spinner.remove();
                    loader.remove();
                    panel.removeClass('panel-loading');
                    // To avoid JavaScript errors being thrown when 'CustomErrors' is ON and jqXHR.responseText does not contain '<body>'.
                    var check = /<body.*?>([\s\S]*?)<\/body>/img.exec(xhr.responseText);
                    if (check != undefined && check.length == 2) {
                        contentContainer.html('<div>Error loading content</div><div style="display: none">' + check[1] + '</div>');
                    } else {
                        var errorText = $.zeusValidate.getErrorInAjax(xhr);
                        errorText = (errorText != undefined ? errorText : 'Error occurred while loading.');
                        contentContainer.html(errorText);
                    }
                });
            }
        },


        // Call this function on new content to apply behaviours to it.
        prepareNewContent: function (newContent) {
            var originalElement = this.element;
            this.element = newContent;
            $.validator.unobtrusive.parseDynamicContent(newContent);
            this.applyBehaviours(true);
            this.element = originalElement;
            this.calculateColumnWidths();
        },

        // Returns a new jquery object that wraps the basic html for a modal dialog.
        // modalHeaderContents - HTML to put in the modal header
        // modalBodyContents - HTML to put in the modal header
        // modalFooterContents - HTML to put in the modal header
        makeModalDialogElement: function(modalHeaderContents, modalBodyContents, modalFooterContents, modalId) {
            var $rhea = this;
            modalHeaderContents = (modalHeaderContents != null && modalHeaderContents != '') ? modalHeaderContents : '&nbsp;';
            var modalHeader = '<div class="modal-header"><button type="button" class="close"><span aria-hidden="true">×</span><span class="readers">Close dialog</span></button>' + modalHeaderContents + '</div>';
            var modalBody = '<div class="modal-body">' + modalBodyContents + '</div>';
            var modalFooter = '<div class="modal-footer">' + modalFooterContents + '</div>';
            var modal = $('<div tabindex="-1" class="modal modal-message fade" id="'+modalId+'"><div class="modal-dialog"><span class="readers" >Dialog start</span><div class="modal-content">' + modalHeader + modalBody + modalFooter + '</div><span class="readers">Dialog End</span></div></div>'); // Prod defect 9446: Provide tabIndex -1 on outer div, this ensures that the div gets focused (even though it's not tabbable).
            modal.find('.modal-header button.close').on('click', function () { $rhea.dismissModalDialogElement(modal); });
            return modal;
        },

        // Shows a modal dialog created with makeModalDialogElement. Use this instead of .modal() as this function places the focus correctly, and handles adding it to the body
        showModalDialogElement: function(modal) {
            modal.data('previousActiveElement', $(document.activeElement));
            $('body').append(modal);
            modal.modal({ backdrop: 'static', keyboard: false }); // Keyboard: true Closes the modal when escape key is pressed.
            window.setTimeout(function () {
                modal.find('.modal-dialog').children('span').first().focus();
            }, 400);            
        },

        // Dismisses a modal dialog created with makeModalDialogElement. Use this rather that [data-dismiss="modal"] elements as this properly returns keyboard focus
        dismissModalDialogElement: function (modal) {
            var dismisser = $('<a>').attr('data-dismiss', 'modal');
            modal.append(dismisser);
            dismisser.trigger('click');
            modal.data('previousActiveElement').focus();
            setTimeout(function () { modal.remove(); }, 500);
        },

        applyBehaviours: function (blnRunResponsiveTables) {
            this.skip();
            this.resize();
            this.maxlength();
            this.primary();
            this.userDefaults();
            this.datetimepicker();
            this.datepicker();
            this.timepicker();
            this.dropdowns();
            this.processTreeview();
            this.ajaxfield();
            this.searchModals();
            this.contingentif();
            this.ajaxloadif();
            this.actionif();
            this.paged();
            this.multiplegridselect();
            this.senddisabled();
            this.gst();
            this.age();
            this.copy();
            this.relativedate();
            this.historypin();
            this.numeric();
            this.crn();
            this.reset();
            this.clear();
            this.inlinegrid();
            this.ajaxgrid();
            this.gridstyle();
            this.expandCollapseAll();
            this.trigger();
            this.gridSortable();
            this.filterGrid();
            this.gridcolumnselector();
            this.focuserrors();
            this.processRichTextBox(); // Adding it before the 'tooltipposition' method so hint tip (showing the accessibility shortcuts) works.
            this.tooltipposition();
            this.tooltiplinks();
            this.switchers();
            this.checkboxesadditions();
            this.flotGraphs();
            this.ajaxproperty();
            this.widgets();
            if (blnRunResponsiveTables)
            {
                this.responsivetables();
            }
            this.processCalendar();
            this.equaliseReadOnlyViews();
            //this.equalizepanels();
            this.dateBasedContent();
            this.quickfinds();
            this.collapseRightSidebar();
            this.processFullHeightContent();
            this.savedSearchPopup();
            this.timelineLoadMore();
            this.fixColorAdminProblems();
            this.fixMarkup();
            this.generateMainFormJumpList(); // needs to be called after fixMarkup() because panel-headings are updated.
            this.monitorBulletins();
            //this.redirectDocumentUploadDownload();
            //this.processFixedTableHeader();
            this.dirtycheck(); // should always be last
            this.autoLoadUrls(); // Well, except for this, which should be even more last.
        },

        postApplyBehavioursInit: function () {
            var self = this;
            this.calculateColumnWidths();
            $(document).on('resize.columnwidths', function () { self.calculateColumnWidths(); });

            // Do initial load of data for widgets
            $('[' + fullDataTypes.Click + '=reload]').trigger("click");

            // Do alerts
            this.alerts();

            // Setup contract modal for left-hand menu (used when the user selects a menu item that has more than one contract type but those contract types are different to the users current contract)
            this.contractmodal();
            
            // Setup pickers
            this.contractpicker();
            this.orgsitepicker();
            this.menufiltering();

            // Settings menu
            this.settingsmenu();

            this.accessKeys();

            // Focus the 'Skip to Content' Link instead of letting browser to handle the focus (which usually goes to address bar).
            var skipToContentLink = $("#skipLinks");//$("li a[href='#content']"); // Instead of focusing the link, we will focus on <ul> containing the link so links don't show up upon page load.
            if (skipToContentLink != undefined) {
                skipToContentLink.focus();
            }
            

            this.hubconfiguration();

            this.responsivetables();
        },

        hubconfiguration: function () {
            return; // Disabled for the moment as we don't have time to properly performance test this.
            // Reference the auto-generated proxy for the hub.  
            var userMessagingHub;
            if ($.connection) userMessagingHub = $.connection.userMessagingHub;
            if (userMessagingHub) {
                // Create a function that the hub can call back to display messages.
                userMessagingHub.client.receiveMessage = function (message) {
                    var alertContainer = $('#zeus-alert');
                    if (alertContainer.length) {
                        $.gritter.add({
                            title: '',
                            text: message,
                            image: '',
                            sticky: true,
                            time: '',
                            class_name: 'my-sticky-class'
                        });
                    }
                };

                // Start the connection.
                $.connection.hub.start().done(function () {
                    //userMessagingHub.server.hello();// Calls a method Hello() on server in the implementation of 'UserMessagingHub' class.
                });
            }
        },

        equalizepanels: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('div.row').each(function () {
                var row = $(this);
                if (row.closest('.zeus-widget-container').length == 0) { // Don't equalise widgets
                    row.equalize({ equalize: 'height', reset: false, children: '.panel' });
                    
                    // change height to min-height
                    row.find('.panel').each(function () {
                        var panel = $(this)
                        panel.css('min-height', panel.css('height'));
                        panel.css('height', '');
                    });
                }
            });
        },
        
        contractmodal: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var getBackgroundColourFromWidget = function (widget) {
                var colour = widget.data('bg-col');
                
                if (colour != undefined) {
                    return colour;
                }

                colour = 'black';
                
                var c = widget.attr('class').split(' ');
                
                for (var i = 0; i < c.length; i++) {
                    if (c[i].indexOf('bg-') == 0) {
                        colour = c[i].substr(3, c[i].length - 3);

                        widget.data('bg-col', colour);
                        break;
                    }
                }

                return colour;
            };
            
            // Contract tile hover states
            function setLight() {
                var widget = $($(this).find('.widget')[0]);
                var colour = getBackgroundColourFromWidget(widget);
                var lightClass = 'bg-' + colour;
                var darkClass = 'bg-' + colour + '-darker';
                widget.removeClass(darkClass).addClass(lightClass);
            }
            function setDark() {
                var widget = $($(this).find('.widget')[0]);
                var colour = getBackgroundColourFromWidget(widget);
                var lightClass = 'bg-' + colour;
                var darkClass = 'bg-' + colour + '-darker';
                widget.removeClass(lightClass).addClass(darkClass);
            }
            root.find('a.contract-picker').hover(setDark, setLight).focus(setDark).blur(setLight);

            root.find('[' + fullDataTypes.ContractsForContractModal + ']').bind('click.zeus-contractmodal', function (e) {
                e.preventDefault();
                
                var menulink = $(this);
                var contractsData = menulink.data(dataTypes.ContractsForContractModal);
                
                if (contractsData == undefined || contractsData.length == 0) {
                    return;
                }

                var contracts = contractsData.split(',');
                var modal = $('#contract_modal');
                var currentContract = $('[' + fullDataTypes.CurrentContract + ']').data(dataTypes.CurrentContract);
                
                // Preparae modal
                modal.find('.modal-body a').each(function() {
                    var contractlink = $(this);

                    contractlink.addClass('hidden');
                    
                    var contractlinkContract = contractlink.find('.stats-desc')[0].innerHTML;
                    
                    for (var i = 0; i < contracts.length; i++) {
                        if (contractlinkContract == contracts[i]) {
                            contractlink.removeClass('hidden');
                        }
                    }
                    
                    contractlink.bind('click.zeus-contractmodallink', function (event) {
                        event.preventDefault();

                        var menuhref = menulink.attr('href');
                        var contractReplacement = '/' + contractlinkContract + '/';
                        var currentContractFind = '/' + currentContract + '/';
                        var contractIndex = menuhref.indexOf(currentContractFind);

                        $.zeusValidate.alwaysIgnoreDirty = true;
                        window.location.href = menuhref.substr(0, contractIndex) + contractReplacement + menuhref.substr(contractIndex + currentContractFind.length, menuhref.length - contractIndex + currentContractFind.length);
                    });

                });

                modal.modal({ backdrop: 'static', keyboard: false }); // Keyboard: true Closes the modal when escape key is pressed.
            });
        },
        
        alerts: function () {
            var alertContainer = $('#zeus-alert');
            
            if (alertContainer.length) {
                var data = alertContainer.data('zeus-alerts');
                
                for (var i = 0; i < data.length; i++) {
                    $.gritter.add({
                        title: '',
                        text: data[i].Text,
                        image: '',
                        sticky: true,
                        time: '',
                        class_name: 'my-sticky-class'
                    });
                }
            }
        },

        contractpicker: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('a.contract-picker-launch').each(function () {
                var link = $(this);
                var contractpicker = link.closest('.sidebar').find('.contract-picker-list');
                // Setup show/hide behaviour
                link.on('click', function (event) {
                    if (contractpicker.css('display') != 'block') {
                        event.stopPropagation();
                        var readersText = link.find('.readers').last();
                        readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                        contractpicker.css('display', 'block');
                        $(document).on('click.contractpicker-autoclose', closeContractPicker);
                        $(document).on('keydown.contractpicker-autoclose', function (event) {
                            if (event.which == 27) { // Close on escape key
                                closeContractPicker();
                            }
                        });
                        function closeContractPicker() {
                            // Hide the control
                            contractpicker.css('display', 'none');
                            readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                            $(document).off('.contractpicker-autoclose');
                        }
                    }
                })
            });
        },

        menufiltering: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            var bottomUpMenuLinkSelectors = ['.sidebar .nav > .has-sub .sub-menu li.has-sub > a', '.sidebar .nav > .has-sub > a'];
            var bottomUpMenuSelectors = ['.sidebar .nav > li > ul > li > ul', '.sidebar .nav > li > ul'];

            // Called after searches on contract filtering to make the higher level menu items show/hide based on if they have visible children
            function showHideHigherLevelMenus() {
                for (var i in bottomUpMenuSelectors) {
                    var selector = bottomUpMenuSelectors[i];
                    root.find(selector).each(function () {
                        if ($(this).find('li:not(.hide, .sidebar-subnav-header)').length > 0) {
                            $(this).closest('li').removeClass('hide');
                        }
                        else {
                            $(this).closest('li').addClass('hide');
                        }
                    });
                }
            }

            // Basic setup of select/deselect events for all anchors
            root.find('.menu-filter a').on("click.menu-filtering", function () {
                if ($(this).hasClass('selected')) {
                    $(this).trigger('deselect.menu-filtering');
                }
                else {
                    $(this).trigger('select.menu-filtering');
                }
            });
            root.find('.menu-filter a').on("select.menu-filtering", function () {
                $(this).addClass('selected');
                $(this).addClass($(this).parent().attr('data-background-class'));
                var readerText = $(this).find('.readers');
                readerText.text(readerText.text().replace(', not selected', ', selected'));
            });
            root.find('.menu-filter a').on("deselect.menu-filtering", function () {
                $(this).removeClass('selected');
                $(this).removeClass($(this).parent().attr('data-background-class'));
                var readerText = $(this).find('.readers');
                readerText.text(readerText.text().replace(', selected', ', not selected'));
            });

            // Current contract only
            root.find('.contract-menu-filter').on("select.menu-filtering", function () {
                sessionStorage['contract-menu-filter'] = true;
                root.find('.sidebar .nav li.not-cc-valid').addClass('hide');
                showHideHigherLevelMenus();
            })
            .on("deselect.menu-filtering", function () {
                sessionStorage.removeItem('contract-menu-filter');
                root.find('.sidebar .nav li.not-cc-valid').removeClass('hide');
                showHideHigherLevelMenus();
            })
            .each(function () {
                if (sessionStorage['contract-menu-filter']) $(this).trigger('select');
            });

            // Expand all/ collapse all
            root.find('.expand-collapse-menu-filter').on("select.menu-filtering", function () {
                if (root.find('.page-sidebar-minified').length > 0) return;
                sessionStorage['expand-collapse-menu-filter'] = true;
                $(this).find('i').removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
                for (var i in bottomUpMenuLinkSelectors) {
                    var selector = bottomUpMenuLinkSelectors[i];
                    root.find(selector).each(function () {
                        $(this).next('.sub-menu').slideDown(250);
                        var readersText = $(this).find('.readers').first();
                        readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                    });
                }
                var readerText = $(this).find('.readers');
                readerText.text(readerText.text().replace('Expand', 'Collapse'));
            })
            .on("deselect.menu-filtering", function () {
                if (root.find('.page-sidebar-minified').length > 0) return;
                sessionStorage.removeItem('expand-collapse-menu-filter');
                $(this).find('i').removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
                for (var i in bottomUpMenuLinkSelectors) {
                    var selector = bottomUpMenuLinkSelectors[i];
                    root.find(selector).each(function () {
                        $(this).next('.sub-menu').slideUp(250);
                        var readersText = $(this).find('.readers').first();
                        readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                    });
                }
                var readerText = $(this).find('.readers');
                readerText.text(readerText.text().replace('Collapse', 'Expand'));
            })
            .each(function () {
                if (sessionStorage['expand-collapse-menu-filter']) $(this).trigger('select');
            });

            // Search
            root.find('div.search-menu-filter input').on('input.menu-filtering', function () {
                var text = $.zeusValidate.getValueFromInput($(this)) || '';
                sessionStorage['search-menu-filter'] = text;
                var searchregexp = new RegExp(text.toLowerCase());
                //root.find('.sidebar .nav > li:not(.has-sub), .sidebar .nav > li.has-sub > ul > li:not(.has-sub) > a, .sidebar .nav > li.has-sub > ul > li.has-sub > ul > li:not(.has-sub) > a').each(function () {
                root.find('.sidebar .nav li:not(.has-sub) > a').each(function () {
                    if (text == '' || searchregexp.test($(this).text().toLowerCase())) {
                        $(this).closest('li').removeClass('hide');
                    }
                    else {
                        $(this).closest('li').addClass('hide');
                    }
                });
                showHideHigherLevelMenus();
            });
            root.find('a.search-menu-filter').on("select.menu-filtering", function () {
                sessionStorage['search-menu-filter'] = '';
                $(this).siblings('a.contract-menu-filter').trigger('deselect');
                $(this).siblings('a.expand-collapse-menu-filter').trigger('select');
                var searchdiv = $(this).closest('div.menu-filter').find('div.search-menu-filter');
                searchdiv.show();
                searchdiv.find('input').focus();
            })
            .on("deselect.menu-filtering", function () {
                var input = $(this).closest('div.menu-filter').find('div.search-menu-filter input');
                input.val('').trigger('input.menu-filtering');
                sessionStorage.removeItem('search-menu-filter');
                $(this).closest('div.menu-filter').find('div.search-menu-filter').hide();
                $(this).siblings('a.expand-collapse-menu-filter').trigger('deselect');
            })
            .each(function () {
                var stored = sessionStorage['search-menu-filter'];
                if (stored != undefined) {
                    $(this).trigger('select');
                    var input = $(this).closest('div.menu-filter').find('div.search-menu-filter input');
                    input.val(stored).trigger('input.menu-filtering');
                }
            });
        },

        gridcolumnselector: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            root.find('a[data-toggle="columnselector-dropdown"]').each(function() {

                var link = $(this);
                var columnSelectorContainer = link.parent().find('ul.columnselector');
                var hiddenClass = 'hidden';
                var animationClass = 'fadeInDown animated';
                var applyBtn = columnSelectorContainer.find('.btn-primary');
                var closeBtn = columnSelectorContainer.find('.btn-close');
                var checkboxes = columnSelectorContainer.find('.check-box-list input[type="checkbox"]');
                var checked = {};
                var disabled = { };

                // Always hide close button as we're currently not using it
                closeBtn.addClass(hiddenClass);

                link.click(function(e) {
                    e.stopPropagation();                    
                    if (columnSelectorContainer.hasClass(hiddenClass)) {
                        columnSelectorContainer.removeClass(hiddenClass);
                        columnSelectorContainer.addClass(animationClass);
                        link.parent().addClass('open');

                        // Determine current state of checkboxes so we can revert back to it if the user closes without applying the changes
                        checked = {};
                        disabled = {};
                        
                        checkboxes.each(function () {
                            var chk = $(this);
                            checked[chk.attr('id')] = chk.attr('checked');
                            disabled[chk.attr('id')]= chk.attr('disabled');
                    });

                    } else {
                        columnSelectorContainer.removeClass(animationClass);
                        columnSelectorContainer.addClass(hiddenClass);
                        link.parent().removeClass('open');
                    }
                });

                // To ensure drop down is not closed when user clicks inside of it, we will bind an event handler on that.
                columnSelectorContainer.click(function (e) {
                    e.stopPropagation();
                });

                columnSelectorContainer.keydown(function (e) {
                    // ENTER
                    if (e.keyCode == 13) {
                        // Only propagate if focus is on a button
                        if (!(closeBtn.is(':focus') || applyBtn.is(':focus'))) {
                            e.preventDefault();
                        }
                    }
                });

                root.click(closeColumnSelectorDropdown);

                closeBtn.click(closeColumnSelectorDropdown);

                function closeColumnSelectorDropdown() {
                    // If dropdown is opened.
                    if (!columnSelectorContainer.hasClass(hiddenClass)) {
                        columnSelectorContainer.addClass(hiddenClass);
                        
                        link.parent().removeClass('open');

                        handleBootstrapDropdownReaderText(link);// Update reader text depending on state of open/close.

                        // Restore original state
                        if (!$.isEmptyObject(checked) && !$.isEmptyObject(disabled)) {
                            for (var key in checked) {
                                var c = $('#' +key);
                                c.removeAttr('checked');
                                if (checked[key]) {
                                    c.attr('checked', 'checked');
                                }
                            }

                            for (var key in disabled) {
                                var c = $('#' +key);
                                c.removeAttr('disabled');
                                
                                if(disabled[key]) {
                                    c.attr('disabled', 'disabled');
                                }
                            }
                        }
                    }
                }

                applyBtn.click(function () {
                    // Update the initialValue of each column selector checkbox so it doesn't trigger the dirty state
                    checkboxes.each(function () {
                        var cb = $(this);
                        cb.data('initialValue', $.zeusValidate.getValueFromInput(cb));
                    });

                    // Trigger the load more for this, forcing it to start again from page 0
                    $rhea.loadMoreResults(link.parent().parent().find('.rhea-paged'), true);

                    // Clear restore so it keeps the newly applied settings
                    checked = {};
                    disabled = {};

                    closeColumnSelectorDropdown();
                });

                function handleBootstrapDropdownReaderText(element) {
                    var li = element.parent();
                    var readersText = element.find('.readers').first();
                    if (readersText.length > 0) {
                        window.setTimeout(function () {
                            if (li.hasClass('open')) {
                                readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                            }
                            else {
                                readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                            }
                        }, 50);
                    }
                }
            });
        },

        settingsmenu: function() {            
            var root = $(this.element) || $(document);
            var pageContainer = root.find('#page-container');
            root.find('a[data-toggle="settings-dropdown"]').each(function() {

                var link = $(this);
                var settingsDiv = link.parent().find('div.settings');
                var hiddenClass = 'hidden';
                var animationClass = 'fadeInDown animated';
                var responsiveTable = settingsDiv.find('input[name="ResponsiveTable"][type="hidden"]').siblings('div.switcher');
                var fixedHeader = settingsDiv.find('input[name="FixedHeader"][type="hidden"]').siblings('div.switcher');
                var colourSchemeRadio = settingsDiv.find('input[type=radio][name="ColourScheme"]');
                var settingsVal = settingsDiv.find('[data-settings="true"]').attr('data-value');
                var settings = $.parseJSON(settingsVal);

                link.click(function(e) {
                    e.stopPropagation();                    
                    if (settingsDiv.hasClass(hiddenClass)) {
                        settingsDiv.removeClass(hiddenClass);
                        settingsDiv.addClass(animationClass);
                        // Close other dropdowns that are opened.
                        root.find('ul.dropdown-menu, div.sitepicker, div.settings').each(function () {
                            var element = $(this);
                            if (element.hasClass('contract-picker-list') || element.hasClass('sitepicker')) {
                                // This is contract-picker/settings menu/sitepicker so doesn't have parentListItem.
                                element.css('display', 'none');
                            } else if (element.closest('li.dropdown, div.dropdown').length == 1) {
                                element.closest('li.dropdown, div.dropdown').removeClass('open');
                            }
                        });
                        // Then add the open class to li for 'settings' which highlights the icon by making the color: white.
                        link.closest('li.dropdown').addClass('open');
                    } else {
                        settingsDiv.removeClass(animationClass);
                        settingsDiv.addClass(hiddenClass);                        
                        link.closest('li.dropdown').removeClass('open');
                    }
                });

                applySettings();

                function applySettings() {
                    $.zeusValidate.userSettings.FixedHeader = settings.FixedHeader;
                    $.zeusValidate.userSettings.ResponsiveTable = settings.ResponsiveTable;
                    $.zeusValidate.userSettings.ColourScheme = settings.ColourScheme;
                    // Process each setting one by one.
                    if (!settings.FixedHeader) {
                        // Turn off fixed sidebar
                        pageContainer.removeClass('page-sidebar-fixed');
                        pageContainer.find('.sidebar').css('top', '-50px'); // when sidebar is not fixed, it tends to leave empty black space at the top so we move the top by 50px.
                        root.find('.sidebar [data-scrollbar="true"]').each(function() {
                            $(this).removeAttr('style');
                            $(this).slimScroll({ destroy: true });
                        });
                        if (pageContainer.find('.sidebar-bg').length === 0) {
                            pageContainer.append('<div class="sidebar-bg"></div>');
                        }
                        if (pageContainer.find('.sidebar-bg.sidebar-right').length === 0) {
                            $('<div class="sidebar-right sidebar-bg" style="width: 240px;"></div>').appendTo(pageContainer);
                        }
                    }
                    if (!settings.ResponsiveTable) {
                        // Turn off Responsive table (handled in _Layout.cshtml server-side).
                    }
                }

                function restoreSettings() {
                    // Process each setting one by one.
                    if (fixedHeader.length) {
                        if (settings.FixedHeader) {
                            // Turn off fixed header
                            fixedHeader.find('.centre').css('left', '55px'); // slide right if true.
                        } else {
                            fixedHeader.find('.centre').css('left', '5px'); // slide left if false.
                        }
                    }
                    if (responsiveTable.length) {
                        if (settings.ResponsiveTable) {
                            // Turn off Responsive table.
                            responsiveTable.find('.centre').css('left', '55px'); // slide right if true.
                        } else {
                            responsiveTable.find('.centre').css('left', '5px'); // slide left if false.
                        }
                    }
                    switch (settings.ColourScheme) {
                        case 0: // default
                            $(getRadioButtonInColourScheme("Default")).attr('checked', 'checked');
                            break;
                        case 1: // dark
                            $(getRadioButtonInColourScheme("Dark")).attr('checked', 'checked');
                            break;
                        case 2: // black
                            $(getRadioButtonInColourScheme("Black")).attr('checked', 'checked');
                            break;
                        case 3: // white
                            $(getRadioButtonInColourScheme("White")).attr('checked', 'checked');
                            break;
                        default:
                            $(getRadioButtonInColourScheme("Default")).attr('checked', 'checked');
                            break;
                    }
                }

                function getRadioButtonInColourScheme(buttonValue) {
                    return $.grep(colourSchemeRadio, function(elementInArray, indexOfElement) {
                        // function should return a boolean value.
                        return $(elementInArray).attr('value') == buttonValue;
                    });
                }

                // To ensure drop down is not closed when user clicks inside of it, we will bind an event handler on that.
                settingsDiv.click(function (e) {
                    e.stopPropagation();
                });
                root.click(closeSettingsDropdown);
                // Close settings dropdown if user clicks on any of the other dropdown menus.
                root.find('a[data-toggle="dropdown"].dropdown-toggle').click(closeSettingsDropdown);
                $(root).on('keydown.settings-autoclose', function(event) {
                    if (event.which == 27) {
                        closeSettingsDropdown();
                    }
                });

                function closeSettingsDropdown() {
                    // If dropdown is opened.
                    if (!settingsDiv.hasClass(hiddenClass)) {
                        settingsDiv.addClass(hiddenClass);
                        link.closest('li.dropdown').removeClass('open');
                        handleBootstrapDropdownReaderText(link);// Update reader text depending on state of open/close.
                        // If user has changed any setting (and has not submitted the form, we need to restore those to their original value).
                        restoreSettings();
                    }
                }

                function handleBootstrapDropdownReaderText(element) {
                    var li = element.parent();
                    var readersText = element.find('.readers').first();
                    if (readersText.length > 0) {
                        window.setTimeout(function () {
                            if (li.hasClass('open')) {
                                readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                            }
                            else {
                                readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                            }
                        }, 50);
                    }
                }
            });
        },

        orgsitepicker: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.sitepicker-launch').each(function() {
                var link = $(this);
                var sitepicker = link.parent().siblings('.sitepicker');
                var orgHidden = sitepicker.find('#RealOrg');
                var siteHidden = sitepicker.find('#RealSite');
                var orgInput = sitepicker.find('#EffectiveOrg');
                var siteInput = sitepicker.find('#EffectiveSite');
                var url = $.zeusValidate.getValueFromInput(sitepicker.find('#UrlTemplate'));
                var buttons = sitepicker.find('button[type="submit"]');

                // Make the the org/site picker not interfere with the dirty check
                buttons.off('click.rhea-ignoredirty');
                orgInput.removeData('initialValue');
                siteInput.removeData('initialValue');

                // Store orignal values so we can rest the org/site picker when it closes
                orgInput.data('originalValue', $.zeusValidate.getValueFromInput(orgInput));
                orgInput.data('originalText', orgInput.text());
                siteInput.data('originalValue', $.zeusValidate.getValueFromInput(siteInput));
                siteInput.data('originalText', siteInput.text());

                // Setup show/hide behaviour
                link.on('click', function (event) {
                    if (sitepicker.css('display') != 'block') {
                        event.stopPropagation();
                        sitepicker.css('display', 'block');
                        sitepicker.addClass("fadeInDown animated");
                        sitepicker.on('mousedown.sitepicker-autoclose', function (event) {
                            event.originalEvent.sitepickerinsidetrigger = true;
                        });
                        $(document).on('mousedown.sitepicker-autoclose', function (event) {
                            if (!event.originalEvent.sitepickerinsidetrigger) {
                                closeOrgSitePicker();
                            }
                        });
                        $(document).on('keydown.sitepicker-autoclose', function (event) {
                            if (event.which == 27) { // Close on escape key
                                closeOrgSitePicker();
                            }
                        });
                        function closeOrgSitePicker() {
                            // Revert to original values
                            orgInput.data('ariaSelectReference').selectOrCreateChoice(orgInput.data('originalValue'), orgInput.data('originalText'), true);
                            siteInput.data('ariaSelectReference').selectOrCreateChoice(siteInput.data('originalValue'), siteInput.data('originalText'), true);
                            siteInput.data('ariaSelectReference').setEnabled(true);
                            sitepicker.find('.alert').remove();

                            // Hide the control
                            sitepicker.css('display', 'none');
                            sitepicker.removeClass("fadeInDown animated");
                            $(document).off('.sitepicker-autoclose');
                            sitepicker.off('.sitepicker-autoclose');
                        }
                    }
                })
                // Setup change behaviour
                buttons.on("click", function (event) {
                    event.preventDefault();
                    var org, site;
                    if ($(this).text() == "Submit") {
                        org = $.zeusValidate.getValueFromInput(orgInput);
                        site = $.zeusValidate.getValueFromInput(siteInput);
                    }
                    else if ($(this).text() == "Reset to Primary") {
                        org = $.zeusValidate.getValueFromInput(orgHidden);
                        site = $.zeusValidate.getValueFromInput(siteHidden);
                    }

                    if (org != '' && site != '') {
                        var newLocation = url.replace('ZEUS_ORG', org).replace('ZEUS_SITE', site);
                        window.location.href = newLocation; // Navigate to new page
                    }
                    else {
                        if (sitepicker.find('div.alert.alert-danger').length == 0) { // Ensures that this message doesn't get duplicated.
                            $("<div>").text("You must select an Org and Site").addClass("alert alert-danger").appendTo(sitepicker);
                        }
                    }
                });
            });
        },

        primary: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('input[type="text"], input[type="email"]').bind('keypress.rhea-primary', function (e) {
                var property = $(this);
                var readonly = property.attr('disabled') || property.attr('readonly');
                
                // On ENTER and not readonly, submit closest primary button, otherwise allow browser to decide
                if (e.which == 13) {
                    
                    if (readonly) {
                        e.preventDefault();
                        return false;
                    }
                    
                    var primary = property.closest('fieldset').find('.btn-primary').not(':hidden')[0];
                    
                    if (primary == undefined) {
                        primary = property.closest('form').find('.btn-primary').not(':hidden')[0];
                    }
                    
                    if (primary != undefined) {
                        primary.click();
                        e.preventDefault();
                        return false;
                    }
                }

                return true;
            });
            

            // manual overriding of Primary Button on Keyboard ENTER.
            /*
             root.find('fieldset').bind('keypress.rhea-primary', function(e) {

                var property = $(this);

                // if e.target.tagName != 'A'

                if (e.target.tagName != 'A') {
                    //on ENTER in fieldset
                    if (e.which == 13) {
                        // find the .primary button within the fieldset
                        var primary = property.find('.primary').not(':hidden')[0];

                        if (primary == undefined) {
                            // find button within the fieldset
                            primary = property.find('button[type="submit"]').not(':hidden')[0];

                            if (primary == undefined) {
                                // find closest button to fieldset
                                primary = property.closest('button[type="submit"]').not(':hidden')[0];

                                if (primary == undefined) {
                                    // find primary button for the form
                                    primary = root.find('.primary').not(':hidden')[0];
                                }
                            }
                        }
                        if (primary != undefined) {
                            primary.click();
                            primary.focus();
                            e.preventDefault();
                            return false;
                        }
                    }
                }
                return true; // prevent browser triggering the button  
            }); 
            */
        },
        
        focuserrors: function () {
            var root = $(this.element) || $(document);
            if ($.zeusValidate.skipNextFocusErrors) {
                $.zeusValidate.skipNextFocusErrors = false;
                return;
            }
            
            setTimeout(function () {
                // After page load, if there are any error, warning, information or success messages then focus #content so the messages are read to screen-reader users
                var errors = root.find('#validation-error-summary ul li');
                var success = root.find('section.msgGood ul li');
                var warning = root.find('section.msgWarn ul li');
                var information = root.find('section.msgInfo ul li');
                var scrollContainer = root.find('div#page-container');
                // Summary exists and is not hidden and contains messages
                if (errors.length > 0 && errors.not(':hidden')) {
                    // Focus main error form header
                    var errorHeading = root.find('#validation-error-summary h4');
                    
                    if (errorHeading.length) {
                        // Temporarily add tabindex to allow focus on non <input>, <a> and <select> element
                        errorHeading.attr('tabindex', '-1');
                    
                        // Apply focus
                        errorHeading.focus();
                        scrollContainer.animate({ scrollTop: 0 }, "fast"); // Sometimes error message is hidden behind the page 'header', so we scroll to top. Alternatively we can use window.scroll(0,0); if animation is not desired.
                        // Remove tabindex
                        //errorHeading.removeAttr('tabindex');

                        // When the errors are added via ModelState, the alert-link  will contain '#' followed by the ID of the element to put focus on, we will handle that here.
                        errors.find('a.alert-link').click(function (e) {
                            e.preventDefault();
                            var errorLink = $(this);
                            var elementId = errorLink.attr('href');
                            $.zeusValidate.focusErrorOnElement(root.find(elementId));
                        });
                    }
                } else if (success.length > 0 && success.not(':hidden')) {
                    // Focus success header
                    var successHeading = root.find('section.msgGood h4');
                
                    if (successHeading.length) {
                        // Temporarily add tabindex to allow focus on non <input>, <a> and <select> element
                        successHeading.attr('tabindex', '-1');
                    
                        // Apply focus
                        successHeading.focus();
                        scrollContainer.animate({ scrollTop: 0 }, "fast"); // Sometimes error message is hidden behind the page 'header', so we scroll to top. Alternatively we can use window.scroll(0,0); if animation is not desired.

                        // Remove tabindex
                        //successHeading.removeAttr('tabindex');
                    }
                } else if (warning.length > 0 && warning.not(':hidden')) {
                    // Focus warning header
                    var warningHeading = root.find('section.msgWarn h4');
                
                    if (warningHeading.length) {
                        // Temporarily add tabindex to allow focus on non <input>, <a> and <select> element
                        warningHeading.attr('tabindex', '-1');
                    
                        // Apply focus
                        warningHeading.focus();
                        scrollContainer.animate({ scrollTop: 0 }, "fast"); // Sometimes error message is hidden behind the page 'header', so we scroll to top. Alternatively we can use window.scroll(0,0); if animation is not desired.
                    
                        // Remove tabindex
                        //warningHeading.removeAttr('tabindex');
                    }
                } else if (information.length > 0 && information.not(':hidden')) {
                    // Focus information header
                    var informationHeading = root.find('section.msgInfo h4');
                
                    if (informationHeading.length) {
                        // Temporarily add tabindex to allow focus on non <input>, <a> and <select> element
                        informationHeading.attr('tabindex', '-1');
                    
                        // Apply focus
                        informationHeading.focus();
                        scrollContainer.animate({ scrollTop: 0 }, "fast"); // Sometimes error message is hidden behind the page 'header', so we scroll to top. Alternatively we can use window.scroll(0,0); if animation is not desired.
                        // Remove tabindex
                        //informationH2.removeAttr('tabindex');
                    }
                }
            }, 500); // Defect 12210: increasing the timeout to allow focus on errors inside modal.
        },
        
        resize: function () {
            $('textarea').autoGrow({});
        },

        maxlength: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            // Set character counter on elements with maxlength, but not including numeric length elements because bootstrap-maxlength can't handle these.
            root.find('[maxlength]').not('[data-val-range]').each(function () {
                // Don't apply this to read only fields unless they might be editable later on
                if ($(this).is(':disabled, [readonly]') && !$(this).attr(fullDataTypes.ContingentEditableIf) && !$(this).attr(fullDataTypes.ContingentReadOnlyIf)) return;

                var property = $(this);
                var maxlength = property.attr('maxlength');

                var initialDisplay = property.css('display');
                property.css('display', 'block'); // Temporarily make this visible otherwise bootstrap-maxlength will fail at an inconvenient later stage.
                property.maxlength({
                    alwaysShow: true,
                    threshold: maxlength,
                    warningClass: "label label-success",
                    limitReachedClass: "label label-danger",
                    separator: ' of ',
                    preText: 'You have used ',
                    postText: ' chars.',
                    validate: true
                });
                property.css('display', initialDisplay);

                property.bind('focus resize', function (e) {
                    // Wait for the indicator to render.
                    setTimeout($.zeusValidate.adjustPostionOnScroll(property, 'scroll.zeus-maxindicator', 'span.bootstrap-maxlength'), 20);
                });
            });




        },

        skip: function () {
            var content = $('#content');
            
            if (content != undefined) {
                $.zeusValidate.alwaysIgnoreDirty = (/^true$/i.test(content.data(dataTypes.SkipUnsavedChanges))) ? true : false;
                
                // Note: Skip validation is handled in rhea.validate.unobtrusive's ignore function
            }
            
            // [SkipLink] attribute
            //Loop through all the elements with data-rhea-skiplink
            var root = $(this.element) || $(document);
            
            var skipLinks = root.find('[' + fullDataTypes.SkipLink + ']'); //Gets all elements that have data-rhea-skiplink
            if (skipLinks !== undefined) {
                for (var i = 0; i < skipLinks.length; i++) {
                    var skipLinkProp = $(skipLinks[i]);
                    $('#skipLinks').find('ul')[0].innerHTML += '<li><a href=\"#' + skipLinkProp.attr('id') + '\">skip to ' + skipLinkProp.attr(fullDataTypes.DisplayName).toLowerCase() + '</a></li>';
                } 
            }
             
            //check to see if the page has element with ID = elementName + "Table"
            //this indicates that tables exists which has been assigned skipLink attribute
            var skipLinksTable = root.find('[' + fullDataTypes.SkipLinkTable + ']'); // Gets all elements/grids that have this attribute
            
            if (skipLinksTable !== undefined) {
                for (var j = 0; j < skipLinksTable.length; j++) {

                    var skipLinkPropTable = $(skipLinksTable[j]);
                    var skipLinkPropTableChildTable = $(skipLinkPropTable).find('table')[0];
                    if (skipLinkPropTableChildTable !== undefined) {//check if skipLinkProp has any children in it. That is, if table or results are rendered.
                        var tableIdAssigned = skipLinkPropTableChildTable.id;
                        if (tableIdAssigned !== undefined)  // table with this ID exists
                        { 
                            var skipLinkName = skipLinkPropTable.attr(fullDataTypes.DisplayName);
                            if ($(skipLinkPropTable.prev('legend')).length > 0)
                                skipLinkName = $(skipLinkPropTable.prev('legend'))[0].outerText;
                            $('#skipLinks').find('ul')[0].innerHTML += '<li><a href=\"#' + tableIdAssigned + '\">skip to ' + skipLinkName.toLowerCase() + '</a></li>';
                        }
                    }

                }
            } 



                  
        },
        
        serializeform: function (form) {
            // Find disabled inputs, and remove the "disabled" attribute
            var disabled = form.find(':input:disabled').removeAttr('disabled');

            // Serialize the form with the disabled inputs now included
            var serialized = form.serialize();
            
            // re-disable the set of inputs that were formerly disabled
            disabled.attr('disabled', 'disabled');

            return serialized;
        },
        
        dirtycheck: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('button').each(function () {
                    if (!$(this).hasEvent('click.rhea-ignoredirty')) {
                        $(this).bind('click.rhea-ignoredirty', function () {
                            // Ignore links that open in a new window or those that do not navigate
                            $.zeusValidate.ignoreDirty = true;
                        });
                    }
            });
            
            root.find('input,textarea,select').each(function () {
                if ($(this).attr('type') == 'radio') {
                    $(this).data('initialValue', this.checked);
                }
                else {
                    $(this).data('initialValue', $.zeusValidate.getValueFromInput($(this)));
                }
            });
            // Remove the quickfinds and widget views and menu filter and grid filter as they shouldn't trigger the dirty check
            root.find('.history input, .history textarea, .history select, .zeus-widget-view-list input, .zeus-widget-view-list textarea, .zeus-widget-view-list select, .menu-filter input, .zeus-grid-filter, .ztv-selected, .ztv-expanded,' + '[' + fullDataTypes.IgnoreDirtyCheck + '="true"]')
                .removeData('initialValue');

            var catcher = function () {
                var changed = false;

                $('input,textarea,select').each(function () {
                    var initialValue = $(this).data('initialValue');
                    var type = $(this).attr('type');
                    if (initialValue != undefined) {
                        if ( (type == 'radio' && initialValue != this.checked)
                          || (type != 'radio' && initialValue != $.zeusValidate.getValueFromInput($(this)))
                        ) {
                            changed = true;
                            return false;
                        }
                    }
                });
                var alwaysShowUnsavedChanges = $('section#validation-error-summary').attr(fullDataTypes.AlwaysShowUnsavedChanges) == "true";
                // Don't prompt if we are supposed to ignore it
                if ($.zeusValidate.ignoreDirty) {
                    $.zeusValidate.ignoreDirty = false;
                } else if ((changed && !$.zeusValidate.alwaysIgnoreDirty) || alwaysShowUnsavedChanges) {
                    // Only prompt if a main form has changed (not quickfind) and we're not forcing a reload ourselves
                    return 'You have unsaved changes.';
                }
                
                return undefined;
            };

            // Dont bind 'beforeunload' more than once
            $(window).off('beforeunload.catcher');
            $(window).on('beforeunload.catcher', catcher);
        },

        senddisabled: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            var lastClickedMarker = 'last-clicked-button';
            
            root.find('button[name="submitType"]').bind('click.lastclicked', function () {
                var button = $(this);

                // Remove last clicked button marker
                $('button.' + lastClickedMarker).removeClass(lastClickedMarker);

                // Apply last clicked button marker to latest button that was clicked
                button.addClass(lastClickedMarker);
            });

            var forms = root.find('form');

            if (forms.length <= 0) {
                root.find('button[name="submitType"]').bind('click.rhea-senddisabled', function () {
                    var button = $(this);

                    // Store whether the button submit results in a file download
                    button.closest('form').data(dataTypes.IsDownload, button.data(dataTypes.IsDownload));
                });
            } else {
                forms.each(function () {
                    var form = $(this);

                    form.find('button[name="submitType"]').bind('click.rhea-senddisabled', function () {
                        var button = $(this);

                        // Store whether the button submit results in a file download
                        form.data(dataTypes.IsDownload, button.data(dataTypes.IsDownload));
                    });

                    form.submit(function (e) {
                        if ($.zeusValidate.preventDefaultOnNextFormSubmit) {
                            $.zeusValidate.preventDefaultOnNextFormSubmit = false;
                            e.preventDefault();
                            return;
                        }

                        if (e.isDefaultPrevented()) {
                            // jQuery validation found errors
                            return;
                        }

                        var lastClicked = $('button.' + lastClickedMarker);

                        if (!$.zeusValidate.ignoreLastClicked && lastClicked != undefined && lastClicked.length == 1) {
                            var button = $(lastClicked[0]);
                            var url = button.data(dataTypes.ButtonConfirmation);
                            var skipconfirm = button.hasClass('skipconfirm'); // actionif

                            if (!skipconfirm && url != undefined) {
                                // When we have a confirmation action, ignore the form submit and present a confirmation modal
                                e.preventDefault();

                                var prefix = button.data(dataTypes.FieldPrefix);
                                var results = {};
                                var parameters = [];
                                var parameterData = button.data(dataTypes.ButtonConfirmationParameters);

                                if (parameterData != undefined && parameterData.length > 0) {
                                    parameters = parameterData.split(',');
                                }

                                if (parameters.length > 0) {
                                    for (var i = 0; i < parameters.length; i++) {

                                        var key = parameters[i];

                                        var targetId = (prefix != undefined && prefix.length > 0) ? prefix + '_' + key : key;

                                        key = key.toLowerCase();

                                        results[key] = $.zeusValidate.getValueFromInput($('#' + targetId));
                                    }
                                }

                                var headers = {};
                                headers[headerTypes.AjaxConfirmation] = true;
                                headers[headerTypes.Ajax] = true;

                                $.ajax({
                                    url: url,
                                    type: 'GET',
                                    dataType: 'html',
                                    cache: false,
                                    headers: headers,
                                    data: results
                                }).done(function (data, textStatus, request) {
                                    if ($.zeusValidate.sessionExpired(request)) {
                                        return;
                                    }

                                    var modalConfirmationID = 'modal-confirmation';
                                    var confirmationModal = $('#' + modalConfirmationID);

                                    if (confirmationModal.length == 0) {
                                        confirmationModal = $rhea.makeModalDialogElement('', data, '<a class="btn btn-sm btn-white" href="javascript:;">No</a><a class="btn btn-sm btn-primary" href="javascript:;">Yes</a>', modalConfirmationID)

                                        // Bind to Yes button in modal
                                        confirmationModal.find('.modal-footer a.btn-primary').bind('click.zeus-modal-yes', function () {
                                            // Indicate to ignore the last clicked button so the user isn't prompted with another confirmation
                                            $.zeusValidate.ignoreLastClicked = true;

                                            // Resubmit form via the button that was originally clicked
                                            button.click();
                                        });
                                        confirmationModal.find('.modal-footer a').bind('click.zeus-modal-dismiss', function () {
                                            $rhea.dismissModalDialogElement(confirmationModal);
                                        });
                                    }
                                    // Show modal
                                    $rhea.showModalDialogElement(confirmationModal);

                                }).fail(function (xhr, status, data) {
                                    $.zeusValidate.addError('Error occurred while loading.');
                                });

                                return;
                            }
                        }

                        // Change message to indicate data is being submitted
                        $.zeusValidate.blockUIoptions.message = '<div class="msgInfo">Sending data please wait</div>';

                        // Block UI, relying on page to reload or redirect which results in an unblocked page
                        $.blockUI($.zeusValidate.blockUIoptions);

                        // Check if this is an Ajax document upload to the Document Store Web API
                        var documentStoreWebApiUrl = form.attr('enctype') == 'multipart/form-data' && form.data(dataTypes.DocumentStoreWebApiUrl) != undefined ? form.data(dataTypes.DocumentStoreWebApiUrl) : undefined;

                        if (documentStoreWebApiUrl != undefined)
                        {
                            e.preventDefault();

                            var finished = function () {
                                $.unblockUI();
                                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
                                $.zeusValidate.ignoreLastClicked = false;
                            };
                            var uploadToken = $.zeusValidate.readCookie('UploadToken');
                            var headers = {};
                            if (uploadToken != undefined) {
                                headers['Authorization'] = uploadToken;
                            }
                            headers['employment.gov.au-UniqueRequestMessageId'] = $.zeusValidate.guid();

                            var formData = new FormData(form[0]);

                            // or 
                            /*
                            var data = new FormData();
                            
                            var form = 
                            data.append('Bucket', $('#Bucket').val());
                            data.append('Metadata.CreatedBy', $('#Metadata_CreatedBy').val());
                            data.append('Document', $('#Document')[0].files[0]);
                    
                            */

                            var ajaxOptions = {
                                type: 'POST',
                                dataType: 'html',
                                global: false,
                                url: documentStoreWebApiUrl,
                                cache: false,
                                headers: headers,
                                processData: false,
                                contentType: false,
                                data: formData,
                            };

                            $.ajax(ajaxOptions).done(function (data, textStatus, request) {
                                if ($.zeusValidate.sessionExpired(request)) {
                                    return;
                                }

                                finished();
                                var r = request;
                            })
                            .fail(function (xhr, status, data) {
                                finished();

                                // Similar error handling to EmploymentWebApiClient
                                var response = JSON.parse(xhr.responseText);

                                function AddErrors(errors) {
                                    if (errors == undefined || !$.isArray(errors) || errors.length == 0) {
                                        return;
                                    }

                                    var clear = true;
                                    for (var i = 0; i < errors.length; i++) {
                                        $.zeusValidate.addError(errors[i], undefined, clear);
                                        clear = false;
                                    }
                                }

                                function HandleBadRequest() {
                                    var errors = [];

                                    if (response.Data != undefined) {
                                        // Validation error
                                        if (response.Data.ValidationErrors != undefined) {
                                            for (var i = 0; i < response.Data.ValidationErrors.length; i++) {
                                                errors.push('<span class="hidden">' + 'CorrelationId: ' + response.Data.CorrelationId + ', ErrorNumber: ' + response.Data.ErrorNumber + ', ValidationRuleId: ' + response.Data.ValidationErrors[i].ValidationRuleId + '</span>' + response.Data.ValidationErrors[i].Message);
                                            }
                                        } else {
                                            errors.push('<span class="hidden">' + 'CorrelationId: ' + response.Data.CorrelationId + ', ErrorNumber: ' + response.Data.ErrorNumber + '</span>' + response.Data.Message);
                                        }
                                    }

                                    AddErrors(errors);
                                }

                                function HandleUnauthorized() {
                                    var errors = [];

                                    if (response.Data != undefined) {
                                        // Authorization failures
                                        if (response.Data.AuthorizationFailures != undefined) {
                                            for (var i = 0; i < response.Data.AuthorizationFailures.length; i++) {
                                                errors.push('<span class="hidden">' + 'CorrelationId: ' + response.Data.CorrelationId + ', ErrorNumber: ' + response.Data.ErrorNumber + ', ActivityName: ' + response.Data.AuthorizationFailures[i].ActivityName + '</span>' + response.Data.AuthorizationFailures[i].UnauthorizedReason);
                                            }
                                        } else {
                                            errors.push('<span class="hidden">' + 'CorrelationId: ' + response.Data.CorrelationId + ', ErrorNumber: ' + response.Data.ErrorNumber + '</span>' + response.Data.Message);
                                        }
                                    }

                                    AddErrors(errors);
                                }

                                function HandleConflict() {
                                    HandleUnspecifiedError();
                                }

                                function HandleNotFound() {
                                    HandleUnspecifiedError();
                                }

                                function HandleInternalServerError() {
                                    HandleUnspecifiedError();
                                }

                                function HandleUnspecifiedError() {
                                    var errors = [];

                                    if (response.Data != undefined) {
                                        errors.push('<span class="hidden">' + 'CorrelationId: ' + response.Data.CorrelationId + ', ErrorNumber: ' + response.Data.ErrorNumber + '</span>' + response.Data.Message);
                                    }

                                    AddErrors(errors);
                                }

                                switch (xhr.status)
                                {
                                    case 400: HandleBadRequest(); break;
                                    case 401: HandleUnauthorized(); break;
                                    case 409: HandleConflict(); break;
                                    case 404: HandleNotFound(); break;
                                    case 500: HandleInternalServerError(); break;
                                    default: HandleUnspecifiedError(); break;
                                }
                            });
                        }
                        else
                        {
                            // Remove block after a short timeout (2.5 sec) if the button results in a file download ([Button(ResultsInDownload = true)]) as the page will remain as is (no reload/redirect)
                            // Otherwise, remove block after a long timeout (30 sec) so eventually the user will have control again if something went wrong (or they cancelled the submit which there is no event to watch for)
                            var timeout = form.data(dataTypes.IsDownload) ? 1000 * 2.5 : 1000 * 30;

                            if (form.data(dataTypes.IsDownload)) {
                                // The page doesn't refresh when doing a file download, so go back to paying attention to button clicks
                                $.zeusValidate.ignoreLastClicked = false;
                            }

                            setTimeout(function () {
                                $.unblockUI();
                                $.zeusValidate.blockUIoptions.message = $.zeusValidate.blockUIdefaultMessage;
                            }, timeout);

                            // Find disabled inputs, and remove the "disabled" attribute so the value is submitted in the form submit
                            var disabled = $(this).find(':input:disabled').removeAttr('disabled');

                            setTimeout(function () {
                                // Re-disable the set of inputs that were formerly disabled
                                disabled.attr('disabled', 'disabled');
                            }, 1);
                        }
                    });
                });
            }
        },
        
        dropdowns: function () {
            var root = $(this.element) || $(document);
            root.find('select').each(function () {
                var select = $(this);
                var beginDisabled = select.is('[disabled]');
                var selectionLimit = select.attr(fullDataTypes.MaximumSelections);
                var lazyLoad = select.attr(fullDataTypes.LazyLoad);
                var neverCache = select.attr(fullDataTypes.NeverCache);
                var noDeselect = select.attr(fullDataTypes.NoDeselect);

                var isAdw = select.hasClass('rhea-adw');
                var isAjax = select.hasClass('rhea-ajax');

                var ariaOptions = {
                    labelText: $(root.find('label[for="' + select.attr('id') + '"]').contents().get(0)).text() + (select.attr('data-val-required') ? " - Required" : ""), // When SELECT is marked required, the text() ends up getting the text inside the span tag in <label>, so here we ensure that we only get the text of label and not the elements within it.
                    errorHandler: function (jqXHR, status, response) {
                    },
                };
                if (lazyLoad != undefined) {
                    ariaOptions['eagerLoad'] = false;
                }
                if (neverCache != undefined) {
                    ariaOptions['allowAjaxCache'] = false;
                }
                if (noDeselect != undefined) {
                    ariaOptions['deselectAllowed'] = false;
                }
                if (selectionLimit != undefined) {
                    $.extend(ariaOptions, {
                        limit: parseInt(selectionLimit),
                    });
                }
                if (isAjax || isAdw) {
                    $.extend(ariaOptions, {
                        url: select.data(dataTypes.Url),
                        global: false,
                    });
                }
                if (isAjax) {
                    if (select.data(dataTypes.Parameters) != undefined && select.data(dataTypes.Parameters).length > 0) {
                        ariaOptions['eagerLoad'] = false; // Can't use eager load on properties that depend on others because they could change too much
                        var parameterElements = $.zeusValidate.getParameterElementsForElement(select);

                        for (var i = 0; i < parameterElements.length; ++i) {
                            parameterElements[i].on("change.hierarchy", function () {
                                var toBeEnabled = true;
                                // Check ALL dependents and only enable the input box if they all have a value
                                for (var j = 0; j < parameterElements.length; ++j) {
                                    var input = parameterElements[j];
                                    // We exclude the check for input value when input is of the type 'checkbox' because the condition returns true even when value is false i.e. if(false == '') returns true, this ends up making any dropdown that's dependent on checkbox to be disabled when one is unselected.
                                    if (input.attr('type') != 'checkbox' && $.zeusValidate.getValueFromInput(input) == '') {
                                        toBeEnabled = false;
                                        break;
                                    }
                                }
                                if (toBeEnabled) {
                                    container.setEnabled(true);
                                    container.clearAll();
                                }
                                else {
                                    container.setEnabled(false);
                                    container.clearAll();
                                }
                            });
                        }

                        $.extend(ariaOptions, {
                            getPostData: function () {
                                return $.zeusValidate.getParameterMapForElement(select);
                            },
                        });
                    }
                } // end isAjax
                if (isAdw) {
                    var dpValueFunction = function () {
                        return select.data(dataTypes.DependentValueAdw);
                    }
                    var dpId = select.data(dataTypes.DependentPropertyId);

                    // When rendering Modals the dpProperty will not be found because it is yet to be added to DOM (which is done in SearchModal () that has called prepareNewContet()).
                    // Therefore we attempt to find it in root (which is supposed to be newContent, when this function is called from prepareNewContent() method).
                    var dpProperty = $(root).find('#' + dpId);
                    if (dpId != undefined && dpProperty.length == 1) {
                        var readOnlyType = dpProperty.data(dataTypes.ReadOnlyType);
                        dpValueFunction = function () {
                            return $.zeusValidate.getValueFromInput(dpProperty);
                        }
                        ariaOptions['eagerLoad'] = false; // Can't use eager load on properties that depend on others because they could change too much
                        dpProperty.on("change.hierarchy", function () {
                            if (dpValueFunction() == '') {
                                container.setEnabled(false);
                                container.clearAll();
                            }
                            else {
                                container.setEnabled(true);
                                container.clearAll();
                            }
                        });
                        // begin disbaled if the dp has no value
                        if (dpValueFunction() == '') beginDisabled = true;
                    }

                    $.extend(ariaOptions, {
                        getPostData: function () {
                            return {
                                code: select.data(dataTypes.Code),
                                currentCodesOnly: select.data(dataTypes.CurrentCodesOnlyAdw),
                                dependentValue: dpValueFunction(),
                                dominant: select.data(dataTypes.Dominant),
                                orderType: select.data(dataTypes.OrderType),
                                displayType: select.data(dataTypes.DisplayType),
                                excludeValues: select.data(dataTypes.ExcludeValues) != undefined ? select.data(dataTypes.ExcludeValues).split(',') : undefined
                            };
                        }
                    });
                } // end isAdw

                var isSingleSelect = !select.attr('multiple');
                if (isSingleSelect) {
                    $.extend(ariaOptions, {
                        closeOnSelect: true,
                    });
                }
                var container = ariaSelect(select, ariaOptions);
                if (isSingleSelect) {
                    container.addClass('single-select'); // Mark single selects so they can have a different style
                    if (select.attr('data-noselection')) {
                        container.clearAll();
                    }
                }
                // Add decorative magnifying glass icon
                $('<i>').addClass('fa').addClass('fa-search').addClass('right-icon').prependTo(container.find('.amc-box'));
                // Add bootstrap classes to make display consistent.
                container.find('.amc-box').addClass('form-control');
                container.find('input').addClass('form-control');
                // Do not remove 'for' from the label, as this results in 'RequiredIf' indicator not finding the correct label in order to remove asterisk.
                if (beginDisabled) container.setEnabled(false);
            });
        },

        actionif: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-actionif').each(function () {
                var property = $(this);
                var fieldprefix = '';
                
                if (property.data(dataTypes.FieldPrefix).length > 0) {
                    fieldprefix = property.data(dataTypes.FieldPrefix) + '_';
                }

                var comparisonType = $(this).data(dataTypes.ComparisonType);
                var valueToTestAgainst = $(this).data(dataTypes.DependentValue);
                var actionForDependencyType = $(this).data(dataTypes.ActionForDependencyType);
                var propertyType = $(this).data(dataTypes.Type);

                var prefixedDependentPropertyId = fieldprefix + property.data(dataTypes.DependentProperty);
                var dependentProperty = root.find('#' + prefixedDependentPropertyId);
                
                // If dependent property not found by ID, assume it is a radio button and get by name instead (this will return multiple elements)
                if (dependentProperty.length == 0 || dependentProperty.data(dataTypes.RadioButtonGroup)) {
                    dependentProperty = root.find('input:radio[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                } else if (dependentProperty.data(dataTypes.CheckboxList)) {
                    dependentProperty = root.find('input:checkbox[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                }

                // Don't bind if self-referencing
                if (property[0] == dependentProperty[0]) {
                    return;
                }

                var actionIfChange = function () {
                    var dependentPropertyValue = null;

                    if ($(this)[0].type == 'radio' || $(this).length > 1) {
                        for (var index = 0; index != $(this).length; index++) {
                            if ($(this)[index]['checked']) {
                                dependentPropertyValue = $(this)[index].value;
                                break;
                            }
                        }

                        if (dependentPropertyValue == null) {
                            dependentPropertyValue = false;
                        }
                    } else if ($(this)[0].type == "select-multiple" && $(this)[0].length != undefined && $(this)[0].length > 0
                        && $(this)[0].value !== undefined && $(this)[0].value != "") {
                        dependentPropertyValue = [];

                        for (var j = 0; j < $(this)[0].children.length; j++) {
                            if ($(this)[0].children[j].selected) {
                                dependentPropertyValue.push($(this)[0].children[j].value);
                            }
                        }
                        
                    } else if ($(this)[0].type == 'checkbox') {
                        var these = $('input:checkbox[name="' + this.name + '"]');
                        dependentPropertyValue = [];

                        for (var index = 0; index != these.length; index++) {
                            if (these[index]['checked']) {
                                dependentPropertyValue.push(these[index].value);
                            }
                        }

                        if (dependentPropertyValue.length == 0) {
                            dependentPropertyValue = false;
                        }
                    } else {
                        dependentPropertyValue = $(this)[0].value;
                    }

                    var surroundingSpan = property.find('span');
                    if ($.zeusValidate.is(dependentPropertyValue, comparisonType, valueToTestAgainst, false, false)) {
                        if (actionForDependencyType.toLowerCase() == 'visible') {
                            property.removeClass('hidden');
                        } else if (actionForDependencyType.toLowerCase() == 'hidden') {
                            property.addClass('hidden');
                        } else if (actionForDependencyType.toLowerCase() == 'enabled') {
                            if (propertyType == 'link') {
                                if (surroundingSpan.hasClass('iconOnly')) {
                                    property.find('a[disabled]').removeAttr('disabled');
                                }
                                else{
                                property.find('span').addClass('hidden');
                                property.find('a').removeClass('hidden');
                                }
                            } else {
                                property.removeAttr('disabled');
                            }
                        } else if (actionForDependencyType.toLowerCase() == 'disabled') {
                            if (propertyType == 'link') {
                                // Special Case: Group Header Link --> we will find the parent span (wrapper that wraps GroupHeaderLink).
                                var wrapper = property.closest('span['+ fullDataTypes.ApplyActionForDependency +'=true]');
                                if (wrapper.length == 1) {
                                    wrapper.attr('disabled', 'disabled');
                                }
                                else if (surroundingSpan.hasClass('iconOnly')) {
                                    property.find('a').attr('disabled','disabled');
                                }
                                else {
                                    property.find('a').addClass('hidden');
                                    surroundingSpan.removeClass('hidden');
                                }
                            } else {
                                property.attr('disabled', 'disabled');
                            }
                        } else if (actionForDependencyType.toLowerCase() == 'confirmation') {
                            property.removeClass('skipconfirm');
                        }
                    } else {
                        if (actionForDependencyType.toLowerCase() == 'visible') {
                            property.addClass('hidden');
                        } else if (actionForDependencyType.toLowerCase() == 'hidden') {
                            property.removeClass('hidden');
                        } else if (actionForDependencyType.toLowerCase() == 'enabled') {
                            if (propertyType == 'link') {
                                if (surroundingSpan.hasClass('iconOnly')) {
                                    property.find('a').attr('disabled', 'disabled');
                                } else {
                                property.find('a').addClass('hidden');
                                property.find('span').removeClass('hidden');
                                }
                            } else {
                                property.attr('disabled', 'disabled');
                            }
                        } else if (actionForDependencyType.toLowerCase() == 'disabled') {
                            // Special Case: Group Header Link --> we will find the parent span (wrapper that wraps GroupHeaderLink).
                            var wrapperSpan = property.closest('span[' + fullDataTypes.ApplyActionForDependency + '=true]');
                            if (wrapperSpan.length == 1) {
                                wrapperSpan.removeAttr('disabled');
                            }
                            else if (propertyType == 'link') {
                                if (surroundingSpan.hasClass('iconOnly')) {
                                    property.find('a[disabled]').removeAttr('disabled');
                                } else {
                                property.find('span').addClass('hidden');
                                property.find('a').removeClass('hidden');
                                }
                            } else {
                                property.removeAttr('disabled');
                            }
                        } else if (actionForDependencyType.toLowerCase() == 'confirmation') {
                            property.addClass('skipconfirm');
                        }
                    }
                };
                
                if (dependentProperty.length > 1) {
                    // Bind to each radio button element
                    for (var i = 0; i < dependentProperty.length; i++) {
                        $(dependentProperty[i]).bind('change.rhea-actionif', actionIfChange);
                    }
                } else {
                    dependentProperty.bind('change.rhea-actionif', actionIfChange);
                }
            });
        },

        contingentif: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var prepareContingentIf = function (property, contingentDataType) {
                var containerFor = 'ContainerFor-';
                var innerContainerFor = 'InnerContainerFor-';
                var readOnlyType = property.data(dataTypes.ReadOnlyType);

                /* START CONTINGENT SPECIFIC FUNCTIONS */
                var editableIfChangeHandler = function() {
                    var store = property.data(contingentCategory + 'store');

                    if (store == undefined) {
                        return;
                    }
                
                    var conditionMet = allConditionsMetCheck(store);
                
                    if (conditionMet) {
                        if (property.is('select')) {
                            var ariaContainer = property.data('ariaSelectReference');
                            ariaContainer.setEnabled(true);
                            
                            property.removeAttr('readonly');
                            property.removeAttr('disabled');
                            // SPECIAL CASE: when [RequiredIf] is added but is not directly linked to an elment on UI (Address control and Custom Address Control)
                            if (property.attr(fullDataTypes.AddressAutocomplete) == "true") {
                                var requiredIndicator = $('label[for=' + property.attr('id') + ']').find('span.req');
                                if (requiredIndicator.length == 1)
                                {
                                    requiredIndicator.removeClass('hidden');
                                    requiredIndicator.find('.readers').attr('aria-hidden', 'false'); // Defect: 13879 NVDA does not read title therefore adding the readers text.
                                }
                            }
                        } else if (property.data('val-date') != undefined) {
                            var parent = property.parent();

                            if (parent.hasClass('datetime')) {
                                parent.find('input').each(function () {
                                    $(this).removeAttr('disabled');
                                    $(this).removeAttr('readonly');
                                });
                            } else {
                                property.removeAttr('readonly');
                                property.removeAttr('disabled');
                            }
                        } else {
                            var limitedCheckbox = (property[0].type == 'checkbox' && property.data('limit') == true);
                            if (!limitedCheckbox) {
                                property.removeAttr('readonly');
                                property.removeAttr('disabled');
                            }
                        }

                        // Update enable state for check all checkbox on a check box list
                        if (property[0].type == 'checkbox' && property.data('checkallid') != undefined) {
                            var checkall = $('#' + property.data('checkallid'));

                            if (checkall) {
                                checkall.removeAttr('readonly');
                                checkall.removeAttr('disabled');
                                checkall.closest('li').removeClass('hidden');
                            }
                        }
                    } else {
                        if (property.is('select')) {
                            var ariaContainer = property.data('ariaSelectReference');
                            ariaContainer.setEnabled(false);
                            
                            property.attr(readOnlyType, readOnlyType);
                            // SPECIAL CASE: when [RequiredIf] is added but is not directly linked to an elment on UI (Address control and Custom Address Control)
                            if (property.attr(fullDataTypes.AddressAutocomplete) == "true") {
                                var requiredIndicator = $('label[for=' + property.attr('id') + ']').find('span.req');
                                if (requiredIndicator.length == 1) {
                                    requiredIndicator.addClass('hidden');
                                    requiredIndicator.find('.readers').attr('aria-hidden', 'true');
                                }
                            }
                        } else if (property.data('val-date') != undefined) {
                            var parent = property.parent();

                            if (parent.hasClass('datetime')) {
                                parent.find('input').each(function () {
                                    $(this).attr(readOnlyType, readOnlyType);
                                });
                            } else {
                                property.attr(readOnlyType, readOnlyType);
                            }
                        } else {
                            var limitedCheckbox = (property[0].type == 'checkbox' && property.data('limit') == true);
                            if (!limitedCheckbox) {
                                property.attr(readOnlyType, readOnlyType);
                            }
                        }

                        // Update enable state for check all checkbox on a check box list
                        if (property[0].type == 'checkbox' && property.data('checkallid') != undefined) {
                            var checkall = $('#' + property.data('checkallid'));

                            if (checkall) {
                                checkall.attr(readOnlyType, readOnlyType);
                                checkall.closest('li').addClass('hidden');
                            }
                        }
                    }
                        
                    // If current property has been made readonly but has focus, refocus so browser properly obeys the readonly state
                    if ($(':focus')[0] == property[0]) {
                        property.blur();
                        property.focus();
                    }

                    // Notify of editable state change
                    $(document).trigger('editable-state-change', property);
                };

                var readOnlyIfChangeHandler = function () {
                    var store = property.data(contingentCategory + 'store');

                    if (store == undefined) {
                        return;
                    }

                    var conditionMet = allConditionsMetCheck(store);

                    // Opposite of editableif
                    if (!conditionMet) {
                        if (property.is('select')) {
                            var ariaContainer = property.data('ariaSelectReference');
                            ariaContainer.setEnabled(true);
                            
                            property.removeAttr('readonly');
                            property.removeAttr('disabled');
                        } else if (property.data('val-date') != undefined) {
                            var parent = property.parent();
                            
                            if (parent.hasClass('datetime')) {
                                parent.find('input').each(function () {
                                    $(this).removeAttr('disabled');
                                    $(this).removeAttr('readonly');
                                });
                            } else {
                                property.removeAttr('readonly');
                                property.removeAttr('disabled');
                            }
                        } else {
                            var limitedCheckbox = (property[0].type == 'checkbox' && property.data('limit') == true);
                            if (!limitedCheckbox) {
                                property.removeAttr('readonly');
                                property.removeAttr('disabled');
                            }
                        }

                        // Update enable state for check all checkbox on a check box list
                        if (property[0].type == 'checkbox' && property.data('checkallid') != undefined) {
                            var checkall = root.find('#' + property.data('checkallid'));

                            if (checkall) {
                                checkall.removeAttr('readonly');
                                checkall.removeAttr('disabled');
                                checkall.closest('li').removeClass('hidden');
                            }
                        }
                    } else {
                        if (property.is('select')) {
                            var ariaContainer = property.data('ariaSelectReference');
                            ariaContainer.setEnabled(false);
                            
                            property.attr(readOnlyType, readOnlyType);
                        } else if (property.data('val-date') != undefined) {
                            var parent = property.parent();

                            if (parent.hasClass('datetime')) {
                                parent.find('input').each(function () {
                                    $(this).attr(readOnlyType, readOnlyType);
                                });
                            } else {
                                property.attr(readOnlyType, readOnlyType);
                            }
                        } else {
                            var limitedCheckbox = (property[0].type == 'checkbox' && property.data('limit') == true);
                            if (!limitedCheckbox) {
                                property.attr(readOnlyType, readOnlyType);
                            }
                        }

                        // Update enable state for check all checkbox on a check box list
                        if (property[0].type == 'checkbox' && property.data('checkallid') != undefined) {
                            var checkall = root.find('#' + property.data('checkallid'));

                            if (checkall) {
                                checkall.attr(readOnlyType, readOnlyType);
                                checkall.closest('li').addClass('hidden');
                            }
                        }
                    }
                    
                    // If current property has been made readonly but has focus, refocus so browser properly obeys the readonly state
                    if ($(':focus')[0] == property[0]) {
                        property.blur();
                        property.focus();
                    }

                    // Notify of editable state change
                    $(document).trigger('editable-state-change', property);
                };
                
                var visibleIfChangeHandler = function () {
                    var store = property.data(contingentCategory + 'store');
                    
                    if (store == undefined) {
                        return;
                    }

                    var conditionMet = allConditionsMetCheck(store);

                    var propertyId = property[0].id;

                    if (propertyId.indexOf('InnerContainerFor-') != -1) {
                        propertyId = propertyId.replace('InnerContainerFor-', '');
                    }

                    if (propertyId.indexOf('ContainerFor-') == -1 && propertyId.lastIndexOf('-') != -1) {
                        propertyId = propertyId.substring(0, propertyId.lastIndexOf('-'));
                    }

                    var containerId = propertyId;
                    containerId = (containerId.indexOf(containerFor) == -1) ? containerFor + containerId : containerId;
                    
                    if (conditionMet) {
                        root.find('#' + containerId).removeClass('hidden');
                        try {
                            root.find('#' + containerId).find('textarea:visible').each(function() {
                                if ($(this).is(':not([readonly])') || $(this).text() != "") {
                                    $(this).trigger('input'); // Force resizing of textareas (See 'Zeus.resize'). Required to set initial size if this is the first time this has been made visible
                                }
                            });
                        }
                        catch (err) {
                            // bootstrap-maxlength throws errors when making textareas visible that have maxlength indicators. Just swallow the error as it is meaningless and can't be worked around.
                        }
                    } else {
                        root.find('#' + containerId).addClass('hidden');
                    }
                    $rhea.generateMainFormJumpList(); // Regenerate the jump list as this might have hidden or revealed whole sections
                };

                var clearIfChangeHandler = function() {
                    var store = property.data(contingentCategory + 'store');

                    if (store == undefined) {
                        return;
                    }

                    var conditionMet = allConditionsMetCheck(store);

                    if (conditionMet) {
                        var changed = false;
                        var val = '';

                        if (property.hasClass('rhea-numeric') && !/^true$/i.test(property.data(dataTypes.IsNullable))) {
                            val = $.autoNumeric.Format(property, 0);
                        }

                        if (property[0].type == 'checkbox' || property[0].type == 'radio') {
                            if (property[0].checked) {
                                changed = true;
                                property[0].checked = false;
                            }
                        } else {
                            if (property[0].value != val) {
                                changed = true;
                                property.val(val);
                            }
                        }

                        //if datetime, need to clear both date and time fields as well as hidden input
                        if ($(property[0]).parent('.datetime').length !== 0) {
                            $(property[0]).parent('.datetime').find('input:text').val(val);
                        }

                        if (!changed) {
                            return;
                        }

                        var always = getAlways(store);

                        // Clear chaining not support for 'always' clear ([Clear] attribute) to prevent infinite clear loop
                        if (always) {
                            property.trigger('change.rhea-gst');
                            property.trigger('change.rhea-copy');
                        } else {
                            property.change();
                        }

                        if (property.is('select')) {
                            var ariaContainer = property.data('ariaSelectReference');
                            ariaContainer.clearAll();
                        }
                    }
                };

                var requiredIfChangeHandler = function() {
                    var store = property.data(contingentCategory + 'store');

                    if (store == undefined) {
                        return;
                    }

                    var conditionMet = allConditionsMetCheck(store);

                    // Store result for unobtrusive validation
                    property.data('requiredif-allconditionsmet', conditionMet);

                    var requiredIndicator = root.find('label[for=' +property.attr('id') + ']').find('span.req');

                    if (conditionMet) {
                        // Required so show indicator
                        requiredIndicator.removeClass('hidden');
                        requiredIndicator.find('.readers').attr('aria-hidden', 'false'); // Defect: 13879 NVDA does not read title therefore adding the readers text.
                        // Special case for selects as they need their screen reader label modified as well
                        if (property.is('select')) {
                            var introductionText = property.parent().find('.amc-box').find('span.reader-only').first();
                            introductionText.text(introductionText.text().replace(/$/, ' - Required'));
                        }
                    } else {
                        // Hide indicator
                        requiredIndicator.addClass('hidden');
                        requiredIndicator.find('.readers').attr('aria-hidden', 'true');
                        // Special case for selects as they need their screen reader label modified as well
                        if (property.is('select')) {
                            var introductionText = property.parent().find('.amc-box').find('span.reader-only').first();
                            introductionText.text(introductionText.text().replace(/ - Required$/, ''));
                        }
                    }
                };
        
                /* END CONTINGENT SPECIFIC FUNCTIONS */

                // Check all dependent conditions have beeen met
                var allConditionsMetCheck = function (store) {
                    var results = [];
                    var groupResults = [];
                    var groupResultsKeys = [];

                    for (var j = 0; j < store.Dependents.length; j++) {
                        if (store.Contingents[j].Group != undefined && store.Contingents[j].Group.length) {
                            if ($.inArray(store.Contingents[j].Group, groupResultsKeys) == -1) {
                                // Add key
                                groupResultsKeys.push(store.Contingents[j].Group);

                                // Setup group
                                groupResults[store.Contingents[j].Group] = [];
                            }

                            // Add result to group
                            groupResults[store.Contingents[j].Group].push(singleConditionMetCheck(store.Dependents[j], store.Contingents[j]));
                        } else {
                            results.push(singleConditionMetCheck(store.Dependents[j], store.Contingents[j]));
                        }
                    }

                    // Check groups
                    for (var j = 0; j < groupResultsKeys.length; j++) {
                        // All results in the group must pass for its condition to be met
                        results.push($.inArray(false, groupResults[groupResultsKeys[j]]) == -1);
                    }

                    // At least one result must be true for the condition to be met
                    return $.inArray(true, results) != -1;
                };
                
                // Checks if a single dependent condition has been met
                var singleConditionMetCheck = function (dependent, contingent) {
                    if (contingent == undefined) {
                        return false;
                    }

                    var comparisonType = contingent.ComparisonType;
                    var passOnNull = contingent.PassOnNull;
                    var failOnNull = contingent.FailOnNull;
                    var valueToTestAgainst = contingent.DependentValue;
                    var always = contingent.Always;
                    var dependentPropertyValue = null;

                    if (dependent[0].type == 'radio') {
                        // Radio button group may have a single radio button in it, so check the length > 0 instead of 1.
                        for (var index = 0; index != dependent.length; index++) {
                            if (dependent[index]['checked']) {
                                dependentPropertyValue = dependent[index].value;
                                break;
                            }
                        }

                        if (dependentPropertyValue == null) {
                            dependentPropertyValue = false;
                        }
                    } else if (dependent[0].type == "select-multiple" && dependent[0].length != undefined && dependent[0].length > 0 &&
                        dependent[0].value !== undefined && dependent[0].value != "") {

                        dependentPropertyValue = [];
                        for (var j = 0; j < dependent[0].children.length; j++) {
                            if (dependent[0].children[j].selected) {
                                dependentPropertyValue.push(dependent[0].children[j].value);
                            }
                        }
                        
                    } else if (dependent[0].type == 'checkbox') {
                        var these = root.find('input:checkbox[name="' + dependent[0].name + '"]');
                        dependentPropertyValue = [];

                        for (var index = 0; index != these.length; index++) {
                            if (these[index]['checked']) {
                                dependentPropertyValue.push(these[index].value);
                            }
                        }

                        if (dependentPropertyValue.length == 0) {
                            dependentPropertyValue = false;
                        }
                    } else {
                        dependentPropertyValue = dependent[0].value;
                    }

                    return always || $.zeusValidate.is(dependentPropertyValue, comparisonType, valueToTestAgainst, passOnNull, failOnNull);
                };

                // Get the setting for always
                var getAlways = function(store) {
                    var always = false;
                        
                    for (var j = 0; j < store.Dependents.length; j++) {
                        always = store.Contingents[j].Always ? true : always;
                        }
                        
                    return always;
                };

                // Sets up the contingent handler for when the dependent property value changes
                var setupDependentChangeHandler = function (contingentType, contingent, contingentTypeHandler) {
                    var dependentPropertyId = contingent.DependentProperty;

                    // If property has no ID then it is a Telerik control which has the actual input with ID nested inside its own markup
                    if (property[0].id.length == 0 && property.find('input').length > 0) {
                        // Get nested input property
                        property = property.find('input');
                    }

                    var prefixedDependentPropertyId = $.zeusValidate.getFieldPrefixFromId(property[0], dependentPropertyId);

                    // Special case for visible if
                    if (contingentType == 'visibleif') {
                        if (prefixedDependentPropertyId.indexOf(innerContainerFor) != -1) {
                            prefixedDependentPropertyId = prefixedDependentPropertyId.substring(innerContainerFor.length, prefixedDependentPropertyId.length);
                        }
                        if (prefixedDependentPropertyId.indexOf(containerFor) != -1) {
                            prefixedDependentPropertyId = prefixedDependentPropertyId.substring(containerFor.length, prefixedDependentPropertyId.length);
                        }
                    }

                    var dependentProperty = root.find('#' + prefixedDependentPropertyId);

                    // If dependent property not found by ID, assume it is a radio button and get by name instead (this will return multiple elements)
                    if (dependentProperty.length == 0 || dependentProperty.data(dataTypes.RadioButtonGroup)) {
                        dependentProperty = root.find('input:radio[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                    } else if (dependentProperty.data(dataTypes.CheckboxList)) {
                        dependentProperty = root.find('input:checkbox[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                    }

                    // Don't bind if self-referencing
                    if (property[0] == dependentProperty[0] || dependentProperty.length == 0) {
                        return;
                    }

                    // Add a pointer list of dependent properties we've binded a handler to, storing on the main property
                    var store = {};
                    store.Contingents = [];
                    store.Dependents = [];

                    if (property.data(contingentType + 'store') != undefined) {
                        store = property.data(contingentType + 'store');
                    }

                    store.Dependents.push(dependentProperty);
                    store.Contingents.push(contingent);

                    property.data(contingentType + 'store', store);

                    if (dependentProperty.length > 1) {
                        // Bind to each radio button element
                        for (var i = 0; i < dependentProperty.length; i++) {
                            $(dependentProperty[i]).bind('change.zeus-trigger' + contingentType, contingentTypeHandler);
                        }
                    } else {
                        dependentProperty.bind('change.zeus-trigger' + contingentType, contingentTypeHandler);
                    }
                };

                var contingentCategory;
                var contingentChangeHandler;

                if (contingentDataType == dataTypes.ContingentEditableIf && property.data(dataTypes.ContingentEditableIf) != undefined) {
                    contingentCategory = 'editableif';
                    contingentDataType = dataTypes.ContingentEditableIf;
                    contingentChangeHandler = editableIfChangeHandler;
                } else if (contingentDataType == dataTypes.ContingentReadOnlyIf && property.data(dataTypes.ContingentReadOnlyIf) != undefined) {
                    contingentCategory = 'readonlyif';
                    contingentDataType = dataTypes.ContingentReadOnlyIf;
                    contingentChangeHandler = readOnlyIfChangeHandler;
                } else if (contingentDataType == dataTypes.ContingentVisibleIf && property.data(dataTypes.ContingentVisibleIf) != undefined) {
                    contingentCategory = 'visibleif';
                    contingentDataType = dataTypes.ContingentVisibleIf;
                    contingentChangeHandler = visibleIfChangeHandler;
                } else if (contingentDataType == dataTypes.ContingentClearIf && property.data(dataTypes.ContingentClearIf) != undefined) {
                    contingentCategory = 'clear';
                    contingentDataType = dataTypes.ContingentClearIf;
                    contingentChangeHandler = clearIfChangeHandler;
                } else if (contingentDataType == dataTypes.ContingentRequiredIf && property.data(dataTypes.ContingentRequiredIf) != undefined) {
                    contingentCategory = 'requiredif';
                    contingentDataType = dataTypes.ContingentRequiredIf;
                    contingentChangeHandler = requiredIfChangeHandler;
                }

                if (contingentCategory == undefined || contingentDataType == undefined || contingentChangeHandler == undefined) {
                    return;
                }

                var contingencies = property.data(contingentDataType);

                if (contingencies == undefined || typeof(contingencies) != "object") {
                    return;
                }

                for (var i = 0; i < contingencies.length; i++) {
                    setupDependentChangeHandler(contingentCategory, contingencies[i], contingentChangeHandler);
                }

                // RequiredIf only requirements
                if (contingentChangeHandler == requiredIfChangeHandler) {
                    // Trigger handler to initialize asterisk state
                    requiredIfChangeHandler();

                    // Bind so it can be triggered later when needed by unobtrusive validation
                    property.bind('load.zeus-trigger-requiredif', requiredIfChangeHandler);
                }
            };

            root.find('[' + fullDataTypes.ContingentEditableIf + ']').each(function() { prepareContingentIf($(this), dataTypes.ContingentEditableIf); });
            root.find('[' + fullDataTypes.ContingentReadOnlyIf + ']').each(function () { prepareContingentIf($(this), dataTypes.ContingentReadOnlyIf); });
            root.find('[' + fullDataTypes.ContingentVisibleIf + ']').each(function () { prepareContingentIf($(this), dataTypes.ContingentVisibleIf); });
            root.find('[' + fullDataTypes.ContingentClearIf + ']').each(function () { prepareContingentIf($(this), dataTypes.ContingentClearIf); });
            root.find('[' + fullDataTypes.ContingentRequiredIf + ']').each(function () { prepareContingentIf($(this), dataTypes.ContingentRequiredIf); });
        },
        
        ajaxfield: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('textarea.zeus-ajaxfield, input[type="text"].zeus-ajaxfield, select.zeus-ajaxfield').each(function () {
                var property = $(this);
                var url = property.attr(fullDataTypes.Url);

                var parameterElements = $.zeusValidate.getParameterElementsForElement(property);
                for (var i = 0; i < parameterElements.length; ++i) {
                    parameterElements[i].on('change.ajaxfield', function () {

                        setTimeout(function () {
                            if (property.data('ajaxFieldTriggered') === true) {
                                return;
                            }

                            property.data('ajaxFieldTriggered', true);

                            $.ajax({
                                type: 'GET',
                                dataType: 'html',
                                global: false,
                                url: url,
                                cache: false,
                                data: $.zeusValidate.getParameterMapForElement(property),
                                success: function (response, textStatus) {
                                    property.val(response);
                                    if (property.is('textarea:visible')) {
                                        property.trigger('input'); // To force resizing.
                                    }
                                    else if (property.is('select')) {
                                        var container = property.data('ariaSelectReference');
                                        if (container != undefined) {
                                            container.selectOrCreateChoice(response, response, true);
                                        }
                                    }
                                    // No behaviours on this as it should be text.

                                    property.data('ajaxFieldTriggered', false);
                                }
                            }).fail(function (xhr, status, data) {
                                $.zeusValidate.addError('Error occurred while loading ' + property.attr(fullDataTypes.DisplayName) + '.');
                                property.data('ajaxFieldTriggered', false);
                            });
                        }, 1);

                    });
                }
            });
        },

        ajaxloadif: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-ajaxloadif').each(function () {
                var property = $(this);
                var target = property.attr('id');

                if (target.indexOf('InnerContainerFor-') != -1) {
                    target = target.replace('InnerContainerFor-', '');
                }

                if (target.indexOf('ContainerFor-') == -1 && target.lastIndexOf('-') != -1) {
                    target = target.substring(0, target.lastIndexOf('-'));
                }
                
                var always = (/^true$/i.test($(this).data(dataTypes.AlwaysAjaxLoadIf))) ? true : false;

                var propertyContainer = $('#ContainerFor-' + target);
                
                if (propertyContainer[0] == undefined) {
                    propertyContainer = root.find('#ContainerFor-' + target);
                }

                $.each(property.data(), function(name, value) {
                    propertyContainer.data(name, value);
                });
                    
                property = propertyContainer;

                var displayName = property.data(dataTypes.DisplayName);
                var dependentPropertyId = property.data(dataTypes.DependentPropertyAjaxLoadIf);
                var comparisonType = property.data(dataTypes.ComparisonTypeAjaxLoadIf);
                var passOnNull = property.data(dataTypes.PassOnNullAjaxLoadIf);
                var failOnNull = property.data(dataTypes.FailOnNullAjaxLoadIf);
                var valueToTestAgainst = property.data(dataTypes.DependentValueAjaxLoadIf);
                
                // If property has no ID then it is a Telerik control which has the actual input with ID nested inside its own markup
                if (property[0].id.length == 0 && property.find('input').length > 0) {
                    // Get nested input property
                    property = property.find('input');
                }

                var prefixedDependentPropertyId = $.zeusValidate.getFieldPrefixFromId(property[0], dependentPropertyId);

                if (prefixedDependentPropertyId.indexOf('InnerContainerFor-') != -1) {
                    prefixedDependentPropertyId = prefixedDependentPropertyId.replace('InnerContainerFor-', '');
                }

                if (prefixedDependentPropertyId.indexOf('ContainerFor-') != -1) {
                    prefixedDependentPropertyId = prefixedDependentPropertyId.replace('ContainerFor-', '');
                }
                var dependentProperty = $('#' + prefixedDependentPropertyId);

                if (dependentProperty[0] == undefined) {
                    dependentProperty = root.find('#' + prefixedDependentPropertyId);
                }

                // If dependent property not found by ID, assume it is a radio button and get by name instead (this will return multiple elements)
                if (dependentProperty.length == 0 || dependentProperty.data(dataTypes.RadioButtonGroup)) {
                    dependentProperty = $('input:radio[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                } else if (dependentProperty.data(dataTypes.CheckboxList)) {
                    dependentProperty = $('input:checkbox[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                }

                // Don't bind if self-referencing
                if (!always && property[0] == dependentProperty[0]) {
                    return;
                }

                var ajaxLoadIfChange = function (e, args) {
                    var suppressScrollAndFocus = true; //default to true
                    if (args != undefined && args.suppressScrollAndFocus != undefined && args.suppressScrollAndFocus === false)
                    {
                        delete args.suppressScrollAndFocus;
                        suppressScrollAndFocus = false;
                    }

                    var overrideContingentCheck = false;
                    if (args != undefined && args.overrideContingentCheck != undefined && args.overrideContingentCheck === true) {
                        delete args.overrideContingentCheck;
                        overrideContingentCheck = true;
                    }
                        
                    var url = property.data(dataTypes.Url);
                    var dependentPropertyValue = null;

                    if ($(this)[0].type == 'radio' || $(this).length > 1) {
                        for (var index = 0; index != $(this).length; index++) {
                            if ($(this)[index]['checked']) {
                                dependentPropertyValue = $(this)[index].value;
                                break;
                            }
                        }

                        if (dependentPropertyValue == null) {
                            dependentPropertyValue = false;
                        }
                    } else if ($(this)[0].type == "select-multiple" && $(this)[0].length != undefined && $(this)[0].length > 0 &&
                        $(this)[0].value !== undefined && $(this)[0].value != "") {

                        dependentPropertyValue = [];
                        for (var j = 0; j < $(this)[0].children.length; j++) {
                            if ($(this)[0].children[j].selected) {
                                dependentPropertyValue.push($(this)[0].children[j].value);
                            }
                        }

                    } else if ($(this)[0].type == 'checkbox') {
                        var these = $('input:checkbox[name="' + this.name + '"]');
                        dependentPropertyValue = [];

                        for (var index = 0; index != these.length; index++) {
                            if (these[index]['checked']) {
                                dependentPropertyValue.push(these[index].value);
                            }
                        }

                        if (dependentPropertyValue.length == 0) {
                            dependentPropertyValue = false;
                        }
                    } else {
                        dependentPropertyValue = $(this)[0].value;
                    }

                    if (overrideContingentCheck || always || $.zeusValidate.is(dependentPropertyValue, comparisonType, valueToTestAgainst, passOnNull, failOnNull)) {
                        var parameterMap = $.zeusValidate.getParameterMapForElement(property);
                        
                        // Start with passed in args as parameter results
                        args = (args != undefined) ? args : {};
                        for (var key in parameterMap) {
                            var upperCamelCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
                            if (args[upperCamelCaseKey] != undefined) {
                                parameterMap[key] = args[upperCamelCaseKey];
                            }
                        }
                        
                        var group = $('#ContainerFor-' + target);
                        if (group == undefined || group.length == 0) {
                            return;
                        }

                        var pT = group.data(dataTypes.ParentType);
                        var pN = group.data(dataTypes.PropertyNameInParent);
                        
                        var panel = group.find('.panel');
                        
                        if (group.find('.panel').length == 0) {
                            group.html('<div class="panel panel-inverse"><div class="panel-heading">' + displayName + '</div><div class="panel-body"></div></div>');
                        } else if (always && property.data('pageload') == undefined) {
                            // Only do pageload when group panel is empty
                            return;
                        }

                        panel = $(group).find('.panel');

                        if (panel.hasClass('panel-loading')) {
                            // Ignore click when already loading
                            return;
                        }

                        panel.addClass('panel-loading');

                        var spinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
                        var loader = $('<div class="panel-loader"></div>');

                        var panelBody = panel.find('.panel-body');
                        panelBody.prepend(spinner);

                        var panelFooter = panel.find('.panel-footer');
                        panelFooter.prepend(loader);

                        // Check for deep nested view model
                        // Find out all parent types and property name in parent values
                        var closestContainer = group.parent().closest('.iscontainer');

                        while (closestContainer.length) {
                            pT = closestContainer.data(dataTypes.ParentType) + ',' + pT;
                            pN = closestContainer.data(dataTypes.PropertyNameInParent) + ',' + pN;

                            closestContainer = closestContainer.parent().closest('.iscontainer');
                        }
                    
                        var headers = {};
                        headers[headerTypes.Ajax] = true;
                        headers[headerTypes.ParentType] = pT;
                        headers[headerTypes.PropertyNameInParent] = pN;

                        $.ajax({
                            type: 'GET',
                            dataType: 'html',
                            global: false,
                            url: url,
                            cache: false,
                            headers: headers,
                            data: parameterMap
                        }).done(function (data, textStatus, request) {
                            if ($.zeusValidate.sessionExpired(request)) {
                                return;
                            }

                            spinner.remove();
                            loader.remove();
                            panel.removeClass('panel-loading');

                            group.html(data);
                            $.zeusValidate.skipNextFocusErrors = true;
                            $rhea.prepareNewContent(group);

                            // Scroll container into view
                            if (!suppressScrollAndFocus) {
                                var scrollContainer = $('div#page-container');
                                scrollContainer.animate({ scrollTop: group.offset().top - scrollContainer.offset().top + scrollContainer.scrollTop() - 20}, 'fast'); // overflow is now applied on 'content' div, so don't scroll body.

                                // Focus container (tabindex required)
                                group.attr('tabindex', -1).focus();
                            }
                            })
                            .fail(function (xhr, status, data) {
                                var errorText = $.zeusValidate.getErrorInAjax(xhr);
                                var panelHeading = $(group.find('.panel-heading .panel-title')[0]);
                                if (panelHeading != undefined) {
                                    var panelId = panelHeading.attr('id');
                                    panelHeading = panelHeading.text();
                                    panelHeading = panelHeading.length ? '<a class="alert-link" href="#' + panelId + '">' + panelHeading + '</a> - ' : panelHeading;
                                } else {
                                    panelHeading = '';
                                }
                                errorText = panelHeading + (errorText != undefined ? errorText : 'Error occurred while loading');
                                $.zeusValidate.addError(errorText);
                                spinner.remove();
                                loader.remove();
                                panel.removeClass('panel-loading');
                        });
                    }
                };

                if (dependentProperty.length > 1) {
                    // Bind to each radio button element
                    for (var i = 0; i < dependentProperty.length; i++) {
                        $(dependentProperty[i]).bind('change.rhea-ajaxloadif', ajaxLoadIfChange);
                    }
                } else if (dependentProperty.length == 1) {
                    dependentProperty.bind('change.rhea-ajaxloadif', ajaxLoadIfChange);
                }
                
                property.bind('load.rhea-ajaxloadif', ajaxLoadIfChange);
                
                if (property.data('pageload') != undefined) {
                    return;
                }
                
                if (always) {
                    property.trigger('load.rhea-ajaxloadif', { suppressScrollAndFocus: true, overrideContingentCheck: true });
                    property.data('pageload', true);
                }
            });
        },

        gst: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-gst').each(function () {
                var property = $(this);
                
                var readOnlyType = $(this).data(dataTypes.ReadOnlyType);
                var dependentPropertyId = $(this).data(dataTypes.DependentPropertyGst);
                var isExclusive = $(this).data(dataTypes.ExclusiveGst);

                // If property has no ID then it is a Telerik control which has the actual input with ID nested inside its own markup
                if (property[0].id.length == 0 && property.find('input').length > 0) {
                    // Get nested input property
                    property = property.find('input');
                }

                var prefixedDependentPropertyId = $.zeusValidate.getFieldPrefixFromId(property[0], dependentPropertyId);
                var dependentProperty = $('#' + prefixedDependentPropertyId);
                
                // If dependent property not found by ID, assume it is a radio button and get by name instead (this will return multiple elements)
                if (dependentProperty.length == 0 || dependentProperty.data(dataTypes.RadioButtonGroup)) {
                    dependentProperty = $('input:radio[name="' + $.zeusValidate.replaceAll(prefixedDependentPropertyId, '_', '.') + '"]');
                }
                
                // Don't bind if self-referencing
                if (property[0] == dependentProperty[0]) {
                    return;
                }

                var gstChange = function () {
                    
                    if (dependentPropertyId == null || dependentPropertyId == undefined) {
                        return;
                    }

                    var dependentPropertyValue = null;

                    if ($(this)[0].type == 'checkbox' || $(this)[0].type == 'radio' || $(this).length > 1) {
                        for (var index = 0; index != $(this).length; index++) {
                            if ($(this)[index]['checked']) {
                                dependentPropertyValue = $(this)[index].value;
                                break;
                            }
                        }

                        if (dependentPropertyValue == null) {
                            dependentPropertyValue = false;
                        }
                    } else {
                        dependentPropertyValue = $(this)[0].value;
                    }

                    dependentPropertyValue = $.zeusValidate.replaceAll(dependentPropertyValue.replace('$', ''), ',', '');

                    if (!isNaN(dependentPropertyValue)) {
                        var amount = new Number(dependentPropertyValue);
                        
                        var gst = isExclusive ? new Number(amount * 0.1) : new Number(amount / 11);

                        if (property.hasClass('rhea-numeric')) {
                            gst = $.autoNumeric.Format(property, gst);
                        }
                        
                        property.val(gst);
                        property.change();
                    }
                };
                
                if (dependentProperty.length > 1) {
                    // Bind to each radio button element
                    for (var i = 0; i < dependentProperty.length; i++) {
                        $(dependentProperty[i]).bind('change.rhea-gst', gstChange);
                    }
                } else {
                    dependentProperty.bind('change.rhea-gst', gstChange);
                }
            });
        },
        
        age: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-age').each(function () {
                var property = $(this);
                var dependentPropertyId = $(this).data(dataTypes.DependentPropertyAge);
                var formatString = $(this).data(dataTypes.DependentPropertyAgeFormatString);
                var prefixedDependentPropertyId = $.zeusValidate.getFieldPrefixFromId(property[0], dependentPropertyId);
                var dependentProperty = $('#' + prefixedDependentPropertyId);
                
                // Don't bind if self-referencing
                if (property[0] == dependentProperty[0]) {
                    return;
                }

                dependentProperty.bind('change.rhea-age', function () {
                    var dependentPropertyValue = $(this)[0].value;
                    var systemDate = moment($('#system_date').text(), 'DD/MM/YYYY');
                    var dependentDate = moment(dependentPropertyValue, 'DD/MM/YYYY h:mm A');

                    if (dependentDate.isValid() && dependentDate.year() != 0) {
                    var years = systemDate.diff(dependentDate, 'years');
                    var months = systemDate.diff(dependentDate, 'months');
                    months = months - 12 * years;

                    property.val(formatString.replace('{0}', years).replace('{1}', months));
                    } else {
                        property.val('');
                    }
                });
            });
        },
        
        copy: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-copy').each(function () {
                var property = $(this);
                
                var readOnlyType = $(this).data(dataTypes.ReadOnlyType);
                var dependentPropertyId = $(this).data(dataTypes.DependentPropertiesCopy);

                // If property has no ID then it is a Telerik control which has the actual input with ID nested inside its own markup
                if (property[0].id.length == 0 && property.find('input').length > 0) {
                    // Get nested input property
                    property = property.find('input');
                }

                var dependentProperties = [];
                
                if ($.isArray(dependentPropertyId)) {
                    dependentProperties = dependentPropertyId;
                } else if (dependentPropertyId != null && dependentPropertyId != undefined) {
                    dependentProperties.push(dependentPropertyId);
                }

                for (var i = 0; i < dependentProperties.length; i++) {
                    var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(property[0], dependentProperties[i]));

                    // Don't bind if self-referencing
                    if (property[0] == dependentProperty[0]) {
                        return;
                    }

                    dependentProperty.bind('change.rhea-copy', function () {

                        var doCurrent = false;
                        
                        if (dependentProperties.length > 1) {
                            var overallValue = new Number(0);
                            
                            // Loop through each dependent and add their values if it all dependent properties are numeric
                            // Otherwise revert to copying the value of the current changed dependent property
                            for (var j = 0; j < dependentProperties.length; j++) {
                                var dP = $('#' + $.zeusValidate.getFieldPrefixFromId(property[0], dependentProperties[j]));

                                var dPValue = null;

                                if (dP[0].type == 'checkbox' || dP[0].type == 'radio' || dP.length > 1) {
                                    for (var k = 0; k != dP.length; k++) {
                                        if (dP[k]['checked']) {
                                            dPValue = dP[k].value;
                                            break;
                                        }
                                    }

                                    if (dPValue == null) {
                                        dPValue = false;
                                    }
                                } else {
                                    dPValue = dP[0].value;
                                }

                                dPValue = $.zeusValidate.replaceAll(dPValue.replace('$', ''), ',', '');
                                
                                if (!$.zeusValidate.isNumeric(dPValue)) {
                                    doCurrent = true;
                                } else {
                                    overallValue = overallValue + new Number(dPValue);
                                }
                            }
                            
                            if (!doCurrent) {
                                if (property.hasClass('rhea-numeric')) {
                                    overallValue = $.autoNumeric.Format(property, overallValue);
                                }
                                property.val(overallValue);
                                property.change();
                            }
                        } else {
                            doCurrent = true;
                        }
                        
                        if (doCurrent) {
                            var dependentPropertyValue = null;

                            if ($(this)[0].type == 'checkbox' || $(this)[0].type == 'radio' || $(this).length > 1) {
                                for (var index = 0; index != $(this).length; index++) {
                                    if ($(this)[index]['checked']) {
                                        dependentPropertyValue = $(this)[index].value;
                                        break;
                                    }
                                }

                                if (dependentPropertyValue == null) {
                                    dependentPropertyValue = false;
                                }
                            } else {
                                dependentPropertyValue = $(this)[0].value;
                            }

                            dependentPropertyValue = $.zeusValidate.replaceAll(dependentPropertyValue.replace('$', ''), ',', '');
                            
                            if (property.hasClass('rhea-numeric')) {
                                dependentPropertyValue = $.autoNumeric.Format(property, dependentPropertyValue);
                            }

                            property.val(dependentPropertyValue);
                            property.change();
                        }
                    });
                }
            });
        },

        relativedate: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-relativedate').each(function () {
                var property = $(this);

                var readOnlyType = $(this).data(dataTypes.ReadOnlyType);
                var dependentPropertyUnpacked = $(this).data(dataTypes.DependentPropertyDate).split(',', 6);
                var years = parseInt(dependentPropertyUnpacked[0]);
                var months = parseInt(dependentPropertyUnpacked[1]);
                var days = parseInt(dependentPropertyUnpacked[2]);
                var hours = parseInt(dependentPropertyUnpacked[3]);
                var minutes = parseInt(dependentPropertyUnpacked[4]);

                var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(property[0], dependentPropertyUnpacked[5]));

                // Don't bind if self-referencing
                if (property[0] == dependentProperty[0]) {
                    return;
                }

                function calculateDate() {
                    var inputgroup = property.closest('.input-group');
                    var inFormat = inputgroup.hasClass('time') ? "h:mm A" : "DD/MM/YYYY h:mm A"
                    var newDate = moment(dependentProperty.val(), inFormat);
                    newDate = newDate.add({
                        years: years,
                        months: months,
                        days: days,
                        hours: hours,
                        minutes: minutes
                    });

                    if (inputgroup.hasClass('date')) {
                        // Just update the basic control
                        property.datepicker('update', newDate.toDate());
                    }
                    else if (inputgroup.hasClass('time')) {
                        // Just update the basic control
                        property.val(newDate.format("h:mm A"))
                        property.trigger('change');
                    }
                    else if (inputgroup.hasClass('datetime')) {
                        // Manually update separate date time inputs
                        var dpart = $('#' + property.attr('id') + '_Date');
                        var tpart = $('#' + property.attr('id') + '_Time');

                        dpart.datepicker('update', newDate.toDate());
                        tpart.val(newDate.format("h:mm A"));
                        property.val(newDate.format("DD/MM/YYYY h:mm A"))
                        property.trigger('change');
                    }

                }
                // Note : DO NOT call calucateDate on page load, as this will nullify any previous user selections of the relative date.

                var changeHandle; // Used to ensure the handler only gets called once, even though the datetime control calls the change event three times, inexplicably.
                dependentProperty.bind('change.rhea-relativedate', function () {
                    window.clearTimeout(changeHandle);
                    changeHandle = window.setTimeout(calculateDate, 5);
                });
            });
        },
        
        datetimepicker: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.datetime').each(function () {
                var hiddenInput = $($(this).find('input[type="hidden"]')[0]);
                var dateContainer = $(this);
                var timeContainer = $(this);
                var dateInput = $(dateContainer.find('input')[0]);
                var timeInput = $(timeContainer.find('input')[1]);
                var errorTip = dateInput.parents().siblings('a.errorTip');
                var errorMessageSpanSelector = 'span[generated=true]';
                var errorClasses = ' input-validation-error parsley-error';
                // Check minimum date value on input
                var todayFormatted = new Date().toString('dd/MM/yyyy');
                if (dateInput.val() == '01/01/0001') {
                    dateInput.val(todayFormatted);
                    // We also should update the hidden input.
                    hiddenInput.val($.zeusValidate.replaceAll(hiddenInput.val(), '01/01/0001', todayFormatted));
                }

                dateInput.datepicker({
                    format: 'dd/mm/yyyy',
                    todayBtn: 'linked',
                    todayHighlight: true, 
                    autoclose: true,
                    weekStart: 1,
                    endDate: new Date(2100, 12, 31),
                    startDate: new Date(1900, 01, 01),
                    forceParse: false // Keeps the invalid input and doesn't revert it.
                }).on('changeDate', function () {
                    // Defect: 9257 -- Clicking on selected date (again), used to clear the date from the control. (now fixed inside bootstrap-datepicker.js)

                    // Hide error tip.
                    errorTip.find(errorMessageSpanSelector).remove();
                    errorTip.hide();
                    dateInput.removeClass(errorClasses);
                });

                dateInput.bind('input', function () {
                    $.zeusValidate.handleDateValidation(dateInput, errorTip, errorMessageSpanSelector, errorClasses);
                    // Defect 7655: as user starts typing within a date field, calendar will be closed so it will not be as intrusive as it was.
                    dateInput.datepicker('hide');
                });

                dateContainer.find('.fordate').bind('click', function () {
                    if (dateInput.attr('disabled') == undefined && dateInput.attr('readonly') == undefined) {
                        dateInput.focus();
                    }
                });
                
                dateInput.bind('show.zeus-datepicker', function () {
                    // Hide datepicker if readonly
                    if (dateInput.attr('readonly') == 'readonly' || dateInput.attr('disabled') == 'disabled') {
                        dateInput.data('datepicker').hide();
                    }
                });

                // Apply transform to container to make plugin apply to group add on button
                timeInput.timepicker({
                    timeFormat: 'g:i A',
                    step : 15
                });

                timeContainer.find('.fortime').bind('click', function () {
                    if (timeInput.attr('disabled') == undefined && timeInput.attr('readonly') == undefined) {
                        timeInput.focus();
                    }
                });

                dateInput.data('previousVal', dateInput.val());
                dateInput.data('currentVal', dateInput.val());
                dateInput.bind('input.track', function () {
                    dateInput.data('currentVal', dateInput.val());
                });
                dateInput.bind('focusout.track', function () {
                    setTimeout(function () {
                        var previousVal = dateInput.data('previousVal');
                        var currentVal = dateInput.data('currentVal');

                        var changedVal = (previousVal != currentVal);
                        dateInput.data('dateChanged', changedVal);

                        if (changedVal && dateInput.hasClass('.rhea-trigger')) {
                            dateInput.trigger('change.rhea-trigger');
                        }
                    }, 1);
                });

                dateInput.bind('change.date focusout.date', function () {
                    var container = $(this).parent();
                    
                    var hiddenInput = $(container.find('input[type="hidden"]')[0]);
                    var dateInput = $(container.find('input')[0]);

                    var oldValue = hiddenInput.val();
                    var oldValues = oldValue.split(' ');

                    if (oldValues.length != 3) {
                        oldValues = [todayFormatted, '12:00', 'AM'];
                    }

                    if (oldValues[0] == '1/01/0001') {
                        oldValues[0] = todayFormatted;
                    }

                    var newValue = $.trim(dateInput.val());

                    if (newValue != '') {
                        // Check if value is valid. Use if it is, otherwise revert it to last known good value
                        var parsedDate = $.zeusValidate.parseDateUsingMoment(newValue);
                        if (parsedDate.isValid()) { //if (Date.parseExact(newValue, 'dd/mm/yyyy') != null) {
                            var d = newValue;
                            var year = undefined;
                            var parts = undefined;

                            if (d.indexOf('/') != -1) {
                                parts = d.split('/');
                                year = parts[parts.length - 1];
                            } else if (d.indexOf('-') != -1) {
                                parts = d.split('-');
                                year = parts[parts.length - 1];
                            }

                            if (parts != undefined && parts.length == 3 && year != undefined && year.length < 4) {
                                var adjustment = 10;
                                var tippingYear = (moment().year() - 2000) + adjustment;

                                if (year <= tippingYear) {
                                    parsedDate.add(2000, 'y');
                                } else if (year < 100) {
                                    parsedDate.add(1900, 'y');
                                } else {
                                    parsedDate.year(parsedDate.year() + '0');
                                }
                            }

                            newValue = parsedDate.format('D/MM/YYYY');

                            hiddenInput.val(newValue + ' ' + oldValues[1] + ' ' + oldValues[2]);
                            dateInput.val(newValue);
                            hiddenInput.trigger('change');

                            // Rerun validate
                            $.zeusValidate.handleDateValidation(dateInput, errorTip, errorMessageSpanSelector, errorClasses);
                        } else {
                            // DO NOT revert to old value instead keep the invalid value to draw user's attention DEFECT 9257.
                            // Revert dateInput value using hiddenInput
                            //dateInput.val(oldValues[0]);
                            errorTip.show();
                            var currentClasses = dateInput.attr('class');
                            if (currentClasses.indexOf(errorClasses) < 0)
                            { dateInput.attr('class', currentClasses + errorClasses); }
                            hiddenInput.val(newValue + ' ' + oldValues[1] + ' ' + oldValues[2]); // Replace the value in hiddenInput (even if it is invalid) so jQuery unobtrusive validation will pick it up.
                        }
                    }
                });
                dateInput.focus(function () {
                    // Wait for the indicator to render.
                    setTimeout($.zeusValidate.adjustPostionOnScroll(dateInput, 'scroll.zeus-timepicker', 'div.datepicker.datepicker-dropdown.dropdown-menu'), 20);
                });

                timeInput.bind('change.time focusout.date', function () {
                    var container = $(this).parent();

                    var hiddenInput = $(container.find('input[type="hidden"]')[0]);
                    var timeInput = $(container.find('input')[1]);

                    var oldValue = hiddenInput.val();
                    var oldValues = oldValue.split(' ');

                    if (oldValues.length != 3) {
                        oldValues = [todayFormatted, '12:00', 'AM'];
                    }

                    var newValue = $.trim(timeInput.val());

                    if (newValue != '') {
                        // Check if value is valid. Use if it is, otherwise revert it to last known good value
                        if (Date.parseExact(newValue, 'h:mm tt') != null) {
                            hiddenInput.val(oldValues[0] + ' ' + newValue);
                            hiddenInput.trigger('change');
                        } else {
                            // Revert timeInput value using hiddenInput
                            timeInput.val(oldValues[1] + ' ' + oldValues[2]); // Add space between 00 AM.
                        }
                    }
                });
                timeInput.focus(function () {
                    // Wait for the indicator to render.
                    setTimeout($.zeusValidate.adjustPostionOnScroll(timeInput, 'scroll.zeus-timepicker', 'div.ui-timepicker-wrapper'), 20);
                });

                hiddenInput.bind('focus.datetime', function() {
                    dateInput.focus();
                });
            });


        },

        datepicker: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('.date').each(function () {
                var container = $(this);
                var input = $($(this).find('input')[0]);
                var errorTip = input.parents().siblings('a.errorTip');
                var errorMessageSpanSelector = 'span[generated=true]';
                var errorClasses = ' input-validation-error parsley-error';
                // Check minimum date value on input
                var todayFormatted = new Date().toString('dd/MM/yyyy');
                if (input.val() == '01/01/0001') {
                    input.val(todayFormatted);
                }

                // Apply transform to container to make plugin apply to group add on button
                input.datepicker({
                    format: 'dd/mm/yyyy',
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true,
                    weekStart: 1,
                    endDate: new Date(2100, 12, 31),
                    startDate: new Date(1900, 01, 01),
                    forceParse: false // Keeps the invalid input and doesn't revert it.
                }).on('changeDate', function () {
                    // Defect: 9257 -- Clicking on selected date (again), used to clear the date from the control. (now fixed inside bootstrap-datepicker.js)
                    
                    // Hide error tip.
                    errorTip.find(errorMessageSpanSelector).remove();
                    errorTip.hide();
                    input.removeClass(errorClasses);
                });

                container.find('.input-group-addon').bind('click', function () {
                    if (input.attr('disabled') == undefined && input.attr('readonly') == undefined) {
                        input.focus();
                    }
                });

                input.bind('input', function () {
                    $.zeusValidate.handleDateValidation(input, errorTip, errorMessageSpanSelector, errorClasses);
                    // Defect 7655: as user starts typing within a date field, calendar will be closed so it will not be as intrusive as it was.
                    input.datepicker('hide');
                });

                input.bind('show.zeus-datepicker', function () {
                    // Hide datepicker if readonly
                    if (input.attr('readonly') == 'readonly' || input.attr('disabled') == 'disabled') {
                        input.data('datepicker').hide();
                    }   
                });

                input.data('previousVal', input.val());
                input.data('currentVal', input.val());
                input.bind('input.track', function () {
                    input.data('currentVal', input.val());
                });
                input.bind('focusout.track', function () {
                    setTimeout(function () {
                        var previousVal = input.data('previousVal');
                        var currentVal = input.data('currentVal');

                        var changedVal = (previousVal != currentVal);
                        input.data('dateChanged', changedVal);

                        if (changedVal && input.hasClass('.rhea-trigger')) {
                            input.trigger('change.rhea-trigger');
                        }
                    }, 1);
                });

                input.bind('change.date focusout.date', function () {
                    var oldValue = input.data('lastval');

                    if (oldValue == '1/01/0001') {
                        oldValue = todayFormatted;
                }

                var newValue = $.trim(input.val());

                if (newValue != '') {
                    // Check if value is valid. Use if it is, otherwise revert it to last known good value
                        var parsedDate = $.zeusValidate.parseDateUsingMoment(newValue);
                        if (parsedDate.isValid()) {//if (Date.parseExact(newValue, 'dd/mm/yyyy') != null) {

                            var d = newValue;
                            var year = undefined;
                            var parts = undefined;

                            if (d.indexOf('/') != -1) {
                                parts = d.split('/');
                                year = parts[parts.length -1];
                            } else if (d.indexOf('-') != -1) {
                                parts = d.split('-');
                                year = parts[parts.length -1];
                        }

                            if (parts != undefined && parts.length == 3 && year != undefined && year.length < 4) {
                                var adjustment = 10;
                                var tippingYear = (moment().year() -2000) +adjustment;

                                if (year <= tippingYear) {
                                    parsedDate.add(2000, 'y');
                                } else if (year < 100) {
                                    parsedDate.add(1900, 'y');
                                } else {
                                    parsedDate.year(parsedDate.year() + '0');
                            }
                        }

                            newValue = parsedDate.format('D/MM/YYYY');

                            input.data('lastval', newValue);
                            input.val(newValue);

                            // Rerun validate
                            $.zeusValidate.handleDateValidation(input, errorTip, errorMessageSpanSelector, errorClasses);
                        } else {
                            // DO NOT revert to old value instead keep the invalid value to draw user's attention DEFECT 9257.
                            // Revert dateInput value using hiddenInput
                            //input.val(oldValue);
                            var currentClasses = input.attr('class');
                            if(currentClasses.indexOf(errorClasses) < 0)
                                {input.attr('class', currentClasses +errorClasses);
                        }
                            errorTip.show();
                }
                    }
                });
                input.focus(function () {
                    // Wait for the indicator to render.
                    setTimeout($.zeusValidate.adjustPostionOnScroll(input, 'scroll.zeus-datepicker', 'div.datepicker.datepicker-dropdown.dropdown-menu'), 20);
                });
            });
        },

        timepicker: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.time').each(function () {
                var container = $(this);
                var input = $($(this).find('input')[0]);
                var btn = $($(this).find('.input-group-addon')[0]);

                // Apply transform to container to make plugin apply to group add on button
                var tp = input.timepicker({
                    timeFormat: 'g:i A',
                    step: 15
                });

                btn.bind('click', function () {
                    if (input.attr('disabled') == undefined && input.attr('readonly') == undefined) {
                        input.focus();
                    }
                });

                input.bind('change.date focusout.date', function () {
                    var oldValue = input.data('lastval');

                    var newValue = $.trim(input.val());

                    if (newValue != '') {
                        // Check if value is valid. Use if it is, otherwise revert it to last known good value
                        if (Date.parseExact(newValue, 'h:mm tt') != null) {
                            input.data('lastval', newValue);
                        } else {
                            // Revert dateInput value using hiddenInput
                            input.val(oldValue);
                        }
                    }
                });
                input.focus(function () {
                    // Wait for the indicator to render.
                    setTimeout($.zeusValidate.adjustPostionOnScroll(input, 'scroll.zeus-timepicker', 'div.ui-timepicker-wrapper'), 20);
                });
            });
        },

        numeric: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-numeric').each(function () {

                var options = {};

                options.aSep = '';
                
                if ($(this).data('val-currency') != undefined) {
                    options.aSep = ',';
                    options.aSign = '$';
                }
                
                options.wEmpty = (/^true$/i.test($(this).data(dataTypes.IsNullable))) ? 'empty' : 'zero';

                if ($(this).data(dataTypes.Decimal) != undefined) {
                    options.mDec = parseInt($(this).data(dataTypes.Decimal));
                } else {
                    options.mDec = 0;
                }

                var min = $(this).data('val-range-min');
                var max = $(this).data('val-range-max');

                if (min != undefined) {
                    if ($(this).data(dataTypes.Decimal) != undefined) {
                        options.vMin = parseFloat(min);
                    } else {
                        options.vMin = parseInt(min);
                    }
                }

                if (max != undefined) {
                    if ($(this).data(dataTypes.Decimal) != undefined) {
                        options.vMax = parseFloat(max);
                    } else {
                        options.vMax = parseInt(max);
                    }
                }
                
                $(this).autoNumeric(options);
            });
        },

        ajaxproperty: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('[' + fullDataTypes.PropertyNameForAjax + ']').each(function() {
                var element = $(this);

                var prefix = element.data(dataTypes.FieldPrefix);
                prefix = prefix == undefined ? '' : prefix;
                var target = element.data(dataTypes.PropertyNameForAjax);

                if (target == undefined || target.length == 0) {
                    return;
                }
                
                if (prefix != undefined && prefix.length > 0) {
                    prefix = prefix + '_';
                }
                // Handle anchor
                if (element.is('a')) {
                    element.bind('click.zeus-ajaxproperty', function(e) {
                        e.preventDefault();

                        var parameters = [];

                        var url = element.data(dataTypes.Url);

                        // Use links HREF if this link is in a table or we don't have a URL data attribute or any parameters
                        if (element.parents('td').length > 0 || url == undefined) {
                            url = this.href;
                        } else {
                            parameters = $.zeusValidate.getParameterMapForElement(element);
                        }

                        var widget = false;

                        // Target for property
                        var group = $('#ContainerFor-' + prefix + target);

                        // Target for parallel property
                        if (group == undefined || group.length == 0) {
                            group = $('#ContainerFor-' + target);
                        }

                        // Target self
                        if (group == undefined || group.length == 0) {
                            var isSelf = (/^true$/i.test(target)) ? true : false;

                            if (!isSelf) {
                                return;
                                }

                                // Handle targetting self
                            var p = $(this).closest('.panel');

                            if (p.hasClass('iswidget')) {
                                widget = true;
                                group = p.parent();
                                } else {
                                    // find nearest container and get its id
                                var c = p.closest('.iscontainer');

                                if (c != undefined) {
                                    var containingID = c.attr('id');

                                    if (containingID != undefined && containingID.indexOf('ContainerFor-') != -1) {
                                        target = containingID.replace('ContainerFor-', '');
                                        group = $('#ContainerFor-' + target);
                                    }
                                }
                            }

                            if (group == undefined || group.length == 0) {
                                return;
                            }
                        }

                            // Sneaky highlighting of the row if this is inside a table row
                        var potentialTableRow = $(this).closest('tr');
                        if (potentialTableRow.length > 0) {
                            potentialTableRow.siblings('tr').removeClass('success');
                            potentialTableRow.addClass('success');
                        }

                        var pT = group.data(dataTypes.ParentType);
                        var pN = group.data(dataTypes.PropertyNameInParent);

                        var panel = group.find('.panel');

                        if (panel.hasClass('panel-loading')) {
                                // Ignore click when already loading
                                return;
                                }

                        panel.addClass('panel-loading');

                        var spinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
                        var loader = $('<div class="panel-loader"></div>');

                        var panelBody = panel.find('.panel-body');
                        panelBody.prepend(spinner);

                            var panelFooter = panel.find('.panel-footer');
                        panelFooter.prepend(loader);

                        // Check for deep nested view model
                        // Find out all parent types and property name in parent values
                        var closestContainer = group.parent().closest('.iscontainer');

                        while (closestContainer.length) {
                            pT = closestContainer.data(dataTypes.ParentType) + ',' + pT;
                            pN = closestContainer.data(dataTypes.PropertyNameInParent) + ',' + pN;

                            closestContainer = closestContainer.parent().closest('.iscontainer');
                        }

                        var headers = {};
                        headers[headerTypes.Ajax] = true;
                        headers[headerTypes.ParentType] = pT;
                        headers[headerTypes.PropertyNameInParent] = pN;

                        var ajaxOptions = {
                            type: 'GET',
                            dataType: 'html',
                            global: false,
                            url: url,
                            cache: false,
                            headers: headers,
                            data: parameters
                        };

                        // Create postable parameter set if needed
                        var usePost = false;
                        var data = new FormData();
                        var elements = $.zeusValidate.getParameterElementsForElement(element);
                        for (var i = 0; i < elements.length; ++i) {
                            var current = elements[i];
                            if (current.attr('type') == 'file' && current.attr('name') != undefined) {
                                data.append(current.attr('name').replace(/.*\./, ''), current[0].files[0]);
                                usePost = true
                            }
                            else if (current.attr('name') != undefined) {
                                data.append(current.attr('name').replace(/.*\./, ''), $.zeusValidate.getValueFromInput(current));
                            }
                        }
                        // If we detected a file, convert this request to a multipart encoded POST
                        if (usePost) {
                            ajaxOptions = {
                                type: 'POST',
                                dataType: 'html',
                                global: false,
                                url: url,
                                cache: false,
                                headers: headers,
                                processData: false,
                                contentType: false,
                                data: data,
                            };
                        }

                        $.ajax(ajaxOptions).done(function(data, textStatus, request) {
                                if ($.zeusValidate.sessionExpired(request)) {
                                    return;
                                }

                                spinner.remove();
                                loader.remove();
                                panel.removeClass('panel-loading');

                                // Adjust for widget
                                if (widget) {
                                    group = group.find('.panel-body');
                                }

                                group.html(data);
                                $rhea.prepareNewContent(group);

                                // Scroll container into view
                                var scrollContainer = $('div#page-container');
                                scrollContainer.animate({ scrollTop: (group.offset().top - scrollContainer.offset().top + scrollContainer.scrollTop()) - 20}, 'fast');

                                    // Focus container (tabindex required)
                                group.attr('tabindex', -1).focus();

                        })
                        .fail(function (xhr, status, data) {
                            var errorText = $.zeusValidate.getErrorInAjax(xhr);
                            var panelHeading = $(group.find('.panel-heading .panel-title')[0]);
                            if (panelHeading != undefined) {
                                var panelId = panelHeading.attr('id');
                                panelHeading = panelHeading.text();
                                panelHeading = panelHeading.length ? '<a class="alert-link" href="#' + panelId + '">' + panelHeading + '</a> - ' : panelHeading;
                            } else {
                                panelHeading = '';
                            }
                            errorText = panelHeading + (errorText != undefined ? errorText : 'Error occurred while loading');
                            $.zeusValidate.addError(errorText);
                            spinner.remove();
                            loader.remove();
                            panel.removeClass('panel-loading');
                        });
                    });
                }
            });

            var url = window.location.href;
            root.find('[' + fullDataTypes.PropertyNamesWithAjaxLoadToTrigger + ']').each(function() {
                var element = $(this);

                var properties = element.data(dataTypes.PropertyNamesWithAjaxLoadToTrigger);
                var parameters = element.data(dataTypes.Parameters);

                if (properties == undefined || properties.length == 0) {
                    return;
                }

                var targets = properties.split(',');

                if (element.is('a')) {

                    // SPECIAL CASE: only applicable for bulletins where the ID appears in the URL and we'd like to highlight the row (even though user hasn't clicked on the link).
                    if (parameters != undefined && parameters.Id != undefined) { // Check that parameter list contains 'Id'.
                        var id = parameters.Id;
                        if (url != undefined && id != undefined) {  // We assume Id is the last query string in url.
                            if (url.indexOf('/Bulletins') != -1) {
                                // Ensure to only apply on Bulletins.
                                var idUrl = url.substring(window.location.href.lastIndexOf('/') + 1);
                                if (idUrl == id) {
                                    highlightGridRow(element);
                                }
                                // This effort was in place to highlight the first row when Id does not appear in URL.
                                //else if ((idUrl == 'Bulletins' || idUrl == '') && !highlightedFirstRow) {
                                //    // if no id in url then highlight the first row.
                                //    highlightGridRow(element);
                                //    highlightedFirstRow = true;
                                //}
                            }
                        }
                    }
                    element.bind('click.zeus-ajaxproperties', function (e) {
                        e.preventDefault();

                        if (parameters == undefined) {
                            parameters = {};
                        }
                        
                        for (var j = 0; j < targets.length; j++) {
                            // When link clicked - scroll and focus to first target, suppress for all others.
                            parameters.suppressScrollAndFocus = j > 0;

                            // Always ignore contingent check when triggering from here
                            parameters.overrideContingentCheck = true;
                            
                            $('#ContainerFor-' + targets[j]).trigger('load.rhea-ajaxloadif', parameters);
                            highlightGridRow(element);
                        }
                    });
                    
                    // Highlights the clicked grid row.
                    function highlightGridRow(property) {

                        var table = property.closest('table');
                        var row = property.closest('tr');
                        if (table.length >= 1 && row.length >= 1) {
                            // Loop through all <tr>s and remove 'success' class.
                            $(table).find('tr').each(function () {
                                var currentRow = $(this);
                                var isEditedRow = undefined;
                                isEditedRow = currentRow.attr(fullDataTypes.EditedRow);
                                // Ensure the current row is not edited row.
                                if (isEditedRow == undefined) {
                                    $(currentRow).removeClass('success');
                }
            });
                            row.addClass('success');
                        }
                    }
                }
            });
        },

        trigger: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-trigger').each(function () {

                var property = $(this);
                
                var submitTypeName = property.data(dataTypes.SubmitName);
                var submitType = property.data(dataTypes.SubmitType);

                // If property has no ID then it is a Telerik control which has the actual input with ID nested inside its own markup
                if (property[0].id.length == 0 && property.find('input').length > 0) {
                    // Get nested input property
                    property = property.find('input');
                }

                var triggerEvent = function () {
                    if (property.data('triggered') === true) {
                        return;
                    }

                    property.data('triggered', true);

                    window.setTimeout(function () {

                        var changed = property.data(dataTypes.DatePicker) ? property.data('dateChanged') : true;

                        if (property.data(dataTypes.DateTimePicker)) {
                            changed = $(property.parent().find('input')[0]).data('dateChanged');
                        }
                        
                        if (changed !== true) {
                            property.data('triggered', false);
                            return;
                        }

                        property.off('change.rhea-trigger');

                        // Save dirty state
                        var initialData = {}
                        $('#content input, #content textarea, #content select').each(function () {
                            if ($(this).attr('id')) {
                                initialData[$(this).attr('id')] = $(this).data('initialValue');
                            }
                        });
                        $.zeusValidate.updateCkeditorInstances(root);
                        var serializedData = $rhea.serializeform($('#main_form')) + '&' + submitTypeName + '=' + submitType;
                        var propertyId = property.attr('id');

                        $.ajax({
                            type: 'POST',
                            data: serializedData
                        }).done(function (data, textStatus, request) {
                            if ($.zeusValidate.sessionExpired(request)) {
                                return;
                            }
                 
                            property.data('triggered', undefined);

                            // Close all open datepickers before handling trigger refresh so they don't get stuck open
                            $(document).find('.date,.datetime').each(function () {
                                $($(this).find('input')[0]).datepicker('hide');
                            });

                            // Close all open timepickers too
                            $('body').find('.ui-timepicker-wrapper').hide();


                            var content = $('#content');
                            content.html(data);
                            $rhea.prepareNewContent(content);

                            // restore dirty state
                            $('#content input, #content textarea, #content select').each(function () {
                                if ($(this).attr('id')) {
                                    $(this).data('initialValue', initialData[$(this).attr('id')]);
                                }
                            });

                            var refocus = function () {
                                var element = $('#' + propertyId);
                                if (element.is('select')) {
                                    element.data('ariaSelectReference').find('.amc-box').focus();
                                }
                                else {
                                    element.focus();
                                }
                            };
                            setTimeout(refocus, 50);
                        }).fail(function (xhr, status, data) {
                            var errorText = $.zeusValidate.getErrorInAjax(xhr);
                            errorText = (errorText != undefined ? errorText : 'Error occurred while performing trigger on ') + ' ' + property.attr(fullDataTypes.DisplayName) + '.';
                            $.zeusValidate.addError(errorText);
                            property.on('change.rhea-trigger', triggerEvent);
                            property.data('triggered', false);
                        });
                    }, 100); // 100 ms timeout to make sure other events complete before firing the trigger.
                };

                property.on('change.rhea-trigger', triggerEvent);

            });
        },

        paged: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('.rhea-paged').each(function () {
                // Paged link
                var property = $(this);

                if (property.attr('data-rhea-scroll-load') == 'true') {
                    $(window).bind('scroll', function () {
                        if ($(window).scrollTop() + $(window).height() >= root.height() - 200) {
                            // user has reached bottom of the page
                            $rhea.loadMoreResults(property, false);
                        }
                    });
                }

                // Show paged link (only visible when javascript is enabled for AJAX paging)
                if (property.hasClass('has-more')) {
                    property.removeClass('hidden');
                }
                
                property.bind('click.rhea-paged', function (e) {
                    // Prevent paged link default behaviour
                    e.preventDefault();

                    $rhea.loadMoreResults(property, false);
            });
            });
        },

        getTableRows: function (table) {
            // Gets how many rows are currently in the table (this is to accomodate when individual rows have been added via Ajax Modal)
            return table.find('tbody tr:not([' + fullDataTypes.ActualDeletedRow + '=true],[' + fullDataTypes.ActualAddedRow + '=true])').not('.rhea-metadata').not('.responsive-row').length
        },

        loadMoreResults: function (property, columnSelection) {
            $rhea = this;
            
            // Grid
            var gridProperty = $('#' + property.data(dataTypes.PropertyIdGrid));

            // Do not execute AJAX if paged link has since been hidden
            if (property.hasClass('hidden') && !columnSelection) {
                return;
            }

            // How many rows are currently in the table (this is to accomodate when individual rows have been added via Ajax Modal)
            var rows = $rhea.getTableRows(gridProperty.closest('table'));
            // WE SHOULD CATER FOR ADDED ROWS! Determine how many rows were added/deleted from the table.

            // Paged metatadata
            var metadataValue = '';

            if (property.is('[' + fullDataTypes.PagedMetadata + ']')) {
                // History or Bulletins
                metadataValue = property.data(dataTypes.PagedMetadata);
            }
            else {
                // Grid
                // Get the stored metadata
                metadataValue = gridProperty.data(dataTypes.PagedMetadata);

                if (metadataValue == undefined) {
                    // Nothing stored so get original value from input
                    metadataValue = $('#' + property.data(dataTypes.PagedMetadataPropertyId)).val();
                }
            }

            // Setup header to include row count
            var headers = {};
            headers[headerTypes.RowNumber] = rows;

            // Include selection type
            headers[headerTypes.SelectionType] = gridProperty.closest('table').data(dataTypes.SelectionType);

            // If columnSelection is true, should reload from page 0 and add column selections to header, server should save them 
            if (columnSelection) {
                // Get selected checkboxes
                var columnSelectorCheckboxes = $('#' +gridProperty.closest('table').attr('id') + 'SelectedColumns').closest('ul').find('input[type="checkbox"]').filter(':checked');

                var selections = [];

                for (var i = 0; i < columnSelectorCheckboxes.length; i++) {
                    selections.push(columnSelectorCheckboxes[i].value);
                }

                // Add to header
                headers[headerTypes.ColumnSelections] = selections.join();
            }

            var ajaxType = 'GET';

            if (/^true$/i.test(gridProperty.closest('table').data(dataTypes.HttpPost))) {
                ajaxType = 'POST';
            }

            // Call for next page using paged metadata
            $.ajax({
                type: ajaxType,
                dataType: 'html',
                url: property.data(dataTypes.Url),
                data: {
                    metadata: metadataValue,
                    storedRouteValues: property.data(dataTypes.StoredRouteValues),
                },
                headers: headers,
                cache: false
            }).done(function (data) {
                if (data == '' || data == null) {
                    // Hide paged link and return if no data came back
                    property.addClass('hidden');
                    return;
                }

                // Clear grid first if refreshing from column selection
                if (columnSelection) {
                    gridProperty.empty();
                }

                // Strip out header
                var splitter = '<databreak/>';
                var splitterIndex = data.indexOf(splitter);
                if (splitterIndex != -1) {
                    var header = data.substring(0, splitterIndex);
                    data = data.substring(splitterIndex + splitter.length);

                    // Update header
                    var thead = gridProperty.parent().find('thead');

                    thead.empty();
                    var headerRows = $(header).find('tr');
                    thead.append(headerRows);
                    
                    var originalElement = this.element;
                    this.element = gridProperty.closest('table').parent();
                    $rhea.gridstyle();
                    $rhea.gridSortable();
                    this.element = originalElement;
                }

                // Append retrieved page to grid
                var newContent = $(data);

                gridProperty.append(newContent);

                $.zeusValidate.skipNextFocusErrors = true;
                $rhea.prepareNewContent(newContent);

                var $table = gridProperty.closest('table');                
                if ($table.attr(fullDataTypes.GridFilterStatus) == "true") {// check if filtering is allowed client-side, if so apply filter again.
                    $table.trigger($.fn.filterTable.defaultOptions.contentChangedEvent);
                }
                $rhea.responsivetables(newContent);

                // Get and update latest paged metadata
                $rhea.updateTableMetadata(data, property, gridProperty);

                // No need to resync for history
                if (property.is('[' + fullDataTypes.PagedMetadata + ']')) {
                    return;
                }
            })
            .fail(function (xhr, status, data) {
                $.zeusValidate.addError('Error occurred while loading results.');
            });

        },

        updateTableMetadata: function(data, loadMoreLink, tbody){
            var metadata = $(data).last().data(dataTypes.PagedMetadata);

            if (metadata) {
                // Update metadata
                if (loadMoreLink.is('[' + fullDataTypes.PagedMetadata + ']')) {
                    // History or Bulletins
                    loadMoreLink.data(dataTypes.PagedMetadata, metadata);
                }
                else {
                    // Grid
                    //$('#' + property.data(dataTypes.PagedMetadataPropertyId)).val(metadata);
                    // Store metadata in data so when the user navigates away and then comes back via the back button the actual input value still has the original metadata value for paging to work as expected
                    tbody.data(dataTypes.PagedMetadata, metadata);
                }
            }
            var hasMore = (/^true$/i.test($(data).last().data(dataTypes.PagedHasMore))) ? true : false;

            if (!hasMore) {
                // Hide paged link if there are no more pages
                loadMoreLink.addClass('hidden');
            } else {
                loadMoreLink.removeClass('hidden');
            }
        },
        
        historypin: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            var pageContainer = root.find('#page-container');

            // Space out each individual history panel
            var topOffset = 100;
            var zindexOffset = 1020;
            root.find('.theme-panel').each(function () {
                $(this).css('top', topOffset + 'px');
                topOffset += 50;
                $(this).css('z-index', zindexOffset);
                zindexOffset -= 10;
            })

            // Fix up accesibility parts
            root.find('a[data-click="theme-panel-expand"]').on("click", function (event) {
                var self = $(this);
                var readerSpan = self.find('.readers');
                var text = readerSpan.text();                
                if (text.match(/^close/) == null) {                   
                    self.closest('.theme-panel').css('position', 'absolute'); // When zoomed to 200% unable to view recently accessed records as the position is Fixed, hence changing it to absolute.
                    readerSpan.text(text.replace(/^open/, 'close'));
                    self.siblings('.theme-panel-content').show();
                    // Update TOP position because the 'absolute' position of the theme-panel causes it to be shown on the top of the page.
                    var actualTop = self.closest('.theme-panel').css('top');
                    self.attr('actualTop', actualTop);
                    var newTop = parseInt(actualTop) + pageContainer.scrollTop();                    
                    self.closest('.theme-panel').css('top', newTop);
                }
                else {
                    readerSpan.text(text.replace(/^close/, 'open'));
                    var actualTop = self.attr('actualTop'); // restore actual top.
                    self.closest('.theme-panel').css('top', actualTop);
                    self.closest('.theme-panel').css('position', 'fixed'); // You can still see the hidden content with position abolute, so we change it to fixed when panel is closed.
                    window.setTimeout(function () {
                        self.siblings('.theme-panel-content').hide();
                    }, 300);
                }
            });

            root.find('.unpin-all').on("click", function (event) {
                event.preventDefault();
                var historyType = $(this).data(dataTypes.HistoryType);

                // Update server records
                $.ajax({
                    type: 'POST',
                    global: false,
                    url: $(this).data(dataTypes.Url),
                    data: {
                        historyType: historyType,
                    },
                    cache: false
                }).fail(function (xhr, status, data) {
                    $.zeusValidate.addError('Error occurred while processing history pin.');
                });

                var pinnedRecords = $(this).parent().find('.pinned');
                var list = $(this).siblings('ul');
                // Update pin count
                list.attr(fullDataTypes.PinnedCount, parseInt(list.attr(fullDataTypes.PinnedCount)) - pinnedRecords.length);
                pinnedRecords.each(function () {
                    var record = $(this);
                    record.removeClass('pinned');
                    // Update the hidden text for screen-reader.
                    var readersSpan = $(this).find('span.readers');
                    readersSpan.text(readersSpan.text().replace('Unpin', 'Pin').replace(' from list', ' to list'));
                    var parentItem = $(this).closest('li');
                    // Push to bottom of list
                    parentItem.appendTo(list);
                });
            });
            root.find('.history-pin').each(function () {
                var pin = $(this);

                var historyType = pin.data(dataTypes.HistoryType);
                var historyDescription = pin.data(dataTypes.HistoryDescription);
                var objectValues = pin.data(dataTypes.ObjectValues);

                var parentItem = pin.closest('li');
                var parentList = parentItem.closest('ul');

                pin.on('click.zeus-pin', function (e) {
                    e.preventDefault();
                    var pinnedCount = parseInt(parentList.attr(fullDataTypes.PinnedCount));
                    var url = pin.data(dataTypes.Url);

                    // Check for early exit on exceeding pin count -- taking out at Ross's request
                    //var limit = 10;
                    //if (!pin.hasClass('pinned') && pinnedCount >= limit) {
                    //    $.zeusValidate.addPropertyError('pinLink', 'Pin ' + historyDescription, 'You have reached the maximum limit of ' + limit + ' pinned ' + historyDescription + ' records. To add this record to your pinned list, you must first remove a ' + historyDescription + ' record.');
                    //    return; // Early exit
                    //}

                    // Update server record
                    $.ajax({
                        type: 'POST',
                        global: false,
                        url: url,
                        data: {
                            historyType: historyType,
                            values: objectValues
                        },
                        cache: false
                    }).fail(function (xhr, status, data) {
                        $.zeusValidate.addError('Error occurred while processing history pin.');
                    });

                    pin.toggleClass('pinned');
                    // Update the hidden text for screen-reader.
                    var readersSpan = $(pin).find('span.readers');
                    if (pin.hasClass('pinned')) {
                        // Push to top of list
                        parentItem.prependTo(parentList);
                        // Update url
                        pin.data(dataTypes.Url, url.replace('Pin', 'Unpin'));                        
                        readersSpan.text(readersSpan.text().replace('Pin', 'Unpin').replace(' to list', ' from list'));
                        // Update pin count
                        parentList.attr(fullDataTypes.PinnedCount, pinnedCount + 1);
                    }
                    else {
                        // Push to bottom of list
                        parentItem.appendTo(parentList);
                        // Update url
                        pin.data(dataTypes.Url, url.replace('Unpin', 'Pin'));
                        readersSpan.text(readersSpan.text().replace('Unpin', 'Pin'));
                        // Update pin count
                        parentList.attr(fullDataTypes.PinnedCount, pinnedCount - 1);
                    }

                    // Move focus to link, for keyboard users
                    pin.prev().focus();
                });
            });
        },

        multiplegridselect: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('.rhea-multiple-select-grid').each(function () {
                var property = $(this);
                
                // Grid
                var gridProperty = $('#' + property.data(dataTypes.PropertyIdGrid));
                
                // See if all are checked
                var allChecked = true;
                gridProperty.find('input:checkbox').each(function () {
                    if ($(this)[0] != property[0] && !$(this).is(':checked')) {
                        allChecked = false;
                    }
                });
                property.attr({ checked: allChecked });

                // Show select/deselect all checkbox (only visible when javascript is enabled)
                property.removeClass('hidden');

                property.bind('click.rhea-mutiple-select-grid', function () {
                    // Set all checkboxes in grid to match the select/deselect all checkbox
                    gridProperty.find('input:checkbox').each(function () {
                        var readonly = ($(this).attr('readonly') == 'readonly' || $(this).attr('disabled') == 'disabled' || $(this).closest('tr.zeus-filter-hide').length); // also exclude the filtered out columns.

                        if (!readonly) {
                            $(this).attr({ checked: property.is(':checked') });
                        }
                    });
                });
                
            });
        },
        
        crn: function () {
            
            $('[data-val-crn]').bind('change.rhea-crn', function () {
                this.value = this.value.toUpperCase();
            });
            
            $('[data-val-crn]').bind('keyup.rhea-crn', function () {
                var selectionStart = this.selectionStart;
                var selectionEnd = this.selectionEnd;
                
                this.value = this.value.toUpperCase();
                
                this.selectionStart = selectionStart;
                this.selectionEnd = selectionEnd;
            });
        },
        
        tooltipposition: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var checkPosition = function (property) {
                var span = property.find('span');

                // Store current top setting for below position
                if (span.data('top') == undefined) {
                    if (span[0].currentStyle != undefined) {
                        span.data('top', span[0].currentStyle.top);
                    }
                }

                var offset = property.offset();
                var height = property.outerHeight(false);
                var spanHeight = span.outerHeight(false);

                var viewportBottom = $(window).scrollTop() + $(window).height();
                var spanTop = offset.top + height;
                var enoughRoomBelow = spanTop + spanHeight <= viewportBottom;

                // Default to use below position
                var top = span.data('top');

                // But if there's not enough room, reposition above
                if (!enoughRoomBelow) {
                    top = -(spanHeight + 3);
                }

                span.css({ top: top });
            };
            
            var changeVisibility = function (property, isErrorTip) {
                
                if (isErrorTip === true) {
                    if ($(root.find('.hintTip span')).hasClass('visible')) {
                        $(root.find('.hintTip span')).removeClass('visible');
                    }
                }
                else {
                    if ($(root.find('.errorTip span')).hasClass('visible')) {
                        $(root.find('.errorTip span')).removeClass('visible');
                    }
                }
                var span = property.find('span');
            
                if ($(span).hasClass('visible')) {
                    $(span).removeClass('visible');
                } else {
                    $(span).addClass('visible');
                    checkPosition(property);
                }
            };


            var hideTips = function () {

                if ($(root.find('.hintTip span')).hasClass('visible')) {
                    $(root.find('.hintTip span')).removeClass('visible');
                }

                if ($(root.find('.errorTip span')).hasClass('visible')) {
                    $(root.find('.errorTip span')).removeClass('visible');
                }

            };


            root.find('.errorTip').each(function () {
                var property = $(this);
                //                property.bind('focus.rhea-tooltipposition', function() { checkPosition(property); });
                //                property.bind('hover.rhea-tooltipposition', function() { checkPosition(property); });
                var isErrorTip = true;
                property.bind('click.rhea-tooltipposition', function () { changeVisibility(property, isErrorTip); });
                property.bind('onenter.rhea-tooltipposition', function () { changeVisibility(property, isErrorTip); });
                property.bind('focusout.rhea-tooltipposition', function () { hideTips(); });
            });
            
            root.find('.hintTip').each(function () {
                var property = $(this);

                //                property.bind('focus.rhea-tooltipposition', function() { checkPosition(property); });
                //                property.bind('hover.rhea-tooltipposition', function() { checkPosition(property); });
                var isErrorTip = false;
                property.bind('click.rhea-tooltipposition', function () { changeVisibility(property, isErrorTip); });
                property.bind('onenter.rhea-tooltipposition', function () { changeVisibility(property, isErrorTip); });
                property.bind('focusout.rhea-tooltipposition', function () { hideTips(); });
            });
        },
        
        tooltiplinks: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('a[' + fullDataTypes.Tooltip + ']').each(function() {
                var link = $(this);
                var placement = link.data(dataTypes.Tooltip);

                if (placement == undefined) {
                    placement = 'auto';
                }

                var tooltipDefaults = {
                    placement: placement,
                    trigger: 'hover',
                    container: 'body',
                    delay: { "show": 100, "hide": 0 },
                }

                link.tooltip(tooltipDefaults);
            });
        },

        clear: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('button[' + fullDataTypes.ButtonClear + '="true"]').each(function() {
                var clearButton = $(this);
                // Bind Click event to this button
                clearButton.bind('click', function (e) {
                    // prevent from leaving the current page.
                    e.preventDefault();
                    var parentPanel = $(clearButton).parents('div.panel');
                    var allElements;

                    // check if button is inside a panel
                    if (parentPanel.length == 1) {
                        // get elements within that panel
                        allElements = $(parentPanel[0]).find('*'); //.elements; 
                    }
                    else {
                        // if Button is not contained in panel, then get all elements of form
                        allElements = $('#main_form *');
                    }

                    if (allElements != undefined) {
                        for (var i = 0; i < allElements.length; i++) {
                            if (($(allElements[i]).attr('readOnly') != undefined)
                                ||
                                (allElements[i].hasAttribute('disabled'))) {
                                continue;
                            }
                            var elementType = allElements[i].type;
                            if (elementType) {
                                console.log(elementType);
                                switch (elementType.toLowerCase()) {
                                case "text":
                                case "password":
                                case "textarea": // case "hidden":
                                case "tel": // Defect 9431: Handled tel and email type.
                                case "email":
                                    allElements[i].value = '';
                                    break;
                                case "radio":
                                case "checkbox":
                                    if (allElements[i].checked) {
                                        allElements[i].checked = false;
                                    }
                                    break;
                                case "select":
                                case "select-one":
                                case "select-multi":
                                case "select-multiple":
                                    $(allElements[i]).data('ariaSelectReference').clearAll();
                                    break;
                                default:
                                    break;
                                }
                            }

                        }
                    }
                });

            });
        },

        inlinegrid: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            // Setup property to check when any properties in its row changes (ignoring self)
            root.find('input[' + fullDataTypes.GridInlineEditedState + ']').each(function() {
                var editedState = $(this);
                
                // Get all inputs except self
                var inputs = editedState.closest('tr').find(':input').filter(function() {
                    var current = $(this);

                    return current.attr('id') != editedState.attr('id');
                });

                // Get original state
                var initialState = $rhea.serializeform(inputs);

                editedState.data('initialState', initialState);
                editedState.bind('checkstate', function() {
                    // Get current state
                    var currentState = $rhea.serializeform(inputs);

                    if (editedState.data('initialState') != currentState) {
                        editedState.val(true);
                        editedState.closest('tr').addClass('success');
                    } else {
                        editedState.val(false);
                        editedState.closest('tr').removeClass('success');
                    }
                });

                inputs.each(function() {
                    var input = $(this);

                    input.bind('change.inlinegrid', function() {
                        editedState.trigger('checkstate');
                    });
                });
            });
        },
        
        ajaxgrid: function () {

            var ModalType = {};
            ModalType.None = 'none';
            ModalType.Add = 'add';
            ModalType.AddRefresh = 'addrefresh';
            ModalType.AddSelfForAjax = 'addselfforajax';
            ModalType.Edit = 'edit';
            ModalType.EditRefresh = 'editrefresh';
            ModalType.EditSelfForAjax = 'editselfforajax';
            ModalType.Delete = 'delete';
            ModalType.DeleteRefresh = 'deleterefresh';
            ModalType.DeleteSelfForAjax = 'deleteselfforajax';

            var $rhea = this;
            var root = $(this.element) || $(document);

            var styleDeletedRow = function (element) {
                var tr = $(element);
                // Disable all inputs in row
                tr.find(':input').each(function () {
                    $(this).attr('disabled', 'disabled');
                });

                // Unselect selector radio button/checkbox
                tr.find('input[' + fullDataTypes.RowSelector + ']').each(function () {
                    this['checked'] = false;
                });

                // Hide row links
                var notHiddenTD = tr.find('td').not('.hidden');
                $(notHiddenTD[notHiddenTD.length - 1]).find('a').each(function () { $(this).addClass('hidden'); });

                // Indicate row is deleted by colour
                tr.removeClass('success');
                tr.addClass('parsley-error');
            }

            root.find('tr[' + fullDataTypes.DeletedRow + '="true"]').each(function() {
                styleDeletedRow(this);
            });

            var styleEditedRow = function (element) {
                var tr = $(element);
                
                // Indicate row is edited by colour
                tr.removeClass('parsley-error');
                tr.addClass('success');
            }

            root.find('tr[' + fullDataTypes.EditedRow + '="true"]').each(function () {
                styleEditedRow(this);
            });

            // TODO: Cater to adding a new grid row (for grids that support modal editing only)
            root.find('a[' +fullDataTypes.AjaxGridModal + ']').each(function () {
                var link = $(this);

                var type = link.data(dataTypes.AjaxGridModal);

                if (type == ModalType.None) {
                    return;
            }

                link.bind('click.ajaxgridmodal', function (e) {
                    e.preventDefault();

                    var grid = type == ModalType.Add || type == ModalType.AddRefresh || type == ModalType.AddSelfForAjax ? $(link.closest('.panel').find('table')[0]) : link.closest('table');
                    var url = e.target.href != undefined ? e.target.href : link.attr('href'); // when anchor contains span, the e.target will be undefined.
                    var row = type == ModalType.Add || type == ModalType.AddRefresh || type == ModalType.AddSelfForAjax ? grid.find('tbody tr').not('.rhea-metadata').length : link.closest('tr').index();

                    var parameterMap = $.zeusValidate.getParameterMapForElement(link);
                    /* Commented out as we're using global: true instead

                    var panel = link.closest('.panel');

                    if (panel.hasClass('panel-loading')) {
                        // Ignore click when already loading
                        return;
                    }

                    panel.addClass('panel-loading');

                    var spinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
                    var loader = $('<div class="panel-loader"></div>');

                    var panelBody = panel.find('.panel-body');
                    panelBody.prepend(spinner);

                    var panelFooter = panel.find('.panel-footer');
                    panelFooter.prepend(loader);

                    */

                    var headers = {};
                    headers[headerTypes.AjaxForm]= true; // Indicate we want the <form> tag to come back

                    $.ajax({
                        url: url,
                        type: 'GET',
                        cache: false,
                        global: true,
                        data: parameterMap != undefined ? parameterMap : '',
                            headers: headers
                    }).done(function (data, textStatus, request) {
                        if ($.zeusValidate.sessionExpired(request)) {
                            return;
                        }

                        /* Commented out as using global: true instead
                        spinner.remove();
                        loader.remove();
                        panel.removeClass('panel-loading');
                        */

                        var modalID = 'modal-grid';
                        var gridModal = $('#' +modalID);

                        // Always remove modal if it exists so it can be recreated from scratch and prepared with behaviours (keeping it was causing bootstrap-maxlength to apply twice and then error)
                        if (gridModal.length > 0) {
                            gridModal.remove();
                        }

                        var gridModal = $rhea.makeModalDialogElement('', '', '', modalID);

                        var prepareModal = function (html) {
                            // Update inner HTML
                            gridModal.find('.modal-body').html($.zeusValidate.replaceAll(html, 'id="main_form"', 'id="gridmodal_form"'));

                            // Include offset link to correct a display issue where having all buttons hidden causes the modal container not to wrap all contents
                            var fix = $('<a href="javascript:;" class="modal-fix" tabindex="-1">&nbsp;</a>');
                            var nestedButtons = gridModal.find('.modal-body .nestedButtons');
                            $(nestedButtons[nestedButtons.length - 1]).prepend(fix);

                            // Show modal
                            $rhea.showModalDialogElement(gridModal);

                            // Prepare modal after it's visible so calculateColumnWidths can work properly
                            $rhea.prepareNewContent(gridModal);

                            gridModal.find('.modal-body button').not('ul.amc-selected-choices li button').not('button[data-zbcl]').bind('click.zeus-modal-btn', handleModal);
                        };

                        var handleModal = function (event) {
                            // Prevent main form from submitting
                            // TODO: Commented this line out, as the form.submit() never gets triggered where this variable is utilised. DEFECT 8763: instead it prevents the 'proper' form submit when user clicks on 'submit' button.
                            //$.zeusValidate.preventDefaultOnNextFormSubmit = true;

                            event.preventDefault();

                            var button = $(this);

                            if (button.hasClass('cancel') && (button.attr(fullDataTypes.SkipValidation) == undefined || button.attr(fullDataTypes.SkipValidation) == "false")) {
                                $rhea.dismissModalDialogElement(gridModal);
                                //$('.modal').modal('hide');
                                return;
                            }

                            if (gridModal.hasClass('modal-loading')) {
                                // Ignore click when already loading
                                return;
                            }

                            gridModal.addClass('modal-loading');

                            var pT = grid.data(dataTypes.ParentType);
                            var pN = grid.data(dataTypes.PropertyNameInParent);
                            var fN = grid.data(dataTypes.FullPropertyNameInParent);

                            var spinnerModal = $('<div class="modal-loader"><span class="spinner-small"></span></div>');

                            gridModalBody = gridModal.find('.modal-body');
                            gridModalBody.prepend(spinnerModal);

                            var group = $('#ContainerFor-' + grid.attr('id').replace(/Table$/, ''));

                            // Check for deep nested view model
                            // Find out all parent types and property name in parent values
                            var closestContainer = group.parent().closest('.iscontainer');

                            while (closestContainer.length) {
                                pT = closestContainer.data(dataTypes.ParentType) + ',' + pT;
                                pN = closestContainer.data(dataTypes.PropertyNameInParent) + ',' + pN;

                                closestContainer = closestContainer.parent().closest('.iscontainer');
                            }

                            var headers = {};
                            headers[headerTypes.AjaxForm] = true; // Indicate we want the <form> tag to come back
                            headers[headerTypes.ParentType] = pT;
                            headers[headerTypes.PropertyNameInParent] = pN;
                            headers[headerTypes.FullPropertyNameInParent] = fN;
                            headers[headerTypes.RowNumber] = row;

                            var ajaxOptions = {
                                url: url,
                                type: 'POST',
                                cache: false,
                                global: false,
                                headers: headers,
                            };
                            var gridForm = gridModal.find('form');
                            // Handle Rich Text Box
                            $.zeusValidate.updateCkeditorInstances(gridForm);
                            var dataToPost;
                            if (gridForm.find('input[type="file"]').length == 0) { // use regular query string
                                dataToPost = $rhea.serializeform(gridForm) + '&submitType=' + button.attr('value');
                            }
                            else { // Use multipart form
                                $.extend(ajaxOptions, {
                                    processData: false,
                                    contentType: false,
                                });
                                dataToPost = new FormData();
                                // add each input one by one to the data to send
                                gridForm.find('input,select,textarea').each(function () {
                                    var current = $(this);
                                    var currentName = current.attr('name');
                                    if (currentName) {
                                        currentName = currentName.replace(/.*\./, '');
                                    if (current.attr('type') == 'file') {
                                        dataToPost.append(currentName, current[0].files[0]);
                                    }
                                    else {
                                            dataToPost.append(currentName, $.zeusValidate.getValueFromInput(current));
                                        }
                                    }
                                });
                                dataToPost.append('submitType', button.attr('value'));
                            }

                            // Add the data to send
                            $.extend(ajaxOptions, { data: dataToPost });

                            // Launch the request
                            $.ajax(ajaxOptions).done(function (data, textStatus, request) {
                                if ($.zeusValidate.sessionExpired(request)) {
                                    return;
                                }

                                spinnerModal.remove();
                                gridModal.removeClass('modal-loading');

                                var refresh = false;
                                var selfForAjax = false;
                                var type = link.data(dataTypes.AjaxGridModal);

                                if (type == ModalType.DeleteRefresh) {
                                    refresh = true;
                                    type = ModalType.Delete;
                                } else if (type == ModalType.EditRefresh) {
                                    refresh = true;
                                    type = ModalType.Edit;
                                } else if (type == ModalType.AddRefresh) {
                                    refresh = true;
                                    type = ModalType.Add;
                                } else if (type == ModalType.DeleteSelfForAjax) {
                                    selfForAjax = true;
                                    type = ModalType.Delete;
                                } else if (type == ModalType.EditSelfForAjax) {
                                    selfForAjax = true;
                                    type = ModalType.Edit;
                                } else if (type == ModalType.AddSelfForAjax) {
                                    selfForAjax = true;
                                    type = ModalType.Add;
                                }

                                if (type == ModalType.Delete) {
                                    var newContent = $(data);
                                    var tr = link.closest('tr')[0];

                                    if ((newContent.length == 0) || newContent.data(dataTypes.AjaxGridRow)) {
                                    // Is ajax grid row returned, do an update
                                    if (newContent.data(dataTypes.AjaxGridRow)) {
                                        $(tr).html(newContent[0].innerHTML);
                                        $.zeusValidate.skipNextFocusErrors = true;
                                        $rhea.prepareNewContent(tr);
                                    }
                                        // newContent length will be 0 if row model passed is 'null', in this case we highlight the row and close the modal dialog.
                                    styleDeletedRow(tr);

                                        // Hide modal
                                    $rhea.dismissModalDialogElement(gridModal);
                                    $(tr).attr(fullDataTypes.ActualDeletedRow, 'true'); // we add an attribute that confirms the row was deleted by user.

                                    } else {
                                        // Same view but with errors.
                                        prepareModal(data);
                                        refresh = false;
                                        selfForAjax = false;
                                    }
                                }
                                else if (type == ModalType.Edit)
                                {
                                    var newContent = $(data);
                                    var tr = link.closest('tr')[0];

                                    // Is ajax grid row
                                    if (newContent.data(dataTypes.AjaxGridRow)) {
                                        $(tr).html(newContent[0].innerHTML);
                                        $.zeusValidate.skipNextFocusErrors = true;
                                        $rhea.prepareNewContent(tr);

                                        // UPDATE: All edited rows are highlithed. Query 7941: "After editing a grid row using a modal dialog, the edited row is highlighted.  Is it possible to make this highlight fade away after a few seconds as it is easy to have multiple rows highlighted if you make one change after another".
                                        //// Removing 'success' class from all the edited rows and only highlight the last edited row.
                                        //grid.find('tr:not([' + fullDataTypes.EditedRow + '=true])').each(function(index) {
                                        //    $(this).removeClass('success');
                                        //});
                                        styleEditedRow(tr);

                                        // Hide modal
                                        $rhea.dismissModalDialogElement(gridModal);
                                        //$('.modal').modal('hide');
                                    } else {
                                        // Is same view from GET but with errors
                                        prepareModal(data);
                                        refresh = false;
                                        selfForAjax = false;
                                    }
                                } else if (type == ModalType.Add) {
                                    var newContent = $(data);

                                    // Is ajax grid row
                                    if (newContent.data(dataTypes.AjaxGridRow)) {
                                        var tr = $('<tr>');
                                        grid.append(tr);
                                        tr.html(newContent[0].innerHTML);
                                        $.zeusValidate.skipNextFocusErrors = true;
                                        $rhea.prepareNewContent(tr);

                                        tr.addClass('success');
                                        tr.attr(fullDataTypes.ActualAddedRow, 'true'); // we add an attribute that confirms the row was added by user.
                                        // Hide modal
                                        $rhea.dismissModalDialogElement(gridModal);
                                        //$('.modal').modal('hide');
                                        
                                        // Focus newly added row by first giving it a tabindex for the focus() to work
                                        tr.attr('tabindex', '-1');
                                        tr.focus();

                                    } else {
                                        // Is same view from GET but with errors
                                        prepareModal(data);
                                        refresh = false;
                                        selfForAjax = false;
                                    }
                                }

                                if (refresh) {
                                    window.location.reload();
                                } else if (selfForAjax) {
                                    var container = group.parent().closest('.iscontainer');

                                    if (container.length) {
                                        container.trigger('load.rhea-ajaxloadif');
                                    }
                                }
                            })
                            .fail(function (xhr, status, data) {
                                var errorText = $.zeusValidate.getErrorInAjax(xhr);
                                var panelHeading = $(group.find('.panel-heading .panel-title')[0]);
                                if (panelHeading != undefined) {
                                    var panelId = panelHeading.attr('id');
                                    panelHeading = panelHeading.text();
                                    panelHeading = panelHeading.length ? '<a class="alert-link" href="#' + panelId + '">' + panelHeading + '</a> - ' : panelHeading;
                                } else {
                                    panelHeading = '';
                                }
                                errorText = panelHeading + (errorText != undefined ? errorText : 'Error occurred while loading');
                                if (xhr.responseText.indexOf('Maximum request length exceeded') >= 0) {
                                    errorText = panelHeading + 'Error occurred while loading (maximum request length exceeded)';
                                }
                                $.zeusValidate.addError(errorText);
                                $.zeusValidate.addError(errorText, $('.modal'));
                                spinnerModal.remove();
                                gridModal.removeClass('modal-loading');
                            });
                        };

                        // Initial prepare
                        prepareModal(data);
                    }).fail(function (xhr, status, data) {
                        var errorText = $.zeusValidate.getErrorInAjax(xhr);
                        var panelHeading = $(group.find('.panel-heading .panel-title')[0]);
                        if (panelHeading != undefined) {
                            var panelId = panelHeading.attr('id');
                            panelHeading = panelHeading.text();
                            panelHeading = panelHeading.length ? '<a class="alert-link" href="#' + panelId + '">' + panelHeading + '</a> - ' : panelHeading;
                        } else {
                            panelHeading = '';
                        }
                        errorText = panelHeading + (errorText != undefined ? errorText : 'Error occurred while loading');
                        $.zeusValidate.addError(errorText);
                    });
                });
            });

            root.find('a[' + fullDataTypes.AjaxGridInline + ']').each(function () {
                var link = $(this);

                var grid = $('#' + link.data(dataTypes.AjaxGridInline) + 'Table');

                if (grid == undefined || grid.length == 0) {
                    return;
            }

                link.bind('click.ajaxgridinline', function(e) {
                    e.preventDefault();

                    var serializedData = $rhea.serializeform(grid.find(':input'));

                    var headers = {};
                    headers[headerTypes.Ajax] = true;

                    $.ajax({
                            url: e.target.href,
                        type: 'POST',
                        cache: false,
                            headers: headers,
                            data: serializedData
                    }).done(function(data, textStatus, request) {
                        if ($.zeusValidate.sessionExpired(request)) {
                            return;
                    }

                        var errors = false;
                        $.each(data, function(key, value) {
                            // Ignore non-grid style properties
                            if (key.indexOf('[') == -1) {
                                return;
                        }

                            // Convert name to id
                            var id = $.zeusValidate.replaceAll(key, '.', '_').replace('[', '_').replace(']', '_');

                            // Ensure first letter is uppercase
                            id = id.charAt(0).toUpperCase() + id.slice(1);

                            var input = $('#' + id);

                            if (input.length) {
                                var td = input.closest('td');

                                if (value.length > 0) {
                                    errors = true;

                                    td.addClass('error');
                                } else {
                                    td.removeClass('error');

                                    input.append(value);
                            }
                        }
                    });
                    }).fail(function(xhr, status, data) {
                        $.zeusValidate.addError('Error occurred while loading grid.');
                    });
                });
            });
        },

        gridstyle: function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            // Copy inner span background colour up to containing td
            root.find('td span').each(function (eq) {
                var span = $(this);
                var copyClass = false;
                var td = span.parent();
                var table = td.closest('table');
                if (table.length >= 1) {
                    var headerRows = table.find('thead tr');
                    if (headerRows.length == 2) {
                        //if (eq == 0) {
                        //    console.log('two header rows found -- Outcomes Tracker');
                        //}
                        // Only the Outcome Tracker has two rows in thead, so this means that the current table is 'Outcomes Tracker'.
                        copyClass = true;
                    }
                }
                // Check that span has class attribute
                var classes = span.attr('class') != undefined ? span.attr('class').split(' ') : [];
                if (copyClass)
                {
                    // Ensure that this copy of class only happens for 'Outcomes Tracker'.
                for (var i = 0; i < classes.length; i++) {
                    if (classes[i].indexOf('bg-') == 0) {
                        td.addClass(classes[i]);
                        break;
                    }
                }
                }
            });

            // Apply data-label for table print preview style that renders tables as lists (see PrintCustom.css)
            root.find('tbody tr th, tbody tr td').each(function () {
                var cell = $(this);
                // Get cell's corresponding header display name, with whitespace and linebreaks removed
                var displayName = cell.closest('table').find('thead th').eq(cell.index()).text().replace(/^\s+|\s+$/g, '');
                cell.attr('data-label', displayName);
            });

        },

        expandCollapseAll: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            root.find('.expandCollapseAll').each(function () {
                var anchors = $(this).find('a');
                $(anchors.get(0)).on('click.expandCollapseAll', function () {
                    $(this).closest('.panel-body').find('[' + fullDataTypes.Click + '=collapse] i.fa-plus').trigger('click');
                });
                $(anchors.get(1)).on('click.expandCollapseAll', function () {
                    $(this).closest('.panel-body').find('[' + fullDataTypes.Click + '=collapse] i.fa-minus').trigger('click');
                });
            });
        },

        gridSortable: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            // Foreach grid on the page:
            // Foreach link header tag of this grid bind click event on them.
            // get the source of image to determine if the grid column was sorted previously
            // if so reverse the sort order and update the image
            // otherwise set the sort order to ascending and update the image.
            // sort the grid based on sort order selected in previous steps.
            root.find('table').each(function () {
             
                var currentTable = this;
                
                $(currentTable).sortTable({
                    // add custom functions
                });
                
                $(currentTable).on('beforetablesort', function (event, data) {
                    // block ui //$.blockUI($.zeusValidate.blockUIoptions);
                    $.blockUI($.zeusValidate.blockUIoptions);
                });

                $(currentTable).on('aftertablesort', function (event, data) {
                    // Get <th>'s. CHANGE: [DescriptionKey] attribute now render <th> therefore the way we find <th> needs to change from ' $(this).find('th')' to ' $(this).find('thead th')'.
                    var th_all = $(this).find('thead td, thead th'); // Assumes there is only one <tr> in <thead> We also need to cater for <td> in <tr> as the 'Select All' checkbox in multiple selection grids is no longer <th>.

                    // check for multiple <tr> in <thead> (normally there's just 1 but at most there can be 2 which is for the outcome tracker)
                    var theadTR_all = $(this).find('thead tr');

                    if (theadTR_all[1] != null) {
                        // Found 2 <tr> in <thead> so get only the <th>'s from the second row
                        th_all = $(theadTR_all[1]).find('td, th');
                    }

                    //  remove class 'arrow' from header columns
                    th_all.find('.arrow').remove();
                    var dir = $.fn.sortTable.dir;

                    var arrow = data.direction === dir.ASC ? '&uarr;' : '&darr;';
                    // add relevant arrow according to sort order to sorted column.
                    th_all.eq(data.column).append('<span class="arrow">' + arrow + '</span>');

                    // set appropriate title to anchor tag and text within span tag.
                    var thSortedAnchor = th_all.eq(data.column).find('a');
                    var readerParagraph = $(currentTable).parent().find('p.readers').first(); // Prev() will not work as the textbox for filter is in place.
                    var readerText = (thSortedAnchor != undefined ? 'Column ' + thSortedAnchor.text()  + ' ': '') + "sorted ";
                    readerText += data.direction === dir.ASC ? "ascending" : "descending";
                    readerText += ". Select column heading to change sort order.";

                    // set reader text of span tag.
                    // DEFECT: Instead of updating the column headings with order we update the 'span readers' that resides outside of the table.
                    readerParagraph[0].innerText = readerText;

                    //thSortedAnchor.blur();
                    //thSortedAnchor.focus();

                    // Re-run responsive tables so it behaves correctly
                    $(currentTable).trigger('resize', [true, true]);

                    // unblock ui
                    $.unblockUI();
                });
            });
        },

        filterGrid: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('.table-responsive table:not([' + fullDataTypes.GridFilterStatus + '=false])').each(function () { // alternative is to use custom selector that ignore case--> :not(:caseInsensitive(' + fullDataTypes.GridFilterStatus + ',true))
                var table = $(this);
                var gridPropertyName = table.attr(fullDataTypes.PropertyNameInParent);
                var tableContainer = table.closest('.table-responsive');
                if (table.find('tbody tr').length) { // only apply on tables that contain rows in tbody.
                    var serverSideFilter = table.attr(fullDataTypes.GridFilterStatus) != 'true'; // for server side filtering, attribute will contain the url
                    var filterAction = '', filterActionParams = {}, headers = {};
                    if (serverSideFilter) {
                        var initialMetadata = undefined;
                        filterAction = table.attr(fullDataTypes.GridFilterStatus);
                        // Check if it is a pageable grid, if so provide metadata
                        var loadMoreLink = tableContainer.find('.rhea-paged');
                        if (loadMoreLink.length == 1) {
                            initialMetadata = $('#' + loadMoreLink.data(dataTypes.PagedMetadataPropertyId)).val();
                            filterActionParams.metadata = initialMetadata;                            
                        } else {
                            initialMetadata = table.find('tbody').data(dataTypes.PagedMetadata);
                            if (initialMetadata == undefined && gridPropertyName != undefined) {
                                initialMetadata = tableContainer.find('input#' + gridPropertyName + '_Metadata').val();
                            }
                        }
                        if (initialMetadata) {
                            filterActionParams.metadata = initialMetadata;
                            // Setup header to include row count
                            headers[headerTypes.RowNumber] = $rhea.getTableRows(table);
                        }
                        headers[headerTypes.GridFilter] = true;
                    }

                    var options = {
                        placeInsideTable: serverSideFilter ? false : false,
                        columnHeadingSelector: 'th[' + fullDataTypes.GridFilterColumn + '=true]',
                        processComplexElements: false,
                        searchForComplexCells: true,
                        filterAction: filterAction,
                        filterActionParameters: filterActionParams,
                        headers: headers,
                        columnNameAttribute: fullDataTypes.PropertyNameInParent,
                        animation: true,
                        labelText: 'Filter results on this table:'
                    };
                    table.filterTable(options);

                    // Bind to filter completed event.
                    table.off($.fn.filterTable.defaultOptions.filterCompletedEvent);
                    table.on($.fn.filterTable.defaultOptions.filterCompletedEvent, function () {
                        if (serverSideFilter) {
                            var filteredRecords = table.find('tbody tr');
                            $rhea.updateTableMetadata(filteredRecords, loadMoreLink, table.find('tbody'));
                        }

                        var isRowVisible = false;
                        var hiddenFilterClass = $.fn.filterTable.defaultOptions.hiddenClass;
                        // Process responsive table rows
                        table.find('tbody tr:not(.hidden)').each(function () {
                            var currentRow = $(this);
                            // if a row is not a responsive-row and has not been filtered out.
                            if (!currentRow.hasClass('responsive-row')) {
                                if (!currentRow.hasClass(hiddenFilterClass)) {
                                    isRowVisible = true;
                                } else {
                                    isRowVisible = false;
                                }
                            }
                            else if (currentRow.hasClass('responsive-row') && currentRow.hasClass(hiddenFilterClass) && isRowVisible) {
                                currentRow.removeClass(hiddenFilterClass);
                            }
                        });
                    });
                }
            });
        },
        
        reset: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var resetID = 0;
            root.find('input[type="reset"]').each(function () {
                var resetButton = $(this);
                
                // Assign ID to reset button for re-focus after reset
                resetButton.data('resetid', resetID++);
                
                resetButton.bind('click.rhea-reset', function (e) {
                    if ($.zeusValidate.initialContentHTML != undefined) {
                        e.preventDefault();
                    
                        // Get reset ID
                        var id = resetButton.data('resetid');
                    
                        // Reload initial content HTML
                        $('#content').html($.zeusValidate.initialContentHTML);
                        
                        $rhea.prepareNewContent($('#content'));

                        $.zeusValidate.skipNextFocusErrors = true;
                        
                        // Hide error messages
                        var container = root.find('[data-valmsg-summary="true"]');
                        var list = container.find('ul');
                        if (list && list.length) {
                            list.empty();
                            container.addClass('validation-summary-valid')
                                .removeClass('validation-summary-errors')
                                .removeClass('alert')
                                .removeClass('alert-danger');
                        }
                        
                        // Hide error indicators
                        $('.parsley-error').removeClass('parsley-error');
                        $('[' + fullDataTypes.ErrorTipFor + ']').hide();
                        
                        // Hide success messages
                        var successList = $('section.msgGood');      //.find('ul');
                        if (successList && successList.length) {
                            successList.empty();
                            successList.remove();
                        }
                        
                        // Hide warning messages
                        var warningList = $('section.msgWarn');      //.find('ul');
                        if (warningList && warningList.length) {
                            warningList.empty();
                            warningList.remove();
                        }
                        
                        // Hide information messages
                        var informationList = $('section.msgInfo');  //.find('ul');
                        if (informationList && informationList.length) {
                            informationList.empty();
                            informationList.remove();
                        }
                         
                        // Re-focus the reset button
                        $('input[type="reset"]').each(function () {
                            if ($(this).data('resetid') == id) {
                                $(this).focus();
                            }
                        });
                    }
                });
            });
        },
        
        // Convert appropriately marked input elements into the set of HTML elements required to render a 'switcher' instead of a checkbox.
        // Also hooks up the event handlers and focus handlers to make the switcher keyboard accessible and generally hide the fact that
        // there is still a hidden checkbox modelling the on-off behaviour.
        switchers: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('input[' + fullDataTypes.Switcher + '="true"]').each(function () {
                var jQueryCheckbox = $(this);
                var checkbox = $(this)[0];
                var label = $('label[for="' + checkbox.id + '"]');
                var hiddenSelectionText = $('<span>').addClass("readers");
                if (label.length) {
                    label.append(hiddenSelectionText);
                }
                var defaultColor = $(checkbox).attr(fullDataTypes.BackgroundColour) != undefined ? $(checkbox).attr(fullDataTypes.BackgroundColour) : 'bg-black';
                var left = $('<span>').addClass("left").addClass(defaultColor).text(jQueryCheckbox.attr(fullDataTypes.SwitcherChecked));
                var right = $('<span>').addClass("right").addClass(defaultColor).text(jQueryCheckbox.attr(fullDataTypes.SwitcherUnchecked));
                var container = $('<div class="switcher" aria-hidden="true">')
                    .append(left)
                    .append(right)
                ;
                var centre = $('<span>').addClass("centre").appendTo(container);

                // Handle changes
                var slideSwitcher = function () {
                    if (checkbox.checked) {
                        hiddenSelectionText.text("value is " + jQueryCheckbox.attr(fullDataTypes.SwitcherChecked) + ", uncheck to select " + jQueryCheckbox.attr(fullDataTypes.SwitcherUnchecked));
                        centre.css('left', '55px');
                        // Right covered
                        left.removeClass('covered');
                        right.addClass('covered');
                    }
                    else {
                        centre.css('left', '5px');
                        hiddenSelectionText.text("value is " + jQueryCheckbox.attr(fullDataTypes.SwitcherUnchecked) + ", check to select " + jQueryCheckbox.attr(fullDataTypes.SwitcherChecked));
                        // Left covered
                        left.addClass('covered');
                        right.removeClass('covered');
                    }
                };
                // Set initial state
                slideSwitcher();

                jQueryCheckbox.on("change", function (event) {
                    slideSwitcher();
                });
                jQueryCheckbox.on("focus", function (event) {
                    container.addClass('switcher-focus');
                });
                jQueryCheckbox.on("blur", function (event) {
                    container.removeClass('switcher-focus');
                });
                container.on("click", function (event) {
                    jQueryCheckbox.click() // Toggle checkbox
                    jQueryCheckbox.focus();
                });
                jQueryCheckbox.after(container);
                jQueryCheckbox.addClass("readers"); // Hide from regular viewers
                // light green, dark green, light red, dark red, grey
                //#b0ebca, #3c763d, #f8b2b2, #a94442, #b6c2c9
                // better red, better green
                // #d9534f, #5cb85c
            });
        },

        // 1. Automatically add a "Check all" check box to every check box list displayed in the page.
        // This is a convenience function only and removing it should not impact the overall function of the page.
        // 2. Add code to prevent selection of more than the allowed limit of checkboxes
        checkboxesadditions: function () {
            $(".check-box-list", this.element).each(function (index) {
                var listParentElement = $(this);
                var checkboxes = listParentElement.find('input[type="checkbox"]');
                if (checkboxes.length == 0) {
                    return;
                }

                var firstCheckbox = $(checkboxes[0]);
                var id = 'CheckAllFor-' + firstCheckbox[0].id;
                var input = $('<input type="checkbox" id="' + id + '">');
                var label = $('<label for="' + id + '">').text('Check all');
                var wrapper = $('<div class="checkbox">').append(input).append(label);
                var listItem = $('<li>').append(wrapper).prependTo(listParentElement);
                
                // Include a pointer back to the 'check all' checkbox from each checkbox
                // (used in editableif and readonlyif for dynamically matching the 'check all' enable state with the checkboxes)
                for (var i = 0; i < checkboxes.length; i++) {
                    $(checkboxes[i]).data('checkallid', id);
                }

                // Make sure initial enable state matches
                if (firstCheckbox.attr('disabled')) {
                    input.attr('disabled', firstCheckbox.attr('disabled'));
                }

                if (firstCheckbox.attr('readonly')) {
                    input.attr('readonly', firstCheckbox.attr('readonly'));
                }

                if (firstCheckbox.attr('disabled') || firstCheckbox.attr('readonly')) {
                    listItem.addClass('hidden');
                }

                // Add check/uncheck all event
                input.bind("change.rhea-checkall", function (event) {
                    var checkboxes = listItem.siblings().find('input[type="checkbox"]');
                    $(this).attr('checked') ? checkboxes.attr('checked', $(this).attr('checked')) : checkboxes.removeAttr('checked');
                    checkboxes.trigger('change');
                });

                var checkLimit = listParentElement.attr(fullDataTypes.MaximumSelections);
                if (checkLimit != undefined) {

                    function isChecked() {
                        return this.checked;
                    }
                    function isNotChecked() {
                        return !this.checked;
                    }
                    function isAlwaysReadOnly() {
                        return /^true$/i.test($(this).data(dataTypes.AlwaysReadOnly));
                    }

                    function setEnabledState(changedCheckbox) {

                        // Only include check all boxes on lists without limits.
                        listItem.hide();

                        // Don't apply this to checkbox lists that are always readonly via [ReadOnly(true)] or [Editable(false)]
                        // or to individual checkboxes that must remain unchanged
                        if (/^true$/i.test(listParentElement.data(dataTypes.AlwaysReadOnly))
                            || (changedCheckbox != undefined && /^true$/i.test(changedCheckbox.data(dataTypes.AlwaysReadOnly)))) {
                            return;
                        }

                        // Need to be careful applying this to checkbox lists that are conditionally readonly/editable via [ReadOnlyIf] and [EditableIf],
                        // which we can tell by whether the 'checkall' option is visible or not
                        //if ($('#' + id).closest('li').hasClass('hidden')) {
                        if (listItem.hasClass('hidden')) {
                            return;
                        }

                        // Ensure those that are always readonly are setup that way
                        var alwaysReadOnly = checkboxes.filter(isAlwaysReadOnly);
                        alwaysReadOnly.each(function () {
                            $(this).attr('disabled', 'disabled');
                        });

                        var checkedOnes = checkboxes.filter(isChecked);
                        var notCheckedOnes = checkboxes.filter(isNotChecked);
                        var checkCount = checkedOnes.length;
                        if (checkCount >= checkLimit) {
                            notCheckedOnes.data('limit', true);
                            notCheckedOnes.attr('disabled', 'disabled');
                        }
                        else {
                            notCheckedOnes.data('limit', false);
                            notCheckedOnes.removeAttr('disabled');
                        }
                    }
                    setEnabledState();
                    checkboxes.on("change.selectionlimit", function () {
                        setEnabledState($(this));
                    });
                }
            });
        },

        // Use FLOT javascript libraries to render up appropriately annotated tables
        flotGraphs: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            function kludgePlotGraph(graph, dataModel, options) {
                // Initialise the graph - using a kludge to render it offscreen as flot demands that the graph area be visible,
                // or else it will die claiming it can't render to a graph of height 0.
                var tabPane = graph.parent();
                var hasActive = tabPane.hasClass('active');
                tabPane.css("left", "-100000px").css("display", "block");
                if (!hasActive) tabPane.addClass("active");
                var plot = $.plot(graph, dataModel, options);
                if (!hasActive) tabPane.removeClass("active");
                tabPane.css("display", '').css("left", ''); // Removes inline styles, so those styles revert to their class based values
            }

            root.find(".zeus-graph-table", $rhea.element).each(function () {
                var table = $(this);

                // Data refresh organising section
                var topLevelButtons = $('[' + fullDataTypes.GraphTopLevelUrl + ']', $rhea.element);
                topLevelButtons.off(".zeus-graph-refresh");
                topLevelButtons.on("click.zeus-graph-refresh", function (event) {
                    event.preventDefault();
                    var contentContainer = $(this).closest('div').parent();
                    var uri = $(this).attr(fullDataTypes.GraphTopLevelUrl);
                    var panel = $(this).closest('.panel');
                    var graphType = panel.find('[' + fullDataTypes.GraphType + ']').attr(fullDataTypes.GraphType);
                    var dataSetEnabled = contentContainer.find('[' + fullDataTypes.GraphDataSetEnabled + ']').attr(fullDataTypes.GraphDataSetEnabled);
                    var headers = {};
                    headers[headerTypes.DataSetEnabled] = dataSetEnabled;
                    $rhea.getNewContentForPanel(panel, contentContainer, uri, JSON.stringify({ graphType: graphType }), headers);
                });

                // Table drill down
                table.find('.zeus-graph-drill-down').on('click', function (event) {
                    var link = $(this);
                    if (link.parent().index() > 0) {    //dataset table
                        var dataObject = {
                            label: link.closest('table').find('thead').find('th')[link.parent().index()].innerText,
                            dataPoint: link.closest('th').siblings('td').first().text(),
                            graphType: table.attr(fullDataTypes.GraphType),
                            yLabel: link.closest('tr').find('th').text()
                        }
                    }
                    else {
                        var dataObject = {
                            label: link.text(),
                                dataPoint: link.closest('th').siblings('td').first().text(),
                                graphType: table.attr(fullDataTypes.GraphType),
                            yLabel: link.text()
                        }
                    }
                    drillDownUsing(table, dataObject, event.ctrlKey);
                });

                function drillDownUsing(beginPoint, dataObject, ctrlPressed) {
                    var contentContainer = beginPoint.closest('.tab-content').parent();
                    var drillDownUri = contentContainer.find('[' + fullDataTypes.GraphDrillDownUrl + ']').attr(fullDataTypes.GraphDrillDownUrl);
                    if (drillDownUri.length > 0) {
                        var drillDownNewPage = contentContainer.find('[' + fullDataTypes.GraphDrillDownNewPage + ']').length > 0;
                        if (drillDownNewPage) { 
                            postDrillDownNewPage(drillDownUri, dataObject, ctrlPressed);
                        } else {
                            var panel = contentContainer.closest(".panel");
                            var dataSetEnabled = contentContainer.find('[' + fullDataTypes.GraphDataSetEnabled + ']').attr(fullDataTypes.GraphDataSetEnabled);
                            var headers = {};
                            headers[headerTypes.DataSetEnabled] = dataSetEnabled;

                            // This graph as a whole is not set to drill down to a new page
                            // but now we'll check if the clicked element of the graph needs to drill down to a new page
                            var elementAnchorClicked = contentContainer.find('.zeus-graph-drill-down:contains("' + dataObject.label + '")');
                            // Get the URL specified at element (if any).
                            var drillDownUriForElement = elementAnchorClicked.attr(fullDataTypes.GraphDrillDownElementUrl);
                            if (drillDownUriForElement) {
                                // Check if the element click is supposed to 'open page' or 'drill down'.
                                var drillDownElementNewPage = elementAnchorClicked.attr(fullDataTypes.GraphDrillDownElementNewPage);
                                if (drillDownElementNewPage && drillDownElementNewPage.toLowerCase() == "true") {
                                    postDrillDownNewPage(drillDownUriForElement, dataObject, ctrlPressed);
                                } else { // element is supposed to drill down.
                                    $rhea.getNewContentForPanel(panel, contentContainer, drillDownUriForElement, JSON.stringify(dataObject), headers);
                                }
                            } else { // if Url is not specified at element level, we use the global url.
                                $rhea.getNewContentForPanel(panel, contentContainer, drillDownUri, JSON.stringify(dataObject), headers);
                            }
                        }
                    }
                }

                // Responsible for doing redirect to action specified.
                function postDrillDownNewPage(uri, dataObject, ctrlPressed) {
                    var form = $('<form>').attr('method', 'post').attr('action', uri);
                    if (ctrlPressed) {
                        form.attr('target', '_blank');
                    }
                    for (var key in dataObject) {
                        $('<input>').attr('type', 'hidden').attr('name', key).attr('value', dataObject[key]).appendTo(form);
                    }
                    $(document.body).append(form);
                    $.zeusValidate.ignoreDirty = true;
                    form.submit();
                }


                //// Graph type switching behaviour
                //table.parent().parent().siblings().find('[' + fullDataTypes.Click + '="bar"], [' + fullDataTypes.Click + '="pie"], [' + fullDataTypes.Click + '="percentbar"]').off('.zeus-change-graph-type').on('click.zeus-change-graph-type', function () {
                //    var graph = table.parent().siblings().find('div[' + fullDataTypes.GraphType + ']').attr(fullDataTypes.GraphType, $(this).attr(fullDataTypes.Click));
                //    renderGraph(graph, 0);
                //});

                // Graph rendering part
                var graphsToRender = table.parent().siblings().find('div[' + fullDataTypes.GraphType + ']');
                function renderGraph(graph, pieindex) {
                    graph.parent().find(".zeus-graph-choice-container").remove(); // Clear the checkbox choices if we are re-rendering this graph
                    var tipFormatter;
                    var postDataCreator;
                    var dataModel = [];
                    var graphType = graph.attr(fullDataTypes.GraphType);
                    var options = { // Common options for all graphs - they will be added to later by the specific graph type handling sections
                        grid: {
                            clickable: true,
                            hoverable: true,
                        },
                    };
                    var graphColours = graph.attr("data-colours");
                    if (graphColours) {
                        $.extend(options, {
                            colors: graphColours.split(','),
                        })
                    }
                    else { // Use theme based colours
                        var colourScheme = $.zeusValidate.readCookie('ColourScheme');
                        if (colourScheme == 'black') {
                            $.extend(options, { colors: ['#007c7c', '#af6500', '#654a98', '#9e0505', '#0f5eaa', '#3956cf', '#9c5e14', '#1d823c', '#6b2b68'] });
                        }
                        else if (colourScheme == 'white') {
                            $.extend(options, { colors: ['#0a8387', '#a3674b', '#676197', '#bf4f51', '#3862a0', '#007db6', '#20476c', '#3f8241', '#58427c'] });
                        }
                        else if (colourScheme == 'dark') {
                            $.extend(options, { colors: ['#8fc89a', '#f8b88d', '#9285be', '#e58887', '#6eb1e1', '#44b6cb', '#e8e898', '#b7d167', '#be7c9f'] });
                        }
                        else { // Default
                            $.extend(options, { colors: ['#00acac', '#ff6c2c', '#727cb6', '#ff5b57', '#348fe2', '#49b6d6', '#f59c1a', '#8bbe41', '#aa64a9'] });
                        }
                    }
//                    $.extend(options, {
// 60%                        colors: ['#7FB786', '#7BA8C5', '#D99974', '#C2749E', '#66B3B3', '#A77AA9', '#C27574', '#857EA8'],
// 100%                       colors: ['#2a8735', '#226f9f', '#c05417', '#9a175e', '#008081', '#6c2170', '#991917', '#33286e'],
// 80%                        colors: ['#559f53', '#4e8cb2', '#cd7746', '#ae457e', '#339a9a', '#894d8d', '#ad4745', '#5c538b'],
//                    })


                    // Choice container for graphs that allow toggling of data sets
                    var choiceContainer = $('<div class="zeus-graph-choice-container" style="margin: 0 auto">'); // This will be appended only if necessary
                    // Function to create a checkbox for  data series selection. Called below if needed, once for each data series in the dataModel
                    function createCheckboxFor(colNum, labelText) {

                        if (/^true$/i .test(graph.data(dataTypes.GraphCheckboxesHidden))) {
                            return;
                        }

                        var choiceId = graph.attr('id') + '-choice-' + colNum;
                        var checkbox = $('<input type="checkbox" checked="checked" id="' + choiceId + '" ' + fullDataTypes.IgnoreDirtyCheck + '="true">');
                        checkbox.on("change.zeus-graph-choice", function (event) {
                            var chosenDataSets = [];
                            choiceContainer.find("input").each(function (index) {
                                if (this.checked) {
                                    chosenDataSets.push(dataModel[index]);
                                }
                            });
                            $.plot(graph, chosenDataSets, options);
                        });
                        choiceContainer.append(checkbox);
                        choiceContainer.append($('<label for="' + choiceId + '">').text(labelText));
                    }


                    // PIES -------------------------------------------------------------------------
                    if (graphType == "pie") {
                        // Generate the data
                        table.find('tr').each(function (rowNum) {
                            var key = $(this).find('th').text();
                            if (key == '' && rowNum == 0) { return; } // Skip the header row for multi pies
                            var value = parseFloat($(this).find('td').eq(pieindex).text());
                            dataModel.push({
                                label: key,
                                data: value,
                            });
                        })

                        // Define pie options
                        $.extend(options, {
                            series: {
                                pie: {
                                    show: true,
                                    innerRadius: 0.0,
                                    label: {
                                        show: false,
                                        //formatter: function (seriesName, series, a, b) {
                                        //    return '<div data-rhea-series-index="'+(index++)+'"style="display: none; font-size:x-small;text-align:center;padding:2px;color:0;border: thick solid '+series.color+'; border-radius=5px;">'
                                        //        + seriesName + ': ' + series.data[0][1]
                                        //        + '</div>';
                                        //}
                                    }
                                }
                            },
                            legend: {
                                show: true,
                                position: "nw"
                            },
                            yaxis: {
                                transform: function (v) { return -v; },
                                inverseTransform: function (v) { return -v; }
                            }
                        });


                        // Initialise the graph
                        kludgePlotGraph(graph, dataModel, options);

                        tipFormatter = function (tip, item) {
                            tip.text(item.series.label + ': ' + item.series.data[item.dataIndex][1].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
                        };
                        postDataCreator = function (item) {
                            return JSON.stringify({
                                label: item.series.label,
                                dataPoint: item.datapoint[1][0][1],
                                graphType: graphType,
                            })
                        }
                    }
                        // BARS -----------------------------------------------------------------------
                    else if (graphType == "bar" || graphType == "percentbar") {
                        // Generate the data
                        var tickModel = [];
                        var counter = 0;
                        var numColumns = table.find('tr').last().find('td').length; // This is the length of one row only, but since the tables are all rectangular, this should be okay.
                        if (numColumns > 1) { // Multi bars
                            choiceContainer.appendTo(graph.parent());
                            var columns = table.find('tr').first().find('th');
                            columns.each(function (colNum) {
                                if (colNum == 0) { return; } // Skip the first empty cell
                                createCheckboxFor(colNum, $(this).text());

                                // The actual data model
                                var toPush = {
                                    label: $(this).text(),
                                    data: [],
                                    color: colNum,
                                };
                                if (graphType != "percentbar") {
                                    $.extend(toPush, {
                                        bars: {
                                            order: -colNum,
                                        },
                                    })
                                }
                                dataModel.push(toPush);
                            });
                            table.find('tr').each(function (rowNum) {
                                if (rowNum == 0) { return; } // Skip the first row (as this has headers only)
                                var key = $(this).find('th').text();
                                $(this).find('td').each(function (colNum) {
                                    var value = parseFloat($(this).text());
                                    dataModel[colNum].data.push([value, counter]);
                                });
                                tickModel.push([counter, key]);
                                ++counter;
                            });
                        }
                        else { // Single bars
                            table.find('tr').each(function (rowNum) {
                                var key = $(this).find('th').text();
                                var value = parseFloat($(this).find('td').text());
                                dataModel.push({
                                    label: key,
                                    data: [[value, counter]],
                                });
                                tickModel.push([counter, key]);
                                ++counter;
                            })
                        }

                        // Define bar options
                        var barWidth = (graphType == "percentbar") ? 0.5 : 0.5 / numColumns;
                        $.extend(options, {
                            series: {
                                stackpercent: (graphType == "percentbar"),
                                bars: {
                                    show: true,
                                    barWidth: barWidth,
                                    align: "center",
                                    horizontal: true,
                                    fill: true,
                                    fillColor: { colors: [{ opacity: 1 }, { opacity: 1 }, { opacity: 0 }] }
                                }
                            },
                            legend: {
                                show: (numColumns > 1 && graphType != "percentbar") ? true : false,
                            },
                            yaxis: {
                                ticks: tickModel,
                                transform: function (v) { return -v; },
                                inverseTransform: function (v) { return -v; }
                            },
                        });

                        // Initialise the graph
                        kludgePlotGraph(graph, dataModel, options);

                        tipFormatter = function (tip, item) {
                            tip.text(item.series.label + ': ' + item.series.data[item.dataIndex][0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
                        };
                        postDataCreator = function (item) {
                            return JSON.stringify({
                                label: item.series.label,
                                dataPoint: item.datapoint[0],
                                graphType: graphType,
                                ylabel: item.series.yaxis.ticks[item.dataIndex].label, // Only valid on multi bar charts. For multi bar charts, 'label' will contain the series name, and 'ylabel' will contain the ylabel "category" name
                            })
                        }
                    }
                        // LINES --------------------------------------------------------------------
                    else if (graphType == 'line' || graphType == 'time') {
                        // Generate the data
                        var counter = 0;
                        var numColumns = table.find('tr').last().find('td').length; // This is the length of one row only, but since the tables are all rectangular, this should be okay.
                        if (numColumns == 1) {
                            dataModel.push({
                                label: 'Chart',
                                data: [],
                            });
                        }
                        else {
                            choiceContainer.appendTo(graph.parent());
                            table.find('tr').first().find('th').each(function (colNum) {
                                if (colNum == 0) { return; } // Skip the first empty cell
                                createCheckboxFor(colNum, $(this).text());

                                // The actual data series objects
                                dataModel.push({
                                    label: $(this).text(),
                                    data: [],
                                    color: colNum,
                                });
                            });
                        }

                        // Populate the dataModel with data
                        table.find('tr').each(function (rowNum) {
                            if (rowNum == 0 && numColumns > 1) { return; } // Skip the header line
                            var xval = parseFloat($(this).find('th').text());
                            $(this).find('td').each(function (colNum) {
                                var yval = parseFloat($(this).text());
                                dataModel[colNum].data.push([xval, yval]);
                            });
                        });

                        // Define line options
                        $.extend(options, {
                            series: {
                                lines: {
                                    show: true,
                                    fill: (numColumns > 1) ? false : true,
                                    fillColor: { colors: [{ opacity: 0 }, { opacity: 1 }] }
                                },
                                points: {
                                    show: true,
                                },
                            },
                            legend: {
                                show: (numColumns > 1) ? true : false,
                            },
                            xaxis: {
                                mode: graphType == "time" ? 'time' : '',
                                timeformat: graphType == "time" ? '%H %M' : ''
                            }
                        });

                        // Initialise the graph
                        kludgePlotGraph(graph, dataModel, options);

                        tipFormatter = function (tip, item) {
                            pad = "00";
                            hour = new Date(item.series.data[item.dataIndex][0]).getUTCHours();
                            minute = new Date(item.series.data[item.dataIndex][0]).getUTCMinutes();
                            graphType == "time" ?
                                tip.text((numColumns > 1 ? item.series.label + ': ' : '')
                                    + pad.substring(0, pad.length - hour.toString().length) + hour
                                    + ':'
                                    + pad.substring(0, pad.length - minute.toString().length) + minute
                                    + '  ,  ' + item.series.data[item.dataIndex][1]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                                :
                            tip.text((numColumns > 1 ? item.series.label + ': ' : '')
                                + item.series.data[item.dataIndex][0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                                + '  ,  ' + item.series.data[item.dataIndex][1]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                        };
                        postDataCreator = function (item) {
                            return JSON.stringify({
                                label: item.series.label,
                                dataPoint: item.datapoint,
                                graphType: graphType,
                            })
                        }
                    }
                        // ---- DATES -----------------------------------------------------------------------
                    else if (graphType == "date") {
                        // Generate the data
                        var tickModel = [];
                        var counter = 0;
                        var rows = table.find('tr');
                        var yardstick = (parseInt(graph.css('min-height')) - 30) / (rows.length - 1);
                        dataModel = {
                            extents: {
                                show: true,
                                barVAlign: "bottom",
                                rows: rows.length - 1,
                                rowHeight: yardstick,
                                barHeight: yardstick / 2,
                                color: "#484b63",
                                fillColor: "#8e96c5",
                                labelHAlign: "right",
                            },
                            data: [],
                            extentdata: []
                        };
                        var minDate = Number.MAX_VALUE;
                        var maxDate = Number.MIN_VALUE;
                        rows.each(function (rowNum) {
                            if (rowNum == 0) { return; } // Skip the first row (as this has headers only)
                            var key = $(this).find('th').text();
                            var startNode = $(this).find('td').first();
                            var endNode = $(this).find('td').last()
                            var startValue = parseFloat(startNode.text());
                            var endValue = parseFloat(endNode.text());
                            startNode.text(new Date(startValue).toDateString());
                            endNode.text(new Date(endValue).toDateString());
                            dataModel['extentdata'].push({
                                label: key,
                                start: startValue,
                                end: endValue,
                                row: counter++
                            });
                            if (startValue < minDate) {
                                minDate = startValue;
                            }
                            if (endValue > maxDate) {
                                maxDate = endValue;
                            }
                        });

                        // Add 12.5% margin to end of graph
                        var tenPerc = (maxDate - minDate) / 8;
                        maxDate += tenPerc;

                        // Define bar options
                        $.extend(options, {
                            legend: {
                                show: false,
                            },
                            yaxis: {
                                ticks: []
                            },
                            xaxis: {
                                min: minDate,
                                max: maxDate,
                                mode: "time",
                                timeformat: '%d %b %y'
                            }
                        });

                        // Initialise the graph
                        $.plot(graph, [dataModel, {}], options);

                        // Fix label position and style. Can't do this in CSS unfortunately as the plugin applies styles directly to extents.
                        function adjustLabels() {
                            graph.find('.extentLabel').each(function () {
                                var exLabel = $(this);
                                exLabel.css('font-size', (yardstick / 4) + 'px');
                                exLabel.css({
                                    color: 'black',
                                    bottom: exLabel.parent().height() - (exLabel.position().top + exLabel.height()) + ((yardstick / 2 - exLabel.height()) / 2),
                                });
                            });
                        };
                        adjustLabels();

                        // Damn thing replots everything on resize, so we have to recall this. Also we must wait for the underlying resize to complete, hence the timeout
                        graph.on("resize", function () {
                            window.setTimeout(function () {
                                adjustLabels();
                            }, 10);
                        });

                        // No hover or drill down possible on date graphs due to plugin usage.

                    }

                    // Initialise the hover text
                    var tip = graph.siblings('.zeus-graph-tooltip');
                    var hovered = false;
                    graph.on("plothover.flotgraphs", function (event, pos, item) {
                        if (item) {
                            tipFormatter(tip, item);
                            tip.css("border-color", item.series.color);
                            tip.css("display", "block");
                            tip.css("top", pos.pageY - window.pageYOffset);
                            if (tip.width() + 20 > $(document).width() - pos.pageX) { // Check to see if the tip will go off the screen
                                tip.css("left", pos.pageX - window.pageXOffset - 20 - tip.width());
                            }
                            else {
                                tip.css("left", pos.pageX - window.pageXOffset + 20);
                            }
                            hovered = true;
                        }
                    });
                    graph.on("mousemove.flotgraphs", function (event) {
                        if (!hovered) {
                            tip.css("display", "none");
                        }
                        hovered = false;
                    });
                    graph.on("mouseout.flotgraphs", function (event) {
                        tip.css("display", "none");
                    });

                    // Initialise "Drill down" capability. uses deferred's because we need to capture CTRL state and this isn't present in the plotclick event.
                    // So we capture that during the regular click.
                    var myGraphDeferredClick = undefined;
                    graph.on("click.flotgraphs", function (event) {
                        if (myGraphDeferredClick == undefined) {
                            myGraphDeferredClick = $.Deferred();
                        }
                        myGraphDeferredClick.resolveWith(undefined, [event.ctrlKey]);
                    });
                    graph.on("plotclick.flotgraphs", function (event, pos, item) {
                        if (myGraphDeferredClick == undefined) {
                            myGraphDeferredClick = $.Deferred();
                        }
                        myGraphDeferredClick.done(function (ctrlPressed) {
                            if (item) {
                                drillDownUsing(graph, JSON.parse(postDataCreator(item)), ctrlPressed);
                            }
                            myGraphDeferredClick = undefined;
                        });
                    });

                }
                var piecounter = 0;
                graphsToRender.each(function (index) {
                    renderGraph($(this), piecounter);
                    if ($(this).attr(fullDataTypes.GraphType) == 'pie') ++piecounter;
                });
            });

            // Local storage for graph choices
            root.find(".zeus-graph-select-button").each(function () {
                var panelTitle = $(this).closest('.panel').find('.panel-title').first();
                var key = "graph-choice-" + (panelTitle.length ? panelTitle.text() : "unknown");
                var text = $(this).text();
                $(this).on("click", function () {
                    localStorage[key] = text;
                    var liParent = $(this).closest('li');
                    liParent.siblings().add(liParent).each(function() { $(this).find('a .sr-only').remove(); });
                    $(this).append($("<span class='sr-only'>selected</span>"));
                });
                if (localStorage[key] == text) {
                    //$(this).trigger("click"); // Can't use click as the effects are too slow and can be seen by the user. Just set the classes directly
                    var li = $(this).closest('li');
                    li.siblings().removeClass('active');
                    li.addClass('active');
                    var pane = $($(this).prev().attr('href'));
                    pane.siblings().removeClass('in').removeClass('active');
                    pane.addClass('in').addClass('active');
                }
            });
        },

        monitorBulletins: function () {
            var $rhea = this;
            var routeData = $('#zeus-ajax-routes').data(dataTypes.AjaxRoutes);

            // Don't attempt Ajax call if the route data doesn't have the URL
            // (this should only be the case when monitoring is disabled)
            if (routeData.LogBulletin == undefined) {
                return;
            }

            // Monitor clicks on links within bulletin content
            $('#ContainerFor-BulletinDetails').find('a').each(function () {
                var link = $(this);
                
                link.on('click', function (e) {

                    if(link.data('logged') != undefined) {
                        return;
                    }

                    // On first click, prevent default link navigation so we can make our Ajax call
                    e.preventDefault();

                    // Mark link lick as having been logged
                    link.data('logged', true);

                    // Bulletin ID and the URL of the link that was clicked
                    var id = $('#BulletinDetails_BulletinID').val();
                    var url = link.attr('href');

                    var headers = {};
                    headers[headerTypes.Ajax] = true;

                    $.ajax({
                        url: routeData.LogBulletin, //'/Ajax/LogBulletinLink',
                        global: false,
                        type: 'GET',
                        dataType: 'html',
                        data: { id: id, url: url },
                        headers: headers,
                    }).always(function () {
                        if ((link.attr('target') != undefined && link.attr('target') == '_blank')) {
                            window.open(url);
                        } else {
                            window.location.href = url;
                        }
                        
                    });
                });
            });
        },

        widgets: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            var saveLayoutHandle;

            var routeData = $('#zeus-ajax-routes').data(dataTypes.AjaxRoutes);
            
            // Layout updating functions
            function saveLayout(container) {
                // Update user preferences silently in the background, with a cascade of 3 seconds to prevent it being too chatty
                clearTimeout(saveLayoutHandle);
                saveLayoutHandle = setTimeout(function () {
                var widgets = container.find(".panel-title").not(':hidden');
                var widgetNames = widgets.map(function (index, element) {
                    return $(element).text();
                });
                var newLayout = widgetNames.toArray().join();
                
                var headers = {};
                headers[headerTypes.Ajax] = true;

                $.ajax({
                    url: routeData.SetWidgetLayout, //'/Ajax/SetWidgetLayout',
                    global: false,
                    type: 'POST',
                    data: JSON.stringify({
                        widgetLayout: newLayout,
                        widgetContext: container.attr(fullDataTypes.WidgetContext),
                            viewName: container.attr(fullDataTypes.WidgetView),
                    }),
                    headers: headers,
                    contentType: 'application/json; charset=utf-8',
                });
                }, 3000);
            }

            // Adding new widgets event handler
            function addNewWidget(event) {
                var button = $(this);

                var headers = {};
                headers[headerTypes.Ajax] = true;

                var ajaxOptions = {
                    url: routeData.AddWidget, //'/Ajax/AddWidget',
                    type: 'POST',
                    data: JSON.stringify({
                        widgetName: button.find('td').last().text(),
                        widgetContext: button.closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                        viewName: button.closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                    }),
                    headers: headers,
                    contentType: 'application/json; charset=utf-8',
                    success: function (data) {
                        var toomanywidgets = /^Too many widgets: (\d+)$/.exec(data);
                        if (toomanywidgets != null) { // too many widgets
                            $.zeusValidate.addError('Dashboard has too many widgets loaded. You cannot load more than ' + toomanywidgets[1] + ' widgets at once.');
                        }
                        else { /// ok, add the widget
                            var container = root.find('.zeus-widget-container').first();
                            if (container.length == 0) container = $('.zeus-widget-container').first();
                            var newContent = $(data);
                            container.append(newContent);
                            $rhea.prepareNewContent(newContent);
                            button.parent().remove(); // Removes the button and the surrounding list item element

                            // Load content for the first time
                            newContent.find('[' + fullDataTypes.Click + '=reload]').trigger("click");
                            var panelHeading = newContent.find('.panel-heading');
                            var heading = panelHeading.find('.panel-title');
                            if (heading.attr('tabindex') == undefined) heading.attr('tabindex', '-1');
                            // Instead of focusing on the heading we will focus on the first link/button in panel heading.
                            panelHeading.find('a').first().focus();//heading.focus();
                        }
                    },
                    error: function (jqXHR, status, data) {
                        $.zeusValidate.addError('Error occurred while loading widget.');
                    }
                };
                $.ajax(ajaxOptions);
            }

            root.find('.zeus-widget-selection-list button').on("click.zeus-widgets", addNewWidget);

            function postBackDashboardViewChange(url, data, returnLocation) {
                var form = $("<form style='visibility:hidden;'>").attr('method', 'POST').attr('action', url);
                if (returnLocation == undefined) returnLocation = window.location.toString();
                data["returnTo"] = returnLocation;
                for (var i in data) {
                    form.append($("<input>").attr("name", i).attr("value", data[i]));
                }
                $(document.body).append(form);
                $.zeusValidate.ignoreDirty = true;
                form.submit();
            }

            function setQueryStringParameter(url, name, value) {
                var pattern = new RegExp('('+name+'=).*?(&|$)')
                if (url.search(pattern) >= 0) {
                    url = url.replace(pattern, '$1' + value + '$2');
                }
                else {
                    url = url + (url.indexOf('?') > 0 ? '&' : '?') + name + '=' + value;
                }
                return url;
            }

            // Change view
            root.find('.zeus-widget-view-list select').each(function () {
                var ariaContainer = $(this).data('ariaSelectReference');
                ariaContainer.setOption('deselectAllowed', false);
            });
            root.find('.zeus-widget-view-list select').on("change.zeus-widgets", function () {
                var viewName = $.zeusValidate.getValueFromInput($(this));
                if (viewName) {
                    window.location = setQueryStringParameter(window.location.toString(), 'viewName', viewName);
                }
                else { // Disable buttons if some selects 'no' view
                    $(this).siblings('button').attr('disabled', 'disabled');
                }
            });
            // Reset view
            root.find('.zeus-widget-selector .wvl-reset').on("click.zeus-widgets", function () {
                postBackDashboardViewChange(routeData.ResetView, {
                    widgetContext: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                    viewName: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                    defaultLayout: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetDefaultLayout),
                });
            });
            // Delete view
            root.find('.zeus-widget-selector .wvl-delete').on("click.zeus-widgets", function () {
                postBackDashboardViewChange(routeData.DeleteView, {
                    widgetContext: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                    viewName: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                });
            });
            // Set default view
            root.find('.zeus-widget-selector .wvl-default').on("click.zeus-widgets", function () {
                postBackDashboardViewChange(routeData.SetDefaultView, {
                    widgetContext: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                    viewName: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                });
            });
            // Create view
            root.find('.zeus-widget-selector .wvl-create').on("click.zeus-widgets", function (event) {
                var button = $(this)
                event.preventDefault();
                var modal = $rhea.makeModalDialogElement('Enter a name for this new dashboard view : ', '<input style="width: 100%" type="text" name="newViewName"></input>',
                    '<a class="btn btn-sm btn-white" href="javascript:;">Cancel</a><a class="btn btn-sm btn-primary" href="javascript:;">Ok</a>');

                // Bind to Yes button in modal
                modal.find('.modal-footer a.btn-primary').on('click.zeus-modal-yes', function () {
                    var newViewName = $.zeusValidate.getValueFromInput(modal.find('input'));
                    if (newViewName != undefined && newViewName != '') {
                        postBackDashboardViewChange(routeData.CreateNewView, {
                            widgetContext: button.closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                            viewName: button.closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                            newViewName: newViewName,
                        }, setQueryStringParameter(window.location.toString(), 'viewName', newViewName));
                        $rhea.dismissModalDialogElement(modal);
                    }
                    else {
                        if (modal.find('#validation-error-summary').length == 0) {
                            var fakeErrorSummary = $('<section>').attr('id', 'validation-error-summary').addClass('validation-summary-errors alert alert-danger').append($('<ul>'));
                            modal.find('input').before(fakeErrorSummary);
                        }
                        $.zeusValidate.addError("You cannot create a new view with no name", modal);
                    }
                });
                modal.find('.modal-footer a:not(.btn-primary)').on('click.zeus-modal-dismiss', function () {
                    $rhea.dismissModalDialogElement(modal);
                });

                $rhea.showModalDialogElement(modal);
            });

            // data context changers
            root.find('.zeus-widget-data-context-list select').on("change.zeus-widgets", function () {
                var headers = {};
                headers[headerTypes.Ajax] = true;

                var ajaxOptions = {
                    url: routeData.SetWidgetDataContext, //'/Ajax/SetWidgetDataContext',
                    type: 'POST',
                    data: JSON.stringify({
                        dataContext: $.zeusValidate.getValueFromInput($(this)),
                        widgetContext: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetContext),
                        viewName: $(this).closest(".zeus-widget-selector").attr(fullDataTypes.WidgetView),
                    }),
                    headers: headers,
                    contentType: 'application/json; charset=utf-8',
                    success: function (data) {
                        // refresh all widgets
                        $('[' + fullDataTypes.Click + '=reload]').trigger("click");
                    },
                    error: function (jqXHR, status, data) {
                        $.zeusValidate.addError('Error occurred while loading widget.');
                    }
                };
                $.ajax(ajaxOptions);
            });

            // Add heading button handlers
            var tooltipDefaults = {
                placement: 'bottom',
                trigger: 'hover',
                container: 'body'
            }
            // remove
            root.find('[' + fullDataTypes.Click + '=remove]').on("hover.zeus-widgets", function () {
                $(this).tooltip($.extend({
                    title: 'Remove',
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=remove]').on("click.zeus-widgets", function (e) {
                e.preventDefault();
                $(this).tooltip('destroy');
                var panel = $(this).closest('.panel');
                var name = panel.find(".panel-title").first().text();

                // Remove widget from user preferences silently in the background
                var container = panel.closest('.zeus-widget-container');
                var widgetContext = container.attr(fullDataTypes.WidgetContext);
                panel.parent().remove(); // Removes the surrounding div that has the col numbers specification
                $rhea.calculateColumnWidths();
                saveLayout(container);
                $rhea.generateMainFormJumpList(); // Fix up the jump list to not include removed widgets.
                
                // Add back the button to the selection list if there is one.
                // It'd be nice to have this HTML defined only in one place, rather than here AND in the WidgetSelectorViewModel.
                var button = $('<button ' + fullDataTypes.WidgetContext + '="' + widgetContext + '"><table><tbody><tr><td><i class="fa fa-plus-circle fa-2x"></i></td><td>' + name + '</td></tr></tbody></table></button>');
                var listItem = $('<li>').append(button);
                var selectionList = $('.zeus-widget-selection-list');
                if (selectionList.length == 1) {
                    var notFound = true;
                    var children = selectionList.children();
                    for (var index = 0; index < children.length; ++index) {
                        var testee = $(children[index]);
                        if (testee.find('td').last().text() > name) {
                            testee.before(listItem);
                            notFound = false;
                            break;
                        }
                    }
                    if (notFound) {
                        selectionList.append(listItem);
                    }
                }
                button.on("click.zeus-widgets", addNewWidget);
            });

            // collapse
            root.find('[' + fullDataTypes.Click + '=collapse]').on("hover.zeus-widgets", function () {
                var collapseIconName = 'fa-minus';
                var expandIconName = 'fa-plus';
                var icon = $(this).find('i');
                var titleText = 'Collapse / Expand';
                if (icon.length == 1) {
                    if (icon.hasClass(expandIconName)) {
                        titleText = "Expand";
                    }
                    else if (icon.hasClass(collapseIconName)) {
                        titleText = "Collapse";
                    }
                }
                $(this).tooltip('destroy');
                $(this).tooltip($.extend({
                    title: titleText,
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=collapse]').on("click.zeus-widgets", function (e) {
                e.preventDefault();

                var heightNameOff = ['off-full-height-', 'off-group-height-'];
                var heightNameOn = ['full-height-', 'group-height-'];
                var collapseIconName = 'fa-minus';
                var expandIconName = 'fa-plus';
                $(this).closest('.dynamicContainer').removeClass('dynamicContainer');
                var pnl = $(this).closest('.panel');
                $(pnl.find('.panel-body')[0]).slideToggle();
                $(pnl.find('.panel-footer')[0]).slideToggle();

                var pnlClasses = pnl.attr('class').split(' ');

                var heightClassesOff = [];
                var heightClassesOn = [];

                if (pnl.data('heightClassesOff') != undefined && pnl.data('heightClassesOn') != undefined) {
                    heightClassesOff = pnl.data('heightClassesOff');
                    heightClassesOn = pnl.data('heightClassesOn');
                } else {
                    for (var i = 0; i < pnlClasses.length; i++) {
                        for (var j = 0; j < heightNameOff.length; j++) {
                            if (pnlClasses[i].indexOf(heightNameOff[j]) == 0) {
                                heightClassesOff.push(pnlClasses[i]);
                                heightClassesOn.push(pnlClasses[i].substring(4));
                            }
                        }

                        for (var j = 0; j < heightNameOn.length; j++) {
                            if (pnlClasses[i].indexOf(heightNameOn[j]) == 0) {
                                heightClassesOn.push(pnlClasses[i]);
                                heightClassesOff.push(heightNameOff[j] + pnlClasses[i].substring(heightNameOn[j].length));
                            }
                        }
                    }

                    if (heightClassesOn.length > 0) {
                        pnl.data('heightClassesOff', heightClassesOff);
                        pnl.data('heightClassesOn', heightClassesOn);
                    }
                }

                var icon = $(this).find('i');
                var spanReaders = $(this).find('span[class=readers]');
                //for collapseable properties
                var collapseproperty = $(this).attr(fullDataTypes.CollapsedProperty);
                if (icon.length == 1) {
                    if (icon.hasClass(collapseIconName)) {

                        for (var i = 0; i < heightClassesOn.length; i++) {
                            pnl.removeClass(heightClassesOn[i]);
                            pnl.addClass(heightClassesOff[i]);
                        }

                        pnl.addClass('panel-collapsed');
                        icon.removeClass(collapseIconName);
                        icon.addClass(expandIconName);
                        if (spanReaders.length == 1) {
                            spanReaders.text(spanReaders.text().replace(/^Collapse/, "Expand"));
                        }
                        //set collapse property to true
                        if (collapseproperty !== undefined && collapseproperty.length > 0) {
                            $(document).find('#' + $(this).attr(fullDataTypes.CollapsedProperty)).val(true);
                        }
                        
                    }
                    else if (icon.hasClass(expandIconName)) {

                        for (var i = 0; i < heightClassesOff.length; i++) {
                            pnl.removeClass(heightClassesOff[i]);
                            pnl.addClass(heightClassesOn[i]);
                        }

                        pnl.removeClass('panel-collapsed');
                        // Expand
                        icon.removeClass(expandIconName);
                        icon.addClass(collapseIconName);
                        if (spanReaders.length == 1) {
                            spanReaders.text(spanReaders.text().replace(/^Expand/, "Collapse"));
                        }
                        // When panel is expanded, we remove 'overflow:hidden' from panel-footer otherwise split buttons do not properly expand.
                        var element = this;
                        setTimeout(function() {
                            $($(element).closest('.panel').find('.panel-footer')[0]).css('overflow', '');
                            $($(element).closest('.panel').find('.panel-body')[0]).css('overflow', '');
                        }, 200);
                        //set collapse property to false
                        if (collapseproperty !== undefined && collapseproperty.length > 0) {
                            $(document).find('#' + $(this).attr(fullDataTypes.CollapsedProperty)).val(false);
                        }
                    }
                }

            });

            // reload
            root.find('[' + fullDataTypes.Click + '=reload]').on("hover.zeus-widgets", function () {
                $(this).tooltip($.extend({
                    title: 'Reload',
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=reload]').on("click.zeus-widgets", function (e) {
                e.preventDefault();
                var target = $(this).closest('.panel');
                var targetBody = $(target).find('.panel-body').first();
                $rhea.getNewContentForPanel(target, targetBody, targetBody.attr(fullDataTypes.Url), JSON.stringify({
                        widgetContext: targetBody.attr(fullDataTypes.WidgetContext),
                        viewName: targetBody.attr(fullDataTypes.WidgetView)
                    }));
            });

            // expand
            root.find('[' + fullDataTypes.Click + '=expand]').on("hover.zeus-widgets", function () {
                $(this).tooltip($.extend({
                    title: 'Expand / Compress',
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=expand]').on("click.zeus-widgets", function (e) {
                e.preventDefault();
                var target = $(this).closest('.panel');
                var pbody = target.find('.panel-body');
                var footer = target.find('.panel-footer');

                if ($('body').hasClass('panel-expand') && $(target).hasClass('panel-expand')) {
                    $('body, .panel').removeClass('panel-expand');
                    if (footer.length && pbody.length) {
                        pbody.css("margin-bottom", '');
                    }
                    $('.panel').removeAttr('style');
                    // Show 'collapse' button when panel is not expanded (no need to ensure that this is the 'collapse' button on top-most panel because nested panels don't have this button).
                    $(this).siblings('[' + fullDataTypes.Click + '=collapse]').show();
                } else {
                    $('body').addClass('panel-expand');
                    target.addClass('panel-expand');
                    if (footer.length && pbody.length) {
                        pbody.css("margin-bottom", footer.height() + 'px');
                    }
                    // Hide 'collapse' button when panel is expanded (no need to ensure that this is the 'collapse' button on top-most panel because nested panels don't have this button).
                    $(this).siblings('[' + fullDataTypes.Click + '=collapse]').hide();
                }
                $(window).trigger('resize');
            });

            // move up
            root.find('[' + fullDataTypes.Click + '=moveup]').on("hover.zeus-widgets", function () {
                $(this).tooltip($.extend({
                    title: 'Move up',
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=moveup]').on("click.zeus-widgets", function (e) {
                e.preventDefault();
                $(this).tooltip('hide');
                var me = $(this).closest('.panel').parent();
                var them = me.prev();
                if (them.length == 1) {
                    them.before(me);
                    $rhea.calculateColumnWidths();
                    saveLayout(me.closest('.zeus-widget-container'));
                    $(this).focus();
                }
            });

            // move down
            root.find('[' + fullDataTypes.Click + '=movedown]').on("hover.zeus-widgets", function () {
                $(this).tooltip($.extend({
                    title: 'Move down',
                }, tooltipDefaults));
                $(this).tooltip('show');
            });
            root.find('[' + fullDataTypes.Click + '=movedown]').on("click.zeus-widgets", function (e) {
                e.preventDefault();
                $(this).tooltip('hide');
                var me = $(this).closest('.panel').parent();
                var them = me.next();
                if (them.length == 1) {
                    them.after(me);
                    $rhea.calculateColumnWidths();
                    saveLayout(me.closest('.zeus-widget-container'));
                    $(this).focus();
                }
            });

            // Dragging
            root.find('.zeus-widget-container').sortable({
                update: function (event, ui) {
                    // Update user preferences silently in the background
                    $rhea.calculateColumnWidths();
                    saveLayout(ui.item.closest('.zeus-widget-container'));
                },
                start: function (event, ui) {
                    ui.placeholder.height(ui.item.height()); // Fix placeholder size bug
                },
                cancel: '.iswidget .panel-body',
                tolerance: 'pointer',
            });
        },

        responsivetables: function (appended_table_content) {
            var $rhea = this;
            var root = $(this.element) || $(document);
            var existing_table = appended_table_content || false;

            root.find('table').each(function () {
                var table = $(this);
                var hiddenClass = 'responsive-hidden';
                var tableHeaderRow = table.find('thead tr').last();
                var tableContainer = $(this).closest('.table-responsive');
                if (tableContainer.length == 0 || tableHeaderRow.length == 0) return;

                // Setup the index arrays of which columns are removable
                var visibleColumns = [];
                var hiddenColumns = [];
                var firstAlwaysVisibleIndex = undefined;
                tableHeaderRow.children().each(function (index, item) {
                    if ($(item).is(".removable")) {
                        visibleColumns.push(index);
                    }
                    else if (firstAlwaysVisibleIndex == undefined) {
                        firstAlwaysVisibleIndex = index;
                    }
                });

                if (firstAlwaysVisibleIndex == undefined) { console.log("Cannot use responsive table with every column being removable"); return; }

                // Insert row-revealer
                table.find('tbody tr:not(.responsive-row)').each(function () {
                    var icon = $('<i>').addClass("fa fa-plus");
                    
                    var anchor = $('<a>').attr('href', 'javascript:;').addClass("row-revealer").append(icon).addClass(hiddenClass);

                    // Generate unique ID for anchor
                    anchor.data('guid', $.zeusValidate.guid());

                    anchor.on('click', function () {
                        anchor.toggleClass("revealed");

                        // Find correct responsive row for this anchor via guid so it works after table has been re-sorted
                        var guid = anchor.data('guid');
                        var row = anchor.closest('table').find('tr.responsive-row.guid-' + guid);

                        if (row.is('.responsive-row')) {
                            if (anchor.hasClass("revealed")) {
                                row.removeClass(hiddenClass);
                                icon.removeClass("fa-plus").addClass("fa-minus");
                            }
                            else {
                                row.addClass(hiddenClass);
                                icon.removeClass("fa-minus").addClass("fa-plus");
                            }
                        }
                    });
                    $($(this).children().get(firstAlwaysVisibleIndex)).each(function(){
                        if ($(this).children('.row-revealer').length == 0) { // check that if the link has not already been added. Because this function is also called from 'loadMoreResults' function to re-apply responsiveness on newly loaded records.
                            $(this).prepend(anchor);
                        }
                    });
                });

                $(window).on('resize', function (event, recalc, collapse) {
                    //collapse (ensure any expanded rows are collapsed)
                    if (collapse === true) {
                        // Trigger click on all revealed rows to ensure they all close
                        // (need to do when table is being resorted)
                        table.find('a.row-revealer.revealed').trigger('click');

                        // Make sure the a.row-revealer's corresponding tr.responsive-row is after it
                        // (sorting ends up putting all the responsive-row's together on their own)
                        table.find('a.row-revealer').each(function () {
                            var anchor = $(this);
                            var guid = anchor.data('guid');
                            var anchorRow = anchor.closest('tr');
                            var responsiveRow = anchor.closest('table').find('tr.responsive-row.guid-' + guid);
                            responsiveRow.insertAfter(anchorRow);
                        });
                    }

                    //recalc
                    if (jQuery.type(recalc) === "boolean") {
                        visibleColumns = [];
                        hiddenColumns = [];
                        tableHeaderRow.children().each(function (index, item) {
                            if ($(item).is(".removable")) {
                                visibleColumns.push(index);
                            }
                            else if (firstAlwaysVisibleIndex == undefined) {
                                firstAlwaysVisibleIndex = index;
                            }
                        });
                    }

                    var numHidden = hiddenColumns.length;

                    // showColumns();
                    while (tableContainer[0].scrollWidth <= $(tableContainer[0]).innerWidth() && hiddenColumns.length > 0) {
                        var index = hiddenColumns.pop();
                        table.find('tr:not(.responsive-row)').each(function () {
                            $($(this).children('th, td').get(index)).removeClass(hiddenClass);
                        });
                        visibleColumns.push(index);
                    }
                    // hideColumns(); 
                    while (tableContainer[0].scrollWidth > $(tableContainer[0]).innerWidth() && visibleColumns.length > 0) {
                        var index = visibleColumns.pop();
                        table.find('tr:not(.responsive-row)').each(function () {
                            if (!existing_table) {
                                $($(this).children('th, td').get(index)).addClass(hiddenClass);
                            }
                        });
                        hiddenColumns.push(index);
                    }

                    if (numHidden != hiddenColumns.length) { // Change in hidden columns, regenrate the drop down rows
                        table.find('tbody tr:not(.responsive-row)').each(function () {
                            // Clear out old row
                            var next = $(this).next();
                            if (next.length && next.is('.responsive-row')) next.remove();

                            // Add new row
                            if (hiddenColumns.length) {
                                // Anchor
                                $(this).find('.row-revealer').removeClass(hiddenClass);

                                // Anchor guid
                                var guid = $(this).find('.row-revealer').data('guid');

                                var td = $('<td colspan="' + tableHeaderRow.children(':visible').length + '">');
                                var dl = $('<dl class="dl-horizontal">').appendTo(td);
                                var columns = $(this).children('th, td');
                                var headerColumns = tableHeaderRow.children('th, td');
                                for (var index in hiddenColumns) {
                                    var dataClone = $(columns.get(hiddenColumns[index])).clone();
                                    $('<dd>').html(dataClone.html()).prependTo(dl);
                                    var headerClone = $(headerColumns.get(hiddenColumns[index])).clone();
                                    headerClone.find('.readers').remove(); // Remove sorting instruction text;
                                    $('<dt>').text(headerClone.text() + ':').prependTo(dl);
                                }

                                next = $('<tr>').addClass('responsive-row').append(td);

                                // Link row to anchor via the anchor guid
                                next.addClass('guid-' + guid);

                                if (!$(this).find('.row-revealer').hasClass("revealed")) {
                                    next.addClass(hiddenClass);
                                }
                                $(this).after(next);
                            }
                            else {
                                $(this).find('.row-revealer').addClass(hiddenClass);
                            }
                        });

                    }
                });
                if (existing_table) {
                    $(this).trigger('resize',[true, false]);
                }
                else {
                    $(this).trigger('resize');
                }
            });
        },

        processCalendar: function () {

            // Global variables
            var $rhea = this;
            var root = $(this.element) || $(document);

            var topButtonsString = { left: 'today prev, next ', center: 'title', right: 'month,agendaWeek,agendaDay' };
            var date = new Date();
            var calendar;
            var SessionStorageDateKey = 'current_date';
            var SessionStorageViewKey = 'current_view';
            var AgendaDayView = 'agendaDay';
            var AgendaWeekView = 'agendaWeek';
            var MonthView = 'month';
            var DefaultSessionTime = 120; // value in hours i.e. 2 hours.
            var StartTimePropertyName = "'Start.Time'";
            var StartDatePropertyName = "'Start.Date'";
            var EndTimePropertyName = "'End.Time'";
            var EndDatePropertyName = "'End.Date'";
            var StartPropertyName = "'Start'"; // hidden property
            var EndPropertyName = "'End'";      // hidden property
            var ModelStateIsValidPropertyName = "'ModelStateIsValid'";
            var javascriptUrl = "javascript:;";
            var SubmitTypeVariableName = 'submitType';
            var dialogDiv = $("#calendarCategory-dialog-form");
            var modalDiv = $("#modal-message");
            var startTime = new Date();
            var endTime = new Date().addMinutes(DefaultSessionTime);
            var currentAction;
            var submitTypeChosen = undefined;
            var modalYesClicked = false;
            var gotoDateParameter = 'gotoDate';
            var gotoDateControlName = 'Goto-Date';
            var gotoDateInput = $('input#' + gotoDateControlName);
            var rightSideButtons = ('div.fc-right');
            var hideCategoriesButton = 'button.hideCategories';
            var categoriesListOuterDiv = 'div.categoriesList';
            var expandIcon = '<i class="fa fa-2x fa-angle-double-left"></i>';
            var collapseIcon = '<i class="fa fa-2x fa-angle-double-right"></i>';
            var backgroundEventDataSelector = 'p.BackgroundEventsData';
            var calendarDataSelector = 'p.CalendarData';
            var calendarPanel = undefined;

            // Do not close modal on escape.

            // This function binds to click and enter events on buttons inside of Modal and get their submitType.
            function BindButtonsForSubmitType(mform)
            {
                $(mform).find("button[type='submit']").each(function () { // you could find button using this selector "bytton[name="submitType"]".
                    var button = $(this);
                    var buttonValue = $(button).attr('value');
                    if(buttonValue != undefined && buttonValue != ""){
                        if(buttonValue.toLowerCase() != "close"){
                            $(button).click(function (e) {
                                submitTypeChosen = buttonValue;
                            });
                        }
                    }
                });
            }

            // This method will be called when user has clicked existing event with the intention of editing that event.
            function editEvent(url, category) {
                processAjaxGet(url, category);
            }

            // Determines whether the response was in Json/html.
            function isExpectedResponse(request, expectedResponseType) {
                return (request != undefined && request.getResponseHeader("content-type").indexOf(expectedResponseType));
            }

            // Forms a new Date object from JSON date (collection of numbers).
            function getDateFromJSON(jsonDate) {
                var dt = new Date(parseInt(jsonDate.substr(6)));
                var serverOffset = 10 * 60 * 60000; // Canberra/Sydney +10
                var clientOffset = dt.getTimezoneOffset() * 60000;
                return new Date(dt.getTime() + serverOffset + clientOffset);
            }

            // Function is responsible for loading more events upon change of view in calendar. Not being used.

            // This method is responsible for processing AJAX GET call to specified url.
            function processAjaxGet(url, categorySelected) {
                //if (IsAddingEditingAllowed(categorySelected)) // checks whether this category allows addition/editing of events. 
                //THIS WAS COMMENTED OUT BECAUSE we still want to show modal so user can view the details of the event.
                if (url != undefined && url != '') {
                    // Don't process non-clickable events (they contain '#_NonClickable' in their href attribute).
                    if (url.indexOf('#_NonClickable') == -1) {
                        // Make an AJAX call here.                  
                        $.ajax({
                                url: url,
                                quietMillis: 1000,
                                type: 'GET',
                                dataType: 'html',
                                cache: false,
                                global: true,
                                contentType: 'application/xml; charset=utf-8'
                            })
                            .done(function(data, textStatus, request) {
                                if ($.zeusValidate.sessionExpired(request)) {
                                    return;
                                }
                                bindPostSubmit(data, url, categorySelected, request);
                            }).fail(function(xhr, status, data) {
                                $.zeusValidate.addError('Error occurred while loading details.');
                            });
                    }
                } else {
                    $.zeusValidate.addError('Encountered error: Url is undefined or empty processAjaxGet().');
                }
            }

            // This function is responsible for updating the post Token and form's Id.
            function updateFormIdGetActionWithNewToken(response, url) {

                var tokenPrefix = "__RequestVerificationToken=";
                var postAction = undefined;
                if (response != undefined) {
                    // Change the id for this form.
                    response = $.zeusValidate.replaceAll(response, 'id="main_form"', 'id="modal_form"');
                    response = $('<div>').html(response); // you'll want to wrap this inside of <form> tag as changes to Object.cshtml will no longer return form.
                    //alert('Data received from post action is  ' + response);
                    // Update request verification token.                      
                    var tokenElement = $(response).find('input[name="__RequestVerificationToken"]');//[0].Value;
                    var tokenForPost = $(tokenElement).attr('value');
                    currentAction = url;
                    postAction = url + '?' + tokenPrefix + tokenForPost;
                }
                return { postAction: postAction, response: response };
            }

            // This method will be used to process Post / submits for all AJAX POST actions.
            function bindPostSubmit(response, url, categoryName, request) {
                if (response != undefined && response != '') {
                    // Change form id element.
                    var result = updateFormIdGetActionWithNewToken(response, url);
                    var actionForPost = result.postAction;

                    // Get Modal.
                    var modalBody = $("#modal-message .modal-body");

                    var input = $(result.response).find("input[name=" + ModelStateIsValidPropertyName + "]"); // If the response doesn't contain then we assume, event details are returned in JSON format.
                    if ((input.length == 0) ) {
                        // input ModelValidity is not found that means server has returned a JSON response.

                        var categoryDiv = $("[" + fullDataTypes.CalendarCategory + "=" + categoryName + "]");
                        var categoryColor = $(categoryDiv).attr('data-bg');
                        var categoryUrl = $(categoryDiv).attr(fullDataTypes.Url);
                        var dragResizeUrl = $(categoryDiv).attr(fullDataTypes.CalendarDragResizeAction);
                        var categoryClickable = $(categoryDiv).attr(fullDataTypes.IsCategoryItemClickable);
                        var opensInNewTab = $(categoryDiv).attr(fullDataTypes.CalendarOpenInNewTab);
                        var currentEventData = $.parseJSON(response); // Alternative JSON.parse(response);                        

                        var dataUrl = categoryUrl + (categoryUrl.indexOf('?') >= 0 ? '&id=' : '?id=') + currentEventData.Id;
                        var urlHref = currentEventData.IsClickable && categoryClickable == "1" ? dataUrl : "#_NonClickable";
                        if (opensInNewTab == "1" && urlHref.indexOf("#_NonClickable") == -1) { // event is clickable
                            urlHref = dataUrl;
                        }
                        if (currentEventData.IsDelete > 0) {
                            calendar.fullCalendar('removeEvents', currentEventData.Id);
                        } else {
                            var currentEvent =
                            {
                                id: currentEventData.Id,
                                title: currentEventData.Title, // C# properties for CategoryItemViewModel Title, Description, Start and End (both DateTime).
                                start: currentEventData.Start != undefined ? (currentEventData.Start): new Date(),//getDateFromJSON(currentEventData.Start),
                                end:   currentEventData.End != undefined ? (currentEventData.End)  : new Date(),//getDateFromJSON(currentEventData.End  ),
                                className: (currentEventData.SpecialColour != undefined && currentEventData.SpecialColour != '' ? ('bg-' + currentEventData.SpecialColour.toLowerCase()) : categoryColor) + getPastDateClass(currentEventData.End),
                                media: $(categoryDiv).attr('data-media'),
                                description: currentEventData.Title,
                                toolTipDescription: currentEventData.ToolTipDescriptionHtml,
                                url: currentEventData.IsClickable && categoryClickable == "1" ? currentEventData.Id : currentEventData.Id + "#_NonClickable",
                                allDay: currentEventData.AllDay,
                                dataUrl: urlHref,
                                opensInNewTab: opensInNewTab == "1" && currentEventData.IsClickable && categoryClickable == "1",
                                dragUrl: dragResizeUrl == undefined ? undefined : (dragResizeUrl + '?id=' + currentEventData.Id),
                                category: categoryName,
                                editable: dragResizeUrl != undefined && currentEventData.IsEditable   // if url is specified & isEditable (by default is set to true) then event is draggable and resizable.
                            };
                            // remove the event if exists and then add it. OR you can update the existing event.
                            if (currentEventData.Id != undefined) {
                                var existingEvent = calendar.fullCalendar('clientEvents', currentEventData.Id);
                                if (existingEvent != undefined && existingEvent.length == 1) {
                                    calendar.fullCalendar('removeEvents', currentEventData.Id); // calendar.fullCalendar('updateEvent', currentEvent);                            
                                }
                                calendar.fullCalendar('renderEvent', currentEvent);
                            }
                        }
                        if (currentEventData.KeepShowingModal > 0)
                        {
                            // if developers intend to show the Modal (for re-adding of event).
                            processAjaxGet(categoryUrl, categoryName); // we send categoryUrl so new item can be added.
                        } else {
                            closeModal();
                        }

                        // call UpdateIDs() method here so it injects the URLs for                         
                    }
                    else {

                        $(modalBody).empty();
                        $(modalBody).append(result.response);
                        var mform = $('#modal_form');
                        BindButtonsForSubmitType(mform);

                        // Update both Start and End Sessions here (including Date and Time as well as Hidden fields),
                        // do this only for ADD and not for EDIT.
                        var st = $(mform.find("input[name=" + StartPropertyName + "]")[0]);
                        //console.log('start value of DATETIME ' + st.val() + ' length: ' + st.length );
                        if (st != undefined && (st.val() == '' || st.val() == undefined)) {// hidden input.

                            var dateTimeString = startTime.toString('dd/MM/yyyy h:mm tt');
                            // SPACE IS VERY IMPORTANT between " 0:00AM", otherwise, without this space, it affects 10:00AM which will be replaced with 112:00 AM which results in jQueryValidate error.
                            dateTimeString = $.zeusValidate.replaceAll(dateTimeString, " 0:00 AM", " 12:00 AM");
                            $(mform.find("input[name=" + StartPropertyName + "]")[0]).val();
                            // Val() doesn't change the value attribute, what a surprise !!!, so have to set value via attr.
                            $(mform.find("input[name=" + StartPropertyName + "]")[0]).attr('value', dateTimeString);
                        }
                        var st1 = $(mform.find("input[name=" + StartDatePropertyName + "]")[0]);
                        if (st1 != undefined && (st1.val() == '' || st1.val() == undefined)) {
                            var dayString = startTime.toString('dd/MM/yyyy');
                            $(mform.find("input[name=" + StartDatePropertyName + "]")[0]).val();
                            $(mform.find("input[name=" + StartDatePropertyName + "]")[0]).attr('value', dayString);
                        }
                        var st2 = $(mform.find("input[name=" + StartTimePropertyName + "]")[0]);
                        if (st2 != undefined && (st2.val() == '' || st2.val() == undefined)) {
                            var timeString = startTime.toString('h:mm tt');
                            $(mform.find("input[name=" + StartTimePropertyName + "]")[0]).val(timeString);
                            $(mform.find("input[name=" + StartTimePropertyName + "]")[0]).attr('value', timeString);
                        }
                        var et = $(mform.find("input[name=" + EndPropertyName + "]")[0]);
                        if (et != undefined && (et.val() == '' || et.val() == undefined)) {// Hidden input
                            var dateTimeString = endTime.toString('dd/MM/yyyy h:mm tt');
                            // SPACE IS VERY IMPORTANT between " 0:00AM", otherwise, without this space, it affects 10:00AM which will be replaced with 112:00 AM which results in jQueryValidate error.
                            dateTimeString = $.zeusValidate.replaceAll(dateTimeString, " 0:00 AM", " 12:00 AM"); // must have space.
                            $(mform.find("input[name=" + EndPropertyName + "]")[0]).val(dateTimeString);
                            $(mform.find("input[name=" + EndPropertyName + "]")[0]).attr('value', dateTimeString);
                        }
                        var et1 = $(mform.find("input[name=" + EndDatePropertyName + "]")[0]);
                        if (et1 != undefined && (et1.val() == '' || et1.val() == undefined)) {
                            var dayString = endTime.toString('dd/MM/yyyy');
                            $(mform.find("input[name=" + EndDatePropertyName + "]")[0]).val(dayString);
                            $(mform.find("input[name=" + EndDatePropertyName + "]")[0]).attr('value', dayString);
                        }
                        var et2 = $(mform.find("input[name=" + EndTimePropertyName + "]")[0]);
                        if (et2 != undefined && (et2.val() == '' || et2.val() == undefined)) {
                            var timeString = endTime.toString('h:mm tt');
                            $(mform.find("input[name=" + EndTimePropertyName + "]")[0]).val(timeString);
                            // Val() doesn't change the value attribute, what a surprise !!!, so have to set value via attr.
                            $(mform.find("input[name=" + EndTimePropertyName + "]")[0]).attr('value', timeString);
                        }

                        var modalOpen = $(modalDiv).modal({ backdrop: 'static', keyboard: false }); // Keyboard: true Closes the modal when escape key is pressed.

                        // Bind click event of close button so modal is closed.
                        $(modalBody).find('button[class ~= "cancel"]').first().each(function () { // button[class="cancel btn-inverse btn"]

                            $(this).click(function (e) {
                                e.preventDefault();
                                closeModal();
                            });
                            //return false;
                        });

                        $rhea.prepareNewContent(mform);
                        mform.unbind('submit');
                        mform.bind('submit', function (e) {
                            e.preventDefault();

                            var isValid = true;//$(mform).valid(); // NOTE: we will reply on Server-side validation only.

                            if (isValid !== undefined && isValid == true) {
                                var serializedForm = mform.serialize() + '&submitType=' + submitTypeChosen +'&';
                                var formModel = JSON.stringify({ 'model': serializedForm });
                                if (submitTypeChosen != undefined) {
                                    //alert('submit type chosen' + submitTypeChosen);
                                    formModel = JSON.stringify({ 'model': serializedForm});
                                }
                                $.ajax({
                                    url: actionForPost,
                                    quietMillis: 1000,
                                    type: 'POST',
                                    dataType: 'html',
                                    data: formModel

                                }).done(function (data, textStatus, request) {
                                    if (data == undefined || data == '') {
                                        // Some error occurred
                                        $.zeusValidate.ignoreDirty = true;
                                        location.reload(true); // parameter value true: indicates that full page -reload (from server) will be done.
                                    }
                                    else if($.zeusValidate.sessionExpired(request)){
                                        return;
                                    }
                                    else {
                                        bindPostSubmit(data, url, categoryName, request);
                                    }
                                }).fail(function (xhr, status, data) {
                                    $.zeusValidate.addError('Error occurred while loading details.');
                                });
                            }
                            else {
                                //alert("Form is invalid " + isValid);
                            }
                            // After successful form submission, control comes here.
                        });
                        setTimeout(function () {
                            // Set trigger on textarea                             
                            $(mform).find('textarea:visible:not([readonly])').trigger("input").blur(); // Force resizing of text-areas which is required to set initial size when this is loaded (visible) for the first time.
                            // release the focus and apply it to first element.
                            $(mform).find('input[type!=hidden]:first,textarea,select').filter(':visible:first').focus();
                            // remove panels & heading buttons
                            //$(mform).find('div.panel').removeClass('panel-inverse'); // Instead of removing panel class we can remove the heading buttons.
                            $(mform).find('a[' + fullDataTypes.Click + ']').remove();

                        }, 300);
                    }
                }
            }

            // Closes the Modal.
            function closeModal() {
                $(".modal ").modal('hide');
                $(dialogDiv).modal('hide');
            }

            // This function carries out AJAX call to action that is responsible for responding to Resizing and dragging of event.
            function processEventDragResize(url, start, end, revertFunc, eventCategory)
            {
                if (url != undefined) {
                    var startDateChange = start != null ? start.toString('dd/MM/yyyy h:mm tt') : null;
                    var endDateChange = end != null ? end.toString('dd/MM/yyyy h:mm tt') : start.toString('dd/MM/yyyy'); // if end is null i.e. it's an all day event.
                    //alert(startDateChange + "" + endDateChange  + " ");
                    //var dataToSend = JSON.stringify({ start: startDateChange , end: endDateChange });//!= null ? startDateChange.toString() : null      != null ? endDateChange.toString(): null
                    $.ajax({

                        url: url,
                        quietMillis: 1000,
                        type: 'POST',
                        dataType: 'html',
                        data: { start: startDateChange, end: endDateChange, category:eventCategory },
                        error: function (jqXHR) {
                            $.zeusValidate.addError('The server encountered an internal error and was unable to process your request. Please try again later.');
                        }

                    }).done(function (data, textStatus, request) {
                        if ($.zeusValidate.sessionExpired(request)) {
                            return;
                        }
                        if (data == undefined || data == '') {
                            //$.zeusValidate.addError('The server encountered an internal error and was unable to process your request. Please try again later. ' + 'No data received.');
                            $.zeusValidate.ignoreDirty = true;
                            location.reload(true);
                        }
                        else if (data.toLowerCase() == "true") {
                            return;
                        }
                        revertFunc(); // Revert the move if anything goes wrong or if the response is false.
                    }).fail(function (xhr, status, data) {
                        $.zeusValidate.addError('Error occurred while processing.');
                    });
                }
            }

            // Forms Date object from Moment Object.
            function getDateFromMoment(momentObject)
            {
                var day, month, year, hour, minutes;
                day = parseInt(momentObject.format("DD"));
                month = parseInt(momentObject.format("MM"));
                year = parseInt(momentObject.format("YYYY"));
                hour = parseInt(momentObject.format("HH"));
                minutes = parseInt(momentObject.format("mm"));
                return new Date(year, month - 1, day, hour, minutes, 0, 0); // Date object has months starting at 0 to 11.
            }

            // Responsible for showing the confirmation Modal when resizing or dragging/dropping events.
            function showConfirmation(category, callback, revertFunc)
            {
                modalYesClicked = false;
                var text = $("[" + fullDataTypes.CalendarCategory + '=' + category + "]").attr(fullDataTypes.CalendarConfirmationMessage);
                var confirmation = $rhea.makeModalDialogElement('', text,
                    '<a class="btn btn-sm btn-white" href="javascript:;">No</a><a class="btn btn-sm btn-primary" href="javascript:;">Yes</a>');

                confirmation.find("a.btn-primary").click(function (e) {
                    modalYesClicked = true;
                    callback();
                });
                confirmation.find("a.btn").on('click', function (e) {
                    $rhea.dismissModalDialogElement(confirmation);
                });
                confirmation.on('hidden.bs.modal', function (e) {
                    if(!modalYesClicked)
                    {
                        revertFunc();
                    }
                });

                $rhea.showModalDialogElement(confirmation);
            }

            // Returns the class to indicate whether the endSession is in past.
            function getPastDateClass(endSession) {
                var momentObject = moment(endSession);
                var endSessionDate = getDateFromMoment(momentObject);
                return isPastDate(endSessionDate) ? ' pastDate' : '';
            }

            // Checks whether date was in past.
            function isPastDate(dateObject) {
                var today = new Date();
                // Only take dates into account and ignore the time part.
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                dateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
                var isPast = dateObject < today;
                //alert(isPastDate + ' ' + today.toShortDateString() + ' ' + dateObject.toShortDateString());
                return isPast;
            }

            // Trims the whitespace from text.
            function trimText(text) {
                return text != undefined ? text.replace(/\s+/g, '') : undefined;
            }

            // Determines whether the category provided allows adding/editing of events.
            function IsAddingEditingAllowed(categoryTrimmed) {
                var allowed = true;
                var currentCategory = $(categoriesListOuterDiv).find("[" + fullDataTypes.CalendarCategory + "=" + categoryTrimmed + "]");
                if (currentCategory.length == 1) {
                    if (currentCategory.attr(fullDataTypes.CalendarAllowEventAddCategory) == "1") {
                        allowed = true;
                    } else {
                        allowed = false;
                    }
                }
                return allowed;
            }


            $(".vertical-box").each(function () {

                var dialog, selectCategoryform;
                var gotoDate = undefined;
                // store this as parentCalendar
                var currentCalendar = $(this);
                calendarPanel = $(currentCalendar).closest('div.panel').length == 1 ? $(currentCalendar).closest('div.panel') : undefined;
                var disablePastDates = $(currentCalendar).attr(fullDataTypes.CalendarDisablePastDates) != undefined ? $(currentCalendar).attr(fullDataTypes.CalendarDisablePastDates).toLowerCase().indexOf('true') == 0 : true; //default is true.
                var maxEditableDate = $.zeusValidate.parseDateValue($(currentCalendar).attr(fullDataTypes.CalendarMaxDateToShow));
                var minEditableDate = $.zeusValidate.parseDateValue($(currentCalendar).attr(fullDataTypes.CalendarMinDateToShow));
                // Get Calendar object
                var calendarObject = $(currentCalendar).find(calendarDataSelector);
                if (calendarObject.length == 1)
                {
                    calendarObject = JSON.parse(calendarObject.text());
                    calendarObject.EventLimitWeekDay = calendarObject.EventLimitWeekDay > 0 ? calendarObject.EventLimitWeekDay : calendarObject.EventLimit;
                    if(!calendarObject.ShowTodayButton){
                        topButtonsString.left = $.zeusValidate.replaceAll(topButtonsString.left, 'today', '');
                    }
                    if (!calendarObject.AllowCalendarScrolling) {
                        topButtonsString.left = $.zeusValidate.replaceAll(topButtonsString.left, ' prev, next ', '');
                    }
                }
                // check if the current element has not been rendered as calendar already.
                var isCalendarRenderedBefore = $(currentCalendar).attr(fullDataTypes.CalendarRendered);
                if (isCalendarRenderedBefore != undefined && isCalendarRenderedBefore == "true") {
                    // if it has been rendred then return
                    return;
                }
                $(currentCalendar).attr(fullDataTypes.CalendarRendered, "true");

                var storedGotoDate = $.zeusValidate.parseDateValue(sessionStorage[SessionStorageDateKey]);
                var storedView = sessionStorage[SessionStorageViewKey];
                var providedGoToDate = $.zeusValidate.parseDateValue($(currentCalendar).attr(fullDataTypes.CalendarGoToDate));

                if (providedGoToDate != undefined) {
                    gotoDate = providedGoToDate;
                    if (providedGoToDate < minEditableDate || providedGoToDate > maxEditableDate) {
                        gotoDate = minEditableDate;
                    }
                }
                else {
                    if (storedGotoDate != undefined && calendarObject.RememberLastDateAndView) {
                        if (storedGotoDate >= minEditableDate && storedGotoDate <= maxEditableDate) {
                            storedGotoDate = storedGotoDate;
                        }
                        else {
                            storedGotoDate = minEditableDate;
                        }
                        gotoDate = storedGotoDate;
                    }
                }

                RegisterHideCategoriesButtonClick();

                if (currentCalendar.attr(fullDataTypes.CalendarDefaultSessionTime) != undefined
                    &&
                    parseInt(currentCalendar.attr(fullDataTypes.CalendarDefaultSessionTime)) > 0) {
                    var value = parseInt(currentCalendar.attr(fullDataTypes.CalendarDefaultSessionTime));
                    endTime = new Date().addMinutes(value);
                    DefaultSessionTime = value;
                }
                // get list of categories for this calendar
                var categoryList = $(currentCalendar).find(".external-event");
                var categoriesArray = []; // this will be the list that will be displayed as radio buttons inside modal (for selecting event type). Excludes categories that have eventCreation set to false.
                var categoriesArrayTrimmed = []; // this list will be used to uniquely identify category (by trimming its name). This list contains all the categories regardless of the state (enabled/disabled) of the event creation.
                if (categoryList != undefined) {
                    populateCategoriesAndHandleCategoryClick();
                }
                // Hide Category list after populating the arrays for categories.
                if (currentCalendar.attr(fullDataTypes.CalendarHideList) != undefined && currentCalendar.attr(fullDataTypes.CalendarHideList) == 'true') {
                    $(hideCategoriesButton).click();
                    $(hideCategoriesButton).hide();
                }

                // Get Default View value.
                var defaultView = storedView && calendarObject.RememberLastDateAndView != undefined ? storedView : $(currentCalendar).attr(fullDataTypes.CalendarDefaultView);
                switch (defaultView) {
                    case 'day':
                        defaultView = AgendaDayView;
                        break;
                    case 'month':
                        defaultView = MonthView;
                        break;
                    case 'week':
                        defaultView = AgendaWeekView;
                        break;
                    case 'agendaDay':
                        defaultView = AgendaDayView;
                        break;
                    case 'agendaWeek':
                        defaultView = AgendaWeekView;
                        break;
                    default:
                        defaultView = MonthView;
                        break;
                }

                // Function is responsible for populating the arrays of categories (one array for names and the other for trimmed names for uniqueness, 
                // also binds click and enter events on categories on left.
                function populateCategoriesAndHandleCategoryClick() {
                    $(categoryList).each(function () {
                        var category = $(this).attr('data-title');
                        var isCreationAllowed = $(this).attr(fullDataTypes.CalendarAllowEventAddCategory);
                        var isOpenInNewTab = $(this).attr(fullDataTypes.CalendarOpenInNewTab);
                        var categoryTrimmed = trimText(category);

                        categoriesArrayTrimmed.push(categoryTrimmed);
                        var url = $(this).attr(fullDataTypes.Url);

                        if (isCreationAllowed == "1" && isOpenInNewTab == "0") {
                            // ensure event creation is allowed on this category and this category is not required to be opened in new tab.                            
                            categoriesArray.push(category); // This list only contains the categories that allow event creation.

                            $(this)
                                .keypress(function(e) { //bind to enter event (for accessibility).
                                    if (e.which == 13 || e.keyCode == 13) {
                                        processAjaxGet(url, categoryTrimmed);
                                    }
                                });
                        }
                    });
                }

                // Populates the array of categories which will be used in a Dialog box for adding a new event. Excludes 
                function populateCategoriesList(dialogContainer) {

                    // populate categories.  
                    var selectMenu = $(dialogContainer).find('.radio-button-list');

                    $(selectMenu).empty();                    
                    $(categoriesArray).each(function (index) {

                        var option = categoriesArray[index];

                        var trimmedOption = trimText(option); // all whitespaces and /g indicates global flag.
                        var selectedTag = '';
                        if (index == 0) {
                            selectedTag = 'checked';
                        }
                        var radio = '<input id=\'rd-' + trimmedOption + '\' type=\'radio\' name=\'group1\' ' + selectedTag + '  value=\'' + trimmedOption + '\'> <label for=\'rd-' + trimmedOption + '\'>' + option + '</label> <br>';

                        $(selectMenu).append(radio);
                    });
                   
                }

                // Shows the modal requesting which Category user wishes to create event for.
                function showCategoryModal(dialogContainer, start, end) {

                    // populate categories.  
                    var selectMenu = $(dialogContainer).find('.radio-button-list');
                    $(selectMenu).empty();
                    if (!end) { end = start;}
                    categoryList.each(function (em) {                        
                        var category = $(this);
                        if (category.attr(fullDataTypes.CalendarAllowEventAddCategory) == "1" && category.attr(fullDataTypes.CalendarOpenInNewTab) == "1") { // ONLY FOR CATEGORIES THAT 'ALLOW CREATION' of events that OPEN in WINDOW instead of modal.
                            var startString = '', endString = '';
                            startString = start ? start.format() : '';
                            endString = end ? end.format() : '';
                            // remove timezone part.
                            if (startString.indexOf('+') != -1) {
                                startString = startString.substr(0, startString.indexOf('+'));
                            }
                            if (endString.indexOf('+') != -1) {
                                endString = endString.substr(0, endString.indexOf('+'));
                            }
                            var url = category.attr(fullDataTypes.Url);
                            var separator = '&';
                            if (url.indexOf('?') == -1) {
                                separator = '?';
                            }
                            var href = url + (startString != '' ? separator + 'start=' + startString : '') + (endString != '' ? '&end=' + endString : '');
                            var categoryName = category.attr('data-title');
                            var link = '<a class="contract-picker" href="' + href + '"><div class="widget-stats widget ' + category.attr('data-bg') + '"><div class="stats-number">' + categoryName + '</div></div></a>';
                            $(selectMenu).append(link);
                            if (em == 0) { // update the heading / title of modal.                                
                                $(dialogContainer).find('.modal-title').text('Create on ' + start.format('DD/MM/YYYY h:mm a') + ' to ' + end.format('DD/MM/YYYY h:mm a'));
                            }
                        }
                    });
                }

                // This method is responsible for handling click on '+' (plus) button or when user clicks anywhere on the calendar with intention of adding new event. 
                //List of categories will be shown in Modal for user to add event for that category.
                function HandleEventAddClick(categorySelected, start, end)
                {
                    if (categorySelected != undefined && $.inArray(categorySelected, categoriesArrayTrimmed) != -1 ) {
                        addNewEvent(categorySelected);

                    } else {
                        var categoriesThatOpenInNewTab = categoryList.filter(function(){ return $(this).attr(fullDataTypes.CalendarOpenInNewTab) != "0";}).length;                        
                        // default to first category if that is the only category specified. This check is done inside the functions calling this function.
                        // check for length of Categories.
                        if (categoryList.length == 0) {
                            return;
                        }
                        // User will still have to choose category.
                        //else if (categoriesArray.length == 1) {
                        //    addNewEvent(trimText(categoriesArray[0]));
                        //}
                        else if (categoriesThatOpenInNewTab == 0) {
                            populateCategoriesList(dialogDiv);
                            dialog = $(dialogDiv).modal({ keyboard: false, backdrop: 'static' }); // Keyboard: true Closes the modal when escape key is pressed.
                            // handle submit
                            // unbind the previously bound event.
                            dialogDiv.find('form').off('submit');
                            selectCategoryform = dialogDiv.find('form').on('submit', function (event) {
                                event.preventDefault();
                                event.stopPropagation();
                                addNewEvent();
                            });
                        } else {
                            showCategoryModal(dialogDiv, start, end);
                            $(dialogDiv).modal({ keyboard: false, backdrop: 'static' });
                        }
                    }
                }


                // This method will be called when user has clicked anywhere on calendar with the intention of adding new event.
                function addNewEvent(preselectedCategory) {
                    var categorySelected = preselectedCategory;
                    // Opens a dialog box that allows user to select the category for the new event.                    
                    if (selectCategoryform != undefined){
                        categorySelected = $(selectCategoryform).find('input[type]:checked').val();
                    }
                    categorySelected = categorySelected == undefined ? categoriesArrayTrimmed[0] : categorySelected;

                    if ($.inArray(categorySelected, categoriesArrayTrimmed) != -1) {

                        //TODO: This is where you will load a Modal with view-model properties.
                        closeModal();//$(dialogDiv).modal('hide');

                        var attribute = 'div[' + fullDataTypes.CalendarCategory + '="' + categorySelected + '"]';

                        var url = undefined;
                        $(categoryList).each(function () {
                            var attributeValue = $(this).attr(fullDataTypes.CalendarCategory);
                            if (attributeValue == categorySelected) {
                                url = $(this).attr(fullDataTypes.Url);
                                return false;
                            }
                        });
                        processAjaxGet(url, categorySelected);
                    }
                    else {
                        (dialog).dialog("close");

                    }
                }


                // This function gets all the dates that have been disabled (thus will not allow drag, drop and click events).
                function getDisabledDateList() {
                    var dateList = undefined;
                    var datesToDisable = $(currentCalendar).find('p.DatesToDisable');
                    if (datesToDisable.length == 1) {
                        datesToDisable = datesToDisable.text();
                        dateList = JSON.parse(datesToDisable);
                    }
                    return dateList;
                }

                // Determines whether the day currently being rendered has date as one of the specified disabledDates.
                function isDateDisabled(day)
                {
                    var disabled = false;
                    // check if date is in past and DisablePastDates has been set to true, otherwise whether date is one of disabled dates.                    
                    var dateObject = (day instanceof Date || typeof day.getMonth === 'function') ? day : getDateFromMoment(day);
                    if ((isPastDate(dateObject) && disablePastDates)) {
                        disabled = true;
                    }
                    else {
                        var dateList = getDisabledDateList();

                        $.each(dateList, function (e) {
                            var currentDisabledDay = dateList[e];
                            // if day is already typeof Date then don't attempt to convert it from Moment.
                            var dateRendering = new Date(dateObject);
                            var momentObject = moment(currentDisabledDay);
                            var disabledDate = getDateFromMoment(momentObject);
                            if (disabledDate.getHours() == 0) // if only date portion is specified then ignore the time portion.
                            {
                                dateRendering.setHours(0, 0, 0, 0);
                            }
                            if (disabledDate.getTime() == dateRendering.getTime()) {
                                disabled = true;
                            }
                        });
                    }
                    return disabled;
                }

                // Hides the tooltip.
                function HideToolTip(element) {
                    var toolTip = element ? $('.toolTip[' + fullDataTypes.CalendarToolTipTag + ' =' + $(element).attr('href') + ']') : $('.toolTip[' + fullDataTypes.CalendarToolTipTag + ']');
                    $(toolTip).css('display', 'none');
                }

                // Shows alert that Date has been disabled.
                function showDisabledDateAlert(heading, message) {
                    heading = heading == undefined ? 'Error' : heading;
                    message = message == undefined? "Adding events is not permitted on disabled dates." : message;
                    var modalBodyContent = '<div class=\"alert alert-danger\"> <h4>' + heading + '</h4>' + "<p>" + message + "</p></div>";
                    var modalId = 'calendar-date-disabled';
                    var closeButton = '<div class="modal-footer"><a class="btn btn-sm btn-white" href="javascript:;" data-dismiss="modal">Close</a></div>';
                    var disabledDateModal = $rhea.makeModalDialogElement( "", modalBodyContent, closeButton, modalId);
                    $rhea.showModalDialogElement(disabledDateModal);
                    disabledDateModal.find('.modal-footer a[data-dismiss="modal"]').click(function (e) { $rhea.dismissModalDialogElement(disabledDateModal); });
                }                
                
                gotoDate = (gotoDate != undefined) ? gotoDate : undefined;

                var calendarDiv = $(currentCalendar).find("#calendar"); // TODO: change this from ID to className.                
                calendar = $(calendarDiv).fullCalendar({
                    weekends: $(currentCalendar).attr(fullDataTypes.CalendarShowWeekends) == 'false' ? false : true,
                    header: topButtonsString,
                    columnFormat: "ddd D/M",
                    firstDay: 1, // Monday
                    timeFormat: 'h(:mm) a',
                    timezone: 'local',
                    displayEventEnd : true,
                    titleFormat:
                    {
                        month: 'MMMM YYYY',
                        week: 'D MMM YYYY',
                        day: 'D MMMM YYYY'
                    },
                    selectable:
                    {
                        // this is called ViewOptionHash
                        day: true,
                        week: true, // support selection on week view.
                        'default': false
                    },
                    selectHelper: false, // Whether to draw "Placeholder" event while user is dragging.
                    selectOverlap: true, // Allowed in all cases.
                    select: function (start, end, jsEvent, view) {
                        if (calendarObject != undefined && calendarObject.ShowFormInModal == true) {
                            var startObject = getDateFromMoment(start);
                            // first check if the date is not disabled.
                            var dateDisabled = isDateDisabled(startObject);


                            if (!$(this).hasClass('disabled') && !dateDisabled) {
                                var allDay = false;
                                allDay = start.toString().indexOf('00:00:00') > -1;

                                endTime = getDateFromMoment(end); //date.format("DD/MM/YYYY HH:mm A");
                                startTime = startObject;
                                HandleEventAddClick(undefined, start, end);
                            } else {
                                showDisabledDateAlert();
                            }
                        }
                        calendar.fullCalendar('unselect');
                    },
                    droppable: true,
                    defaultView: defaultView,
                    eventLimit: {
                        week: calendarObject.EventLimitWeekDay > 0 ? calendarObject.EventLimitWeekDay : calendarObject.EventLimit,
                        day: calendarObject.EventLimitWeekDay > 0 ? calendarObject.EventLimitWeekDay : calendarObject.EventLimit,
                        month: calendarObject.EventLimit,
                        'default': true
                    },
                    // eventLimitClick: "week", // Whether to display overlay or go to other view.

                    //dragOpacity:{
                    //    'default': 0.5
                    //},

                    eventBackgroundColor: $(currentCalendar).attr(fullDataTypes.CalendarBackgroundEventColour),

                    dayClick: function (date, jsEvent, view) {
                        if (calendarObject != undefined && calendarObject.ShowFormInModal == true) {
                            var dateObject = getDateFromMoment(date);
                            // first check if the date is not disabled.
                            var dateDisabled = isDateDisabled(dateObject);
                            if (!$(this).hasClass('disabled') && !dateDisabled) {
                                var allDay = false;
                                allDay = date.toString().indexOf('00:00:00') > -1;

                                var dateCopy = getDateFromMoment(date); //date.format("DD/MM/YYYY HH:mm A");
                                startTime = dateObject;
                                endTime = dateCopy;
                                if (!allDay) {
                                    endTime.setMinutes(endTime.getMinutes() + DefaultSessionTime);
                                }
                                HandleEventAddClick(undefined, date);
                            }
                            else if(view.name == 'month') { // select: event also fires when clicked, this ends up showing the disabled modal twice (for day and week view as they are 'selectable'), therefore we check here that only to show this on 'month' view which is not 'selectable'.
                                showDisabledDateAlert();
                            }
                        }
                    },

                    // for adjusting the height of calendar.
                    //contentHeight: 1500,
                    height: 700, //Zeus: attempting to fix 'Flickering calendar' issue jquery.flot.resize triggers 'resize' event that causes calendar to re-adjust its height when it is set to auto, hence here we set it to 700.

                    drop: function (date, jsEvent, ui)
                    {
                        var categoryDiv = $(this);
                        // Only allow categories that have 'AllowCreation' set to true to be dragged and dropped AND categories that don't require to be opened in new tab.
                        var categoryCreationAllowed = categoryDiv.attr(fullDataTypes.CalendarAllowEventAddCategory) == "1" && categoryDiv.attr(fullDataTypes.CalendarOpenInNewTab) == "0";
                        if (categoryCreationAllowed) {
                            if (!isDateDisabled(date)) {

                                var categoryname = $(categoryDiv).attr(fullDataTypes.CalendarCategory);
                                var categoryUrl = $(categoryDiv).attr(fullDataTypes.Url);
                                var allDay = false;
                                allDay = date.toString().indexOf('00:00:00') > -1;
                                var dateObject = getDateFromMoment(date);
                                var dateCopy = getDateFromMoment(date); //date.format("DD/MM/YYYY HH:mm A");
                                startTime = dateObject;
                                endTime = dateCopy;
                                if (!allDay) {
                                    // check if this category has specific Default Session Time specified.
                                    if(categoryDiv.attr(fullDataTypes.CalendarDefaultSessionTime) != undefined &&
                                        parseInt(categoryDiv.attr(fullDataTypes.CalendarDefaultSessionTime)) > 0) {
                                        var value = parseInt(categoryDiv.attr(fullDataTypes.CalendarDefaultSessionTime));
                                        endTime.setMinutes(endTime.getMinutes() + value);
                                        // DefaultSessionTime = value; DO NOT SET this otherwise it will affect the categories that haven't been specified with Default Value, in that case we will be using preset value or calendar specific.
                                    } else {
                                        endTime.setMinutes(endTime.getMinutes() + DefaultSessionTime); // just use the default (either preset or from calendar) if not specified on category.
                                    }
                                }
                                processAjaxGet(categoryUrl, categoryname);
                            } else {
                                showDisabledDateAlert();
                            }
                        } else {
                            showDisabledDateAlert('Error', 'New events for this category cannot be created.');
                        }
                    },

                    eventDrop: function (event, delta, revertFunc, jsEvent, ui, view)
                    {
                        var startSession, endSession;
                        startSession = getDateFromMoment(event.start);
                        if (event.end != undefined) {
                            // For all day events. 
                            endSession = getDateFromMoment(event.end);
                        }
                        var eventInContext = $(this);
                        if ((startSession != undefined && !isDateDisabled(startSession)) || (endSession != undefined && !isDateDisabled(endSession))) {
                            var mycallback = function () {
                                var url = eventInContext.attr(fullDataTypes.CalendarDragResizeAction);
                                url = url == undefined ? event.dragUrl : url;
                                processEventDragResize(url, startSession, endSession, revertFunc, event.category); // response from AJAX call.
                            };
                            showConfirmation(event.category, mycallback, revertFunc);

                        }
                        else {
                            $(eventInContext).css('cursor', 'no-drop');
                            showDisabledDateAlert();
                            revertFunc();
                        }
                        HideToolTip(eventInContext);
                    },

                    eventResize: function (event, delta, revertFunc, jsEvent, ui, view)
                    {
                        var eventInContext = $(this);
                        var startSession, endSession;
                        startSession = getDateFromMoment(event.start);
                        if (event.end != undefined) {
                            endSession = getDateFromMoment(event.end);
                        }
                        // Disable re-sizing in 'Month' view
                        if (view.name.indexOf(MonthView) == 0) {
                            revertFunc();
                        }
                        else if ((startSession != undefined && !isDateDisabled(startSession)) || (endSession != undefined && !isDateDisabled(endSession))) {//else if (!isDateDisabled(startSession) || !isDateDisabled(endSession)) {
                            // ensure that start and end session times are not disabled. If they are disabled we will not allow resizing of the event in that slot.
                            var callbackFunc = function () {
                                var url = eventInContext.attr(fullDataTypes.CalendarDragResizeAction);
                                url = url == undefined ? event.dragUrl : url;
                                processEventDragResize(url, startSession, endSession, revertFunc, event.category); // response from AJAX call. 
                            };
                            showConfirmation(event.category, callbackFunc, revertFunc);

                        }
                        else {
                            showDisabledDateAlert();
                            revertFunc();
                        }
                        HideToolTip(eventInContext);
                    },

                    eventClick: function (event, jsEvent, view) {

                        jsEvent.preventDefault();// prevent navigating to different page.
                        
                        var eventAnchor = $(this);
                        var eventUrl = $(eventAnchor).attr(fullDataTypes.Url);
                        if (event.opensInNewTab) {
                            // Open this in new tab, instead of a modal.
                            var newWindow = window.open(event.url, '_self'); // doesn't actually open in new tab.
                            //newWindow.focus(); // focusing the new tab. NO NEED as IE and Chrome already bring the new tab in focus.
                        } else {
                            eventUrl = eventUrl == undefined ? event.dataUrl : eventUrl;
                            editEvent(eventUrl, event.category);
                        }
                    },

                    viewRender: function (view, element)
                    {
                        var prevButton = $(currentCalendar).find('button.fc-prev-button');
                        var nextButton = $(currentCalendar).find('button.fc-next-button');
                        var viewStart = getDateFromMoment(view.start);
                        var viewEnd = getDateFromMoment(view.end);

                        // set proper hidden text.
                        var viewName = 'day';
                        if (view.name == 'month') {
                            viewName = 'month';
                        }else if (view.name == 'agendaWeek') {
                            viewName = 'week';
                        }
                        root.find(currentCalendar).find('.fc-prev-button .readers').text('Previous ' + viewName);
                        root.find(currentCalendar).find('.fc-next-button .readers').text('Next ' + viewName);

                        if(viewStart <= minEditableDate){ // Date that is rendered.
                            // disable next button
                            $(prevButton).attr('disabled', 'disabled');
                        }
                        else if (viewStart > minEditableDate) {
                            // enable next button
                            $(prevButton).removeAttr('disabled');
                        }
                        if (viewEnd > maxEditableDate) { // viewEnd always gives next one day (not currently rendered).
                            // disable next button
                            $(nextButton).attr('disabled', 'disabled');
                        }
                        else if (viewEnd < maxEditableDate) {
                            // enable next button 
                            $(nextButton).removeAttr('disabled');
                        }
                        // Store current date and view in local storage so upon post-back user will be shown the last view.
                        var currentDate = moment(view.start); // create a new  moment object (which will have its own memory reference)
                        currentDate = view.name == 'month' ? currentDate.add(1, 'M') : currentDate; // If in Month view, always add one to the month because the actual view.start on Month view is from previous month.
                        var dateFormatted = currentDate.format("DD/MM/YYYY");
                        sessionStorage[SessionStorageDateKey] = dateFormatted;
                        sessionStorage[SessionStorageViewKey] = view.name;
                        // Hide all tooltips
                        HideToolTip();
                        // Update gotoDate field
                        if (gotoDateInput.val() != dateFormatted) {
                            gotoDateInput.val('');
                        }
                    },

                    dayRender: function(day, cell)
                    {
                        if(isDateDisabled(day))
                        {
                            //alert('This date will be disabled.' + disabledDate.toString() + ' ' + $(cell).innerHTML);
                            //alert(cell.length +' '+ cell.tagName);
                            $(cell).addClass('disabled');
                        }

                    },

                    eventRender: function(event, element)
                    {
                        // Describe the contents of events being rendered.
                        var mediaObject = (event.media) ? event.media : '';
                        var description = (event.description) ? event.description : '';

                        var toolTipTag = fullDataTypes.CalendarToolTipTag + '="' + $(element).attr('href') + '"';
                        element.find('.fc-title').after($("<span class=\"fc-event-icons\"><span>").html(mediaObject));
                        element.find('.fc-title').after('<div>' + description + '</div>'); // Remove black space between description and title.

                        // Only show tooltip for the events that actually have some text as description. (Especially applicable for background events).
                        if (event.description != undefined || event.toolTipDescription != undefined) {
                            var hoverText = $('<small class="toolTip" ' + toolTipTag + '>' + (event.toolTipDescription == undefined ? description : event.toolTipDescription) + '</small>');

                            var toolTip = $('.toolTip[' + toolTipTag + ']'); //fullDataTypes.CalendarToolTipTag + '=' + $(element).attr('href')
                            // Check to see if this hover text hasn't already been added to body.
                            if ($(document).find($(toolTip)).length == 0) {
                                $('body').append(hoverText);
                                toolTip = $('.toolTip[' + toolTipTag + ']');
                            }
                            var toolTipWidth = toolTip.width();
                            var toolTipHeight = toolTip.height();
                            var calendarWidth = calendarDiv.width();
                            $(element)
                                .focusin(function (e) {
                                    var elementPosition = $(element).offset();
                                    $(toolTip).css('display', 'block');
                                    $(toolTip).css('border-color', $(element).css('background-color'));
                                    $(toolTip).css('top', elementPosition.top);
                                    $(toolTip).css('left', elementPosition.left - window.pageXOffset + 100 - toolTipWidth);
                                    var offScreen = $(toolTip).is(':toolTipOffscreen');
                                    if (offScreen.leftNeg) {
                                        $(toolTip).css('left', Math.abs($(toolTip).offset().left));
                                    }
                                    else if (offScreen.leftPos) {
                                        $(toolTip).css('left', ($(toolTip).offset().left - 100 - toolTipWidth));
                                    }
                                    if (offScreen.topNeg) {
                                        $(toolTip).css('top', Math.abs($(toolTip).offset().top));
                                    }
                                    else if (offScreen.topPos) {
                                        $(toolTip).css('top', ($(toolTip).offset().top - toolTipHeight));
                                    }
                                })
                                .mouseover(function (e) {
                                    $(toolTip).css('display', 'block');//fadeIn(300);
                                    $(toolTip).css('border-color', $(element).css('background-color'));// set border according to event's background.
                                });

                            $(element).mousemove(function (e) {
                                $(toolTip).css('top', e.pageY + 5);
                                if (toolTipWidth + 20 > calendarWidth - e.pageX) { // ensure tooltip doesn't go off screen.
                                    $(toolTip).css('left', e.pageX - window.pageXOffset - 20 - toolTipWidth);
                                }
                                else {
                                    $(toolTip).css('left', e.pageX - window.pageXOffset + 20);
                                }
                            });

                            $(element)
                                .focusout(function (e) {
                                    $(toolTip).css('display', 'none');
                                })
                                .mouseout(function (e) {
                                    $(toolTip).css('display', 'none');//.fadeOut(300);
                                });
                        }

                    },

                    editable: true, // by default we set all events to editable, but override this property when rendering individual events.

                    events: new function () {

                        // get list of categories for this calendar
                        var eventList = [];

                        if (categoryList != undefined && categoryList.length) {

                            // Minimize the CategoryList if only one category is declared.
                            if (categoryList.length == 1)
                            {
                                $(hideCategoriesButton).click();
                            }

                            // Logic:
                            //  Iterate through all the Categories
                            //      URL = Get the url for the category. You should know name of current category, then find the div.
                            //      Iterate through all the items for current category
                            //          add these items into events[] array here
                            //          get the Id of the current item, and pass that in url.

                            $.each(categoryList, function () {

                                var currentCategory = $(this);
                                var categoryName = $(currentCategory).attr(fullDataTypes.CalendarCategory); // trimmed category Name.
                                var categoryColor = $(currentCategory).attr('data-bg');
                                var categoryMedia = $(currentCategory).attr('data-media');
                                var categoryUrl = $(currentCategory).attr(fullDataTypes.Url);
                                var categoryClickable = $(currentCategory).attr(fullDataTypes.IsCategoryItemClickable);
                                var dragResizeUrl = $(currentCategory).attr(fullDataTypes.CalendarDragResizeAction);
                                var jsonAttributeForCurrentCategory = '[' + fullDataTypes.CalendarCategoryEventList + '=' + categoryName + ']';
                                var opensInNewTab = $(currentCategory).attr(fullDataTypes.CalendarOpenInNewTab);

                                var jsonContainer = $(calendarDiv).find(jsonAttributeForCurrentCategory);
                                if (jsonContainer != undefined) {

                                    var text = $(jsonContainer).text();
                                    if (text != undefined && text != '') {
                                        var serializedJson = $.parseJSON(text);// Alternative to JSON.parse(text);

                                        $.each(serializedJson, function () {

                                            var currentEventData = $(this)[0];
                                            var startSession = currentEventData.Start != undefined ? (currentEventData.Start) : new Date(); //getDateFromJSON(currentEventData.Start)
                                            var endSession = currentEventData.End != undefined ? (currentEventData.End) : new Date();  // getDateFromJSON(currentEventData.End) 
                                            var pastDateClass = getPastDateClass(endSession);
                                            // URL--> var categoryDiv = $(currentCalendar).children('div[data-title="@category.Type"]'); //where @category.Type is the current category being processed.
                                            var correctedDataUrl = categoryUrl + (categoryUrl.indexOf('?') >= 0 ? '&id=' : '?id=') + currentEventData.Id;
                                            var urlHref = currentEventData.IsClickable && categoryClickable == "1" ? currentEventData.Id : currentEventData.Id + "#_NonClickable";
                                            if (opensInNewTab == "1" && urlHref.indexOf("#_NonClickable") == -1) { // event is clickable
                                                urlHref = correctedDataUrl;
                                            }
                                            var currentEvent =
                                            {
                                                id: currentEventData.Id,
                                                title: currentEventData.Title, // C# properties for CategoryItemViewModel Title, Description, Start and End (both DateTime).
                                                start: startSession,
                                                end: endSession,
                                                dow: currentEventData.DOW,
                                                className: (currentEventData.SpecialColour != undefined && currentEventData.SpecialColour != '' ? ('bg-' + currentEventData.SpecialColour.toLowerCase()) : categoryColor) + pastDateClass, // if CategoryItemViewModel has specified SpecialColour then use it otherwise use the category colour.
                                                media: categoryMedia, // CategoryViewModel properties: Color, Icon,
                                                description: currentEventData.EventDescriptionHtml,
                                                toolTipDescription: currentEventData.ToolTipDescriptionHtml,
                                                url: urlHref, // javascriptUrl, 
                                                allDay: currentEventData.AllDay,
                                                dataUrl: (currentEventData.IsClickable && categoryClickable == "1" ? correctedDataUrl : "#_NonClickable"), // check if some query string has already been specified or not.
                                                dragUrl: dragResizeUrl == undefined ? undefined : (dragResizeUrl + '?id=' + currentEventData.Id),
                                                category: categoryName,
                                                opensInNewTab: opensInNewTab == "1" && currentEventData.IsClickable && categoryClickable == "1",
                                                constraint: trimText(currentEventData.BackgroundEventIdentifier), // Background event Identifier for this event.
                                                editable: dragResizeUrl != undefined && currentEventData.IsEditable   // if url is specified & isEditable (by default is set to true) then event is draggable and resizable.
                                            };
                                            eventList.push(currentEvent);
                                        });
                                        // Remove JSON data from markup.
                                        //$(jsonContainer).empty();
                                    }
                                }
                            });

                            // Process Background event data here.
                            var backgroundData = $(currentCalendar).find(backgroundEventDataSelector);
                            if (backgroundData.length == 1) {
                                var data = backgroundData.text();
                                if (data != undefined && data != '')
                                {
                                    var backgroundEvents = JSON.parse(data);
                                    $.each(backgroundEvents, function () {
                                        var currentBackgroundEvent = $(this)[0];
                                        //alert(currentBackgroundEvent.DOW);//alert(currentBackgroundEvent.Start + ' ' + currentBackgroundEvent.End + ' ' + data);
                                        var newBackgroundEvent = {
                                            id: trimText(currentBackgroundEvent.BackgroundEventIdentifier),
                                            start: currentBackgroundEvent.Start != undefined ? (currentBackgroundEvent.Start):new Date(), //(getDateFromJSON(currentBackgroundEvent.Start)),
                                            end:   currentBackgroundEvent.End != undefined ? (currentBackgroundEvent.End)  : new Date(),//(getDateFromJSON(currentBackgroundEvent.End)),
                                            dow: currentBackgroundEvent.DOW,
                                            rendering: 'background',
                                            color: currentBackgroundEvent.BackgroundEventColor
                                        };
                                        if(currentBackgroundEvent.DroppingAllowed == 0)
                                        {
                                            newBackgroundEvent.overlap = false;
                                        }
                                        eventList.push(newBackgroundEvent);
                                    });
                                }
                            }
                        }
                        return eventList;
                    },

                    eventAfterAllRender: function (view) {
                        // Triggers when all events have been rendered as a result of change in a view or date range change.
                        FullCalendarOverrides.applyChangesToCalendar(currentCalendar);
                        
                        // Responsible for hiding the spinner while calendar is rendering events.
                        var panelLoadingClass = 'panel-loading';
                        calendarPanel.find('.panel-body div.panel-loader').remove();
                        calendarPanel.removeClass(panelLoadingClass);
                    }
                });

                UpdateCalendarGotoDate(gotoDate);

                // Bind to Date input so when the value is changed we update the calendar go to date.
                // Updates the calendar to go to this date.                
                function UpdateCalendarGotoDate(date) {
                    var handle;

                    var validateDate = function(dateSelected, userSelect) {
                        if (dateSelected != undefined || (dateSelected != undefined && dateSelected.trim() != '')) {
                            var dateFormat = typeof(dateSelected) == 'string' ? $.zeusValidate.parseDateValue(dateSelected) : dateSelected; // In case where goto date is obtained from server (not stored in session), this will type of Date.
                            if (dateFormat != null) {
                                var outOfRangeMessage = 'Select a date within the search (From, Look Ahead) ' + minEditableDate.toString("dd/MM/yyyy") + ' - ' + maxEditableDate.toString("dd/MM/yyyy");
                                if (dateFormat >= minEditableDate && dateFormat <= maxEditableDate) {
                                    $(calendarDiv).fullCalendar('gotoDate', moment(dateFormat));
                                }
                                else if (dateFormat > maxEditableDate && userSelect) { // Show message only when user has selected the date from datepicker.
                                    showDisabledDateAlert(undefined, outOfRangeMessage);
                                    //$(calendarDiv).fullCalendar('gotoDate', moment(maxEditableDate));
                                }
                                else if (dateFormat < minEditableDate && userSelect) {
                                    showDisabledDateAlert(undefined, outOfRangeMessage);
                                    //$(calendarDiv).fullCalendar('gotoDate', moment(minEditableDate));
                                }
                                if (userSelect) {
                                    calendarDiv.fullCalendar('changeView', AgendaDayView); // go to day view only when user selects date from date-picker.
                                }
                            }
                        }
                    }

                    if (date != undefined) {
                        //$(calendarDiv).fullCalendar('gotoDate', date);
                        validateDate(date);
                    }
                    gotoDateInput.off('change');
                    gotoDateInput.on('change', function (e) {
                        var input = $(this);
                        // We set the handle to avoid this function getting called multiple times.
                        // The reason for this is that 'change' event gets fired at least 3 times when user changes the date from date picker.
                        // We assume these events are getting fired with 10 milliseconds, hence our setTimeout function only goes for 10 milliseconds.
                        // First, we clear the Handle and then reassign it. Because the reassigning part (setTimeout) occurs after the clear handle, it will get executed last.
                        clearTimeout(handle);
                        handle = setTimeout(function () {
                            var dateSelected = $(input).val();                            
                            validateDate(dateSelected, true);
                        }, 10);
                    });
                }

                // Bind to 'AddEvent' link.
                var selector = 'a[' + fullDataTypes.CalendarEventAddBtn + '=true]';
                $(selector).click(function (e) {
                    var anchorTag = $(this);
                    var hrefVal = $(anchorTag).attr('href');
                    // Only process for tags with 'href="#"' otherwise if they have URL then they are meant to open in page and not in modal. 
                    if (hrefVal == "#") {
                        startTime = new Date();
                        endTime = new Date();
                        endTime.setMinutes(endTime.getMinutes() + DefaultSessionTime);
                        var categoryClicked = $(this).attr(fullDataTypes.FieldPrefix);
                        if (categoryClicked != undefined) {
                            categoryClicked = trimText(categoryClicked); // $.zeusValidate.replaceAll(categoryClicked, ' ', '');
                        }
                        HandleEventAddClick(categoryClicked);
                    }
                });

                // Bind to 'Today' button
                var todayBtn = calendarDiv.find('.fc-today-button');
                if (todayBtn != undefined && todayBtn.length == 1) {
                    $(todayBtn).click(function(e) {
                        e.preventDefault();
                        UpdateCalendarGotoDate(moment().format("DD/MM/YYYY")); //today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear() getMonth() value is 0 based.
                    });
                }

                // Initialize the external events
                //var externalEvents = $(currentCalendar)
                $('#external-events .external-event').each(function () {

                    var eventObject = {
                        title: $.trim($(this).attr('data-title')),
                        className: $(this).attr('data-bg'),
                        media: $(this).attr('data-media'),
                        description: $(this).attr('data-desc')
                    };

                    $(this).data('eventObject', eventObject);

                    $(this).draggable({
                        zIndex: 999,
                        revert: true,
                        revertDuration: 0
                    });
                });


                // This can further be enhanced by placing inside window resize event, which repopulates the URLs in anchor tag of events.
                // The reason for placing this inside resize event is that calendar is re-rendered when window is re-sized, so we will loose all the URLs added
                // in anchor tags.
                //UpdateIds();
                var height, width = 0;
                $(document).resize(function () {
                    // sometimes window resize gets fired multiple times, even at the same width and height. Therefore we will compare the height & width of window to 
                    // check if they are same from previous call.
                    if (height != window.innerHeight || width != window.innerWidth) {
                        height = window.innerHeight;
                        width = window.innerWidth;
                        //UpdateIds();
                    }
                });

                placement();
                function placement() {
                    // place 'Add' button next to view buttons.
                    var addBtn = calendarDiv.closest('.panel-body').find('.categoryListSplitButton');
                    addBtn.css('top', '-12px');
                    calendarDiv.find('.fc-toolbar .fc-right').append(addBtn);
                }

                // This function allows list of categories to be hidden upon button press.
                function RegisterHideCategoriesButtonClick()
                {
                    $(hideCategoriesButton).click(function (e) {
                        e.preventDefault();
                        var text = $(hideCategoriesButton).text();
                        if($(categoriesListOuterDiv).hasClass('hidden')){
                            $(categoriesListOuterDiv).removeClass('hidden');
                            //$(categoriesListOuterDiv).css('display', 'none');
                            $(hideCategoriesButton).html( $.zeusValidate.replaceAll(text, 'Show', 'Hide') +  expandIcon);
                        }
                        else {
                            $(categoriesListOuterDiv).addClass('hidden');
                            //$(categoriesListOuterDiv).css('display','none'); // the reason to explicitly add this is because 'style-responsive.css' has set IMPORTANT for display:block on Vertical-box-column class.
                            $(hideCategoriesButton).html($.zeusValidate.replaceAll(text, 'Hide', 'Show') + collapseIcon);
                        }
                    });
                }

                // Responsible for showing the spinner while calendar is rendering events.
                setTimeout(function() {
                    calendarPanel.find('.fc-button').mousedown(function(event) {
                            showSpinner($(this));
                        })
                        .off('keypress.zeus-calendar-spinner')
                        .on('keypress.zeus-calendar-spinner', function(e) {
                            if (e.which == 13 || e.which == 10) {
                                e.preventDefault();
                                e.stopPropagation();
                                showSpinner($(this));
                            }
                        });

                    function showSpinner(button) {
                        // Ensure that not the active element.
                        if (!button.hasClass('fc-state-active') && !button.is(':disabled')) {// check again whether button is disabled, because the state changes upon view and this function (i.e. mousedown event registration above) takes place at window load.
                            var spinner = $('<div class="panel-loader"><span class="spinner-small"></span></div>');
                            var panelLoadingClass = 'panel-loading';
                            if (!calendarPanel.hasClass(panelLoadingClass)) {
                                calendarPanel.addClass('panel-loading');
                                calendarPanel.find('.panel-body').prepend(spinner);
                            }
                            setTimeout(function() {
                                button.click();
                            }, 300); // Increased timeout here ensures that UI (Spinner) is processed first.
                        }
                    }
                }, 20);

                return false;// So you only apply this on first calendar.
            });

            // Bind to 'enter event'.
            $('.fc-event-container .fc-event').each(function (eq) {
                var eventAnchor = $(this);
                $(this).bind('keypress', function (event) {
                    if (event.keyCode == 13 || event.which == 13) // bind to 'Enter'.
                    {
                        event.preventDefault();// prevent navigating to different page. 
                        var eventUrl = $(eventAnchor).attr(fullDataTypes.Url);
                        var category = $(eventAnchor).attr(fullDataTypes.CalendarCategory);
                        editEvent(eventUrl, category);
                    }
                });
            });
        },


        equaliseReadOnlyViews: function() {
            var root = $(this.element) || $(document);
        
            var unorderedListContainerSelector = root.find('ul.displayContainer');

            // Responsible for determining whether the list-items are stacked on top of each other (when window is not maximised).
            var listItemsStacked = function(currentRow) {
                var stacked = true;
                //var listItemsR1 = $(container).find('li[data-row="r' + 1 + '"]');
                if (currentRow.length >= 2) {
                    var listItem1 = $(currentRow)[0];
                    var listItem2 = $(currentRow)[1];
                    var top1 = $(listItem1).offset().top;
                    var top2 = $(listItem2).offset().top;
                    if (top1 != top2) {
                        stacked = true;
                    } else {
                        stacked = false;
                    }
                }
                return stacked;
            };

            if (unorderedListContainerSelector.length >= 1) {

                processEqualising();

                $(window).resize(function () { setTimeout(processEqualising, 100); });
            }

            // Responsible for equalising the height of list-items.
            function equaliser(container) {

                // Forcefully remove the previous height style.
                if (container != undefined && container.length > 0) {
                    var listItems = (container).find('li.definitionProperty');
                    if (listItems != undefined && listItems.length > 0) {
                        listItems.removeAttr('style');
                    }
                }

                for (var i = 0; i < 1000 ; i++) {
                    var rowClass = "'" + i + "'"; //r
                    var rowSelector = 'li[' + fullDataTypes.ReadOnlyViewRow + '=' + rowClass + ']';
                    var currentRow = (container).find(rowSelector);

                    if (currentRow.length == 0) {
                        break; // break out of the loop.                    
                    }

                    // TODO: check if LIs' have not stacked on top of each other. If they have then don't apply equalise instead add padding.
                    // If not then apply equalise() and remove any padding.
                    if (listItemsStacked(currentRow)) {
                        (currentRow).addClass('defPropertyExtraPadding');
                        (currentRow).removeAttr('style'); // reset height.
                    }
                    else {
                        (currentRow).removeClass('defPropertyExtraPadding');
                        (container).equalize({ children: rowSelector });
                    }

                    // SHOWS height of each list item after equalising.
                    
                    //$.each(currentRow, function () {
                    //    var currentListItem = $(this);
                    //    var heading = $(currentListItem).find('em');
                    //    if (heading.length == 1) {
                    //        $(heading).text('My height = ' + $(currentListItem).height());
                    //    } else {
                    //        $(currentListItem).append($('<em style = "display:block; color: red; text-align: right; position: relative; bottom: 24px;"> My height = ' + $(currentListItem).height() + '</em>'));
                    //    }
                    //});
                }
            }

            function processEqualising() {
                $.each(unorderedListContainerSelector, function () {
                    equaliser($(this));
                });
            } 
        },

        // This function checks if the right sidebar has any content, if not it will be hidden.
        collapseRightSidebar: function() {
            var root = $(this.element) || $(this);
            // function to make sure that each tab remembers the users choice on whether or not the right sidebar shows by default
            // relies on being called AFTER the default right sidebar function in apps.js
            var rightSideBarStayCollapsed = "rightSideBarStayCollapsed";
            var targetContainer = '#page-container';
            var targetClass = 'page-right-sidebar-collapsed';
            var screenreaderText = ' right sidebar.';
            targetClass = ($(window).width() < 979) ? 'page-right-sidebar-toggled' : targetClass;
            var toggleButton = root.find('[data-click=right-sidebar-toggled]');
            toggleButton.click(function (e) {
                if ($(targetContainer).hasClass(targetClass)) {
                    sessionStorage[rightSideBarStayCollapsed] = "true"; // deliberately strings - seesion storage can't store bools properly
                    $(targetContainer).find('.sidebar-right').css('display', 'none'); // prod defect 9278: when hidden, elements are still focusable.
                    toggleButton.find('.readers').text('Open' + screenreaderText);
                } else {
                    sessionStorage[rightSideBarStayCollapsed] = "false"; // deliberately strings - seesion storage can't store bools properly
                    $(targetContainer).find('.sidebar-right').css('display', 'inline'); // default
                    toggleButton.find('.readers').text('Close' + screenreaderText);
                }
            });

            if ($(targetContainer).hasClass(targetClass)) {
                // collapsed right-sidebar (potentially with some content) must be display none, otherwise elements within it are given focus when tabbing through.
                $(targetContainer).find('.sidebar-right').css('display', 'none'); // prod defect 9278: when hidden, elements are still focusable.
                toggleButton.find('.readers').text('Open' + screenreaderText);
            }

            var rightSidebar = $('div.sidebar-right div[data-scrollbar=true]');            
            if (rightSidebar.length > 0 && $('.page-right-sidebar-collapsed').length == 0) // check that side bar exists and it is not collapsed. Collapse class is added on page-container div.
            {
                $(rightSidebar).each(function () {
                    var content = $(this).html();                    
                    if (content == undefined || content.trim() == '' || sessionStorage[rightSideBarStayCollapsed] == "true")
                    {
                        // only trigger this collapsing when right sidebar is expanded.
                        if ($('#page-container.page-right-sidebar-collapsed').length == 0)
                        {
                            $('#page-container').addClass('page-right-sidebar-collapsed');
                            $('#page-container').removeClass('page-right-sidebar-toggled');
                        }
                        toggleButton.find('.readers').text('Open' + screenreaderText);
                    } else {
                        toggleButton.find('.readers').text('Close' + screenreaderText);
                    }
                });
            } 
            else if (rightSidebar.length == 0) {
                // if no side bar exists then, remove the button.
                $('a[data-click="right-sidebar-toggled"]').remove();
            }
        },

        processFullHeightContent: function () {
            var root = $(this.element) || $(document);
            // Adding a fake span to keep the height same.
            root.find('.full-height-scrollable, .full-height-grid-scrollable').each(function () {
                var fullHeightPanel = $(this);
                // Only look for the top-level panel-footer.
                if (fullHeightPanel.children('div.panel-footer').length == 0) {
                    fullHeightPanel.append('<div class="panel-footer"><span class="btn" style="visibility: collapse;">span</span></div>');
                }

                // Defect 13590: we added the overflow on the panel-body so no need to have overflow on this DIV.
                if (fullHeightPanel.hasClass('full-height-grid-scrollable')) {
                    checkWidth();
                    $(window).resize(checkWidth);
                }
                function checkWidth() {
                    var windowWidth = $(window).width();
                    if (windowWidth >= 1200) {
                        fullHeightPanel.find('div.zeus-table').removeClass('overflow-x-auto');
                    } else {
                        fullHeightPanel.find('div.zeus-table').addClass('overflow-x-auto');
                    }
                }
            });
        },

        dateBasedContent: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            root.find('.zeus-date-based-content').each(function () {
                var container = $(this);
                var changeTimeout;
                var datePart = container.find('.zeus-date-part');
                var contentPart = container.find('.zeus-content-part');
                var url = datePart.attr(fullDataTypes.Url);
                var dateList = datePart.attr(fullDataTypes.DateList);
                var highlightedDates = (dateList == undefined) ? [] : dateList.split(",");

                var currentDate = datePart.attr(fullDataTypes.DateTime);
                if (!currentDate) {
                    currentDate = new Date().toISOString();
                    currentDate = currentDate.replace(/T.*/, ''); // Remove the time component from the ISO string
                }

                // Hook up content URI if there is one
                if (url != undefined && url != '') {
                    datePart.datepaginator({
                        injectStyle: false,
                        selectedDate: "1000-01-01", // Dummy value, always changed to trigger the first fetch
                        onSelectedDateChanged: function () {
                            var self = $(this);
                            window.clearTimeout(changeTimeout);
                            changeTimeout = window.setTimeout(function () {
                                var selectedDate = self.find('.dp-selected').attr('data-moment');

                                var group = datePart.closest('.iscontainer');

                                var pT = group.data(dataTypes.ParentType);
                                var pN = group.data(dataTypes.PropertyNameInParent);

                                // Check for deep nested view model
                                // Find out all parent types and property name in parent values
                                var closestContainer = group.parent().closest('.iscontainer');

                                while (closestContainer.length) {
                                    pT = closestContainer.data(dataTypes.ParentType) + ',' + pT;
                                    pN = closestContainer.data(dataTypes.PropertyNameInParent) + ',' + pN;

                                    closestContainer = closestContainer.parent().closest('.iscontainer');
                                }

                                var headers = {};
                                headers[headerTypes.Ajax] = true;
                                headers[headerTypes.ParentType] = pT;
                                headers[headerTypes.PropertyNameInParent] = pN;


                                $.ajax({
                                    type: 'GET',
                                    dataType: 'html',
                                    data: { selectedDate: selectedDate },
                                    global: false,
                                    url: url,
                                    headers: headers,
                                    success: function (data) {
                                        contentPart.html(data);
                                        $rhea.prepareNewContent(contentPart);
                                    },
                                    error: function (jqXHR, status, data) {
                                        $.zeusValidate.addError('Error occurred while processing date based content.');
                                    }
                                })
                            }, 500);
                        }
                    });
                }
             
                datePart.datepaginator("setSelectedDate", currentDate);

                var refresher;
                function patchDatePaginator() {
                    datePart.find('a').each(function (index, element) {
                        var anchor = $(element);

                        // selected date styles patch
                        var moment = anchor.attr('data-moment');
                        for (var i = 0; i < highlightedDates.length; ++i) {
                            if (moment == highlightedDates[i]) {
                                anchor.addClass("zhighlight");
                        }
                        }
                        // retain focus on click patch
                        anchor.off('click.patchdatepaginator').on('click.patchdatepaginator', function (event) {
                            window.setTimeout(function () {
                                datePart.find('a').eq(index).focus();
                                clearTimeout(refresher);
                                patchDatePaginator();
                            }, 1);
                        });
                    });
                    // Add accessibility text to left/right arrows
                    var paginationList = datePart.find('ul.pagination').children();
                    if (paginationList.first().find('.readers').length == 0) {
                        paginationList.first().find('i').before($('<span>').addClass("readers").text("Previous day"));
                    }
                    if (paginationList.last().find('.readers').length == 0) {
                        paginationList.last().find('i').before($('<span>').addClass("readers").text("Next day"));
                    }

                    refresher = window.setTimeout(patchDatePaginator, 5000); // catch all for when the click code doesn't get called (e.g. on calender select, on some resizes, randomly, etc.). At 5 sec between refreshes, should have negligible performance impact.
                }
                patchDatePaginator();

                // Fix width
                var first = datePart.find('a').first();
                var last = datePart.find('a').last();
                first.width(first.width() - 1);
                last.width(last.width() - 1);
             
                // Fix icon
                datePart.find('.glyphicon-calendar').removeClass('glyphicon').removeClass('glyphicon-calendar').addClass('fa').addClass('fa-calendar');
            });
        },

        quickfinds: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            //root.find('div.resource-finder-container').appendTo(root.find('div#page-container'));
            // search method selectors
            root.find('input.qf-method-selector').on("change", function () {
                if (this.checked) {
                    $(this).closest('.history').find('.qf-method').hide();
                    $(this).closest('.history').find('.qf-method-' + $(this).val()).show();
                }
            }).trigger("change");

            // Go buttons
            root.find('.history select').on('change', function () {
                reloadPage($(this), $.zeusValidate.getValueFromInput($(this)) );
            });
            root.find('.zeus-qf').on("click", function (e) {
                // Ensure to not submit the form.
                e.preventDefault();
                e.stopPropagation();
                // Make sure form is valid (i.e. min and max values are obeyed and no alphabets are entered on fields with input type number).
                if ($(this).closest('form').valid()) {
                    reloadPage($(this), $.zeusValidate.getValueFromInput($(this).parent().find('input')));
                }
            });
            root.find('.zeus-qf').siblings('input').on("keypress", function(event) {
                if (event.which == 13 || event.which == 10) { // Simulate go button on enter press
                    // Ensure to not submit the form.
                    event.preventDefault();
                    event.stopPropagation();
                    // Make sure form is valid (i.e. min and max values are obeyed and no alphabets are entered on fields with input type number).
                    if ($(this).closest('form').valid()) {
                        reloadPage($(this), $.zeusValidate.getValueFromInput($(this)));
                    }
                }
            });

            function reloadPage(source, value) {
                var urlTemplate = source.closest('.history').find('h3').attr(fullDataTypes.Url)
                var url = urlTemplate.replace('ZEUS_QF_PLACEHOLDER', value); // Fill in the URL with the value of the quick-found element
                window.location.href = url; // Navigate to new page
            }
        },

        // Function to remember use choices using HTML 5 Session storage
        // Only supports text fields and selects
        userDefaults: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('[' + fullDataTypes.UserDefaultKey + ']').each( function() {
                var inputElement = $(this);
                var localKey = inputElement.attr(fullDataTypes.UserDefaultKey);

                // This functions saves the input values into local storage
                function storeLocally() {
                    // Special code for selects
                    if (inputElement.is('select')) {
                        var values = inputElement.val();
                        if (values == null) {
                            sessionStorage.removeItem(localKey);
                            localStorage.removeItem(localKey);
                        }
                        else if ($.isArray(values)) {
                            var selectRecord = {};
                            for (var index in values) {
                                var val = values[index];
                                selectRecord[val] = inputElement.find('option[value="' + val + '"]').text();
                            }
                            sessionStorage[localKey] = localStorage[localKey] = JSON.stringify(selectRecord);
                        }
                        else {
                            var obj = {};
                            obj[values] = inputElement.find('option[value="' + values + '"]').text();
                            sessionStorage[localKey] = localStorage[localKey] = JSON.stringify(obj);
                        }
                    }
                    else if (inputElement.is('[type="checkbox"]')) {
                        var existingSession = sessionStorage[localKey] != undefined ? JSON.parse(sessionStorage[localKey]) : {};

                        var val = inputElement.val();
                        existingSession[val] = $.zeusValidate.getValueFromInput(inputElement);

                        sessionStorage[localKey] = localStorage[localKey] = JSON.stringify(existingSession);
                    }
                    else { // other elements
                        sessionStorage[localKey] = localStorage[localKey] = $.zeusValidate.getValueFromInput(inputElement);
                    }
                }

                var serverValue = $.zeusValidate.getValueFromInput(inputElement);
                if (serverValue != undefined && serverValue != null && serverValue != '' && serverValue != '01/01/0001' && (!inputElement.is('select') || inputElement.find('option[selected]').length) ) { // Force server value into storage
                    storeLocally();
                }
                else { // Read from local storage and install defaults
                    var defaultVersion = sessionStorage[localKey]; // Session has priority over Local.
                    if (defaultVersion == undefined) { defaultVersion = localStorage[localKey]; }

                    if (defaultVersion != undefined) {
                        // Special code for selects
                        if (inputElement.is('select')) {
                            var selectRecord = JSON.parse(defaultVersion);
                            inputElement.find('option[selected]').removeAttr('selected');
                            for (var key in selectRecord) {
                                var text = selectRecord[key];
                                var option = inputElement.find('option[value="' + key + '"]');
                                if (option.length > 0) {
                                    option.attr('selected', 'selected');
                                }
                                else {
                                    $('<option>').attr('value', key).attr('selected', 'selected').text(text).appendTo(inputElement);
                                }
                                inputElement.removeAttr('data-noselection');
                            }
                        }
                        else if (inputElement.is('[type="checkbox"]')) {
                            if (JSON.parse(defaultVersion)[inputElement.val()]) {
                                inputElement[0].checked = true;
                            }
                        }
                        else if (inputElement.is('[type="radio"]')) {
                            if (defaultVersion == inputElement.val()) {
                                inputElement[0].checked = true;
                            }
                        }
                        else { // Other elements
                            inputElement.val(defaultVersion);
                        }
                    }
                }

                // Update defaults upon user change
                inputElement.on("change.userdefaults", function () {
                    storeLocally();
                });
            });
        },

        searchModals: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            root.find(".zeus-search-modal").each(function () {
                var element = $(this);
                var searchModalButtonName = element.data(dataTypes.SearchModalButtonName);
                var button = $('<button type="button">').text((searchModalButtonName != undefined) ? searchModalButtonName : 'Find');
                var greaterElements = element.add(element.siblings('.amc-aria-multi-complete')); // Grab the multiselect if there is one
                greaterElements.wrapAll($('<div>').addClass('form-control-main-part'));
                element.parent().after(button);
                element.parent().add(button).wrapAll(($('<div>').addClass('form-control-with-appendix')));

                button.data('parentid', element.attr('id'));

                // Match button's editable state to that of the element its attached to
                var editableState = function (event, input) {
                    input = $(input);

                    // Ensure we're updating the corresponding button
                    if (button.data('parentid') != input.attr('id')) {
                        return;
                    }

                    if (input.attr('readonly') == 'readonly' || input.attr('disabled') == 'disabled') {
                        button.attr('disabled', 'disabled');
                    } else {
                        button.removeAttr('disabled');
                    }
                }

                // Add watcher for editable state change
                $(document).bind('editable-state-change', editableState);

                // Trigger initial state
                $(document).trigger('editable-state-change', element);

                button.on('click.search-modals', function (event) {
                    event.preventDefault();
                    var headers = {};
                    headers[headerTypes.AjaxForm] = true; // Indicate we want the <form> tag to come back

                    var url = element.data(dataTypes.Url);
                    var parameterMap = $.zeusValidate.getParameterMapForElement(element);

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'html',
                        cache: false,
                        headers: headers,
                        data: parameterMap,
                        }).done(function(data, textStatus, request) {
                        if ($.zeusValidate.sessionExpired(request)) {
                            return;
                        }

                        var searchModalId = 'modal-search';
                        var searchModalSelector = '#' + searchModalId;
                        $(searchModalSelector).remove(); // Ensure no existing searchModals exist

                        // Create new modal
                        var searchModal = $rhea.makeModalDialogElement('', data, '', searchModalId);
                        $rhea.prepareNewContent(searchModal);

                        // Special search modal preparation
                        function prepareSearchModalContents() {
                            // Do search handler
                            searchModal.find('button[value="Search"]').off('click').on("click.search-modal", function (event) {
                                event.preventDefault();

                                $.zeusValidate.updateCkeditorInstances(searchModal);

                                var data = searchModal.find('form').serialize();
                                // Filter out of the form data any rows from the table
                                data = $.grep(data.split('&'), function(el) {
                                    return el.indexOf('SearchTable') != 0;
                                }).join('&');

                                // Post the form
                                $.ajax({
                                    url: url,
                                    type: 'POST',
                                    data: data,
                                    dataType: 'html',
                                    cache: false,
                                    headers: headers,
                                }).done(function (data, textStatus) {
                                    var container = searchModal.find('.modal-body');
                                    container.html(data);
                                    $rhea.prepareNewContent(container);
                                    prepareSearchModalContents();
                                    searchModal.find('button[value="Search"]').focus();
                                }).fail(function (xhr, status, data) {
                                    var errorText = $.zeusValidate.getErrorInAjax(xhr);
                                    errorText = (errorText != undefined ? errorText : 'Error occurred while loading.');
                                    $.zeusValidate.addError(errorText);
                                });
                            });

                            // Select callback handler
                            searchModal.find('button[value="Select"]').off('click').on("click.search-modal", function (event) {
                                event.preventDefault();
                                var selectedIds = [];
                                var texts = [];
                                    searchModal.find('input[type=radio][' + fullDataTypes.RowSelector + '=True]').each(function() {
                                    if (this.checked) {
                                        var selectedId = this.value;
                                        var text = $(this).attr(fullDataTypes.DataText);
                                        if (text == undefined) {
                                            // If [DescriptionKey] attribute not specified then use Id instead.
                                            text = selectedId;
                                        }
                                        selectedIds.push(selectedId)
                                        texts.push(text);
                                        return false;
                                    }
                                });
                                // If still empty then look for check boxes for multiple selection.
                                if (selectedIds.length == 0) {
                                    searchModal.find('input[type=checkbox]').each(function() {
                                        if (this.checked && $(this).attr(fullDataTypes.DataKey) != undefined) {
                                            var selectedId = $(this).attr(fullDataTypes.DataKey);
                                            var text = $(this).attr(fullDataTypes.DataText);
                                            if (text == undefined) {
                                                // If [DescriptionKey] attribute not specified then use Id instead.
                                                text = selectedId;
                                            }
                                            selectedIds.push(selectedId);
                                            texts.push(text);
                                        }
                                    });
                                }
                                
                                // Now set the value on the client side control.
                                if (selectedIds.length > 0) {
                                    if (element.is('select')) {
                                        var container = element.data('ariaSelectReference'); // Get the underlying container.
                                        for (var i = 0; i < selectedIds.length; ++i) {
                                            container.selectOrCreateChoice(selectedIds[i], texts[i], true);
                                        }
                                    } else {
                                        element.val(selectedIds[0]);
                                    }
                                }
                                
                                // Trigger change event to notify dependent properties
                                element.change();
                                $rhea.dismissModalDialogElement(searchModal);
                            });

                            // Cancel callback handler
                            searchModal.find('button.cancel').off('click').on("click.search-modal", function(event) {
                                event.preventDefault();
                                $rhea.dismissModalDialogElement(searchModal);
                            });

                        } // END FUNCTION prepareSeachModalContents

                        prepareSearchModalContents();

                        // Show modal
                        $rhea.showModalDialogElement(searchModal);
                    })
                    .fail(function (xhr, status, data) {
                        var errorText = $.zeusValidate.getErrorInAjax(xhr);
                        errorText = (errorText != undefined ? errorText : 'Error occurred while loading.');
                        $.zeusValidate.addError(errorText);
                    });
                })
            });
        },

        processRichTextBox: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var routes = $('#zeus-ajax-routes').data(dataTypes.AjaxRoutes);
            var virtualDir = (routes.CkeditorBasePath);

            window.CKEDITOR_BASEPATH = virtualDir;
            CKEDITOR.basePath = virtualDir;
            //console.log("basepath ckeditor =" + virtualDir); 
            root.find('div[' + fullDataTypes.RichTextArea + '=true]').each(function() {
                var currentDiv = $(this);
                var currentInput = currentDiv.find('textarea:enabled');
                var readonly = currentInput.is('[readonly]');
                if (currentDiv.find('a.hintTip').length == 0) {
                    // Add hint tip showing the keyboard shortcut.
                    currentDiv.find('label').after('<a role=\"presentation\" class=\"hintTip\" href=\"javascript:;\"><span>Help tip: Press ALT + F10 to access the toolbar via keyboard.</span></a>');
                }
                if (currentInput.length == 1) {
                    // Get options
                    var options, toolbarGroups;
                    
                    if (readonly) {
                        return;
                    }
                    var optionsText = $(this).find('p[' + fullDataTypes.RichTextBoxOptions + '=true]').text();
                    if (optionsText != undefined) {
                        options = JSON.parse(optionsText);

                        toolbarGroups = [];
                        var toolbarArray = [];

                        var basicStyles = [];
                        if (optionsText.indexOf('bold') > 0) {
                            //toolbarGroups.push({ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] }); //, items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']
                            basicStyles.push('Bold');
                        }
                        if (optionsText.indexOf('italic') > 0) {
                            basicStyles.push('Italic');
                        }
                        if (optionsText.indexOf('underline') > 0) {
                            basicStyles.push('Underline');
                        }
                        toolbarArray.push({ name: 'basicstyles', items: basicStyles });
                        /*
                        if (optionsText.indexOf('clipboard') > 0) {
                            toolbarGroups.push({ name: 'clipboard', groups: [ 'undo'], }); //'clipboard',items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
                        }*/
                        if (optionsText.indexOf('paragraph') > 0) {
                            toolbarGroups.push({ name: 'paragraph', groups: ['list', 'align', 'bidi'] });
                            toolbarArray.push({ name: 'basicstyles', items: ['NumberedList', 'BulletedList', '-', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] }); //'Outdent', 'Indent',
                        }
                        if (optionsText.indexOf('links') > 0) {
                            toolbarGroups.push({ name: 'links', groups: ['Link', 'Unlink'] });
                            toolbarArray.push({ name: 'links', items: ['Link', 'Unlink', 'Anchor'] });
                        }
                        if (optionsText.indexOf('editing') > 0) {
                            toolbarGroups.push({ name: 'editing', groups: ['selection'] }); //, items: ['Find', 'Replace', 'SelectAll', 'Scayt'])
                            toolbarArray.push({ name: 'editing', items: ['SelectAll'] });
                        }
                        if (optionsText.indexOf('source') > 0) {
                            toolbarGroups.push({ name: 'document', groups: ['Source'] });
                            toolbarArray.push({ name: 'document', items: ['Source'] });
                        }

                        if (optionsText.indexOf('tables') > 0) {
                            toolbarGroups.push({ name: 'insert', groups: ['insert'] });
                            toolbarArray.push({ name: 'insert', items: ['Table'] });
                        }

                        if (optionsText.indexOf('cms') > 0) {
                            toolbarGroups.push({ name: 'cms', groups: ['cms'] });
                            toolbarArray.push({ name: 'cms', items: ['Format', 'Superscript', 'Subscript', 'Strike', 'HorizontalRule', '-', 'Image', '-','Outdent', 'Indent'] });
                        }
                    }

                    var textEntered = currentInput.val() != undefined ? currentInput.val() : '';
                    var currentInputName = currentInput.attr('name');
                    var enableBrowserSpellCheck = currentInput.attr('spellcheck') == 'true' ? true : false;
                    var previousInstance = CKEDITOR.instances[$.zeusValidate.replaceAll(currentInputName, '.', '_')];
                    if (previousInstance) {
                        previousInstance.destroy(true);
                    }

                    var ckAllowContent = {
                        'strong em ul ol big small link unlink u': true,
                        'h1 h2 h3 h4 h5 h6 p blockquote li': {
                            styles: 'text-align'
                        },
                        a: { attributes: '!href,target' },
                    }
                    if (optionsText != undefined && optionsText.indexOf('tables') >= 0) {
                        ckAllowContent = {
                            'strong em ul ol big small link unlink u': true,
                            'h1 h2 h3 h4 h5 h6 p blockquote li th td tr tbody thead': {
                                styles: 'text-align'
                            },
                            a: { attributes: '!href,target' },
                            table: { attributes: 'border' },
                        }
                    }

                    //turn on more stuff
                    if (optionsText != undefined && optionsText.indexOf('cms') > 0) {
                        ckAllowContent = true;

                        // Prevent CKEDITOR from removing empty tags when using CMS option
                        $.each(CKEDITOR.dtd.$removeEmpty, function (i, value) {
                            CKEDITOR.dtd.$removeEmpty[i] = false;
                        });
                    }
                    // Check whether input is inside of a modal if so set a timeout. The reason for this is that when modal is rendering and when
                    // PrepareNewContent() function is called, the element (i.e. response of AJAX) hasn't yet been added to <body> so we add timeout.
                    // CKEDITOR looks for the element inside body so adding a timeout for the element to be added.
                    if(currentInput.closest('.modal').length == 1)
                    {
                        setTimeout(processEditor, 50);
                    }
                    else
                    {
                        processEditor();
                    }
                    
                    function processEditor() {
                        var editorInstance = CKEDITOR.replace(currentInputName,
                        {
                            toolbar: toolbarArray, // '1',
                            language: 'en',
                            disableNativeSpellChecker: enableBrowserSpellCheck, // this value gets overridden by setting in config.js.
                            htmlEncodeOutput: false,
                            //toolbarGroups: toolbarGroups,
                            //'spellchecker' // We will not use their spell checker as it is heavily branded (with advertisements), instead spellCheck attribute will be added on the textArea.
                            allowedContent: ckAllowContent,
                            removePlugins: ',scayt,liststyle,tabletools,scayt,contextmenu,paste', // remove their context bar (menu upon right-click) completely.
                            removeButtons: 'PasteFromWord, Language'                            
                        });
                        editorInstance.setData(textEntered);
                        CKEDITOR.on('dialogDefinition', function (ev) {
                            ev.data.definition.resizable = CKEDITOR.DIALOG_RESIZE_NONE;
                        });                        
                    }

                    /* // FIX FOR ANCHOR DIALOG
                    $.extend($.ui.dialog.overlay, {
                        create: function (dialog) {
                            if (this.instances.length === 0) {
                                // prevent use of anchors and inputs
                                // we use a setTimeout in case the overlay is created from an
                                // event that we're going to be cancelling (see #2804)
                                setTimeout(function () {
                                    // handle $(el).dialog().dialog('close') (see #4065)
                                    if ($.ui.dialog.overlay.instances.length) {
                                        $(document).bind($.ui.dialog.overlay.events, function (event) {
                                            var parentDialog = $(event.target).parents('.ui-dialog');
                                            if (parentDialog.length > 0) {
                                                var parentDialogZIndex = parentDialog.css('zIndex') || 0;
                                                return parentDialogZIndex > $.ui.dialog.overlay.maxZ;
                                            }

                                            var aboveOverlay = false;
                                            $(event.target).parents().each(function () {
                                                var currentZ = $(this).css('zIndex') || 0;
                                                if (currentZ > $.ui.dialog.overlay.maxZ) {
                                                    aboveOverlay = true;
                                                    return;
                                                }
                                            });

                                            return aboveOverlay;
                                        });
                                    }
                                }, 1);

                                // allow closing by pressing the escape key
                                $(document).bind('keydown.dialog-overlay', function (event) {
                                    (dialog.options.closeOnEscape && event.keyCode
                                            && event.keyCode == $.ui.keyCode.ESCAPE && dialog.close(event));
                                });

                                // handle window resize
                                $(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
                            }

                            var $el = $('<div></div>').appendTo(document.body)
                                .addClass('ui-widget-overlay').css({
                                    width: this.width(),
                                    height: this.height()
                                });

                            (dialog.options.stackfix && $.fn.stackfix && $el.stackfix());

                            this.instances.push($el);
                            return $el;
                        }
                    });*/
                }
            });
            // Ensure that text area is updated whenever there is a change in CKEDITOR. This is required especially for AJAX Post as text area remains empty (not updated) and no value is returned.
            for (var instance in CKEDITOR.instances) {
                CKEDITOR.instances[instance].on('change', function () {
                    CKEDITOR.instances[instance].updateElement();
                });
            }
            
            // Handle anything pasted and treat it as pasted from Word.
            CKEDITOR.on('instanceReady', function(e) {
                e.editor.on('paste', function(event) {
                    event.data['html'] = '<!--class="Mso"-->' + event.data['html'];
                }, null, null, 9);
            });
            
            // Remove span text 'Press ALT 0 for help'.
            setTimeout(function() {
                var helpText = 'Press ALT 0 for help';
                $('.cke_voice_label').each(function() {
                    var currentLabel = $(this);
                    if (currentLabel.text() == helpText) {
                        currentLabel.text("");
                    }
                });
                $('iframe.cke_wysiwyg_frame').each(function() {
                    var currentFrame = $(this);
                    var titleText = currentFrame.attr('title');
                    if (titleText.indexOf(helpText)) {
                        currentFrame.attr('title', $.zeusValidate.replaceAll(titleText, helpText, ""));
                    }
                });
            }, 100);

        },

        savedSearchPopup: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('button[value="Save search criteria"]').each(function () {
                var button = $(this)
                var form = $(this).closest('form');
                button.on('click', function (event, reallySubmit) {
                    if (!reallySubmit) {
                        event.preventDefault();
                        var modal = $rhea.makeModalDialogElement('Enter a name for this new saved search', '<input style="width: 100%" type="text" name="savedSearchSaveName"></input>',
                            '<a class="btn btn-sm btn-white" href="javascript:;">Cancel</a><a class="btn btn-sm btn-primary" href="javascript:;">Ok</a>');

                        // Bind to Yes button in modal
                        modal.find('.modal-footer a.btn-primary').bind('click.zeus-modal-yes', function () {
                            modal.find('input').appendTo(form);
                            button.trigger('click', true);
                        });
                        modal.find('.modal-footer a').bind('click.zeus-modal-dismiss', function () {
                            $rhea.dismissModalDialogElement(modal);
                        });

                        $rhea.showModalDialogElement(modal);
                    }
                });
            });
        },

        generateMainFormJumpList: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var jumpList = $(document).find(".jump-list ul");
            if (jumpList.length == 0) return;

            // Use document rather than root to make ajax loads regenerate this list correctly
            var panelHeadings = $(document).find(".panel-heading .panel-title");

            jumpList.empty();
            panelHeadings.each(function () {
                var heading = $(this);
                if (!heading.is(':visible')) return; // Skip hidden headers
                var id = heading.attr('id');
                if (id == undefined || id == '') {
                    id = "jl" + (jumpListCounter++);
                    heading.attr('id', id);
                }
                var anchor = $('<a>').attr('href', 'javascript:;').text(heading.text()).on("click", function (event) {
                    var scrollContainer = $('div#page-container');
                    scrollContainer.animate({
                        scrollTop: heading.offset().top - scrollContainer.offset().top + scrollContainer.scrollTop() - 20
                    }, 500);
                    if (heading.attr('tabindex') == undefined) heading.attr('tabindex', '-1');
                    heading.focus();
                });
                $('<li>').append(anchor).appendTo(jumpList);
            });
            // Only show the jump list if there is something to jump to.
            if (jumpList.children().length) {
                jumpList.parent().show();
            }
            else {
                jumpList.parent().hide();
            }
        },

        timelineLoadMore: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);
            
            root.find('a[data-z-time]').each(function () {
                var myself = $(this);
                var mylist = myself.closest('li');
                var url = myself.attr(fullDataTypes.Url);
                var data = {
                    loadMoreTag: myself.attr('data-z-time')
                }

                if (url != undefined && url != '') {
                    myself.on('click', function () {
                        $.ajax({
                            url: url,
                            type: 'GET',
                            data: data,
                            dataType: 'html',
                            cache: false,
                        }).done(function (response, textStatus, jqXHR) {
                            var wrapper = $('<div>').append(response);
                            mylist.before(wrapper);
                            mylist.remove();
                            $rhea.prepareNewContent(wrapper);
                            var contents = wrapper.contents();
                            wrapper.replaceWith(contents);
                            contents.filter('li')[0].scrollIntoView();
                        }).fail(function (xhr, status, data) {
                            $.zeusValidate.addError('Error occurred while loading timeline.');
                        });
                    });
                }

            });
        },

        fixMarkup: function() {
            var root = $(this.element) || $(document);

            // Defect prod 9140: Replace the headings of nested panels to be h3, h4 instead of h2.
            root.find('.panel .panel').each(function() {
                var nestedPanelHeading = $(this).find('.panel-heading');
                var panelTitle = nestedPanelHeading.find('h2.panel-title');
                if (panelTitle.length) {
                    panelTitle.each(function () {
                        // change it to appropriate heading.
                        var currentHeading = $(this);
                        var html = currentHeading[0].outerHTML;
                        var depth = currentHeading.parents('.panel').length + 1;
                        // If the panel is deeply nested, then ensure that proper heading is given to the panel-heading.
                        // If the panel is inside the panel then heading will be three, as the parent() above will find 2 panels (panel to which currentHeading belongs to and parent panel) and we add 1 to it to get h3.
                        currentHeading.replaceWith(html.replace('<h2 ', '<h' + depth + ' ').replace('</h2>', '</h' + depth + '>'));
                    });                    
                }
            });
        },

        accessKeys: function() {
            var root = $(this.element) || $(document);
                // read all access keys.
            var accessKeys = $.parseJSON(root.find('div[' + fullDataTypes.AccessKeys + '=true]').text());
            var shortcutOptions = {'disable_in_input': false, };
            if (accessKeys != null) {
                
                // Access key to access theme-panel (Resource Finder).
                if (accessKeys.QuickFindAccessKey) {
                    var quickFindAcceskeyHandle;
                    shortcut.add(accessKeys.QuickFindAccessKey, function() {
                        clearTimeout(quickFindAcceskeyHandle); // Clears the timeout set by setTimeout thus ensures there is no side-effect of user pressing the key repeatedly.
                        quickFindAcceskeyHandle = setTimeout(function() {
                            var firstQuickfindLink = root.find('.theme-panel [data-click=theme-panel-expand]').first();
                            if (firstQuickfindLink.length) {
                                var firstQuickfindPanel = firstQuickfindLink.parent();
                                if (firstQuickfindPanel.hasClass('active')) {
                                    firstQuickfindPanel.next().focus();
                                } else {
                                    firstQuickfindLink.focus();
                                }
                                firstQuickfindLink.click();
                            }
                        }, 300); // This much time is taken to show() content in theme-panel when quick-find link is clicked (refer to historypin()) method.
                    }, shortcutOptions);
                }


                // Access key to access Jump To.
                if (accessKeys.JumpToAccessKey) {
                    var jumpToAcceskeyHandle;
                    shortcut.add(accessKeys.JumpToAccessKey, function() {
                        clearTimeout(jumpToAcceskeyHandle); // Clears the timeout set by setTimeout thus ensures there is no side-effect of user pressing the key repeatedly.
                        jumpToAcceskeyHandle = setTimeout(function() {
                            var jumpListLink = root.find('.jump-list a').first();
                            if (jumpListLink.length) {
                                jumpListLink.focus();
                                jumpListLink.click();
                            }
                        }, 300);
                    }, shortcutOptions);
                }


                // Access key to Filter menu items in left hand navigation.
                if (accessKeys.MenuSearchFilter) {
                    var filterMenuHandle;
                    shortcut.add(accessKeys.MenuSearchFilter, function() {
                        clearTimeout(filterMenuHandle);
                        filterMenuHandle = setTimeout(function() {
                            root.find('a.search-menu-filter').click();
                        }, 300);
                    }, shortcutOptions);
                }


                // Access key to take focus to 'FocusRightSidebar' on right-sidebar.
                if (accessKeys.FocusRightSidebar) {
                    shortcut.add(accessKeys.FocusRightSidebar, function () {
                        root.find('#sidebar-right').focus();
                    }, shortcutOptions);
                }
            }
        },

        fixColorAdminProblems: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var sidebarClass = 'page-sidebar-minified';
            var targetContainer = '#page-container';
            // Retain the Sidebar state.
            var sidebarState = sessionStorage['sidebarState'];
            if (sidebarState == "collapsed") {
                $(targetContainer).addClass(sidebarClass);
            } else if (sidebarState == "notcollapsed") {
                $(targetContainer).removeClass(sidebarClass);
            }

            // Prod defect 9275: when the sidebar is collapsed its content is still read by screen-reader, so we set the display to none here. 
            root.find('[data-click=sidebar-toggled]').click(function (e) {
                var targetClass = 'page-sidebar-toggled';
                if (root.find('#sidebar').closest('.page-with-two-sidebar').hasClass(targetClass)) {
                    root.find('#sidebar').css('display', 'inline');// If hidden, set display property
                } else {
                    root.find('#sidebar').css('display', 'none'); // If shown, remove display property
                }
            });
            $(window).off('resize.zeus-sidebar');
            $(window).on('resize.zeus-sidebar',function ()
            {
                if ($(window).width() > 767) {
                    $('#sidebar').css('display', 'inline'); // root.find does not work on Dashboard page because root contains last loaded widget's content instead of document.
                } else { $('#sidebar').css('display', 'none'); }
            });

            // Defect:12337 close dropdown-menu upon tab out.
            root.find('ul.dropdown-menu, div.sitepicker, div.settings').each(function () {
                var element = $(this);
                var parentListItem = element.closest('li.dropdown');

                root.keyup(function (e) {
                    var code = e.keyCode;
                    if (code == 9) {
                        // tab press
                        var currentElement = document.activeElement;
                        // check if current element is outside of the 'element'.
                        if (element.find(currentElement).length == 0) {
                            closeDropdown();
                        }
                    }
                });

                function closeDropdown() {
                    var screenreaderSpan = undefined;   // Update the screenreader hidden text when the list is closed.
                    if (element.hasClass('contract-picker-list') || element.hasClass('sitepicker')) {
                        // This is contract-picker/settings menu/sitepicker so doesn't have parentListItem.
                        element.css('display', 'none');                        
                        if (element.hasClass('sitepicker')) {
                            screenreaderSpan = element.closest('div.orgsitepicker').find('a.sitepicker-launch span.readers');
                            updateReaderText('Closes the site picker');
                        } else {
                            screenreaderSpan = element.parent().find('a.contract-picker-launch span.readers');
                            updateReaderText();
                        }
                    }
                    else if (element.hasClass('settings')) {
                        element.addClass('hidden');
                        screenreaderSpan = parentListItem.find('a.dropdown-toggle span.readers');
                        updateReaderText();
                    }
                    else if (parentListItem.length == 1) {
                        parentListItem.removeClass('open');
                        screenreaderSpan = parentListItem.find('a.dropdown-toggle span.readers');
                        updateReaderText();
                    }

                    function updateReaderText(textToMatch) {
                        textToMatch = textToMatch == undefined ? '(Closes the list below)' : textToMatch;
                        if (screenreaderSpan != undefined) {
                            // There is a possibility that screenreaderSpan may contain multiple 'readers' span (if at same level, e.g. a.contract-picker-launch), so we go through each node and only replace the text if it matches textToMatch.
                            screenreaderSpan.text(function (index, text) {
                                if (text.indexOf(textToMatch) != -1) {
                                    return text.replace('Close', 'Open').replace(' the ', ' a ');
                                }
                                //return text; // having no return statement, results in that text not being updated for that node which is what we want. So we only update the node whose text matches.
                            });
                        }
                    }
                }
            });

            // Defect:12361 Ensure focus remains within the panel when in expanded state.
            root.find('.panel a[data-zck=expand]').on('click', function() {
                var element = $(this);
                // We set time out here in order to let the actual event (that collapses/expands panel) fire first and then we check if the panel was expanded or collapsed.
                // If it was expanded then the panel will have the class .panel-expand.

                setTimeout(function() {
                    var expandedPanel = element.closest('div.panel-expand');
                    if (expandedPanel.length == 1) {
                        // Panel was expanded, so ensure that focus remains within it.
                        root.on('keyup.zeus-panel-restrict-focus', function(event) {
                            var code = event.keyCode;
                            if ((code == 9) && expandedPanel.find(event.target).length == 0) {
                                // Restrict focus.
                                event.stopPropagation();
                                expandedPanel.find('a').first().focus(); // focus on first of the panel header buttons.
                            }
                        });
                    } else {
                        root.off('keyup.zeus-panel-restrict-focus');
                    }
                }, 50);
            });


            // Fix inaccessible menu text
            root.find('[data-click=sidebar-minify]').on("click", function (event) {
                var readerSpan = $(this).find('span.readers');
                if (readerSpan.length > 0) {
                    if (readerSpan.text() == 'Minimize menu') {
                        readerSpan.text("Maximize menu");
                    }
                    else {
                        readerSpan.text("Minimize menu");
                    }
                }
                setTimeout(function() {
                    if (root.find(targetContainer).hasClass(sidebarClass)) {
                        sessionStorage['sidebarState'] = 'collapsed'; // Save the Sidebar state
                    } else {
                        sessionStorage['sidebarState'] = 'notcollapsed'; // Save the Sidebar state
                    }
                }, 50);
            });
            // Fix inaccessible top level menu items
            function handleBootstrapDropdownReaderText(element) {
                var li = element.parent();
                var readersText = element.find('.readers').first();
                if (readersText.length > 0) {
                    window.setTimeout(function () {
                        if (li.hasClass('open')) {
                            readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                        }
                        else {
                            readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                        }
                    }, 50); 
                }
            }
            root.find('a[data-toggle="dropdown"], a[data-toggle="settings-dropdown"]').on("click", function () {
                handleBootstrapDropdownReaderText($(this));
            });
            root.find('a[data-toggle="dropdown"], a[data-toggle="settings-dropdown"]').on("focus", function () {
                handleBootstrapDropdownReaderText($(this));
            });
            // Fix inaccessible sidebar menu items
            root.find('.sidebar .nav a').click(function() {
                var ul = $(this).next('.sub-menu');
                var readersText = $(this).find('.readers').first();
                if (readersText.length > 0 && ul.length > 0) {
                    window.setTimeout(function() {
                        if (ul.is(':visible')) {
                            readersText.text(readersText.text().replace(/Opens a list below/, 'Closes the list below'));
                        }
                        else {
                            readersText.text(readersText.text().replace(/Closes the list below/, 'Opens a list below'));
                        }
                    }, 350); // large timeout to wait for the slide toggle
                }
            });

            // Fix dropdown menus not displaying on screen
            root.find('button[data-toggle="dropdown"]').on("click.display-fix", function () {
                var dropbutton = $(this);
                window.setTimeout(function () {
                    var ulSiblings = dropbutton.siblings('ul');
                    ulSiblings.filter(':visible').each(function () {
                        var animate = false;
                        var animateOptions = {};
                        var maxtop = $(this).offset().top + $(this).height() - $(window).height();
                        if (maxtop > $(window).scrollTop()) {
                            animate = true;
                            animateOptions['scrollTop'] = maxtop;
                        }
                        var maxleft = $(this).offset().left + $(this).width() - $(window).width();
                        if (maxleft > $(window).scrollLeft()) {
                            animate = true;
                            animateOptions['scrollLeft'] = maxleft;
                        }
                        if (animate) {
                            $('html, body').animate(animateOptions, 'fast');
                        }
                    });
                }, 50);
            });

        },

        // Puts calculated column widths and margins on elements with col-lg-* specifiers
        // This is used instead of CSS because the framework allows too many different possibilities for nesting. It is impossible to write CSS that covers all
        // the combinations of rows, panels, divs, containers, and nested view models that the framework allows.
        calculateColumnWidths : function() {
            var $rhea = this;
            var root = $(this.element) || $(document);

            var colspec = 'col-xs-';
            if (window.matchMedia('(min-width: 1200px)').matches) { colspec = 'col-lg-'; }
            if (window.matchMedia('(min-width: 1600px)').matches) { colspec = 'col-xl-'; }

            function descendTo(element) {
                var columnChildren = element.children('[class*="'+colspec+'"]');

                var thisRowCount = 0;
                for (var i = 0; i < columnChildren.length; ++i) {
                    var thisChild = $(columnChildren[i]);
                    var thisCount = 12;
                    if (thisChild.hasClass(colspec + '8')) { thisCount = 8; }
                    if (thisChild.hasClass(colspec + '6')) { thisCount = 6; }
                    if (thisChild.hasClass(colspec + '4')) { thisCount = 4; }
                    if (thisChild.hasClass(colspec + '3')) { thisCount = 3; }

                    var nextRowCount = thisRowCount + thisCount;
                    var leftMargin = 0;
                    var rightMargin = 0;
                    if (thisRowCount > 0 && nextRowCount <= 12) {
                        leftMargin = 8;
                    }
                    if (nextRowCount < 12) {
                        rightMargin = 7;
                    }
                    thisChild.css('margin-left', leftMargin + 'px');
                    thisChild.css('margin-right', rightMargin + 'px');
                    var totalMargin = leftMargin + rightMargin;
                    if (thisCount == 12) { thisChild.css('width', 'calc(100% - ' + totalMargin + 'px)'); }
                    else if (thisCount == 8) { thisChild.css('width', 'calc(66.666666% - ' + totalMargin + 'px)'); }
                    else if (thisCount == 6) { thisChild.css('width', 'calc(50% - ' + totalMargin + 'px)'); }
                    else if (thisCount == 4) { thisChild.css('width', 'calc(33.333333% - ' + totalMargin + 'px)'); }
                    else if (thisCount == 3) { thisChild.css('width', 'calc(25% - ' + totalMargin + 'px)'); }

                    if (nextRowCount > 12) { thisRowCount = thisCount; }
                    else if (nextRowCount == 12) { thisRowCount = 0; }
                    else { thisRowCount = nextRowCount; }
                }

                element.children().each(function () { descendTo($(this)); });
            }
            descendTo(root);
        },

        // Auto loads a URL using a form submit. Should be used on files only to prevent redirecting the page.
        autoLoadUrls: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('[' + fullDataTypes.AutoLoadUrl + ']').each(function () {
                var url = $(this).attr(fullDataTypes.AutoLoadUrl);
                if (url != undefined && url != '') {
                    url = url.replace(/.*?\//, '/'); // Quick XSS protection, only allow site relative urls.
                    window.setTimeout(function () {
                        $.fileDownload(url, {
                            httpMethod: "POST"
                        })
                        .done(function () { })
                        .fail(function () { $.zeusValidate.addError("Failed to download file."); });
                    }, 500); // Set 500ms delay to allow page to display
                }
            });
        },

        // Experimental - currently redirects downloads only, intention is to have both uploads and download going via a different server
        redirectDocumentUploadDownload: function () {
            var $rhea = this;
            var root = $(this.element) || $(document);

            root.find('a').each(function () {
                var link = $(this);
                var href = link.attr('href') || '';
                var matches = href.match(/.*\/Components\/DocumentModal\/Document\?TransactionId=(.*)&Guid=(.*)/);
                if (matches != null) {
                    var id = matches[1];
                    var guid = matches[2];
                    link.off('click').on('click', function (event) {
                        event.preventDefault();
                        var url = 'http://localhost:54844/api/document_evidence/transactions/' + id + '/files/' + guid + '/?includeBinary=True';
                        var ajaxOptions = {
                            type: 'GET',
                            dataType: 'json',
                            global: false,
                            url: url,
                            cache: false,
                            //headers: headers,
                            //data: parameters
                            success: function (response, status, jqXHR) {
                                var data = response.Data;
                                if (data != '' && data != undefined) {
                                    var filename = data.Title + data.Extension;
                                    if (navigator.msSaveBlob) { // IE only
                                        var bdata = atob(data.Binary);
                                        var byteNumbers = new Array(bdata.length);
                                        for (var i = 0; i < bdata.length; i++) {
                                            byteNumbers[i] = bdata.charCodeAt(i);
                                        }
                                        var blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
                                        navigator.msSaveBlob(blob, filename);
                                    }
                                    else { // Everything else
                                        var dref = "data:application/octet-stream;base64," + data.Binary;
                                        var dlink = document.createElement('a');
                                        dlink.download = filename;
                                        dlink.href = dref;
                                        var event = document.createEvent('MouseEvents');
                                        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                        dlink.dispatchEvent(event);
                                    }
                                }
                            },
                            error: function (jqXHR, status, response) {
                                var i = 2;
                            },
                            complete: function (jqXHR, status) {
                                var i = 2;
                            },
                        };

                        $.ajax(ajaxOptions);
                    });
                }
            });
        },
        processTreeview: function () {
            var $rhea = this;
           
            $('.jstree-default').not('.jstree').bind("ready.jstree", function(evt, data) {
                var target_treedivid = evt.currentTarget.parentElement.id;
                $('#' +target_treedivid + ' li').each(function (index) {
                    $rhea.treeviewRenderActionIcons($(this), false, target_treedivid);
                });
                $('.jstree-selflink').off("click").click(function(e) {
                    $rhea.bindTreeViewSelfLink(e, $(this));
                    return false;
                    });
                $('.jstree-modal').off("click").click(function(e) {
                    e.preventDefault();
                     $rhea.bindTreeViewModalLink(e, $(this));
                    return false;
                });
            });

            $('.jstree-default').not('.jstree').bind("open_node.jstree", function (evt, data) {
                var target_treedivid = evt.currentTarget.parentElement.id;

                var zid = data.node.li_attr[fullDataTypes.TreeviewNodeId];
                $('#' +target_treedivid + ' .ztv-expanded').each(function (index) {
                    if($(this).attr(fullDataTypes.TreeviewNodeId) == zid) {
                        $(this).val('True');
                        $(this).removeData('initialValue');
                    }
                });
                $('#' +data.node.id).children('ul').children('li').each(function(index) {
                    $rhea.treeviewRenderActionIcons($(this), true, target_treedivid);
                });
                
                $('#' +data.node.id + ' .jstree-selflink').off("click").click(function(e) {
                    e.preventDefault();
                    $rhea.bindTreeViewSelfLink(e, $(this));
                    return false;
                    });
                $('#' +data.node.id + ' .jstree-modal').off("click").click(function(e) {
                    e.preventDefault();
                     $rhea.bindTreeViewModalLink(e, $(this));
                    return false;
                });
            });

            $('.jstree-default').not('.jstree').bind("close_node.jstree", function (evt, data) {
                var target_treedivid = evt.currentTarget.parentElement.id;
                var zid = data.node.li_attr[fullDataTypes.TreeviewNodeId];
                $('#' +target_treedivid + ' .ztv-expanded').each(function (index) {
                    if($(this).attr(fullDataTypes.TreeviewNodeId) == zid) {
                        $(this).val('False');
                        $(this).removeData('initialValue');
                    }
                });
            });
            $('.jstree-default').not('.jstree').bind("select_node.jstree", function (evt, data) {
                var target_treedivid = evt.currentTarget.parentElement.id;
                var zid = data.node.li_attr[fullDataTypes.TreeviewNodeId];
                $('#' +target_treedivid + ' .ztv-selected').each(function (index) {
                    if($(this).attr(fullDataTypes.TreeviewNodeId) == zid) {
                        $(this).val('True');
                        $(this).removeData('initialValue');
                    }
                    else {
                        $(this).val('False');
                        $(this).removeData('initialValue');
                    }
                });
            });

            //hook up link clicks
            $('.jstree-default').not('.jstree').on('select_node.jstree', function (e, data) {
                var link = $('#' +data.selected).find('a');
                if (link.attr("href") != "#" && link.attr("href") != "javascript:;" && link.attr("href") != "" &&
                    link.attr(fullDataTypes.PropertyNameForAjax) == null) {
                    if (link.attr("target") == "_blank") {
                        window.open(link.attr("href"), '_blank');
                    }
                    else
                        document.location.href = link.attr("href");
                    return false;
                }
            });

            //accessibility keyboard nav hook ups for custom action buttons
            $('.jstree-default').not('.jstree').on('keydown.jstree', '.jstree-custactn', $.proxy(function (e) {
                switch(e.which) {
                    case 39: // right
                        e.preventDefault();
                        $(e.currentTarget).next('a').focus();
                        break;
                    case 37: // left
                        e.preventDefault();
                        $(e.currentTarget).prev('a').focus();
                        break;
                    case 38: // up
                        e.preventDefault();
                        o = $(e.currentTarget).closest('.jstree').jstree().get_prev_dom($(e.currentTarget).parent().children('a').first())
                        if(o && o.length) {
                            o.children('.jstree-anchor').focus(); }
                        break;
                    case 40: // down
                        e.preventDefault();
                        o = $(e.currentTarget).closest('.jstree').jstree().get_next_dom($(e.currentTarget).parent().children('a').first())
                        if(o && o.length) {
                            o.children('.jstree-anchor').focus(); }
                        break;
						}
                    }, this))

            $('.jstree-default').not('.jstree').jstree({
                "core": {
                    "themes": {
                        "responsive": false
                    }
                },
                "types": {
                    "default": {
                        "icon": "fa fa-folder text-warning fa-lg"
                    },
                    "file": {
                        "icon": "fa fa-file text-inverse fa-lg"
                    }
                },
                "plugins": ["types"],
            });
        },
        treeviewRenderActionIcons: function (node, recursion, treeviewId) {
            var $rhea = this;
            var NodeText = node.children('a').text();
            var DeleteLink = '<a href="' + $('#' + treeviewId + ' .SelfPostbackURL').val() +
                '" data-ztvaction="Delete" class="jstree-selflink jstree-custactn" tabindex="-1">' +
                '<span class="readers">Delete for: ' +NodeText + '</span>' +
                '<i class="jstree-icon jstree-themeicon fa fa-trash fa-lg text-primary jstree-themeicon-custom" role="presentation" ' +
                'title="Delete for: ' +NodeText + '">' +
                '</i></a>';
            var AddLink = '<a href="' + $('#' + treeviewId + ' .SelfPostbackURL').val() +
                '" data-ztvaction="Add" class="jstree-selflink jstree-custactn" tabindex="-1">' +
                '<span class="readers">Add for: ' +NodeText + '</span>' +
                '<i class="jstree-icon jstree-themeicon fa fa-plus fa-lg text-primary jstree-themeicon-custom" role="presentation"' +
                'title="Add for: ' + NodeText + '">' +
                '</i></a>';
            var CustomActionButtons = "";
            var zid = node.attr(fullDataTypes.TreeviewNodeId);
            $('#' +treeviewId + ' .' + dataTypes.TreeviewNodeCustomAction).each(function (index) {
                if($(this).attr(fullDataTypes.TreeviewNodeId) == zid) {
                    CustomActionButtons = $(this).val();
                }
            });

            if (node.children('ul').length == 1) {
                $(CustomActionButtons).insertBefore(node.children('ul'));
                if (node.attr(fullDataTypes.TreeviewShowTrash) == "True") {
                    $(DeleteLink).insertBefore(node.children('ul'));
                }
                if (node.attr(fullDataTypes.TreeviewShowAdd) == "True") {
                    $(AddLink).insertBefore(node.children('ul'));
                }
                //recusrive if required
                if (recursion) {
                    node.children('ul').children('li').each(function(index) {
                        var new_li = $(this);
                        $rhea.treeviewRenderActionIcons(new_li, true, treeviewId);
                    });
                }
            }
            else {
                node.append(CustomActionButtons);
                if (node.attr(fullDataTypes.TreeviewShowTrash) == "True") {
                    node.append(DeleteLink);
                }
                if (node.attr(fullDataTypes.TreeviewShowAdd) == "True") {
                    node.append(AddLink);
                }
            }
            node.children('[data-zpnfa]:not(.jstree-selflink):has(.jstree-actionbtn)').each(function (index) 
            {
                $(this).wrap("<span class='custom_action_btn'></span>");
                $rhea.prepareNewContent($(this).parent());  //so that ajaxproperty custom actions are binded (as they reuse existing hookups)
                $(this).unwrap();
            });
        },
        bindTreeViewSelfLink: function (e, link) {
            var $rhea = this;
            var jtree_container_id = $(link).closest('.jstree-container').attr('id');
            $('#' +jtree_container_id + ' .TriggerId').val($(link).parent().attr(fullDataTypes.TreeviewNodeId));
            $('#' +jtree_container_id + ' .TriggerAction').val($(link).attr(fullDataTypes.TreeviewActionType));
            $.ajax({
                url: $(link).attr('href'),
                type: 'POST',
                data: $('#main_form' + ' #' + jtree_container_id + ' input').serialize(),
                success: function (response) {
                    var jtree_container_id = $(response).filter(".jstree-container").attr('id');
                    $('#' +jtree_container_id).wrap('<p/>').parent().html(response);
                    $('#' +jtree_container_id).unwrap();
                    $rhea.prepareNewContent($('#' +jtree_container_id));
                }
            });
        },
        bindTreeViewModalLink: function (e, link) {
            var $rhea = this;
            var url = $(e.target).closest('.jstree-modal').attr('href');
            $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                global: true,
                data: '',
            }).done(function(data, textStatus, request) {
            if($.zeusValidate.sessionExpired(request)) {
                return;
            }
            var modalID = 'modal-grid';
            var gridModal = $('#' + modalID);
            // Always remove modal if it exists so it can be recreated from scratch and prepared with behaviours (keeping it was causing bootstrap-maxlength to apply twice and then error)
            if(gridModal.length > 0) {
                gridModal.remove();
            }
            var gridModal = $rhea.makeModalDialogElement('', '', '', modalID);

            var prepareModal = function (html) {
                var sourceTreeviewId = $(e.target).closest('.jstree').parent().attr('id')
                $(gridModal).data("sourceTreeviewId", sourceTreeviewId)
                    // Update inner HTML
                gridModal.find('.modal-body').html($.zeusValidate.replaceAll(html, 'id="main_form"', 'id="gridmodal_form"'));
                    // Include offset link to correct a display issue where having all buttons hidden causes the modal container not to wrap all contents
                var fix = $('<a href="javascript:;" class="modal-fix" tabindex="-1">&nbsp;</a>');
                var nestedButtons = gridModal.find('.modal-body .nestedButtons');
                $(nestedButtons[nestedButtons.length -1]).prepend(fix);
                    // Show modal
                $rhea.showModalDialogElement(gridModal);
                    // Prepare modal after it's visible so calculateColumnWidths can work properly
                $rhea.prepareNewContent(gridModal);

                gridModal.find('.modal-body button').not('ul.amc-selected-choices li button').not('button[data-zbcl]').bind('click.zeus-modal-btn', handleModal);
            };

                var handleModal = function (event) {
                    event.preventDefault();
                    var button = $(this);
                    if(button.hasClass('cancel') && (button.attr(fullDataTypes.SkipValidation) == undefined || button.attr(fullDataTypes.SkipValidation) == "false")) {
                        $rhea.dismissModalDialogElement(gridModal);
                        return;
                    }
                    if (gridModal.hasClass('modal-loading')) {
                        return;
                    }
                    gridModal.addClass('modal-loading');
                    var spinnerModal = $('<div class="modal-loader"><span class="spinner-small"></span></div>');
                    gridModalBody = gridModal.find('.modal-body');
                    gridModalBody.prepend(spinnerModal);

                    var ajaxOptions = {
                        url: url,
                        type: 'POST',
                        cache: false,
                        global: false
                    };
                    var gridForm = gridModal.find('form');
                        // Handle Rich Text Box
                        $.zeusValidate.updateCkeditorInstances(gridForm);
                        var dataToPost;
                        if (gridForm.find('input[type="file"]').length == 0) { // use regular query string
                            dataToPost = $rhea.serializeform(gridForm) + '&submitType=' + button.attr('value');
                        }
                        else { // Use multipart form
                        $.extend(ajaxOptions, {
                            processData: false,
                            contentType: false,
                        });
                            dataToPost = new FormData();
                            // add each input one by one to the data to send
                            gridForm.find('input,select,textarea').each(function () {
                            var current = $(this);
                            var currentName = current.attr('name');
                            if(currentName) {
                                currentName = currentName.replace(/.*\./, '');
                                if (current.attr('type') == 'file') {
                                    dataToPost.append(currentName, current[0].files[0]);
                                }
                                else {
                                    dataToPost.append(currentName, $.zeusValidate.getValueFromInput(current));
                                }
                                }
                            });
                        dataToPost.append('submitType', button.attr('value'));
                        }
                    //data from source treeview
                    var postdata = $('#main_form' + ' #' +$(gridModal).data("sourceTreeviewId") + ' input').serialize();
                    // Add the data to send
                    $.extend(ajaxOptions, { data: dataToPost  + postdata});

                    // Launch the request
                    $.ajax(ajaxOptions).done(function(data, textStatus, request) {
                        if($.zeusValidate.sessionExpired(request)) {
                            return;
                        }
                        //redirect option
                        if (data.redirect != undefined)
                        {
                            window.location.href = data.redirect;
                            return;
                        }
                        spinnerModal.remove();
                        gridModal.removeClass('modal-loading');
                        //refresh treeview
                        var treeviewId = $(gridModal).data("sourceTreeviewId")
                        if ($(data).attr('id') == treeviewId) {
                            $('#' +treeviewId).wrap('<p/>').parent().html(data);
                            $('#' +treeviewId).unwrap();
                            $rhea.prepareNewContent($('#' +treeviewId));
                            // Hide modal
                            $rhea.dismissModalDialogElement(gridModal);
                        }
                        else {
                            // Same view but with errors.
                            prepareModal(data);
                        }
                    })
                    .fail(function(xhr, status, data) {
                        var errorText = $.zeusValidate.getErrorInAjax(xhr);
                        var panelHeading = $(group.find('.modal .panel-heading .panel-title')[0]);
                        if (panelHeading != undefined) {
                            var panelId = panelHeading.attr('id');
                            panelHeading = panelHeading.text();
                            panelHeading = panelHeading.length ? '<a class="alert-link" href="#' + panelId + '">' + panelHeading + '</a> - ' : panelHeading;
                        } else {
                            panelHeading = '';
                        }
                        errorText = panelHeading + (errorText != undefined ? errorText : 'Error occurred while loading');
                        if (xhr.responseText.indexOf('Maximum request length exceeded') >= 0) {
                            errorText = panelHeading + 'Error occurred while loading (maximum request length exceeded)';
                        }
                        $.zeusValidate.addError(errorText, $('.modal'));
                        spinnerModal.remove();
                        gridModal.removeClass('modal-loading');
                    });
                };
                // Initial prepare
                prepareModal(data);
                }).fail(function (xhr, status, data) {
                var errorText = $.zeusValidate.getErrorInAjax(xhr);
                errorText = (errorText != undefined ? errorText : 'Error occurred while loading.');
                $.zeusValidate.addError(errorText);
            });
        }
    };

    // Wrapper around constructor to prevent against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Zeus(this, options));
            }
        });
    };

})(jQuery, window, document);

$(document).ready(function () {
    $(document).zeus();
});
