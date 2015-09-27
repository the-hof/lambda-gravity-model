'use strict';

/**
 * @ngdoc function
 * @name testUiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the testUiApp
 */
angular.module('testUiApp')
  .controller('AboutCtrl', ['$scope', 'jsonService', function($scope, jsonService) {
    $scope.event_json = jsonService.event_json;


  }]);
