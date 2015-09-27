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
    }
  })
  .directive(
  "tjsModelViewer",
  [function () {
    return {
      restrict: "E",
      scope: {
        eventJson: "=eventJson"
      },
      link: function (scope, elem, attr) {
        var camera;
        var scene;
        var renderer;
        var previous;

        // init scene
        init();

        function loadModels(system) {
          var scale_factor = 100000000;
          var radius_scale_factor = 10000000;


          for (var i=0; i<system.length; i++) {
            // set up the sphere vars
            var radius = system[i].radius/radius_scale_factor,
              segments = 16,
              rings = 16;

            // create the sphere's material
            var sphereMaterial = new THREE.MeshLambertMaterial({
                  color: system[i].color
                });

            var sphere = new THREE.Mesh(
              new THREE.SphereGeometry(radius,segments,rings),
              sphereMaterial
            );

            sphere.position.x = system[i].x/scale_factor;
            sphere.position.y = system[i].y/scale_factor;
            sphere.position.z = system[i].z/scale_factor;
            scene.add(sphere);
          }
        }

        loadModels(scope.eventJson.system);
        animate();

        function init() {
          var VIEW_ANGLE = 50;
          var NEAR = 1;
          var FAR = 20000;
          var WIDTH = 700;
          var HEIGHT = 600;
          camera = new THREE.PerspectiveCamera(
            VIEW_ANGLE,
              WIDTH / HEIGHT,
            NEAR,
            FAR
          );
          camera.position.z = 1500;
          scene = new THREE.Scene();

          var pointLight =
            new THREE.PointLight(0xFFFFFF);

        // set its position
          pointLight.position.x = 0;
          pointLight.position.y = 0;
          pointLight.position.z = 150;

          // add to the scene
          scene.add(pointLight);

          // Renderer
          renderer = new THREE.WebGLRenderer();
          renderer.setSize(WIDTH,HEIGHT);
          elem[0].appendChild(renderer.domElement);

          // Events
          //window.addEventListener('resize', onWindowResize, false);
        }

        /*
        function onWindowResize(event) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        */

        //
        var t = 0;

        function animate() {
          requestAnimationFrame(animate);
          render();
        }

        //
        function render() {
          var timer = Date.now() * 0.0005;
          /*
          camera.position.x = Math.cos(timer) * 10;
          camera.position.y = 4;
          camera.position.z = Math.sin(timer) * 10;
          camera.lookAt(scene.position);
          */
          renderer.render(scene, camera);
        }
      }
    }
  }
  ]);



