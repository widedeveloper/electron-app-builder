function resetPassword(userEmail, info, confCode, newPassword, confButton,resetDiv,confDiv,progress) {

   
    if (!userEmail) {
        info.innerHTML = 'Please Enter the email';
        info.style.visibility = 'visible';
        return;
    }
    progress.style.display='block'; 
   

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
        Username: userEmail, // your username here
        Pool: userPool
    };

    var attributeList = [];

    var dataEmail = {
        Name: 'email',
        Value: userEmail // your email here
    };

    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.forgotPassword({
        onSuccess: function (result) {

            progress.style.display='none'; 

            console.log('call result: ' + result);
            //showSuccessMsg('Password Changed sucessfully');
            info.innerHTML = 'Password Changed sucessfully';
            info.style.visibility = 'visible'
        },
        onFailure: function (err) {

            progress.style.display='none'; 
            //alert(err);
            info.innerHTML = err.message;
            info.style.visibility = 'visible'
        },
        inputVerificationCode(data) {

            progress.style.display='none'; 

            info.innerHTML = 'Please check your email for the verification code';
            info.style.visibility = 'visible'

             resetDiv.style.display='none';
             confDiv.style.display='block';
        }
    });


}

function validateConfirmation(userEmail, verificationCode, newPassword,progress) {
    var result = true;

    progress.style.display='none';

    if (userEmail == null || userEmail == '') {
        info.innerHTML = 'Please enter the email address';
        info.style.visibility = 'visible';
        result = false;
    } else if (verificationCode.value == null || verificationCode.value == '') {
        info.innerHTML = 'Please enter the Verificataioncode';
        info.style.visibility = 'visible';
        result = false;
    } else if (newPassword.value == null || newPassword.value == '') {
        info.innerHTML = 'Please enter a password';
        info.style.visibility = 'visible';
        result = false;
    } else {
        info.style.visibility = 'hidden';
        progress.style.display='block';
    }

    return result;
}

function verify(userEmail, verificationCode, newPassword, resetDiv,confDiv,progress) {

    if (validateConfirmation(userEmail, verificationCode, newPassword,progress)) {

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
            Username: userEmail, // your username here
            Pool: userPool
        };

        var attributeList = [];

        var dataEmail = {
            Name: 'email',
            Value: userEmail // your email here
        };

        var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);

        attributeList.push(attributeEmail);

        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

 
        cognitoUser.confirmPassword(verificationCode.value, newPassword.value, {
            onSuccess: function (result) {

                progress.style.display='none';

                resetDiv.style.display='block';
                confDiv.style.display='none';

                info.innerHTML = 'Password Changed sucessfully. Please click <a href="index.html">Back</a> To go to login';
                info.style.visibility = 'visible';

                
            },
            onFailure: function (err) {

                progress.style.display='none'; 

                info.innerHTML = err.message;
                info.style.visibility = 'visible';

                resetDiv.style.display='none';
                confDiv.style.display='block';
            }
        });

    }


}