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
            var _loggedInUser = objectFactory.serverResponseFactory();
            return {
                logIn: function (user, pw) {
                    var conf = {
                        method: 'POST',     //Angular
                        type: 'POST',       //jQuery
                        url: _hostName + _logInPath,
                        data: {username: user || 'Web User', password: pw || 'almgun'},
                        xhrFields: {
                            withCredentials: true //jQuery
                        },
                        withCredentials: true  //Angular

                    };
                    var pr = jQuery.ajax(conf);  //fungerer bare med jQuery vet ikke hvorfor
                    return $q.when(pr).then(function () {
                        return this.getUser();
                    }.bind(this)).then(function (resolved) {
                        console.log(JSON.stringify(resolved));
                        _loggedInUser = resolved;
                       return resolved;
                    }, function (rejected) {
                        console.log(JSON.stringify(rejected));
                        _loggedInUser =  helpers.responseHandler( $q.when(pr));
                        return _loggedInUser;
                    });
                },
                logOut: function () {
                    var str = _hostName + _logOutPath;
                    var pr = $http.get(str);
                    pr.then(function () {
                        _loggedInUser.reset();
                    });
                    return pr;
                },
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
                            deferred.reject(resp.setObj({message:'NOT-LOGGED-IN',status:'NOK'}));
                        }
                        else
                        {
                            deferred.reject(resp.setObj({message:'NLOGGED-IN',status:'OK'}));
                        }
                    }, function () {
                        deferred.reject(resp.setObj({message:'NOT-CONNECTED',status:'NOK'}));
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
                    var prom = $http(conf);
                  /*  prom.then(function (resp) {
                        console.log(JSON.stringify(resp));
                    })*/
                    return helpers.responseHandler(prom);

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





