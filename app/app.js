var app = angular.module('appSostosWeb', ['ngRoute','ngSanitize','angular-jwt', 'angular-storage','ngCookies','udpCaptcha']);

app.constant('CONFIG', {
    APISOSTOS: "http://168.232.165.85:8080/sostos_frontend_api",
    //SOSTOSURL: "http://168.232.165.85/sostosweb/sostos/#!/home"
    SOSTOSURL: "http://localhost/sostosweb/sostos/#!/home"
})

app.run(['$rootScope','jwtHelper', 'store', '$location','$routeParams','$cookies', function($rootScope, jwtHelper, store, $location,$routeParams,$cookies) {

   $rootScope.isUserLoggedIn = false ; //Cambiar a false
   $cookies.remove('sostos.tkn');
   store.remove('token');

}]);

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


app.controller('loginController', ['$scope','CONFIG', 'authFactory', 'jwtHelper', 'store', '$location','$rootScope', '$http', '$cookies','$window','$captcha', function($scope, CONFIG, authFactory, jwtHelper, store, $location,$rootScope, $http, $cookies, $window, $captcha)
{
     $rootScope.isUserLoggedIn = false;
     $scope.login = function(user)
    {
         if($captcha.checkResult($scope.resultado) == true)
		{
		 	authFactory.login(user).then(function(res)
            {
                if(res.data && res.data.token != '')
                {
                    $rootScope.isUserLoggedIn = true;
                    //store.set('token', res.data.token);
                    //Cookie
                    $cookies.put('sostos.tkn', res.data.token);
                    $window.location.href = CONFIG.SOSTOSURL;
                    //$location.url(CONFIG.SOSTOSURL);
                }
                else
                {
                    $window.alert('Error usuario o contraseña');
                }
            });
		}
		//si falla la validacion
		else
		{
		 	alert("Desafio Incorrecto, vuelva a intentar");
		}

    }

    $scope.registro = function(user)
    {
        $scope.code = 0;
        authFactory.regUser(user).then(function(res)
        {
            $scope.code = res.data.detailsResponse.code;
            $scope.msg = res.data.detailsResponse.message;

        })
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
		},
        regUser: function(user)
        {
            var deferred;
            deferred = $q.defer();
            $http({
                method: 'POST',
                skipAuthorization: true,
                url: CONFIG.APISOSTOS +'/usuario/regusuario',
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

app.directive('pwCheck', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwCheck;
        $(elem).add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  }]);




