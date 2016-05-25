/* Javascript JQuery real time search script by David Mitterer
   Made for Demo Node.js Web Server 
*/

// real time search
$("#restSearch").keyup(function (e) {
    if ($("#restSearch").val() == "") {
        $("#result").empty(); //empties the results when no value
      
    } else {
        if (e.which == 13) {                        // on enter press get first result
            var _id = $("#result p").first().text();
            _id = _id.substr(_id.length - 24);
            meClicked(_id);
        } else {
            $.post("/search",                       // post search in mongo
                { name: $("input").val() },
                function (data, status) {

                    $("#detail").css("display", "none");
                    $("#result").empty();
                    var i = 0, len = data.length;
                    $("#result").append("<div style='margin-bottom: 5px'><i>Results:</i></div>")
                    for (i; i < len; i++) {
                        $("#result").append(
                            "<p onclick = 'meClicked(\"" + data[i]._id + "\")' class='hov'>" +
                            "<b>" + data[i].name + "</b>  (" +
                            data[i].address.street + " " + data[i].address.building + ".) <i hidden>Restaurant ID:" + data[i]._id + "</i></p>"
                        )
                    }
                })
        }
    }
});

// when result is clicked, append details and initialises calendar     
function meClicked(dat) {
    $.get("api/" + dat, function (data, status) { 
          $("#detail").css("display: none;");
          $("#detail").html(
            "<div class='grey'><p class='restHeading'><b>Restaurant Info:</p>" +
            "<div class ='table-responsive'><table border='0' class='table' style='border-top: 1px solid #fff'><tr><td ><b>Name</b>:</td> " + "<td id='restNam'>" + data.name + "</td> <td>" +
            "<b>Address:</b> " + "</td> <td>" + data.address.street + " " + data.address.building + "</td></tr>" +
            "<tr> <td> <b>Cuisine</b>: </td> <td>" + data.cuisine + "</td> <td>" + "<b>Borough:</b> " + "</td> <td>" + data.borough +
            "</td> </tr></table> </div> </div>" + "<p hidden id='restID'>" + data._id + "</p>" +
            "<div class='white grey'><p class=restHeading><b>Make a reservation</b></p>" +
            "<div id='calendar' style='width:50%,height:50%;'></div></div>"
        );


        // initiales fullcalendar.io
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                right: 'resetDate'
            },
            customButtons: {
                resetDate: {
                    text: 'Delete',
                    click: function () {
                        var ids = [];
                        for (i = 0; i < $('#calendar').fullCalendar('clientEvents').length; i++) {
                            if ($('#calendar').fullCalendar('clientEvents')[i].color == "Red") { //if appointments are marked red, push them them to Array
                                var appID = $('#calendar').fullCalendar('clientEvents')[i]._id;
                                ids.push($('#calendar').fullCalendar('clientEvents')[i]._id);

                            }
                        }

                        if (ids.length == 0) {
                            alert("Please mark the appoitments you want to delete by clicking on them")
                        } else {
                            deleteApp(ids, function (result) {
                                $("#delMessage").text(result);
                                $('#deletePopUp').modal();
                                 setTimeout(function () { $('#deletePopUp').modal("hide") }, 2000);
                                $('#calendar').fullCalendar('refetchEvents');
                            })
                        }
                    }
                },
                saveDate: { // currently not used
                    text: 'Save',
                    click: function () {

                        var all = ""
                        for (i = 0; i < $('#calendar').fullCalendar('clientEvents').length; i++) {
                            all = all + $('#calendar').fullCalendar('clientEvents')[i].title + " "
                        }
                        alert(all);
                    }
                }
            },
            allDaySlot: false,
            firstDay: 1,
            height: "auto",
            defaultView: 'agendaWeek',
            columnFormat: "ddd D/M",
            minTime: "09:00:00",
            maxTime: "21:00:00",
            editable: false,
            selectable: true,
            selectHelper: true,
            select: function (start, end) {
                emptyMe();
                // adds the school title and selected Date 
                $("#appTitle").html("Where: <b>" + $("#restNam").text() + " </b> <br>When: <b id='appStart'>" + moment(start).format("ddd, MMMM Do YYYY, h:mm a") + "</b>" + "<p hidden id='startAppoint'>" + start + "<p>");

                //calculates the minutes from end to start 
                var dur = moment.duration(end - start).asMinutes();
                var min = moment.duration(end - start);
                

                // nescessary to select the right duration for the appointment. Does not allow more than 5  hours (or 301 minutes) duration
                $("#selectTime").val(
                    function () {
                        if (dur < 301) {
                            var minute = min.minutes() + "0";
                            var stunde = min.hours();
                            return "0" + stunde + ":" + minute.substr(0, 2) + " hours" //could be solved nicer maybe, #rewrite
                        } else { return "05:00 hours" }
                    }
                );
                //opens Pop Up. saveApp Button handles the rest
                $("#appointPop").modal();

            },

            eventClick: function (event, element) {
                if (event.color !== "Red") {
                    event.color = "Red"
                } else { event.color = "Blue" };
                $('#calendar').fullCalendar('updateEvent', event);
            },
            timeFormat: 'H:mm', // uppercase H for 24-hour clock
            events:
            {
                url: '/calupdate',
                type: 'POST',
                data: {
                    restaurant_id: data._id,
                    time: 'somethingelse'
                },
                error: function () {
                    alert('there was an error while fetching events!');
                },
                color: 'blue',   // a non-ajax option
                textColor: 'white' // a non-ajax option
            }

        });
    })
    $("#detail").fadeIn();
    $("#result").empty();
};


// handles popup save button
$("#saveApp").click(function () {
    var timef = $("#selectTime").val(); //gets the selected time frame
    // converts string to date. Maybe easier solution with fewer variables #rewrite
    var startDateString = $("#startAppoint").text();
    var start = new Date(parseInt(startDateString));
    var timeEnd = moment(start).add(timef.substr(0, 2), "hours").add(timef.substr(3, 2), "minutes"); //calculates

    var eventData = {};
    eventData = {
        title: $("#appName").val(),
        start: start,
        end: timeEnd
    };
    saveApp(eventData, function (result) {
        $("#saveApp").hide();
        $("#myAppAlert").hide();
        $("#myAppAlert").append(
            '<div class="alert alert-info" style="margin-top: 25px">' + result + '</div>'
        )
        $("#myAppAlert").fadeIn();
        setTimeout(function () { $("#closeAppBut").click() }, 3000); //gives user time to read message
        $('#calendar').fullCalendar('refetchEvents');

    });
});



// save Appointment with callback
function saveApp(eventData, callback) {
    $.post("/calupdate/save",
        {
            title: eventData.title,
            start: eventData.start.toString(),
            end: eventData.end.toString(),
            restID: $("#restID").text()
        },
        function (data, status) {
            callback(data)
        }
    )
};

//delete Appointment
function deleteApp(eventID, callback) {

    $.post("/calupdate/delete",
        {
            eventID: eventID,
            restID: $("#restID").text()
        },
        function (data, status) {
            callback(data)
        }
    )
};


// handels save new Restaurant Button click 

$("#saveButt").click(function () {

    $.post("/api/saverest",
        {
            restName: $("#restName").val(),
            restAddress: $("#restAddress").val(),
            restCuisine: $("#restCuisine").val()
        },
        function (data, status) { //make a function for alerts in pop ups #rewrite
            $("#saveButt").hide();
            $("#myAlert").hide();
            $("#myAlert").append(
                '<div class="alert alert-info" style="margin-top: 25px">' + data + '</div>'
            )
            $("#myAlert").fadeIn();
            setTimeout(function () { $("#closeBut").click() }, 2000); //gives user time to read message

        });
});

//resets pop ups the dirty way, maybe #rewrite 
function emptyMe() {
    $(".form-control").val("")
    $("#saveButt").show() //shows the save button again
    $("#saveApp").show() //shows the save button again
    $(".myalerts").empty() //empties Alert boxes
}