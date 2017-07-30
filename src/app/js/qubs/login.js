var cognito_identity_pool_id = 'ap-southeast-2:10043c15-0b79-43c6-9470-fa7b915a5b55';
var cognito_user_pool_id = 'ap-southeast-2_tSZ7Sdbxz';
var cognito_user_pool_client_id = '64iqjui0mvbatbrovcis1b5np3';
var cognito_login = 'cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_tSZ7Sdbxz';
var cognito_region = 'ap-southeast-2';




function validateLogin(email, password, info, progress) {
    var result = true;

    progress.style.display = 'none';

    if (email == null || email == '') {
        //info.innerHTML = 'Please specify your email address.';
        //info.style.visibility = 'visible'
        //info.style.display = 'block';
        result = false;
    } else if (password == null || password == '') {
        //info.innerHTML = 'Please specify a password.';
        //info.style.visibility = 'visible'
        //info.style.display = 'block';
        result = false;
    } else {
        info.style.visibility = 'hidden';
        info.style.display = 'none';
        progress.style.display = 'block';
    }

    return result;
}

function cognitoAuthentication(email, password, info, progress, newPassword) {

    if (validateLogin(email, password, info, progress)) {

        AWSCognito.config.region = cognito_region;

        var authenticationData = {
            Username: email,
            Password: password,
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        var poolData = {
            UserPoolId: cognito_user_pool_id, // Your user pool id here
            ClientId: cognito_user_pool_client_id // Your client id here
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username: email,
            Pool: userPool
        };
       
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
      

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log("Successfully funciton",result);
               
                console.log('access token + ' + result.getAccessToken().getJwtToken());

                AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
                    IdentityPoolId: cognito_identity_pool_id, // your identity pool id here

                    Logins: {
                        // Change the key below according to the specific region your user pool is in.
                        cognito_login: result.getIdToken().getJwtToken()
                    }
                });


                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.getSession(function (err, result) {
                        if (result) {
                            console.log('You are now logged in.');

                            progress.style.display = 'block';
                            info.style.display = 'block';
                            info.innerHTML = 'You are now logged in, Please wait...';
                            info.style.visibility = 'visible'
                            window.location = 'pacs.html';

                            // Add the User's Id Token to the Cognito credentials login map.
                            AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
                                IdentityPoolId: cognito_identity_pool_id,
                                Logins: {
                                    cognito_login: result.getIdToken().getJwtToken()
                                }
                            });
                        }
                    });
                }

                //call refresh method in order to authenticate user and get new temp credentials
                AWSCognito.config.credentials.refresh((error) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Successfully logged!');
                    }
                });


            },


            onFailure: function (err) {
                console.log(err);
                progress.style.display = 'none';

                info.innerHTML = err.message;
                info.style.visibility = 'visible'
                info.style.display = 'block';
            },

            newPasswordRequired: function (userAttributes, requiredAttributes) {
                // User was signed up by an admin and must provide new 
                // password and required attributes, if any, to complete 
                // authentication.

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                if (newPassword == null) {
                    $("#new-password-popup").modal();
                } else {
                    // Get these details and call 
                    cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
                }



            },
            inputVerificationCode: function () {
                var verificationCode = prompt('Please input verification code: ', '');
                cognitoUser.verifyAttribute('email', verificationCode, this);
            },
            mfaRequired: function (codeDeliveryDetails) {
                console.log(codeDeliveryDetails);
                // MFA is required to complete user authentication.
                // Get the code from user and call
                cognitoUser.sendMFACode(mfaCode, this)
            },


        });

    }

}

function runWithAccessToken(callbackData, callback) {

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
                callback(userAccessToken, callbackData);
            }

        });
    } else {
        callback(null, callbackData);
    }

}

function getCurrentUsername() {

    var poolData = {
        UserPoolId: cognito_user_pool_id, // your user pool id here
        ClientId: cognito_user_pool_client_id // your client id here
    };

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    return cognitoUser.username;
}

function logoutWithAccessToken(callbackData, callback) {

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
                cognitoUser.signOut();
                callback(userAccessToken, callbackData);
            }
        });
    } else {
        callback(null, callbackData);
    }

}

function logout(){
    location.href = "index.html";
}