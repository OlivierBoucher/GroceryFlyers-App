angular.module('grocery.controllers')
.controller('MapController', function($scope, $rootScope, $stateParams, $ionicLoading, $compile, Stores, Cart) {

    var products = Cart.all();
    var storeTypes = [];
    var stores = [];
    var i = 0;
    $scope.letter = 'A';

    products.forEach(function(product){
        var storeType = util.getMarketFromBanner(product.banner_code);
        if (storeTypes.indexOf(storeType) == -1){
            storeTypes.push(storeType);
        }
    });

    $scope.nextChar = function() {
        var letter = $scope.letter.charCodeAt(0);
        $scope.letter = String.fromCharCode(letter + 1);
        return $scope.letter;
    }

    $scope.loadMap = function(){
        $scope.validStores = [];
        products.forEach(function(product){
            var store = _.find(stores, function(s){ return s.banner_code == product.banner_code; });
            if ($scope.validStores.indexOf(store) == -1){
                $scope.validStores.push(store);
            }
        });

        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var distanceService = new google.maps.DistanceMatrixService();

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 6,
            center: $rootScope.data.postalCode
        });

        var waypts = [];
        $scope.validStores.forEach(function(s){
            waypts.push({
                location: { lat : s.latitude, lng : s.longitude },
                stopover: true
            });
        });


        var mapOptions = { center: $rootScope.data.postalCode, zoom: 16, mapTypeId: google.maps.MapTypeId.ROADMAP };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        directionsDisplay.setMap($scope.map);

        directionsService.route({
            origin: $rootScope.data.postalCode,
            destination: $rootScope.data.postalCode,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });

      distanceService.getDistanceMatrix(
        {
          origins: $rootScope.data.postalCode,
          destinations: waypts,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false,
        }, drivingCallback);

      function drivingCallback(response, status) {
        console.log(response);
        console.log(status);
      }
    }

    storeTypes.forEach(function(type){
        Stores.getByMarket(type).then(function(data){
            stores = stores.concat(data);
            i++;
            if (i == storeTypes.length){
                $scope.loadMap();
            }
        });
    });
});
