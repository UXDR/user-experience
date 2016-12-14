; (function ($, window, document, undefined) {

    $.validator.addMethod("isequalto", function (value, element, params) {
        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;
        
        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("isnotequalto", function (value, element, params) {
        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;

        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("isgreaterthan", function (value, element, params) {
        var currentElement = $(element);
        // If element is date-time picker, then we only consider value of hidden element and not the individual elements for Date and Time.
        if (currentElement.attr($.zeusFullDataTypes.DateTimePicker) == "True" && currentElement.attr('type') != 'hidden') {
            // The reason for this is because validation attributes also end up on .Date, .Time elements of DateTimePicker control along with hidden element.
            return true;
        }

        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;
        
        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("isgreaterthanorequalto", function (value, element, params) {
        var currentElement = $(element);
        // If element is date-time picker, then we only consider value of hidden element and not the individual elements for Date and Time.
        if (currentElement.attr($.zeusFullDataTypes.DateTimePicker) == "True" && currentElement.attr('type') != 'hidden') {
            // The reason for this is because validation attributes also end up on .Date, .Time elements of DateTimePicker control along with hidden element.
            return true;
        }

        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;
        
        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("islessthan", function (value, element, params) {
        var currentElement = $(element);
        // If element is date-time picker, then we only consider value of hidden element and not the individual elements for Date and Time.
        if (currentElement.attr($.zeusFullDataTypes.DateTimePicker) == "True" && currentElement.attr('type') != 'hidden') {
            // The reason for this is because validation attributes also end up on .Date, .Time elements of DateTimePicker control along with hidden element.
            return true;
        }

        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;
        
        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("islessthanorequalto", function (value, element, params) {
        var currentElement = $(element);
        // If element is date-time picker, then we only consider value of hidden element and not the individual elements for Date and Time.
        if (currentElement.attr($.zeusFullDataTypes.DateTimePicker) == "True" && currentElement.attr('type') != 'hidden') {
            // The reason for this is because validation attributes also end up on .Date, .Time elements of DateTimePicker control along with hidden element.
            return true;
        }
        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;

        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("isregexmatch", function (value, element, params) {
        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;

        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("isnotregexmatch", function (value, element, params) {
        var dependentProperty = $('#' + $.zeusValidate.getFieldPrefixFromId(element, params["dependentproperty"]));
        var comparisonType = params["comparisontype"];
        var passOnNull = params["passonnull"];
        var failOnNull = params["failonnull"];
        var dependentPropertyValue = dependentProperty.val();

        var data = $.zeusValidate.handleDateTimeComparison(element, value, dependentProperty, dependentPropertyValue);

        value = data.currentPropertyValue;
        dependentPropertyValue = data.dependentPropertyValue;

        if ($.zeusValidate.is(value, comparisonType, dependentPropertyValue, passOnNull, failOnNull)) {
            return true;
        }

        return false;
    });
    
    $.validator.addMethod("requiredif", function (value, element, params) {
        var property = $(element);
        
        property.trigger('load.zeus-trigger-requiredif');
        
        var allConditionsMet = property.data('requiredif-allconditionsmet');
        
        if (allConditionsMet) {
            // Check if checkbox list has a selection
            if (element.type == 'checkbox' && (/^true$/i.test($(element).data($.zeusDataTypes.CheckboxList)))) {
                value = false;
                // Grab all checkboxes for property and see if any are checked
                var elementProperties = $('input:checkbox[name="' + $.zeusValidate.replaceAll(element.id, '_', '.') + '"]');
                for (var index = 0; index != elementProperties.length; index++) {
                    if (elementProperties[index]["checked"]) {
                        value = true;
                        break;
                    }
                }
            }
            // Check if radio button group has a selection
            else if (element.type == 'radio') {
                value = false;
                // Grab all radio buttons for property and see if any are selected
                var elementProperties = $('input:radio[name="' + $.zeusValidate.replaceAll(element.id, '_', '.') + '"]');
                for (var index = 0; index != elementProperties.length; index++) {
                    if (elementProperties[index]["checked"]) {
                        value = true;
                        break;
                    }
                }
            }
            
            if (value != null) {
                var isNotEmptyString = value.toString().replace( /^\s\s*/ , '').replace( /\s\s*$/ , '') != "";
                    
                if ($.zeusValidate.isDate(value)) {
                    return new Date(Date.parse(value)) != new Date('1/01/0001 12:00');
                }
                    
                if ($.zeusValidate.isBool(value)) {
                    return (/^true$/i.test(value));
                }
                    
                if ($.zeusValidate.isInteger(value)) {
                    return parseInt(value) != 0;
                }
                    
                if ($.zeusValidate.isFloat(value)) {
                    var floatValue = parseFloat(value);
                    var floatValueAsString = (floatValue + "").split(".");
                        
                    if (floatValueAsString.length == 2) {
                        var numberToCompare = "0.";
                            
                        for (var i = 0; i < floatValueAsString[1].length; i++) {
                            numberToCompare = numberToCompare + "0";
                        }

                        return floatValue != parseFloat(numberToCompare);
                    }
                        
                    return floatValue != 0;
                }

                return isNotEmptyString;
            }
        } else {
            return true;
        }

        return false;
    });

    $.validator.addMethod("crn", function(value, element) {
        if (this.optional(element) || value == null || value.length == 0)
        {
            return true;
        }

        if (value.length != 10)
        {
            return false;
        }

        var multiplier = 512;
        var digitSum = 0;
        var checkSumDigits = new Array('X', 'V', 'T', 'S', 'L', 'K', 'J', 'H', 'C', 'B', 'A');

        // Scan digits
        for (var i = 0; i <= 8; i++) {
            // If character is numeric, put it into an array
            if (/^\d+$/.test(value[i]))
            {
                digitSum += value[i] * multiplier;
                multiplier = multiplier / 2;
            }
            else
            {
                // Invalid CRN, don't check further
                return false;
            }
        }

        // Validate checksum value
        return checkSumDigits[digitSum % 11] == value[9];
    });
    
    $.validator.addMethod("abn", function(value, element) {
        if (this.optional(element) || value == null || value.length == 0)
        {
            return true;
        }

        // Trim spaces
        value = $.zeusValidate.replaceAll(value, ' ', '');

        $(element).val(value);

        if (value.length != 11)
        {
            return false;
        }

        var weight = new Array(10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19);
        var sum = 0;
        var digit;

        // Sum the multiplication of all the digits and weights
        for (var i = 0; i < weight.length; i++)
        {
            // If character is numeric, put it into an array
            if (/^\d+$/.test(value[i]))
            {
                digit = parseInt(value[i]);
                
                // Subtract 1 from the first digit before multiplying against the weight
                sum += (i == 0) ? (digit - 1) * weight[i] : digit * weight[i];
            }
            else
            {
                // Invalid ABN, don't check further
                return false;
            }
        }

        // Divide the sum by 89, if there is no remainder the ABN is valid
        return (sum % 89) == 0;
    });
    
    // Identical to number validator except with a dollar sign included
    $.validator.addMethod("currency", function(value, element) {
        return this.optional(element) || /^-?\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
    });

    $.validator.addMethod("date", function(value, element) {
        if ($(element).is(':hidden')) {
            return true;
        }

        var dateTimePicker = $(element).data($.zeusDataTypes.DateTimePicker);
        var valid = false;

        var displayName = element.Name;
        var dataType = "date";

        if (dateTimePicker != undefined) {
            var hiddenInput = $($(element).closest('.datetime').find('input[type="hidden"]')[0]);
            var hiddenValue = hiddenInput.val();
            displayName = hiddenInput.data($.zeusDataTypes.DisplayName);
            dataType = "date and time";
            var parsedDateTimeValue = $.zeusValidate.parseDateTimeUsingMoment(hiddenValue);
            if (parsedDateTimeValue.isValid())
            {
                valid = true;
                // Defect: 14000 If month value is single digit, then prepend zero to it.
                hiddenInput.val(parsedDateTimeValue.format('D/MM/YYYY h:mm A'));
            }

            if (valid) {
                // Check if one of the elements is populated and one is empty. The empty one will be considered invalid
                var baseId = element.id.substring(0, element.id.lastIndexOf('_'));
                var dateElementValue = $.trim($('#' + baseId + '_Date').val());
                var timeElementValue = $.trim($('#' + baseId + '_Time').val());

                if (element.id.match(/_Date$/)) {
                    if (dateElementValue == '' && timeElementValue != '') {
                        valid = false;
                    }
                } else if (element.id.match(/_Time$/)) {
                    if (dateElementValue != '' && timeElementValue == '') {
                        valid = false;
                    }
                }

                //if ((dateElementValue == '' && timeElementValue != '') || (dateElementValue != '' && timeElementValue == '')) {
                //    valid = false;
                //}

                return valid;
            }
        }

        if (this.optional(element)) {
            return true;
        }

        var datePicker = $(element).data($.zeusDataTypes.DatePicker);
        var timePicker = $(element).data($.zeusDataTypes.TimePicker);

        if (value != undefined && value.length) {
            if (datePicker != undefined) {
                displayName = $(element).data($.zeusDataTypes.DisplayName);
                var parsedValue = $.zeusValidate.parseDateUsingMoment(value);
                if (parsedValue.isValid())
                {
                    valid = true;
                    // Defect: 14000 If month value is single digit, then prepend zero to it.
                    $(element).val(parsedValue.format("D/MM/YYYY"));
                }
            } else if (timePicker != undefined) {
                displayName = $(element).data($.zeusDataTypes.DisplayName);
                dataType = "time";
                valid = Date.parseExact(value, 'h:mm tt') != null;
            }
        }

            if (!valid) {
                this.settings.messages[element.name].date = "The field " + displayName + " must be a valid " + dataType + ".";
            }

            return valid;
    });
})(jQuery, window, document);

// Override minlength, maxlength and rangelength to cater to [NumericLength]
$.validator.addMethod("minlength", function (value, element, param) {
    return this.optional(element) || this.getLength($.trim($.zeusValidate.extractNumber(value, element)), element) >= param;
});

$.validator.addMethod("maxlength", function (value, element, param) {
    return this.optional(element) || this.getLength($.trim($.zeusValidate.extractNumber(value, element)), element) <= param;
});

// Override rangelength validator as the internal getLength method does not behave correctly for select tags in both cases of single or multiple selection
$.validator.addMethod("rangelength",
    function (value, element, param) {
    
        var lengths = new Array();

        switch (element.nodeName.toLowerCase()) {
        case 'select':
            var selecteds = $("option:selected", element);

            selecteds.each(function (index, selected) {
                if ($.inArray(selected.value.length, lengths) == -1) {
                    lengths.push(selected.value.length);
                }
            });

            break;
        case 'input':
            if (this.checkable(element)) {
                lengths.push(this.findByName(element.name).filter(':checked').length);
            }
            break;
        }

        if (lengths.length == 0) {
            lengths.push(this.getLength($.zeusValidate.extractNumber(value, element), element));
        }

        var valid = true;

        for (i = 0; i < lengths.length; i++) {
            if (!(lengths[i] >= param[0] && lengths[i] <= param[1])) {
                valid = false;
            }
        }

        return this.optional(element) || valid;
    }
);

// Override min validator to handle currencies
$.validator.addMethod("min", function (value, element, param) {

    // Strip $ and , characters
    if (value != undefined && value != null) {
        value = value.replace( /\$/g , '').replace( /,/g , '');
    }

    return this.optional(element) || value >= param;
});

// Override max validator to handle currencies
$.validator.addMethod("max", function (value, element, param) {
    // Strip $ and , characters
    if (value != undefined && value != null) {
        value = value.replace(/\$/g, '').replace(/,/g, '');
    }
        
    return this.optional(element) || value <= param;
});

// Override range validator to handle currencies
$.validator.addMethod("range", function (value, element, param) {
    // Strip $ and , characters
    if (value != undefined && value != null) {
        value = value.replace(/\$/g, '').replace(/,/g, '');
    }
        
    return this.optional(element) || ( value >= param[0] && value <= param[1] );
});

// Defect 8061: Update error messages to remove 'please' word from it.
jQuery.extend(jQuery.validator.messages, { email: "Enter a valid email address. Example format Job.bloggs@email.com.", url: 'Enter a valid URL.'});


// Override jquery.validate getLength as it is not returning the correct length for select tag which causes the rangelength validator to always fail
//$.validator.prototype.getLength = function(value, element) { return value.length; };