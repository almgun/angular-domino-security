"use strict";

angular.module('ga.domino-security', []).
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
            var _loginStatus = objectFactory.loginStatusFactory();
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
                    var deferred = $q.defer(); //Returnerer denne

                    $q.when(pr).then(function () {
                        var loginStatus = this.getUser();
                        return loginStatus;
                    }.bind(this)).then(function (resolved) {
                        _loginStatus = resolved;
                        deferred.resolve(resolved);
                    }, function (rejected) {
                        if(rejected.msg){
                            _loginStatus = rejected;
                        }
                        else{
                            _loginStatus = objectFactory.loginStatusFactory();
                            _loginStatus.msg = "Not Connected"
                        }

                        deferred.reject(_loginStatus);
                    });

                    return deferred.promise;

                },
                logOut: function () {
                    var str = _hostName + _logOutPath;
                    var pr = $http.get(str);
                    pr.then(function () {
                        _loginStatus.reset();
                    });
                    return pr;
                },
                isLoggedIn: function (confirmLoginPath) {
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
                            deferred.reject('NOT-LOGGED-IN');
                        }
                        else
                        {
                            deferred.resolve('LOGGED-IN');
                        }
                    }, function () {
                        deferred.reject('NOT-CONNECTED');
                    });
                    return deferred.promise;
                },
                getUser: function (userInfoPath) {
                    var deferred = $q.defer();
                    var status = objectFactory.loginStatusFactory();
                    var conf = {
                        method: 'GET',
                        url: _hostName + (userInfoPath || _userInfoPath)
                    };
                    var prom = $http(conf);
                    return helpers.responseHandler(prom);
                    //Must use succsess to get header obj
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
                    return Object.freeze(_loginStatus.user)
                },
                localGetLoginStatus: function () {
                    return Object.freeze(_loginStatus);
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
).factory('objectFactory', function () {
        var _loginStatusPrototype = {
            reset: function () {
                this.isLoggedIn = false;
                this.isConnected = false;
                this.msg = "";
                this.user = {};
            }
        };

        return{
            loginStatusFactory: function () {
                var ret = Object.create(_loginStatusPrototype);
                ret.isLoggedIn = false;
                ret.isConnected = false;
                ret.msg = "";
                ret.user = {};
                return ret;
            }
        }
    });





