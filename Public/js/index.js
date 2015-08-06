//Revealing pattern to render Timeline

/*global $, console */
var eventOrganizer = (function() {
    "use strict";
    var changeCounter = 0;


    /*Fetch event data*/
    var fetchEvents = function(interval) {
        $.ajax({
            url: "https://github.com/khimanshu11/eventTimeline/tree/gh-pages/Public/data/sample-data.json",
            type: "GET",
            success: function(data) {
                evaluateDayEvent(data, interval);
            },
            error: function(data) {
                console.log(data);
            }
        });
    };


    /*Define time interval for the day user want to see event details*/
    var timeInterval = function timeStamp(counter) {
        var now = new Date();
        var today = new Date(now.setDate(now.getDate() + counter));
        today = today.setHours(0, 0, 0, 0);
        var tomorrow = new Date(now.setDate(now.getDate() + 1));
        tomorrow = tomorrow.setHours(0, 0, 0, 0);

        return {
            today: today,
            tomorrow: tomorrow
        };
    };

    /*Next day information*/
    var nextDayCount = function() {
        changeCounter += 1;
        var interval = timeInterval(changeCounter);
        presentDay(interval.today);
        fetchEvents(interval);
    };

    /*Previous day information*/
    var preDayCount = function() {
        changeCounter -= 1;
        var interval = timeInterval(changeCounter);
        presentDay(interval.today);
        fetchEvents(interval);
    };

    /*Present day information*/
    var today = function() {
        changeCounter = 0;
        var interval = timeInterval(changeCounter);
        presentDay(interval.today);
        fetchEvents(interval);
    };

    /*Get all the events for that particular day*/
    var evaluateDayEvent = function(data, interval) {
        var dayEvents = [],
            eventCounts = 0,
            startEvent = 0,
            endEvent = 0;
        for (eventCounts = 0; eventCounts < data.length; eventCounts += 1) {
            data[eventCounts].startTime = startEvent = new Date(data[eventCounts].startTime);
            startEvent = startEvent.getTime();
            data[eventCounts].endTime = endEvent = new Date(data[eventCounts].endTime);
            endEvent = endEvent.getTime();
            if (interval.today < startEvent && interval.tomorrow > endEvent) {
                dayEvents.push(data[eventCounts]);
            }
        }
        dayEvents.sort(sortStartTime);
        createTimeLine(dayEvents);
    };

    /*Render each event on time line*/
    var createTimeLine = function(dayEvents) {
        var timelineToday = $(".timeLineToday");
        timelineToday.empty();
        var eventCount = 0;
        for (eventCount = 0; eventCount < dayEvents.length; eventCount += 1) {
            var eventDescription = "";
            var startHeight = 60 * (dayEvents[eventCount].startTime.getHours()) + dayEvents[eventCount].startTime.getMinutes();
            var endHeight = 60 * (dayEvents[eventCount].endTime.getHours()) + dayEvents[eventCount].endTime.getMinutes();
            var oHeight = endHeight - startHeight;
            var marginTop = startHeight - 720;
            eventDescription = '<div class = "eventTime" style = "margin-top: ' + marginTop + 'px; height:' + oHeight + 'px; z-index: ' + eventCount + '">' +
                '<div class = "eventInfo">' + dayEvents[eventCount].title + '</div>' +
                '<div class = "eventTiming">' + formatAMPM(dayEvents[eventCount].startTime) + ' - ' + formatAMPM(dayEvents[eventCount].endTime) + '</div>' +
                '<div class = "change"><span>edit</span><span>delete</span><span>cancel</span>' +
                '</div>';
            timelineToday.append(eventDescription);
        }
    };

    /*Get AM and PM detail of time*/
    var formatAMPM = function(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
    };

    /*Perfom sorting based on start time of event*/
    var sortStartTime = function(a, b) {
        if (a.startTime.getTime() < b.startTime.getTime()) {
            return -1;
        }
        if (a.startTime.getTime() > b.startTime.getTime()) {
            return 1;
        }
        return 0;
    };

    /*Mapping for getting correct date format*/
    var presentDay = function(todayDate) {
        var showDate = new Date(todayDate),
            weekMapping = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            monthMapping = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ],
            getDateValue = weekMapping[showDate.getDay()] + ", " + monthMapping[showDate.getMonth()] + " " + showDate.getDate() + ", " + showDate.getFullYear();
        $(".dateUpdate").text(getDateValue);

    };

    return {
        nextDay: nextDayCount,
        previousDay: preDayCount,
        today: today
    };
})();

/*Start page with today events*/
eventOrganizer.today();