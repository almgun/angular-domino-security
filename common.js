'use strict';
/**
 * Created by almgun on 30.08.2014.
 */
angular.module('ga.domino-utils').factory('helpers', function ($q, objectFactory) {
    return {
        responseHandler: function (prom, extra) {
            var deferred = $q.defer();
            var rr = objectFactory.serverResponseFactory();
            prom.then(function (res) {
                if (res.data && res.data.status) {
                    rr.setObj(res.data);
                    if (res.data.status === "OK" || res.data.status === "NOK") {
                        deferred.resolve(rr);
                    }
                    else {
                        rr.status = "NOK";
                        rr.message = "UNKNOWN STATUS IN RESPONSE";
                        deferred.reject(rr);
                    }
                }
                else {
                    rr.setObj({"message": "UNKNOWN RESPONSE (HTML login page ?)" + extra || ''});
                    deferred.reject(rr);
                }
            }, function () {
                rr.setObj({"message": "REQUEST REJECTED"});
                deferred.reject(rr);
            });
            return deferred.promise;
        }
    }
}).factory('objectFactory', function () {
    var _severResponsePrototype = {
        reset: function () {
            this.status = "NOK";
            this.message = "";
            this.data = {};
        }, setObj: function (response) {
            this.status = response.status || "NOK";
            this.message = response.message || "";
            this.data = response.data || {};
        }
    };

    return{
        serverResponseFactory: function () {
            return Object.create(_severResponsePrototype, {
                status: { writable: true, enumerable: true, value: "NOK" },
                message: { writable: true, enumerable: true, value: "" },
                data: { writable: true, enumerable: true, value: {} }
            });
        },
        userRecord: function (user,roles) {
            return {user:user||{},roles:roles||[]};
        }
    }
}).factory('transformRequestAsFormPost', function () {
    //post JSON data as form data
    // http://www.bennadel.com/blog/2615-posting-form-data-with-http-in-angularjs.htm
    function transformRequest(data, getHeaders) {
        var headers = getHeaders();
        headers[ "Content-Type" ] = "application/x-www-form-urlencoded; charset=utf-8";
        return( serializeData(data) );
    }
    return( transformRequest );


    function serializeData(data) {
        if (!angular.isObject(data)) {
            return( ( data == null ) ? "" : data.toString() );
        }

        var buffer = [];

        // Serialize each key in the object.
        for (var name in data) {
            if (!data.hasOwnProperty(name)) {
                continue;
            }

            var value = data[ name ];
            buffer.push(
                    encodeURIComponent(name) +
                    "=" +
                    encodeURIComponent(( value == null ) ? "" : value)
            );
        }
        // Serialize the buffer and clean it up for transportation.
        var source = buffer
                .join("&")
                .replace(/%20/g, "+")
            ;
        console.log('transformed: ', source);
        return( source );
    }
});
