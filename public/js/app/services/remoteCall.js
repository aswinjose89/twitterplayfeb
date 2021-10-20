(function() {
    angular
        .module('Twitterplay.services', [])
        .factory('remoteCall', remoteCall);

    remoteCall.$inject = ['$q','$http','$rootScope','$timeout'];
    function remoteCall($q, $http, $rootScope, $timeout)
    {
        var isTimedOut = false;
        var promise = null;
        var sendRequest = function sendRequest(method, url, dataObj,stream,filename) {
            var headers={};
            headers["content-type"]="application/json";
            headers['Access-Control-Allow-Headers']= "*";
            var deferred = $q.defer();

            let requestInput= {
                method : method,
                url : url,
                data : dataObj,
                responseType : (stream)?'arraybuffer':null
                //  headers: dataObj.headers //should be stored in this file, not passed in
            }
            if(method== 'GET'){
                requestInput['params']= dataObj;
            }
            else{
                requestInput['data']= dataObj;
            }

            deferred.resolve($http(requestInput).then(function(result,status, headers) {
                if(stream){
                        if(headers('Content-Disposition').indexOf('=') !== -1)
                        {
                            downloadFileName = headers('Content-Disposition').split('=')[1];
                        }
                        saveAs( new Blob([result], {type: headers('Content-Type')}),(downloadFileName)?downloadFileName:"download");
                }
                return result;

            },function (error, status) {

                console.log('Timeout error message Start');
                console.log('status: ',status);
                console.log('error: ',error);
            }));
            return deferred.promise;

        };
        var ajaxSendRequest = function sendRequest(method, url, dataObj) {
           
            //#endregion Diverting DotNet URL to DotNet Service


            $rootScope.btnDisabled = true;
            addRequestId(dataObj);
            loadingService.isLoading(true);
            if (promise !== null) $timeout.cancel(promise);
            promise = $timeout(function() {
                isTimedOut = true;
                console.log('timeout :: ',isTimedOut);
            }, timeout * 1000);

            if ($rootScope.idlePromise !== null) $timeout.cancel($rootScope.idlePromise);
            $rootScope.idlePromise = $timeout(function () {
                $rootScope.idlePrompt();
            }, ((timeout)*1000)-1000);
            var deferred = $q.defer();
            var settings = {
                "async": false,
                "crossDomain": true,
                "url": url,
                "method": method,
                "headers": headers,
                "processData": false,
                "data": JSON.stringify(dataObj.data)
            };
            deferred.resolve($.ajax(settings).done(function (result) {
                var result = JSON.parse(result);
                $rootScope.btnDisabled = false;
                loadingService.isLoading(false);
                isTimedOut = false;
                //if((error.errorObj)?(error.errorObj.errorCd==='DNC_1000')?true:false:false){($location.path('/denied'))}
                //Adding Common error mesasge to show the error code in all error response. Adding as per instruction given .
                try {
                    if(angular.isDefined(result)) {
                        if (angular.isDefined(result) && angular.isDefined(result.errorObj) && angular.isDefined(result.errorObj.errorCd) && angular.isDefined(result.errorObj.errorDesc)) {
                            if(result.status !== 0) {
                                var customErrorMsg = 'Error: ' + result.errorObj.errorCd + ' - ' + result.errorObj.errorDesc;
                            } else {
                                var customErrorMsg =  result.errorObj.errorDesc;
                            }

                            result.errorObj.errorDesc = customErrorMsg
                        }

                        else if (angular.isDefined(result.data) && angular.isDefined(result.data.errorObj) && angular.isDefined(result.data.errorObj.errorCd) && angular.isDefined(result.data.errorObj.errorDesc)) {
                            if(result.data.status !== 0) {
                                var customErrorMsg = 'Error: ' + result.data.errorObj.errorCd + ' - ' + result.data.errorObj.errorDesc;
                            } else {
                                var customErrorMsg =  result.data.errorObj.errorDesc;
                            }
                            result.data.errorObj.errorDesc = customErrorMsg
                        }
                    }
                } catch(e) {
                    console.log('exception');
                    console.log(result);
                }
                ajaxService.setResponse.call(result);
                /* return result;*/
            }).error(function(error,status){
                var errorData = JSON.parse((error && error.responseText)?error.responseText:error);
                loadingService.isLoading(false);
                if (isTimedOut || status===0) {
                    /*window.location.href = logoutUrl;*/
                    $location.path('/adminContact');
                } else {
                    isTimedOut = false;
                }
                if((errorData && errorData.errorObj)?(errorData.errorObj.errorCd==='DNC_1006')?true:false:false){
                    $location.path('/denied');
                }
                if((errorData && errorData.errorObj)?(errorData.errorObj.errorCd==='DNC_1000')?true:false:false){
                    $location.path('/pageAccessDenied');
                }
                ajaxService.setResponse.call(errorData);
                /* return result;*/
                /*  return error;*/
            }));
            
            return deferred.promise;

        };
        return {
            get: function(url, dataObj,stream,filename) {

                return sendRequest('GET', url,  dataObj,stream,filename);
            },
            post: function(url, dataObj,stream,filename) {

                return sendRequest('POST',url,  dataObj,stream,filename);
            },
            ajaxPost: function(url, dataObj) {
                return ajaxSendRequest('POST',url,dataObj);
            },
            ajaxGet: function(url, dataObj) {
                return ajaxSendRequest('GET',url,dataObj);
            },
            addRequestId: function(dataObj){
                return addRequestId(dataObj);
            }
        };
    }

})();