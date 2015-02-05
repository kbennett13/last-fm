var chartsControllers = angular.module('chartsControllers', []);

chartsControllers.controller('ChartsController', function ($scope, $http) {
  
  $http.get("http://ws.audioscrobbler.com/2.0/?method=chart.getTopArtists&api_key=ea9dc4a6b1684c80141850c5d3c1f005&format=json")
      .then(function (response) {
            makeArtistsPie(response["data"]["artists"]["artist"]);
      });
});

chartsControllers.controller('ArtistController', function ($scope, $http, $routeParams) {
  $scope.artistName = removeSpaces($routeParams["artistName"]);
  $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getevents&artist=" + $routeParams["artistName"] + "&limit=10&api_key=ea9dc4a6b1684c80141850c5d3c1f005&format=json")
        .then(function (response) {
          mapEvents(response.data.events.event);
          $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + $routeParams["artistName"] + "&limit=10&api_key=ea9dc4a6b1684c80141850c5d3c1f005&format=json")
            .then(function (response) {
              stackTracks(response.data.toptracks.track);
            });
        });
    });