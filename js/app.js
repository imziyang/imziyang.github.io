/**
* ziyang.me blog
*/
(function() {
  'use strict';

  var app = angular.module('ziyang', [
    'ngRoute',
    'ngSanitize',
    'templates'
  ]);

  app.config(['$routeProvider', '$locationProvider', function($routeProvider) {
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
        templateUrl: 'view/post.html?v=1'
      })
      .when('/about', {
        controller: 'aboutCtrl',
        templateUrl: 'view/about.html'
      })
      .when('/friend', {
        controller: 'friendCtrl',
        templateUrl: 'view/friend.html'
      })
      .when('/404', {
        controller: 'notfoundCtrl',
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

  app.directive('showNav', ['$rootScope', function($rootScope) {
    return {
      restrict: 'A',
      link: function(scope, ele) {
        ele.bind('click', function() {
          $rootScope.$apply(function() {
            $rootScope.showNav = !$rootScope.showNav;
          });
        });
      }
    };
  }]);

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
            var codes = element.find('pre').find('code');
            for (var i = 0; i < codes.length; i++) {
              hljs.highlightBlock(codes[i]);
            }
          }
        );
      }
    };
  }]);

  app.directive('dirDisqus', ['$window', function($window) {
    return {
      restrict: 'E',
      scope: {
        disqus_shortname: '@disqusShortname',
        disqus_identifier: '@disqusIdentifier',
        disqus_title: '@disqusTitle',
        disqus_url: '@disqusUrl',
        disqus_category_id: '@disqusCategoryId',
        disqus_disable_mobile: '@disqusDisableMobile',
        readyToBind: '@'
      },
      template: '<div id="disqus_thread"></div></a>',
      link: function(scope) {
        scope.$watch('readyToBind', function(isReady) {

          if (!angular.isDefined(isReady)) {
            isReady = 'true';
          }
          if (scope.$eval(isReady)) {
            $window.disqus_shortname = scope.disqus_shortname;
            $window.disqus_identifier = scope.disqus_identifier;
            $window.disqus_title = scope.disqus_title;
            $window.disqus_url = scope.disqus_url;
            $window.disqus_category_id = scope.disqus_category_id;
            $window.disqus_disable_mobile = scope.disqus_disable_mobile;

            // get the remote Disqus script and insert it into the DOM, but only if it not already loaded (as that will cause warnings)
            if (!$window.DISQUS) {
              var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
              dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
              (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            } else {
              $window.DISQUS.reset({
                reload: true,
                config: function () {
                  this.page.identifier = scope.disqus_identifier;
                  this.page.url = scope.disqus_url;
                  this.page.title = scope.disqus_title;
                }
              });
            }
          }
        });
      }
    };
  }]);

  app.factory('headerServ', [function() {
    var defaultTitle = '';
    var defaultDesc = '一个自称叫竹林的家伙用来抒(mei)发(shi)情(zhao)怀(shi)，陶(dan)冶(teng)情(zhuang)操(bi)的地方';
    var title = defaultTitle;
    var desc = defaultDesc;
    return {
      title: function() {
        return (title ? title+'-' : '')+'竹林写字的地方';
      },
      desc: function() {
        return desc;
      },
      setHeader: function(newTitle, newDesc) {
        title = newTitle || defaultTitle;
        desc = newDesc || defaultDesc;
      }
    };
  }]);

  app.factory('loadServ', ['$rootScope', function($rootScope) {
    return {
      on: function() {
        $rootScope.showLoading = true;
      },
      off: function() {
        $rootScope.showLoading = false;
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

  app.controller('mainCtrl', ['$scope', 'headerServ', function($scope, headerServ) {
    $scope.header = headerServ;
  }]);

  app.controller('listCtrl', [
    '$scope',
    'apiServ',
    'loadServ',
    'headerServ',
    function($scope, apiServ, loadServ, headerServ) {
      headerServ.setHeader();
      loadServ.on();
      $scope.posts = [];
      apiServ.get('/posts', function(err, data) {
        loadServ.off();
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
    'loadServ',
    'headerServ',
    function($scope, $routeParams, apiServ, loadServ, headerServ) {
      loadServ.on();
      var tag = $routeParams.tag;
      headerServ.setHeader('『'+tag+'』搜索结果');
      $scope.posts = [];
      apiServ.get('/posts/tag/'+tag, function(err, data) {
        loadServ.off();
        if (err) {
          console.log(err);
        } else {
          $scope.posts = data.posts;
        }
      });
    }
  ]);

  app.controller('postCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'apiServ',
    'loadServ',
    'headerServ',
    function($scope, $routeParams, $location, apiServ, loadServ, headerServ) {
      loadServ.on();
      var id = $routeParams.id;
      $scope.contentLoaded = false;
      $scope.url = 'http://www.ziyang.me/#/post/'+id;
      $scope.post = {};
      apiServ.get('/post/'+id, function(err, post) {
        loadServ.off();
        if (err) {
          console.log(err);
        } else {
          headerServ.setHeader(post.title, post.abstract);
          $scope.post = post;
          $scope.contentLoaded = true;
        }
      });
    }
  ]);

  app.controller('aboutCtrl', ['headerServ', function(headerServ) {
    headerServ.setHeader('关于我');
  }]);

  app.controller('friendCtrl', ['headerServ', function(headerServ) {
    headerServ.setHeader('友链');
  }]);

  app.controller('notfoundCtrl', ['headerServ', function(headerServ) {
    headerServ.setHeader('404');
  }]);

}).call(this);
