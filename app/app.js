var app = angular.module('appSostosWeb', ['ngRoute','ngSanitize','angular-jwt', 'angular-storage','ngCookies']);

app.constant('CONFIG', {
    APISOSTOS: "http://168.232.165.85:8080/sostos_frontend_api",
    SOSTOSURL: "http://168.232.165.85/sostos/#!/home"
})


app.config(function($routeProvider, $httpProvider, jwtInterceptorProvider, jwtOptionsProvider) {

  /*jwtOptionsProvider.config({
      tokenGetter: ['options', function(options) {
        //console.log(tknService.url.toString);
        return $cookies.get('sostos.tkn');
        //return localStorage.getItem('token');
      }],
      whiteListedDomains: ['168.232.165.85', 'localhost'] //,
      //authPrefix: 'Bearer '
    });
    $httpProvider.interceptors.push('jwtInterceptor');
		*/


  $routeProvider
  .when('/', {
    template : '',
    controller 	: 'loginController',
    authorization: false
  })
  .otherwise({
    redirectTo: '/'
  });
});


app.controller('loginController', ['$scope','CONFIG', 'authFactory', 'jwtHelper', 'store', '$location','$rootScope', '$http', '$cookies', function($scope, CONFIG, authFactory, jwtHelper, store, $location,$rootScope, $http, $cookies)
{
    $rootScope.isUserLoggedIn = false;
	  $scope.login = function(user)
    {
        authFactory.login(user).then(function(res)
        {
            if(res.data && res.data.token != '')
            {
                $rootScope.isUserLoggedIn = true;
                //store.set('token', res.data.token);
                //Cookie
                $cookies.put('sostos.tkn', res.data.token);
                $location.url(CONFIG.SOSTOSURL);
            }
            else
            {
                $scope.error = '<div class="alert alert-danger fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> Usuario o Contraseña Inválidos.</div>';
            }
        });
    }
}])

app.factory("authFactory", ["$http", "$q", "CONFIG", function($http, $q, CONFIG)
{
	return {
		login: function(user)
		{
            var deferred;
            deferred = $q.defer();
            $http({
                method: 'POST',
                skipAuthorization: true,
                url: CONFIG.APISOSTOS +'/token/get',
                data: user,
                headers: {'Content-Type': 'application/json'}
            })
            .then(function(res)
            {
                deferred.resolve(res);
            })
            .then(function(error)
            {
                deferred.reject(error);
            })
            return deferred.promise;
		}
	}
}]);

