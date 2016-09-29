'use strict';

angular.module('todoApp', ['ngRoute'])
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/todo', {
          template: '<todo-list></todo-list>'
        }).when('/login', {
          template: '<login></login>'
        }).when('/register', {
          template: '<register></register>'
        }).otherwise('/login');
    }
  ])
  .component('todoList', {
    templateUrl: 'todo.html',
    controller: ['$scope', '$location', '$http', '$timeout', function ($scope, $location, $http, $timeout) {
      if(!$scope.$root.accessToken) {
        return $location.path('/login');
      }

      $http.get('/api/todos?filter={"where":{"userId": "'+ $scope.$root.accessToken.userInfo.user.id +'"}}')
        .then(function (response) {
          $scope.todos = response.data;
        });

      $scope.addTodo = function () {
        $http.post('/api/todos', {
          desc: $scope.myTodo
        }).then(function (response) {
          $scope.todos.push(response.data);
        }).catch(function (response) {
          $scope.error = response.data.error;
          $timeout(function () {
            $scope.error = null;
          }, 3000);
        }).finally(function () {
          $scope.myTodo = '';
        });
      };

      $scope.onDone = function (done) {
        var todo = this.todo;
        $http.put('/api/todos/'+todo.id, {
          done: done
        }).then(function () {
          todo.done = done;
        });
      };

      $scope.archiveAll = function () {
        $scope.todos = $scope.todos.filter(function (todo) {
          if(todo.done) $http.delete('/api/todos/'+todo.id);
          return !todo.done;
        });

      };
    }]
  })
  .component('plans', {
    templateUrl: 'plans.html',
    controller: ['$scope', '$http', function($scope, $http) {
      $http.get('/api/plans?filter={"where":{"isDefault":false,"isAvailable": true}}')
        .then(function (response) {
          $scope.plans = response.data;
        });

      $scope.purchase = function (plan) {
        $http.post('/api/plans/'+plan.id+'/buy', {
          profileId: $scope.$root.accessToken.userInfo.profile.id,
          nonce: undefined // braintree integration
        }).then(function () {
          alert('You have bought plan ' + plan.name);
        })
      };

    }]
  })
  .component('currentSubscriptions', {
    templateUrl: 'currentSubscriptions.html',
    controller: ['$scope', '$http', function($scope, $http) {
      $scope.subscriptions = $scope.$root.accessToken.userInfo.subscriptions;

      $scope.cancel = function (subscription) {
        $http.post('/api/subscriptions/'+subscription.id + '/cancel').then(function (response) {
          subscription.status = response.data.status;
          subscription.cancelledDate = response.data.cancelledDate;
        });
      }
    }]
  })
  .component('register', {
    templateUrl: 'register.html',
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {
      $scope.register = function () {
        $http.post('/api/auth/register', {
          name: $scope.name,
          email: $scope.email,
          password: $scope.password
        }).then(function () {
          $location.path('/login');
        }).catch(function (response) {
          $scope.error = response.data.error;
        });
      }
    }]
  })
  .component('login', {
    templateUrl: 'login.html',
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {

      function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(atob(base64));
      }

      $scope.login = function() {
        $http.post('/api/auth/login', {
          username : $scope.email,
          password : $scope.password
        })
          .then(response => {
            $http.defaults.headers.common.Authorization = response.data.access_token;
            $scope.$root.accessToken = parseJwt(response.data.access_token);
            $location.path('/todo')
          });
      };

      $scope.email = 'ggwozdz+1@neoteric.eu';
      $scope.password = 'qweasd99';
    }]
  });

