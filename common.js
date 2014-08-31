'use strict';
/**
 * Created by almgun on 30.08.2014.
 */
angular.module('ga.domino-utils').factory('helpers', function ($q, objectFactory) {
    return {
        responseHandler: function (prom) {
            var deferred = $q.defer();
            var rr = objectFactory.serverResponseFactory();
            prom.then(function (res) {
                console.log("HER:" + JSON.stringify(res));
                if (res.data && res.data.status) {
                    rr.setObj(res.data);
                    console.log("Inside: " + JSON.stringify(rr));

                   // rr.status = res.data.status;
                    console.log("Inside status: " +  rr.status);
                    if (res.data.status === "OK") {
                        deferred.resolve(rr);
                    }
                    else if (res.data.status !== "NOK") {
                        rr.setObj({"message": "UNKNOWN RESPONSE"});
                        deferred.reject(rr);
                    }
                }
                else {
                    rr.setObj({"message": "UNKNOWN RESPONSE"});
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
                status: { writable:true, enumerable:true, value: "NOK" },
                message: { writable:true, enumerable:true, value: "" },
                data: { writable:true, enumerable:true, value: {} }

            });


        }
    }
});
