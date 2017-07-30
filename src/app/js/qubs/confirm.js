 

    $(document).ready(function() {
        //Site.run();

        var verifyemail = getParameterByName("verifyemail");

        if (verifyemail == "" || verifyemail == null) {

        } else {
            var email = document.getElementById('email');
            $('#email').val(verifyemail).trigger('change');
           
        }


    });

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


    function validateConfirmation(email, confirmationCode, info, progress) {
        var result = true;

        progress.style.display = 'none';

        if (confirmationCode == null || confirmationCode == '') {
            info.innerHTML = 'Please Enter the confirmation code.';
            info.style.visibility = 'visible'
            result = false;
        } else if (email == null || email == '') {
            info.innerHTML = 'Please specify the email address.';
            info.style.visibility = 'visible'
            result = false;
        } else {
            info.style.visibility = 'none';
            progress.style.display = 'block';
        }

        return result;
    }

    function cognitoConfirmSignup(email, confirmationCode, info, progress) {

        if (validateConfirmation(email, confirmationCode, info, progress)) {

            //confirmation starts here
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


            //User Confirmation
            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

            cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
                if (err) {
                    //alert(err);
                    progress.style.display = 'none';
                    info.innerHTML = 'Error Occured While Confirming the Email. ' + err.message;
                    info.style.visibility = 'visible'
                    return;
                }
                console.log('call result: ' + result);
                info.innerHTML = 'Confirmation Succsessful. Please wait... '; //click on '+ '<a href="login.html">Login</a>' +' to proceed.' ;
                info.style.visibility = 'visible'
                window.location = '/';
            });

            //confirmation ends here
        }

    }

    function resendCode() {
        var resendEmail = prompt('Enter Your Email Address ', '');

        //confirmation starts here
        // Cognito Identity Pool Id
        AWS.config.region = cognito_region;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: cognito_identity_pool_id,
        });

        // Cognito User Pool Id
        AWSCognito.config.region = cognito_region;
        AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: cognito_identity_pool_id
        });


        var poolData = {
            UserPoolId: cognito_user_pool_id, // your user pool id here
            ClientId: cognito_user_pool_client_id // your client id here
        };

        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username: resendEmail, // your username here
            Pool: userPool
        };


        //User Confirmation
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function(err, result) {
            if (err) {
                //alert(err);
                info.innerHTML = 'Error Occured While resending the confirmation code. ' + err.message;
                info.style.visibility = 'visible'
                return;
            } else {
                info.innerHTML = 'Please Check your email account and enter the confirmation code';
                info.style.visibility = 'visible'
            }
            console.log('call result: ' + result);
        });

    }

 