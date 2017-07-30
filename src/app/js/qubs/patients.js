var api_studies_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/studies";
var api_appointment_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/appointments";
var api_public_studies_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/studies/public/%7BpublicToken%7D";
var api_studies_download_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/studies/";
var api_studies_referrals_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/appointments";
var api_studies_report_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/appointments";
var api_user_details_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/users/";

var pagenum = 1;
var size = 10;
var selectedStudy = null;
var total_count;
var show_page_count = 6;


var FirstNameTextBox;
var LastNameTextBox;
var DobTextBox;
var IdTextBox ;
var DescriptionTextBox;
var AccessionTextBox  ;
var FromDateTextBox ;
var ToDateTextBox ;

var intercomStarted = false;

$(document).ready(function () {


    //bring the user detail
    runWithAccessToken(null, getUserDetails);

    $("#search-form").submit(function (e) {
        e.preventDefault();
    });
/*
    $("#adv-search").submit(function (e) {
        e.preventDefault();
    });*/

    //firstname enter press
    document.getElementById("search-first-name").addEventListener("keyup", function (event) {
       
        event.preventDefault();
        if (event.keyCode == 13) {
            serach_data_Geneal();
            var firstnum = 0;
            var size = 10;
            var searchParams = get_search_params(firstnum);
            jQuery('.pager').children().remove();
            runWithAccessToken(searchParams, searchStudies);
            // searchStudies(null, searchParams);
        }
    });

    //lastname enter press
    document.getElementById("search-last-name").addEventListener("keyup", function (event) {
     
        event.preventDefault();
        if (event.keyCode == 13) {
           
            serach_data_Geneal();
            var firstnum = 0;
            var searchParams = get_search_params(firstnum);
            jQuery('.pager').children().remove();
            runWithAccessToken(searchParams, searchStudies);
            // searchStudies(null, searchParams);
        }
    });

    var patientSearchButton = document.getElementById("patient-search-button");

    patientSearchButton.addEventListener("click", function (event) {
        serach_data_Geneal();
        console.log("search button");
        event.preventDefault();
        var firstnum = 0;
        var searchParams = get_search_params(firstnum);
        jQuery('.pager').children().remove();
        runWithAccessToken(searchParams, searchStudies);
        // searchStudies(null, searchParams);
    });

    //Advanced search 
    var AdvancedSearchButton = document.getElementById("advanced-search-button");
    AdvancedSearchButton.addEventListener("click", function (event) {
        serach_data_Advanced();
        event.preventDefault();
        var firstnum = 0;
        var searchParams = get_search_params(firstnum);

            /*{
            "patientFirstName": "benay",
            "patientLastName": "FONg",
            "patientBirthday": "19760105",
            "patientId": "70565",
            "studyDescription": "",
            "accession": "151111",
            "fromDate": "20151019",
            "toDate": "20151020",
            "size": "10",
            "from": "0"
            }*/
        jQuery('.pager').children().remove();
       
        runWithAccessToken(searchParams, searchStudies);
        // searchStudies(null, searchParams);
    });

    //Period search ex: This week, last week, this month, last month.
    var PeriodSearchButton = document.getElementById("period_search");
    PeriodSearchButton.addEventListener("change", function (event) {
        event.preventDefault();
        var curr = new Date; // get current date
        var type = this.value;
        switch (type){
            case 'n_week':  // Current Week
                var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
                var last = first + 6; // last day is the first day + 6
                var firstday = new Date(curr.setDate(first));
                var lastday = new Date(curr.setDate(last));
                break;
            case 'l_week'://Last Week
                var to = curr.setTime(curr.getTime() - (curr.getDay() ? curr.getDay() : 7) * 24 * 60 * 60 * 1000);
                var from = curr.setTime(curr.getTime() - 6 * 24 * 60 * 60 * 1000);
                var firstday = new Date(from);
                var lastday = new Date(to);
               
                break;

            case 'n_month': // Current Month

                var firstday = new Date(curr.getFullYear(), curr.getMonth(), 1);
                var lastday = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);

                break;

            case 'l_month': //Last Month
                
                var firstday = new Date(curr.getFullYear(), curr.getMonth()-1, 1);
                var lastday = new Date(curr.getFullYear(), curr.getMonth(), 0);
                break;
        }
        
       

        fromdate = firstday.yyyymmdd();
        todate = lastday.yyyymmdd();
        serach_data_Period(fromdate,todate);
        var firstnum = 0;
        var searchParams = get_search_params(firstnum);
        jQuery('.pager').children().remove();
       
        runWithAccessToken(searchParams, searchStudies);
    });

     //signout
    var logoutbutton = document.getElementById("logout");
    logoutbutton.addEventListener("click", function (event) {
        window.Intercom('shutdown');
        intercomStarted == false;
        logoutWithAccessToken(null, logout);
    });

    Date.prototype.yyyymmdd = function() {
      var mm = this.getMonth() + 1; // getMonth() is zero-based
      var dd = this.getDate();

      return [this.getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
             ].join('');
    };
    //initial search(by default display this week data.)
    var curr = new Date;
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6
    var firstday = new Date(curr.setDate(first));
    var lastday = new Date(curr.setDate(last));
    fromdate = firstday.yyyymmdd();
    todate = lastday.yyyymmdd();
    serach_data_Period(fromdate,todate);
    var firstnum = 0;
    var searchParams = get_search_params(firstnum);
    jQuery('.pager').children().remove();
   
    runWithAccessToken(searchParams, searchStudies);
});
// 

function startIntercom(user) {
   // console.log(user);
    window.Intercom('boot', {
        app_id: 'xcwvx5ob',
        email: user.username,
        phone: user.phone,
        user_hash: user.hash,
        "clinic": user.clinic,
        "referred": user.referedCompanyDomain,
        "speciality":user.speciality,        
        custom_launcher_selector: '#pacs',
        name: user.firstname + " " + user.lastname, // Full name 
        created_at: user.userCreateTimeStamp // Signup date as a Unix timestamp
    });    
}

function sendIntercomEvent(eventName, metadata) { 
    window.Intercom('trackEvent', eventName, metadata);
}
//get user details
function getUserDetails(userAccessToken, placeholder) {

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                userData = JSON.parse(this.responseText);
                var firstname = userData.user.firstname;
                $(".author").html(firstname.toUpperCase());
                //start intercom
                if (intercomStarted == false){
                    startIntercom(userData.user);
                }
               

            } else {


            }
        }
    });

    var userEmail = getCurrentUsername(null);
    console.log(userEmail);

    //userEmail = "info@fadc.com.au";

    xhr.open("GET", api_user_details_url + encodeURI(userEmail)); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);
}


//Get the search parameters
function get_search_params(firstnum) {
    
    var searchParams = {
            patientFirstName: FirstNameTextBox,
            patientLastName: LastNameTextBox,
            patientBirthday: format_date(DobTextBox),
            patientId: IdTextBox,
            studyDescription: DescriptionTextBox,
            accession: AccessionTextBox,
            fromDate: format_date(FromDateTextBox),
            toDate: format_date(ToDateTextBox),
            from: firstnum,
            size:size
        };
        return searchParams;
}

//advanced search
function serach_data_Advanced(){
     FirstNameTextBox = document.getElementById("fname").value;
     LastNameTextBox = document.getElementById("lname").value;
     DobTextBox = document.getElementById("birthdate").value;
     IdTextBox = document.getElementById("patient-id").value;
     DescriptionTextBox = document.getElementById("description").value;
     AccessionTextBox = document.getElementById("accession").value;
     FromDateTextBox = document.getElementById("from-date").value;
     ToDateTextBox = document.getElementById("to-date").value;

}
//general search
function serach_data_Geneal(){
     FirstNameTextBox = document.getElementById("search-first-name").value;
     LastNameTextBox= document.getElementById("search-last-name").value;
     DobTextBox = document.getElementById("search-dob").value;
     IdTextBox = '';
     DescriptionTextBox = '';
     AccessionTextBox = '';
     FromDateTextBox = '';
     ToDateTextBox = '';
     
}
//period search
function serach_data_Period(fromdate,todate){
     FirstNameTextBox = '';
     LastNameTextBox= '';
     DobTextBox = '';
     IdTextBox = '';
     DescriptionTextBox = '';
     AccessionTextBox = '';
     FromDateTextBox = fromdate;
     ToDateTextBox = todate;
     
}
//Date format
function format_date(c_date){
    if(c_date != ""){
        var date_array = c_date.split("/");
        var new_date;
        if(date_array[1] == undefined){

            var Format_year = c_date.substring(0,4);
            var Format_month = c_date.substring(4,6);
            var Format_date = c_date.substring(6,8);
        }else{
            var Format_year = date_array[2];
            var Format_month = date_array[1];
            var Format_date = date_array[0];
        }
        new_date = Format_year + Format_month + Format_date; console.log(c_date,Format_year);
        return new_date;
    }else{
        return "";
    }
    
}

//when click the page number
function newsearch(num){
    pagenum = num;
    var showcount = Math.ceil(total_count/size);
    if(num == 0 || num == showcount+1){
        return false;
    }
    var searchParams = get_search_params((pagenum-1) * size);
    
    jQuery('.pager').children().remove();
    runWithAccessToken(searchParams, searchStudies);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//check if a nested object has a property
//http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
function checkNested(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
}

//search for patient studies
function searchStudies(userAccessToken, inputDataObject) {

    //null selected study
    selectedStudy = null;

    /* PARAMS
    patientBirthday:
    patientFirstName:
    toDate:
    patientLastName:
    patientId:101050
    accession:
    companyDomain:bmi.qubs.com
    from:0
    fromDate:
    size:10
    studyDescription:
    */

    var params = {
        patientId: 101050,
        companyDomain: "bmi.qubs.com",
        from: 0,
        size: 10
    };
    //var paramStr = jQuery.param(params);
    var paramStr = jQuery.param(inputDataObject);

    console.log(inputDataObject);
    $("#patients-table tr").remove();

    var loaderIndicator = document.getElementById("patients-loading-indicator");
    var patientsListTable = document.getElementById("patients-table");
    //var noSearchResultsState = document.getElementById("noSearchResultsState");

    //show loading indicator
    loaderIndicator.style.display = "block"


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {
            loaderIndicator.style.display = "none"

            if (xhr.status == 200) {
                showTableEmptyStates(false);
                studyListData = JSON.parse(this.responseText);
                total_count = studyListData.total;
                var showcount = Math.ceil(total_count / size)

                console.log(showcount);
                addpager(total_count, pagenum);
                studyListData.items.forEach(function (study) {
                    addStudyToTable(study);

                });
            } else {
                var study = null;
                showSideBarEmptyStates(true);
                showTableEmptyStates(true);
            }

        }
    });

    //support for shared studies
    var publicToken = getParameterByName("token");
    var accessionNo = getParameterByName("a");
    var companyDomain = getParameterByName("d");



    if (accessionNo != null) {
        xhr.open("POST", api_studies_url); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);

        var searchParams = JSON.stringify({
            "accessionNumber": accessionNo,
            "companyDomain": companyDomain
        });

        xhr.send(searchParams);

    } else if (publicToken != null) {
        xhr.open("POST", api_public_studies_url); //public api
        xhr.setRequestHeader("content-type", "application/json");
        var publicTokenJson = JSON.stringify({
            "publicToken": publicToken
        });
        xhr.send(publicTokenJson);

    } else {
        xhr.open("GET", api_studies_url + "?" + paramStr); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);
        xhr.send(null);
    }
    

    //Adding the pagnation 
    function addpager(total_count, pagenum){
        console.log(pagenum);
        pagenum = pagenum;
        var pager = jQuery('.pager');
        var prev = jQuery('<a href="#" onclick="newsearch('+(pagenum-1)+')" class="prev disabled"><i class="icon-arrow-left"></i></a>').appendTo(pager);
        var ul = jQuery('<ul></ul>').appendTo(pager);

        var show_num = Math.ceil(total_count / size);
        var li = '';


        //
        var first_page = 0;
        var last_page;
        if (pagenum <= show_page_count){
            first_page = 0;
            if(show_num < show_page_count){
                last_page = show_num;
            }else{
                last_page = show_page_count;
            }
            
        }else if(pagenum > show_page_count){
            first_page = Math.floor((pagenum-1)/show_page_count) * show_page_count ;
            last_page = first_page + show_page_count;
        }

        for(var i = first_page; i<last_page ; i++){
            li += '<li class="'+(((i+1)==pagenum)?"active":"")+'"><a href="#" onclick="newsearch('+(i+1)+')" >'+ (i+1) +'</a></li>';
        }
        jQuery(li).appendTo(ul);
        var next = jQuery('<a href="#" class="next" onclick="newsearch('+(pagenum+1)+')"><i class="icon-arrow-right"></i></a>').appendTo(pager);
        if(pagenum==1){
            pager.find(".prev").addClass("disabled");
            pager.find(".next").removeClass("disabled");
        }
        if(pagenum != 1 && pagenum!= show_num){
            pager.find(".prev").removeClass("disabled");
            pager.find(".next").removeClass("disabled");
        }
        if(pagenum==show_num){
            pager.find(".prev").removeClass("disabled");
            pager.find(".next").addClass("disabled");
        }
        
    }

    //Adding the study Table
    function addStudyToTable(studyItem) {

        var study = null;
        showSideBarEmptyStates(true);


        //check if item is assignedstudy or just study
        if (checkNested(studyItem, "elasticId")) {
            study = studyItem.study;
        } else {
            study = studyItem;
        }

        var canDeleteStudies = false;
        var canShareStudies = false;
        var canTransferToWAHStudies = false;

        /*
                if (userPermissionsData != null) {

                    userPermissionsData.Items.forEach(function(permission) {


                        if (permission.companyDomain === study.companyDomain) {

                            if (permission.shareStudies == true) {
                                canShareStudies = true;
                            }

                            if (permission.deleteStudies == true) {
                                canDeleteStudies = true;
                            }

                            if (permission.transferToWAH == true) {
                                canTransferToWAHStudies = true;
                            }

                        }



                    }, this);


                }
        */

        /*
            <td data-title="Patient Name"><span class="txt"><a href="#">John Doe</a></span></td>
            <td data-title="Patient ID"><span class="txt">109886</span></td>
            <td data-title="Birthdate"><span class="txt"><time datetime="2017-05-11">18/11/1985</time></span></td>
            <td data-title="Descriptions"><span class="txt">US Pelvis</span></td>
            <td data-title="Accession"><span class="txt">333001</span></td>
            <td data-title="Date"><span class="txt"><time datetime="2017-05-11">21/03/2017</time></span></td>
            <td data-title="Modality"><span class="txt">US</span></td>
            <td data-title="Images"><span class="txt">35</span></td>
         */

        var studyRow = document.createElement('tr');

        var patientNameRow = document.createElement('td');
        patientNameRow.setAttribute("data-title", "Patient Name");
        patientNameRow.innerHTML = '<span class="txt">' + study.patientLastName + " " + study.patientFirstName + '</span>';

        var patientIdRow = document.createElement('td');
        patientIdRow.setAttribute("data-title", "Patient ID");
        patientIdRow.innerHTML = '<span class="txt">' + study.patientId + '</span>';


        var patientBirthDateRow = document.createElement('td');
        patientBirthDateRow.setAttribute("data-title", "Birthdate");
      
        var birthdate = study.patientBirthDate;
        var b_year = birthdate.substring(0,4);
        var b_month = birthdate.substring(4,6);
        var b_date = birthdate.substring(6,8);

        var birthdateFormat = b_date + "/" + b_month + "/" + b_year;

       // patientBirthDateRow.innerHTML = '<span class="txt"><time datetime="' + study.patientBirthDate + '">' + study.patientBirthDate + '</time></span>';
        
        patientBirthDateRow.innerHTML = '<span class="txt"><time datetime="' + birthdateFormat  + '">' + birthdateFormat + '</time></span>';
        //patientBirthDateRow.innerHTML = '<span class="txt"><time datetime="' + study.studyDate  + '">' + study.studyDate  + '</time></span>';
        var studyDescriptionRow = document.createElement('td');
        studyDescriptionRow.setAttribute("data-title", "Descriptions");
        if (checkNested(study, "studyDescription")) {
            studyDescriptionRow.innerHTML = '<span class="txt">' + study.studyDescription + '</span>';
        } else {
            studyDescriptionRow.innerHTML = '<span class="txt"></span>';
        }




        var accessionRow = document.createElement('td');
        accessionRow.setAttribute("data-title", "Accession");
        accessionRow.innerHTML = '<span class="txt">' + study.accessionNumber + '</span>';

        var studyDateRow = document.createElement('td');
        studyDateRow.setAttribute("data-title", "Date");
        //studyDateRow.innerHTML = '<span class="txt"><time datetime="2017-05-11">21/03/2017</time></span></td>';
        studyDateRow.innerHTML = '<span class="txt"><time datetime="' + study.studyDateFormatted + '">' + study.studyDateFormatted + '</time></span>';

        var modalityRow = document.createElement('td');
        modalityRow.setAttribute("data-title", "Modality");
        modalityRow.innerHTML = '<span class="txt">' + study.modality + '</span>';

        var numImagesRow = document.createElement('td');
        numImagesRow.setAttribute("data-title", "Images");
        numImagesRow.innerHTML = '<span class="txt">' + study.instanceCount + '</span>';

        studyRow.appendChild(patientNameRow);
        studyRow.appendChild(patientIdRow);
        studyRow.appendChild(patientBirthDateRow);
        studyRow.appendChild(studyDescriptionRow);
        studyRow.appendChild(accessionRow);
        studyRow.appendChild(studyDateRow);
        studyRow.appendChild(modalityRow);
        studyRow.appendChild(numImagesRow);

        // Append the row to the study list
        var studyRowElement = $(studyRow).appendTo('#patients-table');

        $(studyRowElement).click(function (event) {
            if (event.target.cellIndex !== 18 && event.target.cellIndex !== undefined) {
                $("#patients-table tr").removeClass('row-highlight');
                studyRowElement.addClass("row-highlight");
               
                loadSidebar(study);
                console.log("STUDY",study.companyLogo);
            }
        });

        $(studyRowElement).dblclick(function (event) {
            if (event.target.cellIndex !== 18 && event.target.cellIndex !== undefined) {
                $('body').addClass('img-opened');
                $("#patients-table tr").removeClass('row-highlight');
                studyRowElement.addClass("row-highlight");
               
                runWithAccessToken(study, openStudyForViewing);

            }
        });

        function loadSidebar(study) {
            //set selected study
            selectedStudy = study;

            console.log(study.qubsStudyInstanceUid);
            //get history
            runWithAccessToken(study.patientId, getPatientHistory);
            runWithAccessToken(study.qubsStudyInstanceUid, getAppointmentDetails);



            setupSideBarButtons(study);
            showSideBarEmptyStates(false);
            document.getElementById("company-name").innerHTML = '<a target="_blank" href="' + study.website + '"  >' + study.company + '</a>';;
            document.getElementById("imageCount").innerHTML = study.instanceCount;

            var patientSex = "";
            if (checkNested(study, "patientSex")) {
                patientSex = study.patientSex;
            }

            var age = "";
            if (checkNested(study, "age")) {
                age = study.age;
            }

            document.getElementById("patient-name").innerHTML = study.patientFirstName + " " + study.patientLastName +
                '<span class="age" >(' + age + 'y ' + patientSex + ')</span>';

            document.getElementById("email").innerHTML = study.email;

            var phoneNumber = study.phone.replace(/\s/g, '');
            document.getElementById("phone").innerHTML = '<a class="tel" href="tel:' + phoneNumber + '">' + study.phone + '</a>';


            //
            function holder_reset(){
                $('body').removeClass('img-opened');

                var holder = jQuery('#content');

                var refferal_result = holder.find('.refferal-result');
                if (refferal_result.length) {
                    refferal_result.remove();
                }
                var report_result = holder.find('.report-result');
                if (report_result.length) {
                    report_result.remove();
                }

                if($("#content .patient-list").css('display')=='block'){
                    $("#content .patient-list").css('display','none');
                }

                if($("#content .report-nav").css('display')=='block'){
                    $("#content .report-nav").remove();
                }

                if($("#content .result.report").css('display')=='block'){
                    $("#content .result.report").remove();
                }

                if($("#content .refferal-result").css('display')=='block'){
                    $("#content .refferal-result").remove();
                }
            }

            function setupSideBarButtons(study) {

                //remove previous events
                $('#study-report').off('click touchstart');
                $('#study-images').off('click touchstart');
                $('#study-download').off('click touchstart');
                $('#study-share').off('click touchstart');
                $('#study-activity').off('click touchstart');
                $('#study-manage').off('click touchstart');
                $('#study-referral').off('click touchstart');
                $('#study-attachments').off('click touchstart');


                $("#study-report").on('click touchstart', function () {
                    holder_reset();
                    //$('body').addClass('refferal-opened');
                    // runWithAccessToken(study.qubsStudyInstanceUid, getReport);
                    runWithAccessToken(study, getReport);
                    
                });

                $("#study-images").on('click touchstart', function () {
                    holder_reset();
                    $('body').addClass('img-opened');
                    runWithAccessToken(study, openStudyForViewing);
                });


                $("#study-download").on('click touchstart', function () {
                    runWithAccessToken(study, downloadZip);
                });

                $('#study-share').fancybox({
                    helpers: {
                        overlay: {
                            css: {
                                background: 'rgba(0, 0, 0, 0.65)'
                            }
                        }
                    },
                    afterLoad: function(current, previous) {
                        // handle custom close button in inline modal
                        if(current.href.indexOf('#') === 0) {
                            jQuery(current.href).find('a.close').off('click.fb').on('click.fb', function(e){
                                e.preventDefault();
                                jQuery.fancybox.close();
                            });
                        }
                    },
                    href: '#notification-popup'
                });

                $("#study-activity").on('click touchstart', function () {

                });

                $("#study-manage").on('click touchstart', function () {

                });

                $("#study-referral").on('click touchstart', function () {
                    holder_reset();
                    runWithAccessToken(study, getReferrals);
                    // runWithAccessToken(study.qubsStudyInstanceUid, getReferrals);
                   

                   // $('body').addClass('img-opened');
                });

                $("#study-attachments").on('click touchstart', function () {

                });

            }


        }
    }
}

//this gets data from ris
function getAppointmentDetails(userAccessToken, qubsStudyInstanceUid) {

    $("#usersList dt").remove();
    $("#usersList dd").remove();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                appointmentData = JSON.parse(this.responseText);
                loadAppointmentDataToUI(appointmentData);

            } else {

                //no appointment details
            }
        }
    });

    //support for shared studies
    var publicToken = getParameterByName("token");
    var accessionNo = getParameterByName("a");
    var companyDomain = getParameterByName("d");

    if (accessionNo != null) {
        xhr.open("POST", api_studies_url); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);

        var searchParams = JSON.stringify({
            "accessionNumber": accessionNo,
            "companyDomain": companyDomain
        });

        xhr.send(searchParams);

    } else if (publicToken != null) {
        xhr.open("POST", api_public_studies_url); //public api
        xhr.setRequestHeader("content-type", "application/json");
        var publicTokenJson = JSON.stringify({
            "publicToken": publicToken
        });
        xhr.send(publicTokenJson);

    } else {

        xhr.open("GET", api_appointment_url + "/" + encodeURI(qubsStudyInstanceUid)); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);
        xhr.send(null);
    }

    function loadAppointmentDataToUI(appointmentItem) {
        console.log(appointmentItem);

        if (appointmentItem.email != null) {
            document.getElementById("email").innerHTML = appointmentItem.email;
        }

        if (appointmentItem.MobilePhone != null) {
            var phoneNumber = appointmentItem.MobilePhone.replace(/\s/g, '');
            document.getElementById("phone").innerHTML = '<a class="tel" href="tel:' + phoneNumber + '">' + appointmentItem.MobilePhone + '</a>';

        }

        var reportButton = document.getElementById("reportButton");
        if (appointmentItem.Status != null) {
            reportButton.innerHTML = appointmentItem.Status;
            if (appointmentItem.Status == "AUTHORISED") {
                reportButton.className = "authorised";
            } else {
                reportButton.className = "not-authorised";
            }
        } else {

            reportButton.innerHTML = "Not Available";
            reportButton.className = "not-authorised";
        }

        //load user list

        /*
        <dl id="usersList">
            <dt><a href="#">John Doe</a></dt>
            <dd>Patient</dd>
            <dt><a href="#">Sam Smith</a></dt>
            <dd>Referring Doctor</dd>
        </dl>
        */


        //Referrering clinic
        if (appointmentItem.ReferreringClinic != null) {
            addUserToUi(appointmentItem.ReferreringClinic, "", "");
        }

        //Referrer
        if (appointmentItem.ReferrerFirstName != null) {
            addUserToUi(appointmentItem.ReferrerFirstName, appointmentItem.ReferrerLastName, "Referrer");
        }

        //Radiologist
        if (appointmentItem.RadiologistFistName != null) {
            addUserToUi(appointmentItem.RadiologistFistName, appointmentItem.RadiologistLastName, "Radiologist");
        }



        function addUserToUi(firstname, lastname, userType) {
            var userItemName = document.createElement('dt');
            var userItemType = document.createElement('dd');
            userItemName.innerHTML = firstname + " " + lastname;
            userItemType.innerHTML = userType;

            $(userItemName).appendTo('#usersList');
            $(userItemType).appendTo('#usersList');
        }

    }

}

//this gets data from pacs
function getPatientHistory(userAccessToken, patientId) {


    $("#patient-history li").remove();


    /* PARAMS
    patientBirthday:
    patientFirstName:
    toDate:
    patientLastName:
    patientId:101050
    accession:
    companyDomain:bmi.qubs.com
    from:0
    fromDate:
    size:10
    studyDescription:
    */

    var params = {
        patientId: patientId,
        from: 0,
        size: 100
    };
    var paramStr = jQuery.param(params);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                studyListData = JSON.parse(this.responseText);

                studyListData.items.forEach(function (study) {
                    addStudyToHistoryList(study);

                });
            } else {
                //var study = null;
                //showSideBarEmptyStates(true);
                //showTableEmptyStates(true);
                //no history
            }

        }
    });

    //support for shared studies
    var publicToken = getParameterByName("token");
    var accessionNo = getParameterByName("a");
    var companyDomain = getParameterByName("d");



    if (accessionNo != null) {
        xhr.open("POST", api_studies_url); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);

        var searchParams = JSON.stringify({
            "accessionNumber": accessionNo,
            "companyDomain": companyDomain
        });

        xhr.send(searchParams);

    } else if (publicToken != null) {
        xhr.open("POST", api_public_studies_url); //public api
        xhr.setRequestHeader("content-type", "application/json");
        var publicTokenJson = JSON.stringify({
            "publicToken": publicToken
        });
        xhr.send(publicTokenJson);

    } else {
        xhr.open("GET", api_studies_url + "?" + paramStr); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);
        xhr.send(null);
    }


    function addStudyToHistoryList(studyItem) {

        var studyHistoryItem = null;
        //check if item is assignedstudy or just study
        if (checkNested(studyItem, "elasticId")) {
            studyHistoryItem = studyItem.study;
        } else {
            studyHistoryItem = studyItem;
        }




        /*
            <li>
                <strong class="depart"><span>US</span></strong>
                <div class="text">
                    <h4><a href="#">Ultrasound pregnancy less than 12 weeks</a></h4>
                    <time datetime="2017-05-11">4 weeks ago</time>
                </div>
            </li>
         */


        var studyListItem = document.createElement('li');
        var studyDescriptionDiv = document.createElement('div');
        studyDescriptionDiv.className = "text";


        //modality
        var modalityRow = document.createElement('strong');
        modalityRow.className = "depart";
        modalityRow.innerHTML = '<span>' + studyHistoryItem.modality + '</span>';


        //description
        var studyDescriptionRow = document.createElement('h4');
        if (checkNested(studyHistoryItem, "studyDescription")) {
            studyDescriptionRow.innerHTML = '<a href="#">' + studyHistoryItem.studyDescription + '</a>';
        } else {
            studyDescriptionRow.innerHTML = '<a href="#"> </a>';
        }

        //date
        var studyDateRow = document.createElement('time');
        //  studyDateRow.setAttribute("datetime", "2017-05-11");
        studyDateRow.innerHTML = studyHistoryItem.studyDateAgo;


        studyDescriptionDiv.appendChild(studyDescriptionRow);
        studyDescriptionDiv.appendChild(studyDateRow);

        studyListItem.appendChild(modalityRow);
        studyListItem.appendChild(studyDescriptionDiv);

        // Append the row to the study list
        var studyListItemElement = $(studyListItem).appendTo('#patient-history');


        $(studyListItemElement).click(function (event) {

            console.log("History click");

            $('body').addClass('img-opened');
            runWithAccessToken(studyHistoryItem, openStudyForViewing);
        });



    }
}

function showSideBarEmptyStates(show) {
    var sidebarEmptyState = document.getElementById("sidebar-empty-state");
    var sidebarDetails = document.getElementById("sidebar-details");

    if (show == true) {
        sidebarDetails.style.display = 'none';
        sidebarEmptyState.style.display = 'block';
    } else {
        sidebarEmptyState.style.display = 'none';
        sidebarDetails.style.display = 'block';
    }
}

function showTableEmptyStates(show) {
    var tableEmptyState = document.getElementById("table-empty-state");
    if (show == true) {
        tableEmptyState.style.display = 'block';
    } else {
        tableEmptyState.style.display = 'none';
    }
}

//get zip url and download study
function downloadZip(userAccessToken, study) {
    console.log("Downloading: ", study);
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "25000",
        "hideDuration": "1000",
        "timeOut": "25000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    toastr["info"]("Requesting file...", study.patientName);


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;


    xhr.onerror = function (err) {
        console.log("** An error occurred during the transaction", err);
        toastr["error"]("An error occurred during the transaction", err);
        var intercomMetadata = {
            "patient": study.patientFirstName + " " +  study.patientLastName ,
            "patientId": study.patientId,
            "accession": study.accessionNumber,
            "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
            "company": study.company,
            "modality": study.modality,
            "studyDescription": study.studyDescription,
            "error": err
        }
        sendIntercomEvent("downloaded-zip-error", intercomMetadata);
    };

    xhr.timeout = 25000;
    xhr.ontimeout = function (e) {
        toastr.remove();
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "8000",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
        var intercomMetadata = {
            "patient": study.patientFirstName + " " +  study.patientLastName ,
            "patientId": study.patientId,
            "accession": study.accessionNumber,
            "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
            "company": study.company,
            "modality": study.modality,
            "studyDescription": study.studyDescription,
            "note": "Download link will be emailed to user"

        }
        sendIntercomEvent("downloaded-zip-large", intercomMetadata);

        toastr["success"]("This is a large file, we will email you a download link in next 5 mins", study.patientName);
    };

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            console.log("status=" + xhr.status);
            console.log("responseText=" + this.responseText);


            if (xhr.status == 200) {
                data = JSON.parse(this.responseText);
                console.log(data);
                window.open("https://" + data.url, '_self');
            }

            toastr.remove();
            toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "4000",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            }


            toastr["success"]("Download started", study.patientName);
            var intercomMetadata = {
                "patient": study.patientFirstName + " " +  study.patientLastName ,
                "patientId": study.patientId,
                "accession": study.accessionNumber,
                "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
                "company": study.company,
                "modality": study.modality,
                "studyDescription": study.studyDescription
            }
            sendIntercomEvent("downloaded-zip", intercomMetadata);

        }
    });


    xhr.open("GET", api_studies_download_url + encodeURI(study.qubsStudyInstanceUid) + "/download"); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);


}

//get referrals from RIS
// function getReferrals(userAccessToken, qubsStudyInstanceUid) {
function getReferrals(userAccessToken, study) {


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                referralData = JSON.parse(this.responseText);
                loadReferralsToUI(referralData);
                var intercomMetadata = {
                    "patient": study.patientFirstName + " " +  study.patientLastName ,
                    "patientId": study.patientId,
                    "accession": study.accessionNumber,
                    "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
                    "company": study.company,
                    "modality": study.modality,
                    "studyDescription": study.studyDescription
                }
                sendIntercomEvent("viewed-referral", intercomMetadata);

            } else {

                //no appointment details
            }
        }
    });

    //support for shared studies
    var publicToken = getParameterByName("token");
    var accessionNo = getParameterByName("a");
    var companyDomain = getParameterByName("d");

    if (accessionNo != null) {
        xhr.open("POST", api_studies_url); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);

        var searchParams = JSON.stringify({
            "accessionNumber": accessionNo,
            "companyDomain": companyDomain
        });

        xhr.send(searchParams);

    } else if (publicToken != null) {
        xhr.open("POST", api_public_studies_url); //public api
        xhr.setRequestHeader("content-type", "application/json");
        var publicTokenJson = JSON.stringify({
            "publicToken": publicToken
        });
        xhr.send(publicTokenJson);
    } else {

        // xhr.open("GET", api_studies_referrals_url + "/" + encodeURI(qubsStudyInstanceUid) + "/referrals"); //secure api
        xhr.open("GET", api_studies_referrals_url + "/" + encodeURI(study.qubsStudyInstanceUid) + "/referrals"); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);
        xhr.send(null);
    }

    function loadReferralsToUI(referralsItem) {
        // console.log(referralsItem);

        var animSpeed = 300;
        var bodyClass = 'refferal-opened';
        var bodyActiveClass = 'fullscreen-active';
        var body = jQuery('body').addClass(bodyClass);
        var holder = jQuery('#content');
        var thumbImageClass = 'thumb-image';
        var activeClass = 'active';
        var altText = 'No result.'
        var refferalId = 'refferal-main';


        if (holder.length) {
            var loader = createLoader().appendTo(holder);
            var result = holder.find('#' + refferalId);
            if (result.length) {
                result.remove();
            }
            //check the existing of the refferal-result element
            

            var patientsHolder = holder.find('.patient-list');
            var pager = holder.find('.pager');
           
            result = jQuery('<div class="refferal-result" id="' + refferalId + '" />').appendTo(holder);

            //adding the topbbar_refferal 
            var topbar_refferal = jQuery('<div class="img-editor" />').appendTo(result);
            var close_button = jQuery('<a href="#" class="btn-img-close">CLOSE <i class="icon-close"></i></a>').appendTo(topbar_refferal);
            var thumbs = jQuery('<div class="thumbs" />').appendTo(result);

            /*my fix
            <div class="img-editor">
                <a href="#" class="btn-img-close">CLOSE <i class="icon-close"></i></a>
            </div>*/
            
            jQuery(".btn-img-close").bind('click', function(){
                result.remove();
                patientsHolder.fadeIn(animSpeed);
            });

            var bigImgHolder = jQuery('<div class="big-img-holder" />').appendTo(result);
            var bigImage = jQuery('<div class="big-image" />').appendTo(bigImgHolder);
            var opener = jQuery('<a href="#" class="btn-fullscreen"></a>').appendTo(bigImgHolder);
            var thumbsList = jQuery('<ul />').appendTo(thumbs);

            patientsHolder.fadeOut(animSpeed);
            pager.fadeOut(animSpeed);

            if (referralsItem.length === 0) {
                jQuery('<strong class="no-result">' + altText + '</strong>').appendTo(bigImage);
            } else {
                bigImage.empty();

                jQuery.each(referralsItem, function(i, obj){
                    jQuery.each(obj, function(key, val) {
                        if (key === 'referral' && val !== ''){
                            var listItem = jQuery('<li />').appendTo(thumbsList);
                            var link = jQuery('<a href="#" class="' + thumbImageClass + '"></a>').appendTo(listItem);

                            link.data('bg', val);

                            link.css({
                                backgroundImage: 'url(' + val + ')'
                            });
                        }
                    });
                });

                setTimeout(function(){
                    loader.remove();
                }, 1000);

                var thumbLinks = thumbsList.find('.' + thumbImageClass);

                function setActiveThumb() {
                    var activeItem = thumbLinks.filter('.' + activeClass);

                    if (activeItem.length) {
                        bigImage.css({
                            backgroundImage: 'url(' + activeItem.data('bg') + ')'
                        });
                    } else {
                        thumbLinks.eq(0).addClass(activeClass);
                        bigImage.css({
                            backgroundImage: 'url(' + thumbLinks.eq(0).data('bg') + ')'
                        });
                    }
                }

                setActiveThumb();

                thumbLinks.on('click touchstart', function(e){
                    e.preventDefault();

                    var currLink = jQuery(e.currentTarget);
                    thumbLinks.removeClass(activeClass);
                    currLink.addClass(activeClass);
                    setActiveThumb();
                });
            }


            opener.on('click touchstart', function(e) {
                e.preventDefault();
                body.toggleClass(bodyActiveClass);
            });
        }
    }

}

//get report as html for a study
// function getReport(userAccessToken, qubsStudyInstanceUid) {
function getReport(userAccessToken, study) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                reportData = JSON.parse(this.responseText);
                loadReportToUI(reportData);
                var intercomMetadata = {
                    "patient": study.patientFirstName + " " +  study.patientLastName ,
                    "patientId": study.patientId,
                    "accession": study.accessionNumber,
                    "qubsStudyInstanceUid": study.qubsStudyInstanceUid,
                    "company": study.company,
                    "modality": study.modality,
                    "studyDescription": study.studyDescription
                }
                sendIntercomEvent("viewed-report", intercomMetadata);

            } else {
                loadReportToUI("No_data");
                //no appointment details
            }
        }
    });

    //support for shared studies
    var publicToken = getParameterByName("token");
    var accessionNo = getParameterByName("a");
    var companyDomain = getParameterByName("d");

    if (accessionNo != null) {
        xhr.open("POST", api_studies_url); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);

        var searchParams = JSON.stringify({
            "accessionNumber": accessionNo,
            "companyDomain": companyDomain
        });

        xhr.send(searchParams);

    } else if (publicToken != null) {
        xhr.open("POST", api_public_studies_url); //public api
        xhr.setRequestHeader("content-type", "application/json");
        var publicTokenJson = JSON.stringify({
            "publicToken": publicToken
        });
        xhr.send(publicTokenJson);

    } else {

        // xhr.open("GET", api_studies_report_url + "/" + encodeURI(qubsStudyInstanceUid) + "/report"); //secure api
         xhr.open("GET", api_studies_report_url + "/" + encodeURI(study.qubsStudyInstanceUid) + "/report"); //secure api
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", userAccessToken);
        xhr.send(null);
    }

    function loadReportToUI(reportItem) {

        var animSpeed = 300;
        var holder = jQuery('#content').removeClass('flex-box');
        var report_result = jQuery('<div class="report-result" id="report-main"></div>').appendTo(holder);
        var resultId = 'result-main';
        var reportNavId = 'report-nav';

        if (holder.length) {
            var loader = createLoader().appendTo(holder);
            var patientsHolder = holder.find('.patient-list');
            var pager = holder.find('.pager');

            var bar = holder.find('#' + resultId);
            var result = holder.find('#' + reportNavId);

            if (bar.length) {
                bar.remove();
            }
            if (result.length) {
                result.remove();
            }

            var topbar_report = jQuery('<div class="img-editor" />').appendTo(report_result);
            var close_button = jQuery('<a href="#" class="btn-img-close">CLOSE <i class="icon-close"></i></a>').appendTo(topbar_report);
            bar = jQuery('<div class="report-nav" id="' + reportNavId + '"></div>').appendTo(report_result);

           

            var barList = jQuery('<ul />').appendTo(bar);
            var printBtn = jQuery('<li><a href="#" class="print-btn">print</a></li>').appendTo(barList);
            var emailBtn = jQuery('<li><a href="#" class="email-btn">email</a></li>').appendTo(barList);
            var smsBtn = jQuery('<li><a href="#" class="sms-btn">sms</a></li>').appendTo(barList);
            var pdfBtn = jQuery('<li><a href="#" class="pdf-btn">pdf</a></li>').appendTo(barList);

            result = jQuery('<div class="result report" id="' + resultId + '" />').appendTo(report_result);

           

            jQuery(".btn-img-close").bind('click', function(){
                report_result.remove();
                patientsHolder.fadeIn(animSpeed);
            });

            var status = jQuery('<strong class="status" />').appendTo(result);


            if(reportItem=="No_data"){
                barList.remove();
                loader.remove();
                status.remove();
                jQuery('<h4 style="text-align:center">No result!</h4>').appendTo(result).fadeIn(animSpeed);
                console.log("nodeasdfasdf");
            }
            jQuery.each(reportItem, function(key, val) {
                if (key === 'status' && val !== ''){
                    status.text(val);
                }

                if (key === 'html' && val !== ''){
                    patientsHolder.fadeOut(animSpeed);
                    pager.fadeOut(animSpeed);

                    jQuery(val).appendTo(result).fadeIn(animSpeed);
                }
            });

            setTimeout(function(){
                loader.remove();
            }, 1000);


            printBtn.on('click touchstart', function(e) {
                e.preventDefault();
                window.print();
            });
        }
    }
}

function createLoader() {
    var loaderHolder = jQuery('<div class="loader-holder" />');
    var loader = jQuery('<div class="sk-folding-cube" />').appendTo(loaderHolder);
    var cube01 = jQuery('<div class="sk-cube1 sk-cube" />').appendTo(loader);
    var cube02 = jQuery('<div class="sk-cube2 sk-cube" />').appendTo(loader);
    var cube03 = jQuery('<div class="sk-cube4 sk-cube" />').appendTo(loader);
    var cube04 = jQuery('<div class="sk-cube3 sk-cube" />').appendTo(loader);

    return loaderHolder;
}