
/*
register.js
html template : register.html
*/

var cognito_identity_pool_id = 'ap-southeast-2:10043c15-0b79-43c6-9470-fa7b915a5b55';
var cognito_user_pool_id = 'ap-southeast-2_tSZ7Sdbxz';
var cognito_user_pool_client_id = '64iqjui0mvbatbrovcis1b5np3';
var cognito_login = 'cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_tSZ7Sdbxz';
var cognito_region = 'ap-southeast-2';

// Email address validation
function email_validation(email) {

    if (email == null || email == '') {
        $(".email_alert_div").fadeIn(200);
        return false;
    } else {
        if (!isValidEmailAddress(email)) {
            $("label#email_error").show(); //error message
            $("input#sc_email").focus();   //focus on email field
            $(".email_alert_div").fadeIn(200);
            return false;
        }
    }
    return true;
}


function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
};

// Email address validation
//user detail validation
function user_detail_validation() {
    $("#signup_user_form").validate({
        rules: {
            firstname: "required",
            lastname: "required",
            mobile: {
                required: true,
                number: true,
                // minlength:10, 
                // maxlength:10
            },
            specialty: "required"
        },
        messages: {
            firstname: "Please enter Firstname.",
            lastname: "Please enter Lastname.",
            mobile: "Please enter your Phone Number.",
            specialty: "Please select Specialty.",
        }
        ,
        errorPlacement: function (error, element) { }
    });
    if ($("#signup_user_form").valid() == false) {
        $("#signup_user_form").valid();
        return false;
    }

    return true;
}

function provider_detail_validation() {

    $("#signup_provider_form").validate({
        rules: {
            provider_number: "required",
            clinic_name: "required",
            clinic_phone: {
                required: true,
                number: true,
                // minlength:10, 
                // maxlength:10
            },
            clinic_fax: "required",
            clinic_address: "required",
            suburb: "required",
            state: "required",
            postal_code: "required",
        },
        messages: {
            provider_number: "Please enter Provider Number.",
            clinic_name: "Please enter Name.",
            clinic_phone: "Please enter your Phone Number.",
            clinic_fax: "Please enter Fax.",
            clinic_address: "Please enter Address.",
            suburb: "Please enter Suburb.",
            state: "Please select State.",
            postal_code: "Please enter Postal Code.",

        },
        errorPlacement: function (error, element) { }
    });
    if ($("#signup_provider_form").valid() == false) {
        $("#signup_provider_form").valid();
        return false;
    }

    return true;
}

function password_validation() {
    var password = $("#password").val();
    var repassword = $("#repassword").val();
    var result = true;
    //var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,50}$/;
    // if ( !re.test(password) ) {
    if (password.length < 8) {
        $(".pass_len_alert").fadeIn(200);
        result = false;
    } else {
        $(".pass_len_alert").fadeOut(200);
        if (password != repassword) {
            $(".pass_match_alert").fadeIn(200);
            result = false;
        } else {
            $(".pass_match_alert").fadeOut(200);
        }
    }

    return result;
}

// get the user register account information
function create_json_user_data() {
    var progress = document.getElementById('progress');


    var user_data = [];
    var user_type = document.getElementById('user_type').value;

    var email = document.getElementById('email').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var mobile = document.getElementById('mobile').value;
    var password = document.getElementById('password').value;
    var repassword = document.getElementById('repassword').value;



    var specialty = document.getElementById('specialty').value;
    var providerno = document.getElementById('provider_number').value;
    var clinic_name = document.getElementById('clinic_name').value;
    var clinic_phone = document.getElementById('clinic_phone').value;
    var clinic_fax = document.getElementById('clinic_fax').value;
    var clinic_address = document.getElementById('clinic_address').value;
    var suburb = document.getElementById('suburb').value;
    var state = document.getElementById('state').value;
    var postal_code = document.getElementById('postal_code').value;


    cognitoSignup(email, password, repassword, progress, firstname, lastname, mobile, specialty, providerno,
        clinic_name, clinic_phone, clinic_fax, clinic_address, suburb, state, postal_code)
}




function extractDomain() {
    var url = window.location.href;
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}



function cognitoSignup(email, password, repassword, progress, firstName, lastName, phone, specialty, providerNo,
    clinic, clinicphone, clinicfax, clinicaddress, clinicsuburb, clinicstate, clinicpostcode) {

    var input = {
        email: email,
        password: password,
    };
    //Signup starts here
    // Cognito Identity Pool Id
    // Cognito Identity Pool Id
    AWSCognito.config.region = cognito_region;
    AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
        IdentityPoolId: cognito_identity_pool_id,
    });

    // Cognito User Pool Id
    AWSCognito.config.region = cognito_region;
    AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
        IdentityPoolId: cognito_identity_pool_id
    });

    var poolData = {
        UserPoolId: cognito_user_pool_id, // your user pool id here
        ClientId: cognito_user_pool_client_id // your client id here
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var userData = {
        Username: email, // your username here
        Pool: userPool
    };

    ///////////////////////////////////////
    var attributeList = [];

    var dataEmail = {
        Name: 'email',
        Value: email // your email here
    };

    var dataFirstname = {
        Name: 'family_name',
        Value: firstName
    };
    var dataLastname = {
        Name: 'given_name',
        Value: lastName
    };
    var dataClinic = {
        Name: 'custom:clinic',
        Value: clinic
    };
    var dataPhone = {
        Name: 'phone_number',
        Value: '+61' + phone
    };
    var dataProviderno = {
        Name: 'custom:providerno',
        Value: providerNo
    };
    var companydomain = {
        Name: 'custom:companydomain',
        Value: extractDomain()
    };

    var dataSpecialty = {
        Name: 'custom:specialty',
        Value: specialty
    };

    var dataClinicphone = {
        Name: 'custom:clinicphone',
        Value: clinicphone
    };

    var dataClinicfax = {
        Name: 'custom:clinicfax',
        Value: clinicfax
    };

    var dataClinicaddress = {
        Name: 'custom:clinicaddress',
        Value: clinicaddress
    };

    var dataClinicsuburb = {
        Name: 'custom:clinicsuburb',
        Value: clinicsuburb
    };

    var dataClinicstate = {
        Name: 'custom:clinicstate',
        Value: clinicstate
    };

    var dataClinicpostcode = {
        Name: 'custom:clinicpostcode',
        Value: clinicpostcode
    };
    ///////////////////////////////////////


    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
    var attributeFamilyName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataLastname);
    var attributeGivenName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataFirstname);
    var attributeProviderNo = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataProviderno);
    var attributeClinic = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinic);
    var attributePhone = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhone);
    var attributecompanydomain = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(companydomain);

    var attributeSpecialty = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataSpecialty);
    var attributeClinicphone = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicphone);
    var attributeClinicfax = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicfax);
    var attributeClinicaddress = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicaddress);
    var attributeClinicsuburb = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicsuburb);
    var attributeClinicstate = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicstate);
    var attributeClinicpostcode = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataClinicpostcode);




    attributeList.push(attributeEmail);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributeGivenName);
    attributeList.push(attributeProviderNo);
    attributeList.push(attributeClinic);
    attributeList.push(attributePhone);
    attributeList.push(attributecompanydomain);

    attributeList.push(attributeSpecialty);
    attributeList.push(attributeClinicphone);
    attributeList.push(attributeClinicfax);
    attributeList.push(attributeClinicaddress);
    attributeList.push(attributeClinicsuburb);
    attributeList.push(attributeClinicstate);
    attributeList.push(attributeClinicpostcode);

    console.log(attributeList);
    var cognitoUser;
    userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err) {
            alert(err);
            // info.innerHTML = 'User <b>not</b> created. ' + err.message;
            // info.style.visibility = 'visible'
            // progress.style.display = 'none';
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        // info.innerHTML = 'User ' + cognitoUser.getUsername() + ' created. Please check your email to validate the user and enable login.';
        // info.style.visibility = 'visible'
        window.location = 'confirm.html?verifyemail=' + email;
    });
    //Signup ends here


}





