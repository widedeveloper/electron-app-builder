var api_user_details_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/users/";
var api_user_requests_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/users/access-requests";

var intercomStarted = false;
var userData;
$(document).ready(function () {

    //bring the user detail
    runWithAccessToken(null, getUserDetails);

    var DomainOption = document.getElementById("companyDomain");
    DomainOption.addEventListener("change", function (event) {
       var domain = this.value;
       init_display(userData,domain);
    }); 
});

 //load access requests initial  
function init_display(userData,domain){
    var accessPermission=false;
    for(i=0;i<userData.permissions.length;i++){
        var companyDomain = userData.permissions[i].companyDomain;
        if(companyDomain==domain){
            accessPermission = userData.permissions[i].accessRequests;
        }
    }
    
    // accessPermission = userData.permissions[0].accessRequests;
    var accessRequestParams = {
        "companyDomain": domain,
        "size": 3,
        // "lastEvaluatedKey": {
        //     "username": "admin@bmi.com.au",
        //     "companyDomain": domain
        // },
        "scanIndexForward": true
    };
    // accessPermission = false;
    if(accessPermission){ // checking accessrequest permission
        runWithAccessToken(accessRequestParams, getUserAccessRequests);
    }else{
        $("#patients-table tr").remove();
        $(".patient-list .nav_page a").remove();
        showTableEmptyStates(true);
        $(".note").html("You have no the Access requste permission.");
    }
}

function startIntercom(user) {
    // console.log(user);
    window.Intercom('boot', {
        app_id: 'xcwvx5ob',
        email: user.username,
        phone: user.phone,
        user_hash: user.hash,
        "clinic": user.clinic,
        "referred": user.referedCompanyDomain,
        "speciality": user.speciality,
        custom_launcher_selector: '#users',
        name: user.firstname + " " + user.lastname, // Full name 
        created_at: user.userCreateTimeStamp // Signup date as a Unix timestamp
    });
    intercomStarted = true;
}

function sendIntercomEvent(eventName, metadata) {
    window.Intercom('trackEvent', eventName, metadata);
}

//get logged in user details
function getUserDetails(userAccessToken, placeholder) {

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                userData = JSON.parse(this.responseText);
                var firstname = userData.user.firstname;
                $(".author").html(firstname.toUpperCase());
                init_display(userData,'bmi.qubs.com');
                //start intercom
                if (intercomStarted == false) {
                    console.log("userData: ", userData);
                    startIntercom(userData.user);
                }
            } else {


            }
        }
    });

    var userEmail = getCurrentUsername(null);
    xhr.open("GET", api_user_details_url + encodeURI(userEmail)); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);
}

//get list of access requests by users
function getUserAccessRequests(userAccessToken, inputDataObject) {

//    inputDataObject = 
    //    {       
    //        "companyDomain": "bmi.qubs.com",
    //        "size": 3,
    //        "lastEvaluatedKey": {
    //            "username": lastEvaluatekey.username,
    //            "companyDomain": "bmi.qubs.com"
    //        },
    //        "scanIndexForward": true
    //    }
       
    var paramStr = jQuery.param(inputDataObject);
    $("#patients-table tr").remove();
    $(".patient-list .nav_page a").remove();

    var loaderIndicator = document.getElementById("patients-loading-indicator");
    var patientsListTable = document.getElementById("patients-table");
  
    //show loading indicator
    showTableEmptyStates(true);
    loaderIndicator.style.display = "block"


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {
             loaderIndicator.style.display = "none"
             if (xhr.status == 200) {
                showTableEmptyStates(false);
                var accessRequests = studyListData = JSON.parse(this.responseText);
                console.log("Access Requests: ", accessRequests);
                addPageButton();
                accessRequests.Items.forEach(function (study) {
                    loadRequest(study);
                });
            } else {
                var study = null;
                showSideBarEmptyStates(true);
                showTableEmptyStates(true);
            }
        }
    });

    xhr.open("GET", api_user_requests_url + "?" + paramStr); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);
}

//get the details of selected User
function selectedUserDetails(userAccessToken, study) {
    $("#permissionlist dt").remove();
    $("#permissionlist dd").remove();
    $("#providerno dt").remove();
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {
                var seluserData = JSON.parse(this.responseText);
                addSelectedUserDetail(seluserData); 
            } else {


            }
        }
    });

    var userEmail = getCurrentUsername(null);
    xhr.open("GET", api_user_details_url + encodeURI(study.username)); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);
}

function loadRequest(study) {
   
   // var study = null;
    showSideBarEmptyStates(true);

    var userRow = document.createElement('tr');

    var patientUserNameRow = document.createElement('td');
   
    patientUserNameRow.setAttribute("data-title", "Username");
    patientUserNameRow.innerHTML = '<span class="txt">' + study.username +  '</span>';

    var patientFirstNameRow = document.createElement('td');
    patientFirstNameRow.setAttribute("data-title", "First Name");
    patientFirstNameRow.innerHTML = '<span class="txt">' + study.firstname + '</span>';


    var patientLastNameRow = document.createElement('td');
    patientLastNameRow.setAttribute("data-title", "Last Name");
    patientLastNameRow.innerHTML = '<span class="txt">' + study.lastname + '</span>';

    var patientPhoneRow = document.createElement('td');
    patientPhoneRow.setAttribute("data-title", "Phone");
    patientPhoneRow.innerHTML = '<span class="txt">' + study.phone + '</span>';

    var patientProviderRow = document.createElement('td');
    patientProviderRow.setAttribute("data-title", "Provider No");
    patientProviderRow.innerHTML = '<span class="txt">' + study.provider + '</span>';

    var patientClinicRow = document.createElement('td');
    patientClinicRow.setAttribute("data-title", "Clinic");
    patientClinicRow.innerHTML = '<span class="txt">' + study.clinic + '</span>';

    var patientStatusRow = document.createElement('td');
    patientStatusRow.setAttribute("data-title", "Status");
    patientStatusRow.innerHTML = '<span class="txt">' + study.status + '</span>';
   
    userRow.appendChild(patientUserNameRow);
    userRow.appendChild(patientFirstNameRow);
    userRow.appendChild(patientLastNameRow);
    userRow.appendChild(patientPhoneRow);
    userRow.appendChild(patientProviderRow);
    userRow.appendChild(patientClinicRow);
    userRow.appendChild(patientStatusRow);
    var studyRowElement = $(userRow).appendTo('#patients-table');

    $(studyRowElement).click(function (event) {
        if (event.target.cellIndex !== 18 && event.target.cellIndex !== undefined) {
            $("#patients-table tr").removeClass('row-highlight');
            studyRowElement.addClass("row-highlight");
            
            runWithAccessToken(study, selectedUserDetails);
            loadSidebar(study);
        }
    });

    // $(studyRowElement).dblclick(function (event) {
    //     if (event.target.cellIndex !== 18 && event.target.cellIndex !== undefined) {
    //         $('body').addClass('img-opened');
    //         $("#patients-table tr").removeClass('row-highlight');
    //         studyRowElement.addClass("row-highlight");
    //         runWithAccessToken(study, openStudyForViewing);
    //     }
    // });
    
    

    function loadSidebar(study) {
        //set selected study
        selectedStudy = study;
       
        setupSideBarButtons(study);
        showSideBarEmptyStates(false);
        document.getElementById("company-name").innerHTML = '<a target="_blank" href="' + study.website + '"  >' + study.companyDomain + '</a>';;
        // document.getElementById("imageCount").innerHTML = study.instanceCount;


        document.getElementById("patient-name").innerHTML = study.firstname + " " + study.lastname ;

        document.getElementById("email").innerHTML = study.username;

        var phoneNumber = study.phone.replace(/\s/g, '');
        document.getElementById("phone").innerHTML = '<a class="tel" href="tel:' + phoneNumber + '">' + study.phone + '</a>';


        function setupSideBarButtons(study) {

            //remove previous events
            $('#grant-access').off('click touchstart');
            $('#remove-access').off('click touchstart');
            $('#add-providerno').off('click touchstart');
            $('#edit').off('click touchstart');
           


            $("#grant-access").on('click touchstart', function () {
                //holder_reset();
                //$('body').addClass('refferal-opened');
               // runWithAccessToken(study, getReport);
                
            });
        }
    }
}

function  addSelectedUserDetail(seluserData){
    if (seluserData.user.username != null) {
        document.getElementById("email").innerHTML = seluserData.user.username;
    }

    if (seluserData.user.phone != null) {
        var phoneNumber = seluserData.user.username.replace(/\s/g, '');
        document.getElementById("phone").innerHTML = '<a class="tel" href="tel:' + phoneNumber + '">' + seluserData.user.username + '</a>';

    }

    //Show the provider Number
    var providerNumber = document.createElement('dt');
    if(seluserData.providernumbers[0]){
        providerNumber.innerHTML = seluserData.providernumbers[0].providerNumber;
        $(providerNumber).appendTo('#providerno');
    }
   
    //Show the Permission
    for(i=0;i<seluserData.permissions.length;i++){
        permissionsDetails(seluserData.permissions[i]);
    }
    
    function permissionsDetails(permissionData){
        var Domain = document.createElement('dt');
        Domain.innerHTML = permissionData.companyDomain;
        $(Domain).appendTo('#permissionlist');

        var break_glass = document.createElement('dd');
        if(permissionData.breakGlassStudies){
             break_glass.innerHTML = "Break Glass";
             $(break_glass).appendTo('#permissionlist');
        }
        
        var share_studies = document.createElement('dd');
        if(permissionData.shareStudies){
             share_studies.innerHTML = "Share Studies";
             $(share_studies).appendTo('#permissionlist');
        }

        var assign_studies = document.createElement('dd');
        if(permissionData.assignStudies){
             assign_studies.innerHTML = "Assign Studies";
             $(assign_studies).appendTo('#permissionlist');
        }

        var transfer = document.createElement('dd');
        if(permissionData.transferToWAH){
             transfer.innerHTML = "Send To WAH";
             $(transfer).appendTo('#permissionlist');
        }

        var access_requests = document.createElement('dd');
        if(permissionData.accessRequests){
             access_requests.innerHTML = "Access Requests";
             $(access_requests).appendTo('#permissionlist');
        }

        var delete_studies = document.createElement('dd');
        if(permissionData.deleteStudies){
             delete_studies.innerHTML = "Delete Studies";
             $(delete_studies).appendTo('#permissionlist');
        }
       
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

function addPageButton(){
    var pager = jQuery('.nav_page');  
    var prev = jQuery('<a href="#" class="btn blue disabled" onclick="prevsearch()" ><i class="icon-arrow-left"></i>PREVIOUS</a>').appendTo(pager);
    var next = jQuery('<a href="#" class="btn blue" onclick="nextsearch()"><i class="icon-arrow-right"></i>NEXT</a>').appendTo(pager);

}