"use strict";

angular.module('ga.domino-utils', []).
    provider('authentication', function () {

        var _hostName = "http://xxxdomino9/";
        var _userInfoPath = 'dev/orders.nsf/api.xsp/userinfo';
        var _confirmLoginPath = 'dev/orders.nsf/login?OpenPage';
        var _logInPath = 'names.nsf?Login';
        var _logOutPath = 'names.nsf?Logout';
        this.hostName = function (val) {
            if (val) {
                _hostName = val;
                return this;
            }
            else {
                return _hostName;
            }
        };
        this.userInfoPath = function (path) {
            if (path) {
                _userInfoPath = path;
                return this;
            }
            else {
                return _userInfoPath;
            }
        };
        this.confirmLoginPath = function (path) {
            if (path) {
                _confirmLoginPath = path;
                return this;
            }
            else {
                return _confirmLoginPath;
            }
        };
        this.$get = function ($http, $q, objectFactory, helpers) {
            var _loggedInUser = objectFactory.userRecord();
            return {
                logIn: function (user, pw) {
                    var conf = {
                        method: 'POST',     //Angular
                        type: 'POST',       //jQuery
                        url: _hostName + _logInPath,
                        data: {username: user || 'Web User', password: pw || 'almgun', redirectto: _hostName},
                        xhrFields: {
                            withCredentials: true //jQuery
                        },
                        withCredentials: true  //Angular

                    };
                    var pr = jQuery.ajax(conf);  //Gjør om til form encoding for å bruke angular $http
                    // use a promiseChain to detect log-in status.
                    // 1.   POST to restricted resource
                    // 2.   GET userdata from a restricted user service. If both requsts resolve, then we are logged in
                    //      Don't know anything about log-in status until return from getUser()
                    // 3.   Common error handling in second then parameter
                    return $q.when(pr).then(function () {
                        return this.getUser();
                    }.bind(this)).then(function (resolved) {
                        console.log(JSON.stringify(resolved));
                        _loggedInUser = resolved;
                        return resolved;
                    }, function (rejected) {
                        console.error(JSON.stringify(rejected ));
                        _loggedInUser = helpers.responseHandler($q.when(pr));
                        return _loggedInUser;
                    });
                },
                //Log in to database and redirect to userinfo path. What happens then ??
                logInExp: function (user, pw) {
                    var conf = {
                        method: 'POST',     //Angular
                        type: 'POST',       //jQuery
                        url: _hostName + _logInPath,
                        data: {username: user || 'Web User', password: pw || 'almgun', redirectto: _userInfoPath},
                        xhrFields: {
                            withCredentials: true //jQuery
                        },
                        withCredentials: true  //Angular

                    };
                    _loggedInUser = objectFactory.userRecord();
                    var deferred = $q.defer();
                    // Four possible outcomes of the log-in attempt. Only scenario one will resolve the deffered object
                    // 1. log-in ok and a user-record object is returned in the resolve statement. Local _loggedInUser is set with the same value
                    // 2. log-in call is resolved, but with invalid username or pw
                    // 3. log-in call is resolved, but with an error in the getUserObject service. In this case the JSON object from the server is returned as is
                    // 4. log-in is rejected. Infrastructure  problems

                    var pr = jQuery.ajax(conf);
                    $q.when(pr).then(function (res) {
                        //console.log('LOG-IN RESOLVED', res);
                        if(res.status){
                            if(res.status === 'OK'){
                                _loggedInUser = JSON.parse(res.data);
                                deferred.resolve({status:"OK",message:res.message,data:_loggedInUser});
                            }
                            else{
                                deferred.reject(res);
                            }
                        }
                        else{
                            deferred.reject({status:"NOK",message:'Invalid username or password'});
                        }

                    }, function (rej) {
                        //console.log('LOG-IN REJECTED', rej);
                        deferred.reject({status:"NOK",message:'Not connected'});

                    })
                    return deferred.promise;

                },
                logOut: function () {
                    var str = _hostName + _logOutPath;
                    var pr = $http.get(str);
                    pr.then(function () {
                        _loggedInUser = objectFactory.userRecord();
                    });
                    return pr;
                },
                //  Send http-option request against the log-in resource
                //  If the resource is accessed correctly, then the resolved object will not have a data property defined

                isLoggedIn: function (confirmLoginPath) {
                    var resp = objectFactory.serverResponseFactory();
                    var deferred = $q.defer();
                    var conf = {
                        method: 'OPTIONS',
                        cache: false,
                        url: _hostName + (confirmLoginPath || _confirmLoginPath)
                    };
                    var prom = $http(conf);
                    prom.then(function (res) {
                        console.log(res);
                        if (res.data) {
                            deferred.reject(resp.setObj({message: 'NOT-LOGGED-IN', status: 'NOK'}));
                        }
                        else {
                            deferred.resolve(resp.setObj({message: 'LOGGED-IN', status: 'OK'}));
                        }
                    }, function () {
                        deferred.reject(resp.setObj({message: 'NOT-CONNECTED', status: 'NOK'}));
                    });
                    return deferred.promise;
                },
                getUser: function (userInfoPath) {
                    var deferred = $q.defer();
                    // var status = objectFactory.serverResponseFactory();
                    var conf = {
                        method: 'GET',
                        url: _hostName + (userInfoPath || _userInfoPath)
                    };

                    ;
                    var prom = $http(conf);



                    return helpers.responseHandler(prom, ' from getUser-service');

                    /* prom.success(function (userObj, st, header) {
                     var respHeader = header();
                     console.log(JSON.stringify(userObj));

                     var html = respHeader['content-type'].match(/text\/html/);
                     if (!html) {
                     status.user = userObj;
                     status.isLoggedIn = true;
                     status.isConnected = true;
                     status.msg = JSON.stringify(status.user);
                     deferred.resolve(status);
                     }
                     else {
                     status.isConnected = true;
                     status.msg = 'Error. Could not get user-info';
                     deferred.reject(status);
                     }
                     }).error(function () {
                     status.msg = 'Error.  Not connected';
                     deferred.reject(status);

                     });
                     return deferred.promise;*/
                },
                localGetProviderConfig: function () {
                    return Object.freeze({
                            hostName: _hostName,
                            userInfoPath: _userInfoPath,
                            confirmLoginPath: _confirmLoginPath
                        }
                    )
                },
                localGetUser: function () {
                    return Object.freeze(_loggedInUser);
                }
            }
        }
    }
).provider('authSaml', function () {
        return{
            $get: function () {

            }
        }

    }
).provider('authBasic', function () {
        return{
            $get: function () {

            }
        }
    }
)





