var cal = ics();

var semesters = {
    "2022 Spring": {
        startDate: "01/18/2022",
        endDate: "05/06/2022",
    },
    "2022 Summer": {
        startDate: "05/23/2022",
        endDate: "08/12/2022",
    },
    "2022 Fall": {
        startDate: "08/24/2022",
        endDate: "12/09/2022"
    },
    "2023 Spring": {
        startDate: "01/10/2023",
        endDate: "05/12/2023"
    },
    "2023 Summer": {
        startDate: "05/22/2023",
        endDate: "08/11/2023"
    },
    "2023 Fall": {
        startDate: "08/23/2023",
        endDate: "12/08/2023"
    },
    "2024 Spring": {
        startDate: "01/16/2024",
        endDate: "05/03/2024"
    },
    "2024 Summer": {
        startDate: "05/20/2024",
        endDate: "08/09/2024"
    },
    "2024 Fall": {
        startDate: "08/28/2024",
        endDate: "12/13/2024"
    },
    "2025 Spring": {
        startDate: "01/21/2025",
        endDate: "05/09/2025"
    },
    "2025 Summer": {
        startDate: "05/27/2025",
        endDate: "08/15/2025"
    },
    "2025 Fall": {
        startDate: "08/27/2025",
        endDate: "12/12/2025",
    },
    "2026 Spring": {
        startDate: "01/20/2026",
        endDate: "05/08/2026",
    },
    "2026 Summer": {
        startDate: "05/26/2026",
        endDate: "08/14/2026"
    },
    "2026 Fall": {
        startDate: "08/26/2026",
        endDate: "12/11/2026"
    },
    "2027 Spring": {
        startDate: "01/19/2027",
        endDate: "05/07/2027"
    },
    "2027 Summer": {
        startDate: "05/24/2027",
        endDate: "08/13/2027"
    },
    "2027 Fall": {
        startDate: "08/25/2027",
        endDate: "12/10/2027"
    },
    "2028 Spring": {
        startDate: "01/18/2028",
        endDate: "05/05/2028"
    },
    "2028 Summer": {
        startDate: "05/22/2028",
        endDate: "08/11/2028"
    },
    "2028 Fall": {
        startDate: "08/23/2028",
        endDate: "12/08/2028"
    },
    "2029 Spring": {
        startDate: "01/16/2029",
        endDate: "05/04/2029"
    },
    "2029 Summer": {
        startDate: "05/21/2029",
        endDate: "08/10/2029"
    }
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function addToCalendar(term, c) {
    const rrule = {
        freq: "WEEKLY",
        byday: c.days,
        interval: 1,
        until: new Date(semesters[term].endDate).addDays(1)
    }
    const earliestDayAfter = (date, days) => {
        days = days.map(d => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(d)).sort()
        for (let i = 0; i < days.length; ++i) {
            let d = days[i]
            if (d >= date.getDay()) {
                return date.addDays(d - date.getDay())
            }
        }
        return date.addDays(7 + days[0] - date.getDay())
    }
    const setTime = (date, t) => {
        const parseTime = (time) => {
            const r = /(.*)([ap]m)/g
            const result = [...time.matchAll(r)][0]
            const d = new Date("02/02/2020 " + [result[1], result[2]].join(' '))
            return [d.getHours(), d.getMinutes()]
        }
        t = parseTime(t)
        d = new Date(date.toString())
        d.setHours(t[0], t[1])
        return d
    }
    let firstDay = earliestDayAfter(new Date(semesters[term].startDate), c.days)
    cal.addEvent(c.name, "", "", setTime(firstDay, c.startTime), setTime(firstDay, c.endTime), rrule)
}

function parseTable(table) {
    const daysMap = {
        Sunday: "SU",
        Monday: "MO",
        Tuesday: "TU",
        Wednesday: "WE",
        Thursday: "TH",
        Friday: "FR",
        Saturday: "SA"
    }

    function colIndex(heading) {
        let headings = Array.from(table.getElementsByTagName("th")).map(e => e.innerText)
        return headings.findIndex(x => x === heading)
    }

    function isChecked(tbody) {
        return tbody.getElementsByTagName("input")[0].checked
    }

    return Array.from(table.getElementsByTagName("tbody")).filter(isChecked).map(tbody => {
        let cols = tbody.getElementsByTagName("td")
        let nameIndices = [colIndex('Subject'), colIndex('Course'), colIndex('Component')]
        let name = nameIndices.map(x => cols[x].firstChild.textContent).join(' ')
        let days = Array.from(cols[colIndex('Day(s) & Location(s)')].getElementsByTagName("span"))
                        .map(e => e.getAttribute("aria-label")).filter(x => x !== null)
        let startTime, endTime
        try {
            let target = cols[colIndex('Day(s) & Location(s)')].firstElementChild.firstElementChild.firstElementChild.innerHTML
            let matches = [...target.matchAll(/> (.*)$/g)][0]
            let substrs = matches[1].split(' - ')
            startTime = substrs[0], endTime = substrs[1]
        } catch (error) {
            console.warn("Cannot find times for " + name + ". Does this class have missing fields?")
            console.warn(error);
            return null
        }
        return {
            name: name,
            days: days.map(d => daysMap[d]),
            startTime: startTime,
            endTime:endTime
        }
    }).filter(o => o !== null)
}

Array.from(document.getElementsByTagName("table")).forEach(table => {
    const classes = parseTable(table)
    const term = (() => {
        var term = Array.from(document.getElementsByTagName("strong")).filter(e => e.innerText === "Term")[0]
        return term.parentNode.parentNode.children[1].innerText
    })()
    classes.forEach(c => addToCalendar(term, c))
})

cal.download();
