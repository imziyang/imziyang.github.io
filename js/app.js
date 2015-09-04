/**
* ziyang.me blog
*/
(function() {
  var app = angular.module('ziyang', [
    'ngRoute',
    'ngSanitize',
    'angularUtils.directives.dirDisqus'
  ]);

  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        controller: 'listCtrl',
        templateUrl: 'view/list.html'
      })
      .when('/posts/tag/:tag', {
        controller: 'tagCtrl',
        templateUrl: 'view/list.html'
      })
      .when('/post/:id', {
        controller: 'postCtrl',
        templateUrl: 'view/post.html'
      })
      .when('/about', {
        templateUrl: 'view/about.html',
      })
      .when('/friend', {
        templateUrl: 'view/friend.html',
      })
      .when('/404', {
        templateUrl: 'view/404.html'
      })
      .otherwise({
        redirectTo: '/404'
      });

    // $locationProvider.html5Mode(true);
  }]);

  app.filter('timeFormat', function() {
    return function(time) {
      var show;
      var diff = (new Date().getTime() - time) / 1000;
      if (diff < 60) {
        show = '刚刚';
      } else if (diff < 3600) {
        show = Math.floor(diff / 60)+'分钟前';
      } else if (diff < 86400) {
        show = Math.floor((diff / 3600))+'小时前';
      } else {
        var date = new Date(time);
        show = (date.getMonth() + 1)+'月'+date.getDate()+'日';
      }
      return show;
    };
  });

  app.directive('compile', ['$compile', function($compile) {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(
          function(scope) {
            return scope.$eval(attrs.compile);
          },
          function(value) {
            element.html(value);
            $compile(element.contents())(scope);
            $('pre code').each(function(i, block) {
              hljs.highlightBlock(block);
            });
          }
        );
      }
    };
  }]);

  app.factory('apiServ', ['$http', function($http) {
    // var apiUrl = 'http://localhost:8888';
    var apiUrl = 'http://api.ziyang.me';
    var api = {};

    api.get = function(api, callback) {
      $http
        .get(apiUrl+api)
        .success(function(data, status) {
          if (status == 200 && !data.hasOwnProperty('error')) {
            callback(null, data);
          } else {
            callback(data.message);
          }
        });
    };

    api.post = function(api, data, callback) {
      $http
        .post(apiUrl+api, data)
        .success(function(data, status) {
          if (status == 200 && !data.hasOwnProperty('error')) {
            callback(null, data);
          } else {
            callback(data.message);
          }
        });
    };

    return api;
  }]);

  app.controller('listCtrl', [
    '$scope',
    'apiServ',
    function($scope, apiServ) {
      $scope.posts = [];
      apiServ.get('/posts', function(err, data) {
        if (err) {
          console.log(err);
        } else {
          $scope.posts = data.posts;
        }
      });
    }
  ]);

  app.controller('tagCtrl', [
    '$scope',
    '$routeParams',
    'apiServ',
    function($scope, $routeParams, apiServ) {
      var tag = $routeParams.tag;
      $scope.posts = [];
      apiServ.get('/posts/tag/'+tag, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          $scope.posts = data.posts;
        }
      })
    }
  ]);

  app.controller('postCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'apiServ',
    function($scope, $routeParams, $location, apiServ) {
      var id = $routeParams.id;
      $scope.contentLoaded = false;
      $scope.url = $location.absUrl();
      $scope.post = {};
      apiServ.get('/post/'+id, function(err, post) {
        if (err) {
          console.log(err);
        } else {
          $scope.post = post;
          $scope.contentLoaded = true;
        }
      });
    }
  ]);
}).call(this);
