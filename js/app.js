var chartsApp = angular.module('chartsApp', ['ngRoute', 'chartsControllers']);

chartsApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/charts.html',
        controller: 'ChartsController'
      }).
      when('/artist/:artistName', {
        templateUrl: 'partials/artist.html',
        controller: 'ArtistController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);