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

    function bodyIsEmpty() {
      for(var prop in $scope.body) {
        if($scope.body.hasOwnProperty(prop))
          return false;
      }

      return true;
    }
  }]);
