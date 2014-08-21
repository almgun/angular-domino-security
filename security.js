angular.module('almgun.dom-sec', []).
    provider('authentication', function () {
        //Result from last call to logIn()
       var  _status = {
            isLoggedIn: false,
            isConnected: false,
            user: {},
            reset: function () {
                this.isLoggedIn = false;
                this.isConnected = false;
                this.user = {};
            }
        };
        var _host = "http://xxxdomino9/";
        var _userInfoPath = 'dev/orders.nsf/api.xsp/userinfo';
        var _confirmLoginPath = 'dev/orders.nsf/login?OpenPage';

        var _logInPath = 'names.nsf?Login';
        var _logOutPath = 'names.nsf?Logout';

        this.hostName = function (host) {
            if(host){
                _host = host;
                return this;
            }
            else{
                return _host;
            }
        };

        this.userInfoPath = function (path) {
            if(path){
                _userInfoPath = path;
                return this;
            }
            else{
                return _userInfoPath;
            }
        };
        this.confirmLoginPath = function (path) {
            if(path){
                _confirmLoginPath = path;
                return this;
            }
            else{
                return _confirmLoginPath;
            }
        };

        // ...
        this.$get = function ($http, $q) {
            return {
                logIn: function (user, pw) {
                    var conf = {
                        method: 'POST',     //Angular
                        type: 'POST',       //jQuery
                        url: _host+_logInPath,
                        data: {username: user || 'Web User', password: pw || 'almgun'},
                        xhrFields: {
                            withCredentials: true //jQuery
                        },
                        withCredentials: true  //Angular

                    }
                    console.log('this is the login-method ' );
                    var pr = jQuery.ajax(conf);  //fungerer bare med jQuery vet ikke hvorfor
                    var deferred = $q.defer(); //Returnerer denne

                    $q.when(pr).then(function (resolved) {
                        console.debug('login OK (method POST)' );
                        return this.getUser();
                    }.bind(this)).then(function (resolved) {
                        deferred.resolve(resolved);
                        console.debug('getUser OK ');
                    }, function (rejected) {
                        _status.reset();
                        console.error('Error in promise chain ' + rejected);
                        deferred.reject('Error in login-function');
                    })

                    return deferred.promise;

                },
                logOut: function () {
                    var str = _host+_logOutPath;
                    var pr = $http.get(str);
                    pr.then(function () {
                        _status.reset();
                        console.debug('log-out OK');
                    })
                    return pr;
                },
                isLoggedIn: function () {
                    console.log('this is the isLoggedIn-method');
                    var deferred = $q.defer();
                    var conf = {
                        method: 'OPTIONS',
                        cache:false,
                        url: _host+_confirmLoginPath
                    };
                    var prom = $http(conf);
                    prom.then(function (res) {
                        if(res.data)
                        {
                           deferred.reject('NOT-LOGGED-IN');
                        }
                        {
                            deferred.resolve('LOGGED-IN');
                        }
                    }, function (rej) {
                        deferred.reject('NOT-CONNECTED');
                    })
                    return deferred.promise;
                },
                getUser: function () {
                    var deferred = $q.defer();
                    var conf = {
                        method: 'GET',
                        url: _host+_userInfoPath
                    };
                    var prom = $http(conf);
                    //Must use succsess to get header obj
                    prom.success(function (userObj, status, header, config) {
                        var respHeader = header();
                        var html = respHeader['content-type'].match(/text\/html/);
                        if (!html) {
                            _status.user = _.clone(userObj);
                            _status.isLoggedIn = true;
                            _status.isConnected = true;
                            deferred.resolve(_status);
                            console.log(JSON.stringify(_status.user));
                        }
                        else {
                            _status.reset();
                            _status.isConnected = true;
                            console.error('Could not get user-info');
                            deferred.reject('Could not get user-info');
                        }
                    }).error(function () {
                        _status.reset();
                        console.error('Error not connected');
                        deferred.reject('Error not connected');

                    });
                    return deferred.promise;
                }
            }
        }
    });