$(document).ready(function () {
    var root = $(document);
    var calendarRoot = $('div.vertical-box');
    var rightSideButtons = ('div.fc-right');
    var leftSideButtons = ('div.fc-left');
    var gotoDateDivClass = 'Goto-DateContainer';
    var gotoDateDiv = 'div.' + gotoDateDivClass;
    var calendarHeader = 'div.fc-toolbar';
    var moreLink = 'a.fc-more';

    FullCalendarOverrides = {
        processEachCalendar: function () {
            setTimeout(function () {
                $(calendarRoot).each(function (em) {
                    var currentCalendar = $(this);
                    FullCalendarOverrides.applyChangesToCalendar(currentCalendar);
                });
            }, 1);
        },

        applyChangesToCalendar: function (currentCalendar) {
            // Apply changes to calendar here.
            if (currentCalendar != undefined && currentCalendar.length == 1) {

                // Remove and place Goto-DateContainer next to month.
                if ($(currentCalendar).find(leftSideButtons).length == 1) {
                    if ($(leftSideButtons).find(gotoDateDiv).length == 0) {
                        $(leftSideButtons).append($(gotoDateDiv));
                    }
                }

                if ($(currentCalendar).find(moreLink).length >= 1) {                    
                    $(moreLink).each(function () {                        
                        var currentLink = (this);                       
                        if ($(currentLink).attr('href') == undefined)
                        {
                            // double !! checks for both false or undefined.
                            $(currentLink).attr('href', 'javascript:;');
                        }
                        // Add focus on Close button
                        $(currentLink).click(function () { 
                            setTimeout(function () {
                                // we wait until the popup of events is rendered and then apply focus on close.
                                $('button.fc-close.close').focus(); 
                            }, 20);
                        });                        
                    });
                }

                if ($(currentCalendar).find('.fc-prev-button .readers').length == 0) {
                    $(currentCalendar).find('.fc-prev-button').append($('<span>').addClass("readers").text("Previous day"));
                }
                if ($(currentCalendar).find('.fc-next-button .readers').length == 0) {
                    $(currentCalendar).find('.fc-next-button').append($('<span>').addClass("readers").text("Next day"));
                }

            }
        }
    };

    if ($(root).find(calendarRoot).length >= 1) {

        $(root).resize(function () {
            FullCalendarOverrides.processEachCalendar();
        });

    }
});