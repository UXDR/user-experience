
;  (function ($, window, document, undefined) {

    var setValidationValues = function (options, ruleName, value) {
        options.rules[ruleName] = value;
        if (options.message) {
            options.messages[ruleName] = options.message;
        }
    };

    var $Unob = $.validator.unobtrusive;

    $Unob.adapters.add("isequalto", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isequalto", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("isnotequalto", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isnotequalto", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("isgreaterthan", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isgreaterthan", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("isgreaterthanorequalto", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isgreaterthanorequalto", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("islessthan", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "islessthan", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("islessthanorequalto", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "islessthanorequalto", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("isregexmatch", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isregexmatch", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    $Unob.adapters.add("isnotregexmatch", ["dependentproperty", "comparisontype", "passonnull", "failonnull"], function (options) {
        setValidationValues(options, "isnotregexmatch", {
            dependentproperty: options.params.dependentproperty,
            comparisontype: options.params.comparisontype,
            passonnull: options.params.passonnull,
            failonnull: options.params.failonnull
        });
    });
    
    
    $Unob.adapters.add("requiredif", ["contingencies"], function (options) {
        var value = {};

        setValidationValues(options, "requiredif", value);
    });

    // Override "required" so checkbox elements are mandatory if their property was decorated with the [Required] attribute
    $Unob.adapters.add("required", function (options) {
        setValidationValues(options, "required", true);
    });
    
    $Unob.adapters.addBool("crn");
    
    $Unob.adapters.addBool("abn");
    
    $Unob.adapters.addBool("currency");
    
})(jQuery, window, document);


/* Override of jQuery unobtrusive validation functions 'onErrors' and 'onError' */
$(function() {
    setupFormValidation($(document));
});

function setupFormValidation(context) {
    context.find('form').each(function() {

        var getDisplayName = function(element) {
            var displayName = $(element).data($.zeusDataTypes.DisplayName);
                    
            if (displayName == undefined) {
                displayName = $(element)[0].name;
            }

            return displayName;
        };
        
        // Copy of jquery function used by 'onError' (cannot access from outside)
        var escapeAttributeValue = function(value) {
            return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
        };

        // remove old handler for 'onErrors'
        $(this).unbind("invalid-form.validate");

        // set new handler for 'onErrors'
        $(this).bind("invalid-form.validate", function(event, validator) { // 'this' is the form element
            var container = $(this).find("section#validation-error-summary"),//[data-valmsg-summary=true]
                list = container.find("ul");

            if (list && list.length && validator.errorList.length) {
                list.empty();
                //alert('invalid-form.validate unobstrusive')
                container.addClass("validation-summary-errors");
                container.addClass("alert");
                container.addClass("alert-danger");
                container.removeClass("validation-summary-valid");
                container.removeClass("noErrors");
                var errorsToAdd = [];
                $.each(validator.errorList, function () {

                    var elementID = $(this.element)[0].id;
                    var li = undefined;
                    var errorMessage = this.message;


                    var dateTimePicker = $('#' + elementID + '_Date').length && $('#' + elementID + '_Time').length;

                    if (dateTimePicker) {
                        elementID = elementID + '_Date';
                    }

                    // Update the 'error tip' associated with this element with new message.
                    // Logic: find the closest 'error tip' to this element
                    // Then, check the anchor tag's attribute 'data-zet' and ensure it is same as 'element id' (this confirms that error tip belongs to current element).
                    // The anchor (error tip) contains two span elements, the second span (with 'for' attribute) actually contains the error message, so we will replace that text with new message here.
                    var errorTipSelector = 'a.errorTip[' + $.zeusFullDataTypes.ErrorTipFor + '="' + elementID + '"]';
                    // Find the error tips in 'isContainer' div.
                    var errorTipsFound = $('#' + elementID).closest('iscontainer').find(errorTipSelector);
                    if (errorTipsFound.length == 0) {
                        // If no error tips are found, then do a global search.
                        errorTipsFound = $(errorTipSelector);
                    }
                    $(errorTipsFound).each(function () {
                        // At this stage we have found the error tip for 'elementID'.
                        var errorTip = $(this);
                        // Now we will find the second span (with 'for' attribute).
                        $(errorTip).find('span[for="' + elementID + '"]').text('Error: ' + errorMessage);
                        // Only process a single error tip (we assume that error tips are unique because of the 'data-zet=elementId' attribute).
                        return;
                    });

                    var anchor = $('<a class=\'alert-link\' href="javascript:;">' + getDisplayName(this.element) + '</a>').on("click", function (event) {
                        var element = $('#' + elementID);
                        $.zeusValidate.focusErrorOnElement(element);
                    });
                    li = $("<li />").append(anchor).append(' - ' + this.message);
                    //li = $("<li />").append('<a class=\'alert-link\' href="#' + elementID + '">' + getDisplayName(this.element) + '</a> - ' + this.message);

                    var errorToAdd = getDisplayName(this.element) + ' - ' + this.message;

                    // Don't add duplicate errors
                    if (li != undefined && $.inArray(errorToAdd, errorsToAdd) == -1) {
                        li.appendTo(list);

                        errorsToAdd.push(errorToAdd);
                    }
                });
                // Send focus to the first found error
                var childLinks = list.find('a');
                if (childLinks.length) {
                    childLinks.first().focus();
                }
            }

            // NOTE: Error messages will no longer be shown inside panels. Hence commenting out this portion.
            /*
            // find all panels, iterate through them 
            //      then iterate through errors, 
            //          get closest section of the current error
            //          if panelId == closestSectionId then
            //              and add these errors to the panel.

            var panelContainers = $(".panel-body section[data-valmsg-summary=true]");//[data-valmsg-summary=true]
            $.each(panelContainers, function () {
                var panelContainer = $(this);
                var panelHasErrors = false;
                var panelList = panelContainer.find("ul");

                if (panelList && panelList.length && validator.errorList.length) {

                    panelList.empty();
                    //alert('invalid-form.validate unobstrusive')

                    var errorsToAddPanel = [];

                    $.each(validator.errorList, function () {

                        var elementID = $(this.element)[0].id;
                        var li = undefined;
                        var duplicateLi = undefined;

                        // process individual element errors inside this panel.
                        var closestContainer = $('#' + elementID).closest('.panel-body').find('[data-valmsg-summary=true]');//

                        if (closestContainer.length && closestContainer[0].id == panelContainer[0].id) {

                            panelHasErrors = true;

                            var dateTimePicker = $('#' + elementID + '_Date').length && $('#' + elementID + '_Time').length;
                            if (dateTimePicker) {
                                elementID = elementID + '_Date';
                            }

                            li = $("<li />").append('<a class=\'alert-link\' href="#' + elementID + '">' + getDisplayName(this.element) + '</a> - ' + this.message);

                            var errorToAdd = getDisplayName(this.element) + ' - ' + this.message;

                            // Don't add duplicate errors
                            if (li != undefined && $.inArray(errorToAdd, errorsToAddPanel) == -1) {
                                li.appendTo(panelList);
                                errorsToAddPanel.push(errorToAdd);
                            }
                        }
                    });

                    if (panelHasErrors) {
                        panelContainer.addClass("validation-summary-errors");
                        panelContainer.addClass("alert");
                        panelContainer.addClass("alert-danger");
                        panelContainer.removeClass("validation-summary-valid");
                        panelContainer.removeClass("noErrors");
                    }
                }
            });
            */
            //**********************************************

                
                // Focus main error form header, Heading 3 is in place instead of h2.
                var errorHeading = $('#validation-error-summary h4');
                
                if (errorHeading.length) {
                    // Temporarily add tabindex to allow focus on non <input>, <a> and <select> element
                    errorHeading.attr('tabindex', '-1');
                    
                    // Apply focus
                    errorHeading.focus();
                    $('div#page-container').animate({ scrollTop: 0 }, "fast"); // Sometimes error message is hidden behind the page 'header', so we scroll to top. Alternatively we can use window.scroll(0,0); if animation is not desired.
                    
                    // Remove tabindex
                    //errorHeading.removeAttr('tabindex');
                }
        });

        var validator = $.data($(this)[0], 'validator');
        var settings = validator.settings;

        // Whether to focus the first invalid property by default
        settings.focusInvalid = false;
        
        // Remove rechecking that doesn't work properly on compund controls
        settings.onkeyup = settings.onclick = settings.onfocusout = function () { };

        settings.ignore = function () {
            var content = $('#content');
            
            if (content != undefined) {
                var skip = (/^true$/i.test(content.data($.zeusDataTypes.SkipValidation))) ? true : false;
                
                if (skip) {
                    return true;
                }
            }

            var disabled = $(this).is(':disabled') || $(this).is('[readonly]'); // [Editable(false)] ends up adding the readonly attribute to the markup, so we ignore such fields from being validated here.
            var hidden = $(this).is(':hidden');
            
            if (hidden) {
                // Handle Date Time picker
                var dp = $('#' + this.id + '_Date');
                var tp = $('#' + this.id + '_Time');

                if (dp.length && tp.length) {
                    return dp.is(':hidden');
                }

                // Handle amc-aria-multi-selects
                var amcContainer = $(this).siblings().first();
                if (amcContainer.length > 0 && amcContainer.is('.amc-aria-multi-complete')) {
                    return amcContainer.is(':hidden');
                }

                // Handle Rich Text box
                var richTextboxContainer = $(this).closest('[' + $.zeusFullDataTypes.RichTextArea + '=\'true\']');
                if ($(this).is('textarea') && richTextboxContainer.length && richTextboxContainer.is(':visible')) { // ensure the container is not hidden (by other process).
                    return false;
                }

                // Ignore hidden
                return true;
            }

            // Ignore if disabled
            return disabled ? true : false;
        };
        
        var form = $(this);
        settings.errorPlacement = function(error, inputElement) { // 'this' is the form element
            var container = form.find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']"),
                replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;

            container.removeClass("field-validation-valid").addClass("field-validation-error");
            error.data("unobtrusiveContainer", container);
            var displayElement = $('#' + inputElement[0].id);

            // Handle amc-aria-multi-selects
            var amcContainer = displayElement.siblings().first();
            if (amcContainer.length > 0 && amcContainer.is('.amc-aria-multi-complete')) {
                displayElement = amcContainer.find('.amc-box');
            }

            if (replace) {
                container.empty();
                $('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + escapeAttributeValue(inputElement[0].name) + '"]').hide();
                //$('#InnerContainerFor-' + inputElement[0].id).removeClass('parsley-error');
                displayElement.removeClass('parsley-error');
                
                error.removeClass("input-validation-error").appendTo(container);
                error.removeClass("input-validation-error").appendTo($('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + escapeAttributeValue(inputElement[0].name) + '"]'));
                
                if (error[0].innerHTML.length > 0) {
                    $('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + escapeAttributeValue(inputElement[0].name) + '"]').show();
                    //$('#InnerContainerFor-' +inputElement[0].id).addClass('parsley-error');
                    displayElement.addClass('parsley-error');
                }
            } else {
                error.hide();
                
                $('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + escapeAttributeValue(inputElement[0].name) + '"]').hide();
                
                //$('#InnerContainerFor-' +inputElement[0].id).removeClass('parsley-error');
                displayElement.removeClass('parsley-error');
            }
        };
        
        // Exact copy of jquery.validate.js file elements() function but with [disabled] exclusion removed which is now handled in our custom ignore() function
        // This is mainly for validation to trigger properly for <select> elements that are disabled and tranformed into select2 dropdowns
        validator.elements = function () {
            var validator = this,
                rulesCache = {};
            var disabledAddressFieldSelector = "select[" + $.zeusFullDataTypes.AddressAutocomplete + "=true]:disabled";
            // select all valid inputs inside the form (no submit or reset buttons) and exclude any disabled Address Autocompletes.
            return $(this.currentForm)
            .find("input, select, textarea")
            .not(":submit, :reset, :image, " + disabledAddressFieldSelector )
            .not( this.settings.ignore )
            .filter(function() {
                if ( !this.name && validator.settings.debug && window.console ) {
                    console.error( "%o has no name assigned", this);
                }

                // select only the first element for each name, and only those with rules specified
                if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
                    return false;
                }

                rulesCache[this.name] = true;
                return true;
            });
        };
        
        //copy of method showLabel() in Jquery.validate-vsdoc.js
        //Process added to prevent addition of multiple span tags containing errors on elements.
        validator.showLabel = function(element, message) {
            var label = this.errorsFor(element);
            if (label.length) {
                    // refresh error/success class
                    label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);

                    // check if we have a generated label, replace the message then
                    label.attr("generated") && label.html(message); 
               
            } else { 
                    // create label
                    var messageToDisplay = message !== undefined ? "Error: " + message : "";
                    label = $("<" + this.settings.errorElement + "/>")
                        .attr({ "for": this.idOrName(element), generated: true })
                        .addClass(this.settings.errorClass)
                        .html(messageToDisplay); 
                    if (this.settings.wrapper) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
            }

            if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
            this.toShow = this.toShow.add(label);
            
            // tidy element -> Preventing addition of multiple span tags on same element
            var name = this.idOrName(element);
             
            var errorTipAnchor = $('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + name + '"]');
            
            if(errorTipAnchor.length == 0) {
                
                //check if name contains '_'
                while(name.indexOf('_') >= 0) 
                {
                    name = name.replace('_', '.');
                }
                errorTipAnchor = $('[' + $.zeusFullDataTypes.ErrorTipFor + '="' + name + '"]');
            }
            if(message === undefined) 
            {
                //remove span elements 
                errorTipAnchor.find('[generated="true"]').remove();
            } 
            else 
            {
                var spanCollection = errorTipAnchor.find('[generated="true"]');
                if (spanCollection.length > 1)
                { //if there is error(message) and if method has generated second span tag then remove it.
                    spanCollection.next().remove();
                } 
            }

        };

        // Override original required method to handle validating a datetime picker
        $.validator.methods.required = function (value, element, param) {
            // For date time picker, only show required message if both the date and time inputs are empty,
            // as our 'date' validation in zeus.validate will show a more relevant message when only a date or time is entered
            var dateTimePicker = $(element).data($.zeusDataTypes.DateTimePicker);

            if (dateTimePicker != undefined) {
                var baseId = element.id.substring(0, element.id.lastIndexOf('_'));
                var dateElementValue = $.trim($('#' + baseId + '_Date').val());
                var timeElementValue = $.trim($('#' + baseId + '_Time').val());

                // Pass required check when date time is partially complete, the 'date' validation will show an error message for this case to still prevent submission
                if ((dateElementValue == '' && timeElementValue != '') || (dateElementValue != '' && timeElementValue == '')) {
                    return true;
                }
            }

            // check if dependency is met
            if (!this.depend(param, element)) {
                return "dependency-mismatch";
            }
            if (element.nodeName.toLowerCase() === "select") {
                // could be an array for select-multiple or a string, both are fine this way
                var val = $(element).val();
                return val && val.length > 0;
            }
            if (this.checkable(element)) {
                return this.getLength(value, element) > 0;
            }

            return $.trim(value).length > 0;
        };
    });
}

(function ($) {
    $.validator.unobtrusive.parseDynamicContent = function (selector) {
        //use the normal unobstrusive.parse method
        $.validator.unobtrusive.parse(selector);

        //get the relevant form
        var form = $(selector).first().closest('form');
        if (form.length == 0) form = $('#main_form');
        setupFormValidation(form.parent());

        //get the collections of unobstrusive validators, and jquery validators
        //and compare the two
        var unobtrusiveValidation = form.data('unobtrusiveValidation');
        var validator = form.validate();

        if (unobtrusiveValidation == undefined || unobtrusiveValidation.options == null || unobtrusiveValidation.options == undefined) {
            return;
        }

        $.each(unobtrusiveValidation.options.rules, function (elname, elrules) {
            if (validator.settings.rules[elname] == undefined) {
                var args = {};
                $.extend(args, elrules);
                args.messages = unobtrusiveValidation.options.messages[elname];
                //edit:use quoted strings for the name selector
                $("[name='" + elname + "']").rules("add", args);
            } else {
                $.each(elrules, function (rulename, data) {
                    if (validator.settings.rules[elname][rulename] == undefined) {
                        var args = {};
                        args[rulename] = data;
                        args.messages = unobtrusiveValidation.options.messages[elname][rulename];
                        //edit:use quoted strings for the name selector
                        $("[name='" + elname + "']").rules("add", args);
                    }
                });
            }
        });
    }
})($);


