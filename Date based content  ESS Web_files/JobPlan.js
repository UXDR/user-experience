    var timeoutID;
    var customFunction = function (options) {
        if (options.actionName == 'Summary' && options.controllerName == 'JobPlan' && options.areaName == 'JobSeeker') {
            if (window.location.search.indexOf('flag=Create') > -1) {
                bindevent();
            }
            var addActivity = "AddActivity";
            var reg = RegExp(addActivity, "i");
            
            $('a[href]').filter(function () {
                return reg.test(this.href);
            }).each(function () {
                $(this).on("click", function () {
                    bindevent();
                });
            });
        }
    };

    function bindevent() {
        timeoutID = setInterval(function () {
            var input = $('#Details_ActivityDetails_Activity');
            if (input.length) {
                input.on('change.asdasdasd', function (e) {
                    var textarea = $('#Details_ActivityDetails_Comments');
                    if (this.value == 'JS09') {
                        if (textarea.length) {
                            textarea.text("I understand I can report this job search by either reporting on an approved paper form, or online via jobsearch.gov.au or via other methods as agreed with my provider.");
                        }
                    } else {
                        textarea.text('');
                    }
                });
                clearInterval(timeoutID);
            }
        }, 2000);
    }
    $(document).ready(function () {
        var body = $('body');

        var options = {};

        options.actionName = body.data($.zeusDataTypes.ActionName);
        options.controllerName = body.data($.zeusDataTypes.ControllerName);
        options.areaName = body.data($.zeusDataTypes.AreaName);
        customFunction(options);
    });

