/**
 * Created by almgun on 11.09.2014.
 */

angular.module('ga.domino-utils').provider('staff',
    function () {
        var _path ;
        var _host;
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
                    getEmployeesByQuery: function (qry, path, host ) {
                        var deferred = $q.defer();
                        var conf = {
                            method: 'GET',
                            url: (host || _host) + (path || _path) + qry
                        };
                        console.log(conf.url);
                        var prom = $http(conf);
                        return helpers.responseHandler(prom);
                    }
                }
            }
        }

    });
