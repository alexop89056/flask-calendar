

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
        events: calendarEventsList,
        locale: 'en',
        select: calendarSelect,
        unselect: function() {
            console.log('unselected')
        },
        customButtons: {
            addEventButton: {
                text: 'Add Event',
                click: calendarAddEvent
            }
        },
        eventClassNames: function ({ event: calendarEvent }) {
            const getColorValue = calendarsEvents[calendarEvent._def.extendedProps.calendar];
            return [
              // Background Color
              'event-fc-color fc-bg-' + getColorValue
            ];
        },

        eventClick: calendarEventClick,
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

    // Add Event
    getModalAddBtnEl.addEventListener('click', function() {

        var getModalCheckedRadioBtnEl = document.querySelector('input[name="event-level"]:checked');

        var getTitleValue = getModalTitleEl.value;
        var setModalStartDateValue = getModalStartDateEl.value;
        var setModalEndDateValue = getModalEndDateEl.value;
        var getModalCheckedRadioBtnValue = (getModalCheckedRadioBtnEl !== null) ? getModalCheckedRadioBtnEl.value : '';

        var postData = {
            id: uuidv4(),
            title: getTitleValue,
            start: setModalStartDateValue,
            end: setModalEndDateValue,
            extendedProps: { calendar: getModalCheckedRadioBtnValue }
        };
        $.post('/calendar/add-event', postData, function(response) {
            if (response.status === 'success') {
                calendar.addEvent({
                    id: response.insertId,
                    title: getTitleValue,
                    start: setModalStartDateValue,
                    end: setModalEndDateValue,
                    allDay: true,
                    extendedProps: { calendar: getModalCheckedRadioBtnValue }
                })
                myModal.hide()
            }
        }).fail(function(error) {
            alert("Error " + error.responseText);
        });
    })



    // Update Event
    getModalUpdateBtnEl.addEventListener('click', function() {
        var getPublicID = this.dataset.fcEventPublicId;
        var getTitleUpdatedValue = getModalTitleEl.value;
        var getEvent = calendar.getEventById(getPublicID);

        var getModalUpdatedCheckedRadioBtnEl = $('input[name="event-level"]:checked:first').val();

        var getModalUpdatedCheckedRadioBtnValue = (getModalUpdatedCheckedRadioBtnEl !== null) ? getModalUpdatedCheckedRadioBtnEl.value : '';

        var xhr = new XMLHttpRequest();
        var url = '/calendar/update-event';
        var updateData = {
            id: getPublicID,
            title: getTitleUpdatedValue,
            extendedProps: { calendar: getModalUpdatedCheckedRadioBtnEl }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                var response = JSON.parse(xhr.responseText);

                if (response.status === 'success') {
                    getEvent.setProp('title', getTitleUpdatedValue);
                    getEvent.setExtendedProp('calendar', getModalUpdatedCheckedRadioBtnEl);
                    myModal.hide();
                }
            } else {
                alert('Error: ' + xhr.statusText);
            }
        };

        xhr.onerror = function() {
            alert('Error: ' + xhr.statusText);
        };

        xhr.send(JSON.stringify(updateData));
    })


    // Remove Event
    getModalRemoveBtnEl.addEventListener('click', function() {
        var getPublicID = this.dataset.fcEventPublicId;
        console.log(getPublicID)
        var getEvent = calendar.getEventById(getPublicID);

        var xhr = new XMLHttpRequest();
        var url = '/calendar/delete-event';
        var updateData = {
            id: getPublicID,
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                var response = JSON.parse(xhr.responseText);

                if (response.status === 'success') {
                    getEvent.remove();
                    myModal.hide();
                }
            } else {
                alert('Error: ' + xhr.statusText);
            }
        };

        xhr.onerror = function() {
            alert('Error: ' + xhr.statusText);
        };

        xhr.send(JSON.stringify(updateData));
    })

    // Calendar Renderation
    calendar.render();

}

var calendarEventsList = []
var newDate = new Date();

var calendarHeaderToolbar = {
    left: 'prev next addEventButton',
    center: 'title',
    right: 'dayGridMonth,listWeek'
}

var calendarSelect = function(info) {
        getModalAddBtnEl.style.display = 'block';
        getModalUpdateBtnEl.style.display = 'none';
        getModalRemoveBtnEl.style.display = 'none';

        getModalStartDateBlock.style.display = 'none';
        getModalEndDateBlock.style.display = 'none';
        myModal.show()
        getModalStartDateEl.value = info.startStr;
        getModalEndDateEl.value = info.endStr;
}

var calendarAddEvent = function() {
        var currentDate = new Date();
        var dd = String(currentDate.getDate()).padStart(2, '0');
        var mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = currentDate.getFullYear();
        var combineDate = `${yyyy}-${mm}-${dd}T00:00:00`;
        getModalAddBtnEl.style.display = 'block';
        getModalUpdateBtnEl.style.display = 'none';
        getModalRemoveBtnEl.style.display = 'none';

        getModalStartDateBlock.style.display = 'block';
        getModalEndDateBlock.style.display = 'block';
        myModal.show();
        getModalStartDateEl.value = combineDate;
}



var calendarEventClick = function(info) {
   var eventObj = info.event;

   if (eventObj.url) {
     window.open(eventObj.url);

     info.jsEvent.preventDefault();
   } else {
       var getModalEventId = eventObj._def.publicId;
       var getModalEventLevel = eventObj._def.extendedProps['calendar'];
       // console.log(getModalEventLevel)
       var getModalCheckedRadioBtnEl = document.querySelector(`input[value="${getModalEventLevel}"]`);

       getModalTitleEl.value = eventObj.title;
       getModalCheckedRadioBtnEl.checked = true;
       getModalUpdateBtnEl.setAttribute('data-fc-event-public-id', getModalEventId)
       getModalRemoveBtnEl.setAttribute('data-fc-event-public-id', getModalEventId)
       getModalAddBtnEl.style.display = 'none';
       getModalUpdateBtnEl.style.display = 'block';
       getModalRemoveBtnEl.style.display = 'block';

       getModalStartDateBlock.style.display = 'none';
       getModalEndDateBlock.style.display = 'none';
       myModal.show();
   }
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

var getModalTitleEl = document.querySelector('#event-title');
var getModalStartDateEl = document.querySelector('#event-start-date');
var getModalEndDateEl = document.querySelector('#event-end-date');
var getModalAddBtnEl = document.querySelector('.btn-add-event');
var getModalUpdateBtnEl = document.querySelector('.btn-update-event');
var getModalRemoveBtnEl = document.querySelector('.btn-remove-event');

var getModalStartDateBlock = document.querySelector('#event-start-date-block');
var getModalEndDateBlock = document.querySelector('#event-end-date-block');
var calendarsEvents = {
    Busy: 'danger',
    Free: 'success',
}

var myModal = new bootstrap.Modal(document.getElementById('exampleModal'))
var modalToggle = document.querySelector('.fc-addEventButton-button ')

document.getElementById('exampleModal').addEventListener('hidden.bs.modal', function (event) {
    getModalTitleEl.value = '';
    getModalStartDateEl.value = '';
    getModalEndDateEl.value = '';
    var getModalIfCheckedRadioBtnEl = document.querySelector('input[name="event-level"]:checked');
    if (getModalIfCheckedRadioBtnEl !== null) { getModalIfCheckedRadioBtnEl.checked = false; }
})


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
      console.log('Error.');
    });

    // calendarEventsList.push(
    //     {
    //         id: 1,
    //         title: 'All Day Event',
    //         start: `${newDate.getFullYear()}-${getDynamicMonth()}-01`,
    //         extendedProps: { calendar: 'Work' }
    //     },
    // )

    // var calendarEventsList = [
    //     {
    //         id: 1,
    //         title: 'All Day Event',
    //         start: `${newDate.getFullYear()}-${getDynamicMonth()}-01`,
    //         extendedProps: { calendar: 'Work' }
    //     },
    // ]
});