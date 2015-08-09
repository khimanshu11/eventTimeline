//Revealing pattern to render Timeline

/*global $, console */
"use strict";
var eventOrganizer = (function() {
    var changeCounter = 0;


    /*Fetch event data*/
    var fetchEvents = function(interval) {
        $.ajax({
            url: "../data/sample-data.json",
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
        var eventCount = dayEvents.length - 1;
        /*Algorithm to render the events in O(n) iteration*/
        while (eventCount > 0) {
            var left = 0;
            var width = 100;
            var backTraceEvents = 0;
            var startHeight = 0;
            var endHeight = 0;
            var oHeight = 0;
            var marginTop = 0;
            /*Grouping overlappiing events and rendering them in a group*/
            if (dayEvents[eventCount].startTime.getTime() < dayEvents[eventCount - 1].endTime.getTime()) {
                var groupEvent = [];
                backTraceEvents = eventCount;
                while (backTraceEvents >= 1) {
                    if (dayEvents[backTraceEvents].startTime.getTime() < dayEvents[backTraceEvents - 1].endTime.getTime()) {
                        groupEvent.push(dayEvents[backTraceEvents]);
                        backTraceEvents--;
                    } else {
                        break;
                    }
                }
                groupEvent.push(dayEvents[backTraceEvents]);
                width = width / (groupEvent.length);
                var p = 0;
                for (var j = groupEvent.length - 1; j >= 0; j--) {
                    left = p * width;
                    startHeight = 60 * (groupEvent[j].startTime.getHours()) + groupEvent[j].startTime.getMinutes();
                    endHeight = 60 * (groupEvent[j].endTime.getHours()) + groupEvent[j].endTime.getMinutes();
                    oHeight = endHeight - startHeight;
                    marginTop = startHeight - 720;
                    renderEvent(groupEvent, startHeight, endHeight, oHeight, marginTop, p, timelineToday, left, width);
                    p++;
                }
            }
            if (backTraceEvents !== 0) {
                eventCount = backTraceEvents - 1;
            } else { /*Render logic for non overlapping events*/
                startHeight = 60 * (dayEvents[eventCount].startTime.getHours()) + dayEvents[eventCount].startTime.getMinutes();
                endHeight = 60 * (dayEvents[eventCount].endTime.getHours()) + dayEvents[eventCount].endTime.getMinutes();
                oHeight = endHeight - startHeight;
                marginTop = startHeight - 720;
                renderEvent(dayEvents, startHeight, endHeight, oHeight, marginTop, eventCount, timelineToday, left, width);
                eventCount--;
            }
        }
        onClickFire();
    };

    /*Render function*/
    var renderEvent = function(dayEvents, startHeight, endHeight, oHeight, marginTop, eventCount, timelineToday, left, width) {
        var eventDescription = "";
        /*Condition for rendering event whichh duration is less than or equeal to 15 min*/
        if (oHeight <= 15) {
            oHeight = 15;
            eventDescription = '<div class = "eventTime" style = "margin-top: ' + marginTop + 'px; height:' + oHeight + 'px; z-index: ' + eventCount + ';left : ' + left + '%; width:' + width + '%">' +
                '<div class = "eventTiming">' + formatAMPM(dayEvents[eventCount].startTime) + ' - ' + '<span>' + dayEvents[eventCount].title + '</span></div>' +
                '</div>';
        } else { /*Render event for other cases*/
            eventDescription = '<div class = "eventTime" style = "margin-top: ' + marginTop + 'px; height:' + oHeight + 'px; z-index: ' + eventCount + ';left : ' + left + '%; width:' + width + '%">' +
                '<div class = "eventTiming">' + formatAMPM(dayEvents[eventCount].startTime) + ' - ' + formatAMPM(dayEvents[eventCount].endTime) + '</div>' +
                '<div class = "eventInfo">' + dayEvents[eventCount].title + '</div>' +
                '</div>';
        }
        timelineToday.append(eventDescription);
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
    // On click any event add speech bubble pop up
    var onClickFire = function() {
        $(".eventTime").on("click", function(event) {
            $(".eventExtension").remove();
            var target = event.target;
            var offset = $(this).offset();
            var xCo = event.pageX - offset.left - 45;
            var yCo = event.pageY - offset.top - 90;
            var timeExtention = "<div class=" + "eventExtension" + " style =" + "left:" + xCo + "px;top:" + yCo + "px><span><a href=#>edit</a></span><span><a href=#>delete</a></span><span><a href=#>cancel</a></span></div>";
            $(target).closest(".eventTime").append(timeExtention);
        });

        // On click anywhere else remove speech bubble pop up
        $(document).on("click", function(e) {
            if ($(e.target).closest(".eventTime").length === 0) {
                $(".eventExtension").remove();
            }
        });
    };
    return {
        nextDay: nextDayCount,
        previousDay: preDayCount,
        today: today,
        onClickFire: onClickFire
    };
})();

/*Start page with today events*/
eventOrganizer.today();