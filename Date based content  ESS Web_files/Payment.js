; (function ($, window, document, undefined) {

    // The following function is a workaround to a ModelMetadata caching issue in the MVC framework that isn't able to be reproduced in the lower environments, which is necessary for a proper, permanent fix.
    // This will override the display text of [Link]'s defined in Employment.Web.Mvc.Area.Payment.ViewModels.JobseekerPayments.VacancyDetailsViewModel.cs
    var fixLinks = function(options) {
        
        // Fix Vacancy link text on Outcome Snapshot page
        if (options.actionName == 'SnapshotDetails' && options.controllerName == 'Available' && options.areaName == 'Payment') {

            // Fix the Vacancy Details ID link
            var vacancyIdContainer = $('#ContainerFor-VacancyDetails_VacancyId');
            var vacancIdInput = $('#VacancyDetails_VacancyId');

            // Ensure the Vacancy Details ID container and input exist on the page
            if (vacancyIdContainer.length && vacancIdInput.length) {
                // Get the Vacancy Details ID input value
                var vacancyId = vacancIdInput.val();

                // Find the corresponding link within the container
                var links = vacancyIdContainer.find('.button a');

                if (links.length == 1) {
                    var link = $(links[0]);
                    var href = link.attr('href');
                    
                    // Confirm it's the correct link by ensuring the link ending matches the input value
                    if (href.indexOf(vacancyId, href.length - vacancyId.length) !== -1) {
                        // Correct the display text of the link
                        link.text('Vacancy');

                        // Mark as having been fixed (so testers can check the display text was updated in the lower environments, where it's already showing the correct display text)
                        link.attr('data-fixed', true);
                    }
                }
            }


            // Fix the Vacancy Details Placement Date link
            var vacancyPlacementDateContainer = $('#ContainerFor-VacancyDetails_PlacementDate');
            var idInput = $('#VacancyDetails_id');

            // Ensure the Vacancy Placement Date container and input exist on the page
            if (vacancyPlacementDateContainer.length && idInput.length) {
                // Get the ID input value
                var id = idInput.val();

                // Find the corresponding link within the container
                var links = vacancyPlacementDateContainer.find('.button a');

                if (links.length == 1) {
                    var link = $(links[0]);
                    var href = link.attr('href');

                    // Confirm it's the correct link by ensuring the link ending matches the input value
                    if (href.indexOf(id, href.length - id.length) !== -1) {
                        // Correct the display text of the link
                        link.text('Vacancy');

                        // Mark as having been fixed (so testers can check the display text was updated in the lower environments, where it's already showing the correct display text)
                        link.attr('data-fixed', true);
                    }
                }
            }
        }

        if ((options.actionName == 'OutcomeTracker' || options.actionName == 'OutcomeTtwTracker') && options.controllerName == 'Available' && options.areaName == 'Payment') {
            // Get the results table
            var resultsTable = $('#ResultsTable');

            if (resultsTable.length)
            {
                // Get all table body rows
                var rows = resultsTable.find('tbody tr').each(function () {
                    var row = $(this);

                    // Get all cells
                    var cells = row.find('td, th');
                    
                    if (cells.length >= 2) {

                        // Get cell 2 which should be the job seeker ID link
                        var link = $(cells[1]).find('a');

                        if (link.length > 0) {
                            // Check the link text has an ID that matches the link href ID
                            var text = link.text();

                            // Regex for getting ID inside parentheses
                            var regex = /\((.*)\)/;

                            var match = text.match(regex);

                            if (match) {
                                var textId = match[1];

                                // Link format is currently ?JobSeekerId=##########
                                regex = /\?JobSeekerId\=([0-9]*)/;

                                var href = link.attr('href');

                                match = href.match(regex);

                                if (match) {
                                    var hrefId = match[1];

                                    // Compare the ID's
                                    if (textId != hrefId) {
                                        // They don't match so rewrite link text to just the link href ID
                                        link.text('(' + hrefId + ')');

                                        // Mark as having been fixed
                                        link.attr('data-fixed', true);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    $(document).ready(function () {
        var body = $('body');

        var options = {};

        options.actionName = body.data($.zeusDataTypes.ActionName);
        options.controllerName = body.data($.zeusDataTypes.ControllerName);
        options.areaName = body.data($.zeusDataTypes.AreaName);

        fixLinks(options);
    });

})(jQuery, window, document);