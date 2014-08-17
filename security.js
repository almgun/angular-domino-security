angular.module('almgun.dom-sec' ,[]).
    provider('authentication', function () {
        // ...
        $.get = {
            logIn : function () {
                console.log('this is the login-method');

            },
            logOut: function () {
                console.log('this is the logout-method');
            },
            isLoggedIn: function () {
                console.log('this is the isLoggedIn-method');
            }
        }
    });