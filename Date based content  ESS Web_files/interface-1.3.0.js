$(document).ready(function () {


    // ---------- Miscellaneous UI ----------
    $("#advancedSearchB").click(function() { $('#advancedSearch').slideToggle(300); });
    // Handed in RHEA script: $(".sideNav li a").click(function () { $(this).next().slideToggle(200); });


    // ---------- Tabbed Skip Links ----------
    var SkipLinks = $('#skipLinks');
    SkipLinks.find('a')
		.focus(function () { SkipLinks.removeClass('readers'); })
		.blur(function () { SkipLinks.addClass('readers'); });

    $(".skip").focus(function () { $(this).removeClass('readers'); });
    $(".skip").blur(function () { $(this).addClass('readers'); });


    // ---------- Tabbed Navigation ----------
    $('ul a')
		.focus(function () { $(this).parents('li').addClass('hover'); })
		.blur(function () { $(this).parents('li').removeClass('hover'); });


    // ---------- Fix for Chrome/IE's skip-link-focus ----------
    $("a[href^='#']").click(function () {
        var id = $(this).attr('href');
        var el = $(id);
        if ((!el.is('a') || !el.attr('href')) && !el.is('input'))
            el.attr('tabindex', '-1');
        el.focus();
    });

        
    // ---------- Collapsible Content ----------
    $('article.collapsible').each(function () {
        // Select Objects
        var Article, Pannel, Contents;
        Article = $(this);
        Pannel = Article.find('.collapsiblePannel');
        Contents = Pannel.children();

        Article.find('.collapsibleLink').click(function () {
            if (Article.hasClass('open')) {
                $(this).find('em').text('open');
                Pannel.animate({ height: 0, padding: '0 15' }, function () { $(this).hide() });
            } else {
                $(this).find('em').text('close');
                var h = Pannel.show().height('auto').height();
                Pannel.height(0).animate({ height: h, padding: 15 });
            }
            Article.toggleClass('open close');
            return false;
        });
        Article.click();
    });

    /*
    // ---------- Diary tab navigation ----------
    $('#calendarTabLoop1').focus(function () { $('#loop').attr('tabIndex', -1).focus(); });
    $('#calendarTabLoop2').focus(function () { $('#calendar h1').focus(); });
    $('#calendarSkipToday').click(function () { $('#today ol').attr('tabIndex', -1).focus(); });


    // ---------- Diary overlay ----------
    //http://webstandardssherpa.com/reviews/overlays-and-lightboxes-keys-to-success/
    $("#myDiary, #overlay, #calClose a").click(function (e) {
        var hr, url;
        if (e.target !== this) { return; }
        $('#overlay').fadeToggle(400);
        hr = new Date().getHours();
        url = window.location.href;
        window.location.href = (url.split('#')[0]) + '#' + hr + '00'; //set URL to #hr00 for auto scroll		
        $('#calendar h1').attr('tabIndex', -1).focus();
    });

    // ---------- Diary overlay ESC Key ----------
    $(document).keyup(function (e) {
        if (e.which == 27 && $('#overlay').is(':visible')) {
            $('#overlay').fadeOut(400);
        }
    });


    // ---------- Diary current time [NOT LIVE UPDATE] ----------
    var date, hr, mins;
    date = new Date();
    hr = (date.getHours() * 160) - 1280; // +160px for each hour and -1280px because time starts at 8:00am
    mins = Math.round(date.getMinutes() * 2.666);  // 160px/60mins = 2.666px per min.
    if (date.getHours() > 19) { hr = 1760; mins = 157; } // Max at 17:60.. All work and no play makes Jack a dull boy
    $(".now").css('top', hr + mins);
    */


});