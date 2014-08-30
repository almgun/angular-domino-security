/**
 * Created by almgun on 30.08.2014.
 */
angular.module('ga.domino-utils').factory('helpers', function ($q) {
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
}).factory('objectFactory', function () {
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
