angular.module('todoApp', ['ngRoute'])
  .config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/todo', {
          template: '<todo-list></todo-list>'
        }).when('/login', {
          template: '<login></login>'
      }).otherwise('/login');
    }
  ])
  .component('todoList', {
    templateUrl: 'todo.html',
    controller: ['$scope', '$location', '$http', function ($scope, $location, $http) {
      if(!$scope.$root.accessToken) {
        return $location.path('/login');
      }

      let maxTodoQuota = {
          quantity: 0
        },
        quotas = $scope.$root.accessToken.userInfo.quota;

      quotas.forEach(function (quoata) {
        if(quoata.code === 'MAX_TODO_ITEMS') {
          if(maxTodoQuota.quantity < quoata.quantity) {
            maxTodoQuota = quoata;
          }
        }
      });

      $scope.todos = [];
      $scope.maxTodo = maxTodoQuota;

      $scope.addTodo = function () {
        if($scope.todos.length >= $scope.maxTodo.quantity) {
          return alert('Max TODO items reached. Please consider buying PREMIUM plan.');
        }
        $scope.todos.push({
          name: $scope.myTodo,
          done: false
        });
        $scope.myTodo = '';
      };

      $scope.inProgressTodo = function (todo) {
        todo.done = false;
      };

      $scope.archiveAll = function () {
        $scope.todos = $scope.todos.filter(function (todo) {
          return !todo.done;
        });
      };
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
            console.log('userAccessToken', response);
            $scope.$root.accessToken = parseJwt(response.data.access_token);
            $location.path('/todo')
          });
      };

      $scope.email = 'ggwozdz+1@neoteric.eu';
      $scope.password = 'qweasd';
    }]
  });

