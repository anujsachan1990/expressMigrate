var Sap = Sap || {};
Sap.rail = {
    // sample pnr: 2400938094
      //  nextPnr = 2301106660
    getPnrStaus: function (dataString) {
        $.ajax({
            type: "GET",
            url: "/pnr",
            data: dataString,
            cache: false,
            crossDomain: true,
            contentType: "application/json",
            success: function (data, status) {
                var sentData = JSON.parse(data);
                 console.log(sentData);
                Sap.rail._makeStatustable(sentData);
                Sap.rail.getLatLong(sentData);
            },
            error: function (data) {
                console.log("inError");
            }
        });
    },
    _makeStatustable: function (sentData) {
        $("#pnrtable td.trainNo").html(sentData.result.trainno);
        $("#pnrtable td.trainName").html(sentData.result.name);
        $("#pnrtable td.trainBorad").html(sentData.result.journey);
        $("#pnrtable td.trainFrom").html(sentData.result.from);
        $("#pnrtable td.trainto").html(sentData.result.to);
        $("#pnrtable td.trainReserve").html(sentData.result.to);
        $("#pnrtable td.trainBordingPoint").html(sentData.result.brdg);
        $("#pnrtable td.trainClass").html(sentData.result.cls);
        $("#pnrtable").removeClass("hide");
        Sap.rail._passangersInfo(sentData);
    },
    _passangersInfo: function (sentData) {
        $("#passangerstable tbody").html("");
        $.each(sentData.result.passengers, function (v, i) {
            $("#passangerstable tbody").append("<tr><td>Passenger (" + v + ")</td><td>" + sentData.result.passengers[v].bookingstatus + "</td><td>" + sentData.result.passengers[v].currentstatus + "</td></tr>");
        });
        $("#passangerstable").removeClass("hide");
    },
    eventBinders: function () {
        $("#checkPnr").click(function () {
            var task = "pnr";
            var query = "pnr=" + $("#pnrInput").val();
            var dataString = 'task=' + task + '&query=' + query;
            if (query === '') {
                alert("Please Fill All Fields");
            } else {
                Sap.rail.getPnrStaus(dataString);
            }
            return false;
        });
        $("#setAlaram").on("click", function () {
            Sap.rail.makeAlarm();
        });

        $(".currentStatus").on("click",function(){
            var trainno = $("#trainNo").val();
            Sap.rail.getLiveTrainStation(trainno);

        });
    },
    anujtime: function () {
        var now = new Date();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        if (min <= 9) {
            min = "0" + min;
        }
        if (sec <= 9) {
            sec = "0" + sec;
        }
        if (hour > 12) {
            hour = hour - 12;
            add = "pm";
        } else {
            hour = hour;
            add = "am";
        }
        if (hour == 12) {
            add = "pm";
        }
        if (hour == 00) {
            hour = "12";
        }
        if(document.hours){
            document.hours.clock.value = (hour <= 9) ? "0" + hour : hour;
        document.minutes.clock.value = min;
        document.seconds.clock.value = sec;
        document.ampm.clock.value = add;
        setTimeout("Sap.rail.anujtime()", 1000);
        }
        
    },

    makeAlarm: function () {
        var sound = "1.mp3";
        note = document.arlm.message.value;
        if (note === '') {
            note = 'ALARM!!';
        }
        var hrs = document.arlm.hr.value;
        var min = document.arlm.mts.value;
        var apm = document.arlm.am_pm.value;

        if ((document.hours.clock.value === hrs) && (document.minutes.clock.value === min) && (document.ampm.clock.value === apm) && (document.arlm.music.checked === true)) {
            musicwin = window.open("", "", "width=200,height=50");
            if (navigator.appName == "Microsoft Internet Explorer") musicwin.document.write("<bgsound src=" + sound + " loop='infinite'>" + note)
            else musicwin.document.write("<embed src=" + sound + " hidden='true' border='0' width='20' height='20' autostart='true' loop='true'>" + note)
            musicwin.document.close();
            return false;
        }
        if ((document.hours.clock.value == hrs) && (document.minutes.clock.value == min) && (document.ampm.clock.value == apm) && (document.arlm.music.checked == false)) {
            alert(note);
            return false;
        }
        if (hrs === '') {
            alert('The Hour field is empty');
            return false;
        }
        if (min === '') {
            alert('The Minute field is empty');
            return false;
        }
        if (apm === '') {
            alert('The am/pm field is empty');
            return false;
        }

        if (hrs.length == 1) {
            document.arlm.hr.value = '0' + hrs;
        }
        if (min.length == 1) {
            document.arlm.mts.value = '0' + min;
        }
        if (hrs.length > 2) {
            alert('The Hour is wrongly typed.');
            return false;
        }
        if (min.length > 2) {
            alert('The Minute is wrongly typed.');
            return false;
        }
        if (apm != 'am' && apm != 'pm') {
            alert('The am/pm is wrongly typed.');
            return false;
        }

        setTimeout("Sap.rail.makeAlarm()", 1000);

    },
    getLatLong: function (sentData) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        } else {
            alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
        }

        function successFunction(position) {
            this.lat = position.coords.latitude;
            this.long = position.coords.longitude;
            console.log('Your latitude is :' + lat + ' and longitude is ' + long);

            setTimeout(function () {
                Sap.rail._createCORSRequest(lat, long, sentData)

            }, 1000)
        }

        function errorFunction(position) {
            alert('Error!');
        }
    },
    _createCORSRequest: function (lat, long, sentData) {
        this.getCurrenLoc = $.ajax("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=true").done(function (data) {
            console.log(data);
            this.exactAddres=data.results[0].formatted_address;
            this.area = data.results[0].address_components[1].long_name;
            this.city = data.results[0].address_components[3].long_name;
            this.country = data.results[0].address_components[5].long_name;
            this.Pincode = data.results[0].address_components[7].long_name;
            this.fullAddress = this.area + "," + this.city + "," + this.Pincode;
            console.log(this.area + "," + this.city + "," + this.Pincode);
            $("#CurrentLoction tbody").append("<tr><td>" + this.exactAddres + "</td><td>" + sentData.result.from + "</td></tr>")
            Sap.rail._calCulateTrafficTime(this.Pincode, sentData);
        });
    },


    _calCulateTrafficTime: function (pincode, sentData) {
         var trainSource = sentData.result.from;
        console.log(trainSource)
         console.log(pincode)
        var dataString = 'sourcePin=' + pincode + '&trainSource=' + trainSource;
        $.ajax({
            type: "GET",
            url: "php/trafficProxy.php",
            cache: false,
            data: dataString,
            crossDomain: true,
            contentType: "application/json",
            success: function (result) {
                console.log(result);
                $(".load").addClass("hide");
                $("#CurrentLoction tbody").append("<tr><td>" + result + "</td></tr>");
                $("#CurrentLoction").removeClass("hide");
                $('html, body').scrollTop( $(document).height() );
            },
            error: function (result) {
                alert("sorry your source station is not in our database");
            }
        });
    },
    getLiveTrainStation:function(trainNO,from,date){
        var task = "live";
        var query = encodeURIComponent("&trainno="+trainNO+"&stnfrom=NDLS&date=28-FEB-2015");
        var dataString = 'task=' + task + '&query=' + query;
        $.ajax({
            type: "GET",
            url: "php/proxy.php",
            cache: false,
            data: dataString,
            crossDomain: true,
            contentType: "application/json",
            success: function (result) {
                $(".row.hide").removeClass("hide");
                console.log(result);
                $("#liveLocation tbody").html("");
                 $("#liveLocation tbody").append("<tr><td>" + result.result.name + "</td><td>" + result.result.statusmsg + "</td><td>" + result.result.delayrun + "</td></tr>");
                 $("#liveLocation").removeClass("hide");
                 $(".load").hide();
                 $('html, body').scrollTop( $(document).height() );
            },
            error: function (result) {
                alert("SomeThing Went Wrong");
            }
        });

    },
    localStorage: function () {
        $("#checkPnr").on("click", function (e) {
            e.preventDefault();
            var value = $("#pnrInput").val();
            localStorage.setItem("key", value);

        });
        $("#setAlaram").on("click",function(){
            var hour = $(".hour").val();
            var min = $(".min").val();
            var ampm = $(".ampm").val();
            localStorage.setItem("hour", hour);
            localStorage.setItem("min", min);
            localStorage.setItem("ampm", ampm);
        });

    },
    festivalAlaram : function(holidayDate){
    var holidayDate= "05/04/2015"; //mm/dd format
    //function checkResvationDate(holidayDate){
            var date = new Date(holidayDate);
                date.setDate(date.getDate() - 65);
                var dateMsg = date.getDate()+'/'+ (date.getMonth()+1) +'/'+date.getFullYear();
                var Todaydate = new Date();
                var TodaydateFormat =Todaydate.getDate()+'/'+ (Todaydate.getMonth()+1) +'/'+Todaydate.getFullYear();
                //alert(TodaydateFormat);
                if(dateMsg === TodaydateFormat){
                    var currentTimeobj = new Date();
                    //date.setTime(result_from_Date_getTime);
                    var seconds = currentTimeobj.getSeconds();
                    var minutes = currentTimeobj.getMinutes();
                    var hour = currentTimeobj.getHours();
                    if(hour > 12){
                        hour = hour - 12;
                    }
                    if(minutes > 60){
                        minutes = minutes - 60;
                    }
                    $(".hour").val(hour);
                    $(".min").val(minutes + 1);
                    $(".ampm").val("pm");
                    $(".setmsg").val("Please Book Your Tickets for" + holidayDate);
                    $("#setAlaram").click();
                }
            //}
    },
    init: function () {
        this.eventBinders();
        this.anujtime();
        this.localStorage();
        this.festivalAlaram();
    }
};
$(Sap.rail.init());
$(window).load(function () {
    var StorageLoc = localStorage.getItem("key");
    if (StorageLoc) {
        $("#pnrInput").val(StorageLoc);
        $("#checkPnr").click();
    }
    var StorageHr= localStorage.getItem("hour");
    var Storagemin = localStorage.getItem("min");
    var Storageampm = localStorage.getItem("ampm");  
    if(StorageHr && Storagemin && Storageampm){
        $(".hour").val(StorageHr);
        $(".min").val(Storagemin);
        $(".ampm").val(Storageampm);
        $("#setAlaram").click();
    }   
});