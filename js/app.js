/**
* ziyang Module
*
* ziyang.me blog
*/
var app = angular.module('ziyang', ['ngRouge'])

app.config(['$routeProvider',function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'listCtrl',
      templateUrl: 'view/main.html'
    })
    .when('/post/:id', {
      controller: 'postCtrl',
      templateUrl: 'view/post.html'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

app.controller('listCtrl', ['$scope', function($scope) {

}]);

app.controller('postCtrl', ['$scope', function($scope) {

}]);
