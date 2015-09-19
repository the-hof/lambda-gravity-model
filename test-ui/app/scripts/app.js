'use strict';

/**
 * @ngdoc overview
 * @name testUiApp
 * @description
 * # testUiApp
 *
 * Main module of the application.
 */
angular
  .module('testUiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .service('jsonService', function () {
    var _eventJson = {
      number: "1",
      precision: 9,
      G: 6.6738e-11,
      timestep: 3600,
      verbose: false,
      system: []
    };
    return {
      event_json: _eventJson
    };
  });


