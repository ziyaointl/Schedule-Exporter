var courseIDs = new Set();
document.querySelectorAll(".section-item").forEach((e) => {
    if (e.querySelector(".select").checked) {
        courseIDs.add(e.getAttribute("data-id"));
    }
});

var cal = ics();
var checked = (e) => courseIDs.has(e.id);
var setTime = (date, time) => {
    var d = new Date(date.toString());
    d.setHours(Math.floor(time / 100), time % 100);
    return d;
}
var daysMap = {
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA",
    U: "SU"
}
var addToCalendar = (e) => {
    var courseObject = e.attributes;
    if (courseObject.meetings.length > 0 && checked(e)) {
        var name = courseObject.subjectId + ' ' + courseObject.course + ' ' + courseObject.component;
        var meeting = courseObject.meetings[0]
        var location = meeting.building;
        var days = [];
        [...meeting.daysRaw].forEach(d => days.push(daysMap[d]));
        var rrule = {
            freq: "WEEKLY",
            byday: days,
            interval: 1
        };
        var startDate = meeting.startDate.replace("Z", "");
        startDate = setTime(startDate, meeting.startTime);
        endDate = setTime(startDate, meeting.endTime);
        cal.addEvent(name, "", location, startDate, endDate, rrule);
    }
};
Scheduler.Data.CurrentSections.models.forEach(addToCalendar);
Scheduler.Data.CartSections.models.forEach(addToCalendar);

cal.download();
