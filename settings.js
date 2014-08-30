'use strict';
/**
 * Created by almgun on 23.08.2014.
 */
angular.module('ga.domino-security').provider('appSetup', function () {
        return{
            $get: function () {

            }
        }
    }
).provider('appConfig', function () {
        var _path = 'orders.nsf/api.xsp/config/';
        var _host;
        var _cat = '';


        //_host          _path          _service       key      _cat
        //http://domino9/dev/orders.nsf/api.xsp/config/itemtype/app
        return{
            path: function (val) {
                if (val) {
                    _path = val;
                    return this;
                }
                else {
                    return _path;
                }
            },
            host: function (val) {
                if (val) {
                    _host = val;
                    return this;
                }
                else {
                    return _host;
                }
            },
            $get: function ($q, $http, helpers) {
                return{
                    getOption: function (key, path, host, cat) {
                        var deferred = $q.defer();
                        var conf = {
                            method: 'GET',
                            url: (host || _host) + (path || _path) + key + '/' + (cat || _cat)
                        };
                        console.log(conf.url);
                        var prom = $http(conf);
                        return helpers.responseHandler(prom);
                    }
                }
            }
        }
    }).factory('helpers', function ($q) {
        return {
            responseHandler: function (prom) {
                var deferred = $q.defer();
                prom.then(function (res) {
                    if (res.data.status) {
                        if (res.data.status === "OK") {
                            deferred.resolve(res.data);
                        }
                        else {
                            deferred.reject(res.data);
                        }
                    }
                    else {
                        deferred.reject({
                            status: "NOK",
                            message: "LOGGED-OUT or INVALID-URL"
                        });
                    }
                }, function () {
                    deferred.reject({message: "REQUEST REJECTED. ", status: "NOK"}
                    );
                });
                return deferred.promise;
            }
        }
    })
