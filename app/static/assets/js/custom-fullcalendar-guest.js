
var calendarEventsList = []
var newDate = new Date();

var calendarHeaderToolbar = {
    left: 'prev next',
    center: 'title',
    right: 'dayGridMonth,listWeek'
}

function getDynamicMonth() {
   getMonthValue = newDate.getMonth();
   _getUpdatedMonthValue = getMonthValue + 1;
   if (_getUpdatedMonthValue < 10) {
       return `0${_getUpdatedMonthValue}`;
   } else {
       return `${_getUpdatedMonthValue}`;
   }
}

var calendarsEvents = {
    Busy: 'danger',
    Free: 'success',
}

function initCalendar(){
        var calendarEl = document.querySelector('.calendar');
        var checkWidowWidth = function() {
            if (window.innerWidth <= 1199) {
                return true;
            } else {
                return false;
            }
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
        selectable: true,
        height: checkWidowWidth() ? 900 : 1052,
        initialView: checkWidowWidth() ? 'listWeek' : 'dayGridMonth',
        initialDate: `${newDate.getFullYear()}-${getDynamicMonth()}-07`,
        headerToolbar: calendarHeaderToolbar,
        locale: 'en',
        events: calendarEventsList,
        eventClassNames: function ({ event: calendarEvent }) {
            const getColorValue = calendarsEvents[calendarEvent._def.extendedProps.calendar];
            return [
              // Background Color
              'event-fc-color fc-bg-' + getColorValue
            ];
        },

        // eventClick: calendarEventClick,
        windowResize: function(arg) {
            if (checkWidowWidth()) {
                calendar.changeView('listWeek');
                calendar.setOption('height', 900);
            } else {
                calendar.changeView('dayGridMonth');
                calendar.setOption('height', 1052);
            }
        }

    });

    // Calendar Renderation
    calendar.render();
}


document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = '/calendar/get-all-events';
    $.get(apiUrl, function(data) {

        var currentDate = new Date();
        var busyEventsInCurrentMonth = data.filter(function(jsonString) {
            var eventDate = new Date(jsonString.start);
            return jsonString.category === 'Busy' && eventDate.getMonth() === currentDate.getMonth();
        });

        var countBusyEventsInCurrentMonth = busyEventsInCurrentMonth.length;
        let freeEventsCount = countBusyEventsInCurrentMonth
        if (freeEventsCount < 0) {
            freeEventsCount = 0
        }
        $('#adValue').html(freeEventsCount);

        data.forEach(function(jsonString) {
            calendarEventsList.push({
                id: jsonString.id,
                title: jsonString.title,
                start: jsonString.start,
                end: jsonString.end,
                extendedProps: { calendar: jsonString.category }
            });
          });
        initCalendar()
    })
    .fail(function() {
      console.log('Error');
    });
});