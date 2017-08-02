var api_user_details_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/users/";
var api_billing_details_url = "https://hrf0u1oorb.execute-api.ap-southeast-2.amazonaws.com/development/billing";

var cognito_identity_pool_id = 'ap-southeast-2:10043c15-0b79-43c6-9470-fa7b915a5b55';
var cognito_user_pool_id = 'ap-southeast-2_tSZ7Sdbxz';
var cognito_user_pool_client_id = '64iqjui0mvbatbrovcis1b5np3';
var cognito_login = 'cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_tSZ7Sdbxz';
var cognito_region = 'ap-southeast-2';

var current_pw;
var new_pw;
$(document).ready(function () {

    runWithAccessToken(null, getUserDetails);
    runWithAccessToken(null, getBillingDetails);
    //change user password
    var changePWbbutton = document.getElementById("change_pw_btn");

    changePWbbutton.addEventListener("click", function (event) {
        
        $("#chang_pw_form").validate({
            rules: {
                current_password: {
                    required: true,
                    minlength: 5
                },
                new_password: {
                    required: true,
                    minlength: 5
                },
                repeat_password: {
                    required: true,
                    equalTo: "#new_password"
                }
            },
            messages: {
                current_password: {
                    required: "Please enter current Password",
                    minlength: "Length more 5 "
                },
                new_password: {
                    required: "Please enter New Password",
                    minlength: "Length more 5 "
                },
                repeat_password: {
                    required: "Please enter Repeat Password.",
                    equalTo: "Password is not match"
                }
               
            }
        });
        if ($("#chang_pw_form").valid() == false) {
            $("#chang_pw_form").valid();
            return false;
        }
        var email = getCurrentUsername(null);
         current_pw = document.getElementById("current_password").value;
         new_pw = document.getElementById("new_password").value;
       
        changepassWithAccessToken(null, changepassword);

    });
    //signout
    var logoutbutton = document.getElementById("logout");
    logoutbutton.addEventListener("click", function (event) {
        logoutWithAccessToken(null, logout);
    });

});

function changepassWithAccessToken(callbackData, callback) {

    var userAccessToken = null;
    var poolData = {
        UserPoolId: cognito_user_pool_id, // your user pool id here
        ClientId: cognito_user_pool_client_id // your client id here
    };

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
   
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.error(err);
                return;
            }

            AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
                IdentityPoolId: cognito_identity_pool_id,
                Logins: {
                    cognito_login: session.getIdToken().getJwtToken()
                }
            });

            console.log('session validity: ' + session.isValid());
            if (!session.isValid()) {
                console.error('Invalid User Session');

            } else {
                userAccessToken = session.getIdToken().getJwtToken();
                //execute function
                //callback(userAccessToken, callbackData);
                cognitoUser.changePassword(current_pw, new_pw, function(err, result) {
                     if (err) {
                            alert(err);
                            return;
                     }
                     console.log('call result: ' + result);
                     callback(userAccessToken, callbackData);
                });
            }

        });
    } else {
        callback(null, callbackData);
    }



}

function changepassword(userAccessToken,placeholder){
   alert('successfull!');
   location.href = "account.html";
}

//get user details
function getUserDetails(userAccessToken, placeholder) {


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                userData = JSON.parse(this.responseText);
                console.log(userData);
                loadUserDetailsToUI(userData);

            } else {


            }
        }
    });

    var userEmail = getCurrentUsername(null);
    console.log("getCurrentUsername",userEmail);

    //userEmail = "info@fadc.com.au";

    xhr.open("GET", api_user_details_url + encodeURI(userEmail)); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);


    function loadUserDetailsToUI(userData) {
        
        var Tabpanel_ul = $("#main .container ul.tabset");
        var usertype = userData.user.userType;
        
        document.getElementById("fname").value = userData.user.firstname;
        document.getElementById("lname").value = userData.user.lastname;
        $("#speciality").val(userData.user.clinic).change();
        document.getElementById("mobile").value = userData.user.phone;
        document.getElementById("email").value = userData.user.username;

        //load provider numbers
        $("#providernumbers-table tr").remove();

        //display the first name
        var firstname = userData.user.firstname;
        $(".author").html(firstname.toUpperCase());

        
        // usertype = "clinicadmin";
        switch (usertype){
            case "clinicadmin" :
                berak;
            case "referrer" :
                Tabpanel_ul.find("li:nth-child(3)").css("display","none");Tabpanel_ul.find("li:nth-child(3) a").removeAttr("href");
                Tabpanel_ul.find("li:nth-child(4)").css("display","none");Tabpanel_ul.find("li:nth-child(4) a").removeAttr("href");
                Tabpanel_ul.find("li:nth-child(5)").css("display","none");Tabpanel_ul.find("li:nth-child(5) a").removeAttr("href");
                break;
            case "patient" : 
                Tabpanel_ul.find("li:nth-child(2)").css("display","none");Tabpanel_ul.find("li:nth-child(2) a").removeAttr("href");
                Tabpanel_ul.find("li:nth-child(3)").css("display","none");Tabpanel_ul.find("li:nth-child(3) a").removeAttr("href");
                Tabpanel_ul.find("li:nth-child(4)").css("display","none");Tabpanel_ul.find("li:nth-child(4) a").removeAttr("href");
                Tabpanel_ul.find("li:nth-child(5)").css("display","none");Tabpanel_ul.find("li:nth-child(5) a").removeAttr("href");
               
                break;
            default : 
                break;
        }
            
        
     


        /*
        
        <tr>
            <td data-title="Provider Number"><span class="txt"><a href="#">John Doe</a></span></td>
            <td data-title="Clinic Name"><span class="txt">Health Clinic</span></td>
            <td data-title="Phone"><span class="txt"><a href="tel:0894349620">08 9434 9620</a></span></td>
            <td data-title="Fax"><span class="txt"><a href="fax:0894349620">08 9434 9620</a></span></td>
            <td data-title="Healthlink ID"><span class="txt"><a href="#">eastvic08</a></span></td>
            <td data-title="Address"><span class="txt">2 riverway salter point WA 6102</span></td>
            <td data-title="remove"><span class="txt"><a href="#" class="remove"><i class="icon-remove"></i></a></span></td>
        </tr>
        
        */

        userData.providernumbers.forEach(function (provider) {
            addProviderNumberToTable(provider);
        }, this);



        function addProviderNumberToTable(providerNumber) {
            var providerRow = document.createElement('tr');

            var numberRow = document.createElement('td');
            numberRow.setAttribute("data-title", "Provider Number");
            numberRow.innerHTML = '<span class="txt">' + providerNumber.providerNumber + '</span>';

            var clinicRow = document.createElement('td');
            clinicRow.setAttribute("data-title", "Access Granted");
            clinicRow.innerHTML = '<span class="txt">' + providerNumber.companyDomain + '</span>';

            var deleteRow = document.createElement('td');
            deleteRow.setAttribute("data-title", "remove");
            deleteRow.innerHTML = '<span class="txt"><a href="#" class="remove"><i class="icon-remove"></i></a></span>';

            providerRow.appendChild(numberRow);
            providerRow.appendChild(clinicRow);
            providerRow.appendChild(deleteRow);

            var providerRowElement = $(providerRow).appendTo('#providernumbers-table');
        }

    }

}


//get billing details
function getBillingDetails(userAccessToken, placeholder) {


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {

        if (this.readyState === 4) {

            if (xhr.status == 200) {

                userData = JSON.parse(this.responseText);
                loadBillingDetailsToUI(userData);

            } else {


            }
        }
    });


    xhr.open("GET", api_billing_details_url); //secure api
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", userAccessToken);
    xhr.send(null);


    function loadBillingDetailsToUI(billingData) {
        console.log(billingData);

        addBillingContactItem("Full Name:", billingData.billingDetails.fullName);
        addBillingContactItem("Address:", billingData.billingDetails.address);
        addBillingContactItem("Suburb:", billingData.billingDetails.city);
        addBillingContactItem("State:", billingData.billingDetails.state);
        addBillingContactItem("Postcode:", billingData.billingDetails.postCode);
        addBillingContactItem("Country:", billingData.billingDetails.country);
        addBillingContactItem("Phone Number:", billingData.billingDetails.phone);
        addBillingContactItem("Company:", billingData.billingDetails.companyName);
        addBillingContactItem("Website:", billingData.billingDetails.website);


        addPaymentItem("Card No:", '<span class="invisible-card">' + billingData.billingDetails.cardNo + '</span>');
        addPaymentItem("Name on Card:", billingData.billingDetails.cardName);
        addPaymentItem("Expires On:", billingData.billingDetails.cardExpiry);

        document.getElementById("price").innerHTML = "$" + (billingData.subscriptions[0].price / 100);
        document.getElementById("period").innerHTML = billingData.subscriptions[0].period + " (ex gst)";
        document.getElementById("product").innerHTML = billingData.subscriptions[0].product;


        document.getElementById("currentperiod").innerHTML = billingData.subscriptions[0].current_period_start + " - " + billingData.subscriptions[0].current_period_end;
        document.getElementById("days").innerHTML = billingData.subscriptions[0].days_remaining;


        //add subscription features
        $("#featurelist li").remove();
        billingData.subscriptions[0].paidFeatures.forEach(function (feature) {
            addFeatureItem(feature);

            function addFeatureItem(feature) {
                var titleRow = document.createElement('li');
                titleRow.innerHTML = feature;
                $(titleRow).appendTo('#featurelist');
            }

        }, this);



        //add billing details
        function addBillingContactItem(title, details) {
            var titleRow = document.createElement('dt');
            var detailRow = document.createElement('dd');

            titleRow.innerHTML = title;
            detailRow.innerHTML = details;

            $(titleRow).appendTo('#billingcontactinfo');
            $(detailRow).appendTo('#billingcontactinfo');
        }

        function addPaymentItem(title, details) {
            var titleRow = document.createElement('dt');
            var detailRow = document.createElement('dd');

            titleRow.innerHTML = title;
            detailRow.innerHTML = details;

            $(titleRow).appendTo('#paymentinfo');
            $(detailRow).appendTo('#paymentinfo');
        }


    }

}