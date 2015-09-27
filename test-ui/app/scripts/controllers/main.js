'use strict';

/**
 * @ngdoc function
 * @name testUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testUiApp
 */
angular.module('testUiApp')
  .controller('MainCtrl', ['$scope', 'jsonService', function($scope, jsonService) {
    $scope.event_json = jsonService.event_json;

    $scope.sendApi = function () {
      var api_url = "api_url";
      //jsonService.event_json = $scope.event_json;

    };

    $scope.addBody = function () {
      if (!bodyIsEmpty()) {
        $scope.event_json.system.push($scope.body);
      }
      $scope.body = {};
    };

    $scope.addPreset = function(body_name) {
      var body;

      switch(body_name) {
        case 'Sun': body = {
            "name": "Sun",
            "x": 0,
            "y": 0,
            "z": 0,
            "radius": 696000000,
            "color": 0xffff00
          };
          break;
        case 'Earth': body = {
          "name": "Earth",
          "x": 0.471e11,
          "y": 0,
          "z": 0,
          "radius": 63710000,
          "color": 0xadd8e6
        };
          break;
      }

      $scope.event_json.system.push(body);
    };

    function bodyIsEmpty() {
      for(var prop in $scope.body) {
        if($scope.body.hasOwnProperty(prop))
          return false;
      }

      return true;
    }
  }]);
