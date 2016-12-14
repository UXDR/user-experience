/*
* Aria-select. Javascript to create an accessible multi-select control.
*
* Author: Michael Carter
*
* Requires: jQuery 1.8 or up
*
* Usage: Apply the ariaSelect function to a 'select' element wrapped in a jQuery object:
*        e.g.      ariaSelect($('#idOfSelectElement'));
*
* Options: To change options, specify an options object in the original call
*        e.g.      ariaSelect($('#idOfSelectElement'), {
*                     delayBeforeAutocomplete: <milliseconds>,   // Time to wait after last keystroke before updating the options list. Default: 500
*                     url: <url>,                                // Url to fetch options from via an AJAX call. Default: undefined
*                     errorHandler: <function>,                  // Error handler to call if an ajax call fails. Will be passed (jqXHR, status, response), as per the jQuery ajax "error:" property. Default function(){}
*                     multiple: bool,                            // Whether to allow multiple selections or not. Default: the value of the select element's 'multiple' attribute
*                     delayBeforeAutocomplete: int,              // Number of milliseconds to wait after user input finishes before launching an AJAX options retrieval call. Default: 500
*                     eagerLoad: boolean,                        // Whether to load ajax calls at the earliest possible time. Use 'true' to load on page load or loss of focus, and false to load on focusing on the element. Default: true.
*                     getPostData: function,                     // A function that returns an object of additional data to send to AJAX calls. Default: { return {}; }
*                     global: bool,                              // Whether or not to use the jQuery 'global' option on ajax calls. Default: false
*                     limit: int,                                // The maximum unmber of selections allowed. Default: undefined
*                     closeOnSelect: bool,                       // Whether or not to close the options list upon making a selection. Default: false   
*                     deselectAllowed: bool,                     // Whether or not to allow a selection to be removed. Default: true   
*                     labelText: string,                         // If defined, the text to add to the 'selected values' screen reader text. Default: undefined
*                     allowAjaxCache: bool,                      // If false, will instruct jQuery to disallow caching on ajax requests for this element. Default: true
*                  );
*
* AJAX interface: When making a call to retrieve options via AJAX, aria-select use the following parameters as part of its GET request:
*                    page: a number indicating which page of results to load (will be 1 for initial option loading) - this number will be automatically updated when using paged ajax results
*                    text: the text that has been typed into the input box. Usually used to power a server side autocomplete function
*
*				  On return, it expects a JSON encoded option of the following format:
*                    more: a boolean value indicating whether or not there are more pages of options to be returned (Should be false is your server does not implement paged results)
*                    result: an array of options for use in the multi select component. Each element will have the following format: 
*                    			Text: The text to display to the user
*                    			Value: The value of the option (Used in the 'select' elements 'value' attribute). This MUST be unique for each option
*                    			Selected: not used 
*
*
* Container API: A javascript API that can be called on the ariaSelect container once created
*               var container = ariaSelect(<jquery object>, <options>)
*               container.setEnabled(enabled)                           // Enables or disables the control based on the bollean 'enabled' parameter
*               container.clearAll()                                    // Unselects every item currently selected in the list
*               container.selectOrCreateChoice(value, text, isSelected) // Sets the selected state of a choice in the list, and adds it if it didn't already exist. Cannot CHANGE the text of an already existing element.
*               container.focus()                                       // Puts the focus on the focusable element.
*
* NOTES:
* Avoid using ', ", [, ], <, > in value and text descriptions as this probably doesn't handle them properly.
*/

var ariaselect_counter = 0;
function ariaSelect(root, _options) {
    var options = $.extend({
        url: undefined,
        errorHandler: function(){},
        multiple: root.is("[multiple]"),
        delayBeforeAutocomplete: 500,
        eagerLoad: true,
        getPostData: function () { return {}; },
        global: false,
        limit: undefined,
        closeOnSelect: false,
        deselectAllowed: true,
        labelText: undefined,
        allowAjaxCache: true,
    }, _options);

    root.attr('multiple', 'multiple'); // Require the behaviour of multiple as this is sane, unlike the way single selects work.

    var uniquePrefix = 'amc-' + ariaselect_counter + '-';
    ++ariaselect_counter;
    var uniqueSelectedLabelId = uniquePrefix + 'selected-label';
    var uniqueListId = uniquePrefix + 'list';

    var selectedValues = [];
    var selectedTexts = [];
    var deferredAutocomplete;

    var container = $('<div>').addClass("amc-aria-multi-complete");
    var readonlyPlaceholder = $('<input>').attr("readonly", "readonly").attr("type", "text").attr("aria-label", options.labelText); // Prod Defect 9281: When field is readonly, add label text to input element because it will not match the actual '<label for>'.
    var box = $('<div>').addClass("amc-box").attr("tabindex", "0").attr("aria-expanded", "false").attr('role', 'application');
    var choiceContainerLabelText = (options.labelText == undefined) ? "Selected values" : "Selected values for autocomplete " + options.labelText + ". Press enter to view list options."; // Include autocomplete Prod defect 9321.
    var choiceContainerLabel = $('<span>').attr('id', uniqueSelectedLabelId).addClass('reader-only').text(choiceContainerLabelText);
    var choiceContainer = $('<ul>').addClass("amc-selected-choices").attr('aria-labelledby', uniqueSelectedLabelId);
    var listbox = $('<div>').addClass("amc-listbox").hide();
    var loading = $('<div>').addClass('amc-list-substitute').attr('aria-hidden', 'true').text('Loading...');
    var nomatches = $('<div>').addClass('amc-list-substitute').attr('aria-hidden', 'true').text('No matches');
    var errormatches = $('<div>').addClass('amc-list-substitute').attr('aria-hidden', 'true').text('Error');
    var input = $('<input>')
		.attr("type", "text")
		.attr("role", "combobox")
		.attr("aria-autocomplete", "list")
		.attr("aria-multiselectable", true)
		.attr("aria-owns", uniqueListId)
		.attr("aria-activedescendant", "")
        .attr("aria-label", (options.labelText == undefined) ? "Start typing then use tab key so access values" : "Select "+ options.labelText +", start typing then use tab key so access values");
    ;

    var list = $('<ul>').addClass("amc-all-choices")
		.attr("id", uniqueListId)
        //.attr("aria-live", "polite") // Can't have this here, as it will cause class changes to be announced
    ;
    var focusstealer = $('<div>').attr("tabindex", "0").addClass("reader-only");

    var announcer = $('<div>').addClass("reader-only").attr('aria-live', 'assertive').attr('aria-relevant', 'additions');


    listbox.append(input).append(loading).append(nomatches).append(errormatches).append(list).append(focusstealer);
    box.append(choiceContainerLabel).append(choiceContainer);
    container.append(readonlyPlaceholder).append(box).append(listbox).append(announcer);
    readonlyPlaceholder.hide();
    root.after(container);

    // Functions section
    function announce(message) {
        announcer.empty();
        announcer.append($('<span>').text(message));
    }

    function unselectItemWithValue(value, suppressChangeEvent, forceDeselect) {
        var activeListItem = list.find('[data-value="' + value + '"]').filter('.selected');
        if (activeListItem.length == 1) { // List is available, use the list selection method to remove the item
            activeListItem.find('input[type="checkbox"]').trigger('click', [suppressChangeEvent, forceDeselect]);
        }
        else { // List is not available, manually remove the button
            var index = $.inArray(value, selectedValues);
            if (index > -1) {
                selectedValues.splice(index, 1);
                selectedTexts.splice(index, 1);
                choiceContainer.find('[data-value="' + value + '"]').remove();
                root.find('[value="' + value + '"]').removeAttr('selected');
                if (!suppressChangeEvent) root.trigger("change");
            }
        }
    }

    var ariaselect_ccounter = 0;
    function makeNewVisibleChoice(thevalue, thetext) {
        var uniqueId = uniquePrefix + 'c' + ariaselect_ccounter;
        ariaselect_ccounter++;
        var newLi = $('<li>')
			.attr("data-value", thevalue)
			.attr("role", "option")
			//.attr("aria-selected", "true")
			.attr("id", uniqueId)
            .append($('<span>').text(thetext));
        if (options.deselectAllowed) {
            var visibleClose = $('<span>').attr('aria-hidden', 'true').html(' &times; ');
            var screenReaderClose = $('<span>').addClass('reader-only').text('Remove ' + thetext);
            var closeButton = $('<button>').attr('type', 'button').append(visibleClose).append(screenReaderClose);
            newLi.append(closeButton);
            closeButton.on("keydown.aria-multi-complete", function (event) { event.stopPropagation(); }); // Stop it hitting the box keydown handler
            closeButton.on("focus.aria-multi-complete", closeListBox); // Make sure the box is closed
            closeButton.on("click.aria-multi-complete", function (event) {
                event.stopPropagation();
                event.preventDefault();
                // Work out the conditions for where the focus should go next
                var listIsClosed = box.attr("aria-expanded") != "true";
                var nextFocusableItem = undefined;
                if (newLi.next().length > 0) {
                    nextFocusableItem = newLi.next().find('button');
                }
                else if (newLi.prev().length > 0) {
                    nextFocusableItem = newLi.prev().find('button');
                }

                // Unselect the item and move focus
                unselectItemWithValue(thevalue);
                if (listIsClosed && nextFocusableItem) {
                    nextFocusableItem.focus();
                }
                else {
                    box.focus();
                }
            });
        }
        else {
            // If we can't deselect then the click handler needs to be slightly different
            newLi.on("click.aria-multi-complete", function (event) {
                input.focus();
            });
        }

        choiceContainer.append(newLi);
    }

    var ariaselect_icounter = 0;
    function makeNewListChoice(thevalue, thetext, selected) {
        var uniqueItemId = uniquePrefix + 'i' + ariaselect_icounter;
        ariaselect_icounter++;
        var item = $('<li>')
			.attr('role', 'option')
			//.attr('id', uniqueItemId)
			.attr("data-value", thevalue)
        ;
        var checkbox = $('<input>').attr('type', 'checkbox').attr('id', uniqueItemId).addClass('reader-only').appendTo(item);
        if (selected) {
            item.addClass('selected');
            checkbox.attr('checked', 'checked');
        }
        var label = $('<label>').attr('for', uniqueItemId).text(thetext).appendTo(item);
        label.on("click.aria-multi-complete", function (event) {
            event.preventDefault();
            checkbox.focus();
            checkbox.trigger("click");
        });
        checkbox.on("keydown.aria-multi-complete", function (event) { 
            // Convert pressing the ENTER and SPACE keys to clicks
            if (event.which == 13 || event.which == 10 || event.which == 32) {
                event.preventDefault();
                checkbox.trigger("click");
            }
            // Up
            else if (event.which == 38) {
                event.preventDefault();
                if (item.prev().length > 0) {
                    item.prev().find('input[type="checkbox"]').focus();
                }
            }
            // Down
            else if (event.which == 40) {
                event.preventDefault();
                if (item.next().length > 0) {
                    item.next().find('input[type="checkbox"]').focus();
                }
            }
        });
        checkbox.on("focus", function (event) {
            // make sure the focused element is in view
            list.scrollTop(Math.min(list.scrollTop(), label.position().top + list.scrollTop()));
            list.scrollTop(Math.max(list.scrollTop(), (label.position().top + label.outerHeight() + list.scrollTop() - list.height())));
        });
        checkbox.on('click', function (event, suppressChangeEvent, forceDeselect) { // Capture the clicks so we can force through the extra parameters
            event.preventDefault();
            checkbox[0].checked = !checkbox[0].checked;
            checkbox.trigger('change', [suppressChangeEvent, forceDeselect]);
        });
        var changeGateOpen = true; // Screen readers with IE11 screw up and fire too many change events, so we need to limit to once the number of times this code will run in quick succession for an individual select box
        checkbox.on("change.aria-multi-complete", function (event, suppressChangeEvent, forceDeselect) {
            if (changeGateOpen) {
                event.preventDefault();
                if (!options.multiple && selectedValues.length > 0 && selectedValues[0] != item.attr('data-value')) { // Unselect selected item if only one item is allowed
                    unselectItemWithValue(selectedValues[0], true, true);
                }
                if (options.limit != undefined && selectedValues.length >= options.limit && !item.hasClass('selected')) return; // Don't allow selections beyond the limit

                var thisIsSelected = $.inArray(item.attr('data-value'), selectedValues) != -1;
                if (options.deselectAllowed || !thisIsSelected || forceDeselect) {
                    item.toggleClass('selected');
                    if (item.hasClass('selected')) {
                        var dvalue = item.attr('data-value');
                        var dtext = item.text();
                        selectedValues.push(dvalue);
                        selectedTexts.push(dtext);
                        root.find('[value="' + dvalue + '"]').attr('selected', 'true');
                        makeNewVisibleChoice(dvalue, dtext);
                        announce(dtext + " selected");
                    }
                    else {
                        var index = $.inArray(item.attr('data-value'), selectedValues);
                        if (index > -1) {
                            selectedValues.splice(index, 1);
                            selectedTexts.splice(index, 1);
                            choiceContainer.find('[data-value="' + item.attr('data-value') + '"]').remove();
                            root.find('[value="' + item.attr('data-value') + '"]').removeAttr('selected');
                        }
                    }
                    if (!suppressChangeEvent) root.trigger("change");
                }
                if (options.closeOnSelect) {
                    closeListBox();
                    box.focus();
                }

                // Close the change gate for 10 ms
                changeGateOpen = false;
                window.setTimeout(function () { changeGateOpen = true; }, 10);
            }
        });
        checkbox.on("blur.aria-multi-complete", onLoseFocus);

        list.append(item);
        return item;
    }

    // Adds the new choice (retrieved from AJAX or an API call) to the root backing select list, if required, and ensure the selected state is correct
    function ensureChoiceInBackingList(thevalue, thetext, selected) {
        var existing = root.find('[value="' + thevalue + '"]');
        if (existing.length == 0) {
            existing = $('<option>').attr("value", thevalue).text(thetext);
            root.append(existing);
        }
        if (selected) {
            existing.attr('selected', 'selected');
        }
        else {
            existing.removeAttr('selected');
        }
    }

    // Mimics much of the above function makeNewListChoice ,but isn't itself selectable
    function makeNewListLoadMore(pageNumberToLoad) {
        var uniqueItemId = uniquePrefix + 'i' + ariaselect_icounter;
        ariaselect_icounter++;
        var item = $('<li>')
			.attr('role', 'option')
			.attr('id', uniqueItemId)
			//.attr("aria-selected", "false")
			.attr("tabindex", -1)
        ;
        var checkbox = $('<input>').attr('type', 'checkbox').attr('id', uniqueItemId).addClass('reader-only').appendTo(item);
        var label = $('<label>').attr('for', uniqueItemId).text("Load more options...").appendTo(item);
        label.on("click.aria-multi-complete", function (event) {
            event.preventDefault();
            checkbox.focus();
            checkbox.trigger("click");
        });
        checkbox.on("keydown.aria-multi-complete", function (event) {
            // Convert pressing the ENTER and SPACE key to clicks
            if (event.which == 13 || event.which == 10 || event.which == 32) {
                event.preventDefault();
                checkbox.trigger("click");
            }
            // Up
            else if (event.which == 38) {
                event.preventDefault();
                if (item.prev().length > 0) {
                    item.prev().find('input[type="checkbox"]').focus();
                }
            }
        });
        checkbox.on("click.aria-multi-complete", function (event, suppressChangeEvent) {
            event.preventDefault();
            checkbox.parent().prev().find('input[type="checkbox"]').focus();
            checkbox.text("Loading...").off("click");
            listBuildState = $.Deferred();
            var ajaxOptions = {
                url: options.url,
                type: 'GET',
                dataType: 'json',
                global: options.global,
                data: $.extend({ page: pageNumberToLoad }, options.getPostData()),
                cache: options.allowAjaxCache,
                success: function (data) {
                    item.remove();
                    if (data == null || data == undefined) return;
                    for (var index = 0; index < data.result.length; ++index) {
                        var newChoice = data.result[index];
                        var selected = root.find('[value="' + newChoice.Value + '"]').attr('selected');
                        ensureChoiceInBackingList(newChoice.Value, newChoice.Text, selected);
                        makeNewListChoice(newChoice.Value, newChoice.Text, selected);
                    }
                    announce(data.result.length + " new options");
                    if (data.more) {
                        makeNewListLoadMore(pageNumberToLoad + 1);
                    }
                },
                complete: function (data) {
                    container.attr('aria-busy', 'false');
                    listBuildState.resolve();
                },
                error: function (jqHXR, status, response) {
                    ajaxErrorState = jqXHR.status || 'Unknown';
                    options.errorHandler(jqXHR, status, response);
                },
            }
            var matchText = input.val();
            if (matchText != undefined && matchText != '') {
                ajaxOptions.data.text = matchText;
            }
            container.attr('aria-busy', 'true');
            ajaxErrorState = undefined;
            $.ajax(ajaxOptions);
        });
        checkbox.on("blur.aria-multi-complete", onLoseFocus);

        list.append(item);
    }

    var listBuildState;
    var ajaxErrorState = undefined;
    function rebuildList() {
        listBuildState = $.Deferred();
        var matchText = input.val();
        container.attr('aria-busy', 'true');

        if (options.url) {
            ajaxOptions = {
                url: options.url,
                type: 'GET',
                dataType: 'json',
                global: options.global,
                data: $.extend({ page: 1 }, options.getPostData()),
                cache: options.allowAjaxCache,
                success: function (data) {
                    list.empty();
                    if (data == null || data == undefined) return;
                    for (var index = 0; index < data.result.length; ++index) {
                        var newChoice = data.result[index];
                        var selected = root.find('[value="' + newChoice.Value + '"]').attr('selected');
                        ensureChoiceInBackingList(newChoice.Value, newChoice.Text, selected);
                        makeNewListChoice(newChoice.Value, newChoice.Text, selected);
                    }
                    if (data.more) {
                        makeNewListLoadMore(2);
                    }
                },
                complete: function () {
                    container.attr('aria-busy', 'false');
                    listBuildState.resolve();
                },
                error: function (jqXHR, status, response) {
                    ajaxErrorState = jqXHR.status || 'Unknown';
                    options.errorHandler(jqXHR, status, response);
                },
            }
            if (matchText != undefined && matchText != '') {
                ajaxOptions.data.text = matchText;
            }
            ajaxErrorState = false;
            $.ajax(ajaxOptions);
        }
        else {
            window.setTimeout(function () {
                var choices = root.children();
                if (matchText) {
                    choices = choices.filter(function (index, element) {
                        return $(element).text().toLowerCase().indexOf(matchText.toLowerCase()) >= 0;
                    });
                }
                list.empty();
                choices.each(function () {
                    makeNewListChoice($(this).val(), $(this).text(), $(this).attr('selected'));
                });
                container.attr('aria-busy', 'false');
                listBuildState.resolve();
            }, 0);
        }

    }
    if (options.eagerLoad) { rebuildList(); } // Create list on page load

    function openListBox() {
        if (!options.eagerLoad && box.attr('aria-expanded') == 'false') { rebuildList(); }
        openList();
        listbox.show();
        box.attr("aria-expanded", "true");
        input.focus();
    }

    function closeListBox() {
        listbox.hide();
        closeList();
        box.attr("aria-expanded", "false");
        if (input.val() != '') {
            input.val('');
            if (options.eagerLoad) { rebuildList(); }
        }
    }

    function openList() {
        loading.show();
        var loadingAnnouncer = window.setTimeout(function () {
            announce("Loading");
        }, 100);
        listBuildState.done(function () {
            window.clearTimeout(loadingAnnouncer);
            loading.hide();
            if (ajaxErrorState) {
                var errorText = "Error (" + ajaxErrorState + ") while loading results";
                errormatches.text(errorText);
                errormatches.show();
                announce(errorText);
            }
            else if (list.children().length == 0) {
                if (input.val().length > 0) {
                    nomatches.show();
                    announce("No matches");
                }
            }
            else {
                list.show();
                announce(list.children().length + " results are available, use tab key to navigate.");
            }
        });
    }

    function closeList() {
        loading.hide();
        nomatches.hide();
        errormatches.hide();
        announce();// Just so it clears the text ' results are available, use tab key to navigate' when the list is closed - Prod defect 9321.
        list.hide();
    }

    // Init section
    root.children().each(function () {
        if ($(this).attr('selected')) {
            var thevalue = $(this).val();
            var thetext = $(this).text();
            selectedValues.push(thevalue);
            selectedTexts.push(thetext);
            makeNewVisibleChoice(thevalue, thetext);
        }
    });

    // Event handlers section
    focusstealer.on("focus.aria-multi-complete", function () {
        box.focus();
    });
    box.on("focus.aria-multi-complete", function () {
        closeListBox();
    });
    box.on("click.aria-multi-complete", function () {
        openListBox();
    });
    box.on("keydown.aria-multi-complete", function (event) {
        // Enter or space
        if (event.which == 13 || event.which == 10 || event.which == 32) {
            event.stopPropagation();
            event.preventDefault();
            if (box.attr('aria-expanded') == 'false') {
                openListBox();
            }
            else {
                closeListBox();
            }
        }
    });

    input.on("blur", onLoseFocus);


    $(document).on("click.aria-multi-complete", function (event) {
        var abox = $(event.target).closest(".amc-aria-multi-complete");
        if (abox.length == 0 || abox[0] != container[0]) {
            closeListBox();
        }
    });

    function onLoseFocus() {
        window.clearTimeout(deferredAutocomplete);
    }

    container.on("keydown.aria-multi-complete", function (event) {
        // Escape
        if (event.which == 27 && listbox.is(":visible")) {
            event.stopPropagation();
            closeListBox();
            box.focus();
        }
    });
    input.on("keydown.aria-multi-complete", function (event) {
        // Enter
        if (event.which == 13 || event.which == 10) {
            event.preventDefault();
            if (box.attr("aria-expanded") == "false") return;
            if (list.children().length > 0) {
                list.children().first().find('input[type="checkbox"]').trigger("click");
            }
        }
        // Down
        else if (event.which == 40) {
            event.preventDefault();
            if (list.children().length > 0) {
                list.children().first().find('input[type="checkbox"]').focus();
            }
        }
        // A data key. quick heuristic, is the key backspace (8) or at least space (32), but not left arrow (37) or right arrow (39)
        else if ((event.which == 8 || event.which > 31) && event.which != 37 && event.which != 39) {
            handleInput();
        }
    });
    input.unbind('paste');
    input.bind({
        paste: function () {
            handleInput();
        }
    });

    function handleInput() {
        window.clearTimeout(deferredAutocomplete);
        deferredAutocomplete = window.setTimeout(function () {
            closeList();
            rebuildList();
            openList();
        }, options.delayBeforeAutocomplete);
    }

    // container API
    container.setEnabled = function (enabled) {
        if (enabled) {
            container.children().show();
            closeListBox();
            readonlyPlaceholder.hide();
        }
        else {
            container.children().hide();
            readonlyPlaceholder.val(selectedTexts.join());
            readonlyPlaceholder.show();
        }
    }
    container.clearAll = function () {
        readonlyPlaceholder.val('');
        var valuesToRemove = [];
        for (var index in selectedValues) {
            valuesToRemove.push(selectedValues[index]);
        }
        for (var index in valuesToRemove) {
            unselectItemWithValue(valuesToRemove[index]);
        }
    }
    container.selectOrCreateChoice = function (value, text, isSelected) {
        var existingListItem = list.find('[data-value="' + value + '"]');
        if (existingListItem.length == 0) { // Make a new choice
            ensureChoiceInBackingList(value, text, isSelected);
            var item = makeNewListChoice(value, text, false);
            if (isSelected) {
                if (selectedValues.length > 0 && (!options.multiple || selectedValues[0] == value)) {
                    unselectItemWithValue(selectedValues[0], true, true);
                }
                item.find('input[type="checkbox"]').trigger('click');
            }
        }
        else { // set the selected state on the existing choice
            var backing = root.find('[value="' + value + '"]').attr('selected');
            var currentlySelected = backing != undefined && backing != null && backing != '' && backing != false && backing != 'false';
            if (currentlySelected != isSelected) {
                existingListItem.find('input[type="checkbox"]').trigger('click');
            }
        }
    }
    container.setOption = function (name, value) {
        options[name] = value;
    }
    container.focus = function() {
        box.focus();
    }

    root.hide();
    root.data('ariaSelectReference', container);


    // Fixer for initial focus
    box.on('keydown', function (e) {
        if (e.which != 9 && !e.shiftKey) {
            openListBox();
        }
    });

    return container;
}
