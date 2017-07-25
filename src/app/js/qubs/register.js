
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
function email_validation(email){
	
	if (email == null || email == '') {
		$(".email_alert_div").fadeIn(200);
		return false;
	}else{
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
function user_detail_validation(){
	$("#signup_user_form").validate({
        rules: {
            firstname: "required",
            lastname: "required",
            mobile:{
            	required:true,
            	number: true,
            	// minlength:10, 
            	// maxlength:10
            },
            specialty:"required"
        },
        messages: {
            firstname: "Please enter Firstname.",
            lastname: "Please enter Lastname.",
            mobile: "Please enter your Phone Number.",
            specialty: "Please select Specialty.",
        }
        ,
        errorPlacement: function(error, element) {   }
    });
    if ($("#signup_user_form").valid() == false) {
        $("#signup_user_form").valid();
        return false;
    }
   
	return true;
}

function provider_detail_validation(){
	
	$("#signup_provider_form").validate({
        rules: {
            provider_number: "required",
            clinic_name: "required",
            clinic_phone:{
            	required:true,
            	number: true,
            	// minlength:10, 
            	// maxlength:10
            },
            clinic_fax:"required",
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
        errorPlacement: function(error, element) {   }
    });
    if ($("#signup_provider_form").valid() == false) {
        $("#signup_provider_form").valid();
        return false;
    }
   
	return true;
}
 function password_validation(){
 	var password = $("#password").val();
 	var repassword = $("#repassword").val();
 	var result = true;
 	//var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,50}$/;
 	// if ( !re.test(password) ) {
 	if (password.length<8) {
	  	$(".pass_len_alert").fadeIn(200);
	  	result = false;
	}else{
		$(".pass_len_alert").fadeOut(200);
		if(password!=repassword){
			$(".pass_match_alert").fadeIn(200);
		  	result = false;
		}else{
			$(".pass_match_alert").fadeOut(200);
		}
	}

	return result;
 }

 // get the user register account information
 function create_json_user_data(){
 	var email = document.getElementById('email').value;
 	var firstname = document.getElementById('firstname').value;
 	var lastname = document.getElementById('lastname').value;
 	var mobile = document.getElementById('mobile').value;
 	var specialty = document.getElementById('specialty').value;
 	var email = document.getElementById('email').value;
 	var email = document.getElementById('email').value;
 	var email = document.getElementById('email').value;
 	var email = document.getElementById('email').value;
 	var email = document.getElementById('email').value;
 	var email = document.getElementById('email').value;
 	alert(email);
 }






