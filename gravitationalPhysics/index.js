var Big = require('big.js');
var async = require("async");
var AWS = require('aws-sdk');

exports.handler = function( event, context ) {
  precision =  getPrecisionFromEvent(event);
  G = event.G;
  timesize = event.timesize;
  verbose = getBooleanValueFromEventValue(event.verbose);
  var timestep_number = parseInt(event.number) + 1;
  var max_timesteps = parseInt(event.max_timesteps);

  if (isNaN(max_timesteps)) {
    max_timesteps = 10
  }

  if (timestep_number > max_timesteps) {
    context.fail("max number of timesteps exceeded")
  }

  var initial_system = event.system;
  initial_system.sort(function (a, b) {
      return (a.name).localeCompare(b.name)
    });

  var result = {
    precision: precision,
    G: G,
    timesize: timesize,
    number: timestep_number,
    verbose: verbose
  };

  if (verbose)
    result.initial_system = initial_system;

  AWS.config.loadFromPath('./awsconfig.json');

  //calculate the gravitational forces at the initial positions
  gravitationFunction(initial_system, function (err, initial_force_matrix) {
    if (err) {
      context.fail(err);
    } else {
      var initial_force_list = [];
      for (var i=0; i<initial_force_matrix.length; i++) {
        initial_force_list.push(initial_force_matrix[i].shift())
      }
      if (verbose) {
        result.initial_force_matrix = initial_force_matrix;
        result.initial_force_list = initial_force_list;
      }

      //apply forces to objects and calculate updated positions and velocities
      updateKinematics(initial_system, initial_force_list, timesize, function (err, expected_system) {
        if (err) {
          context.fail(err)
        } else {
          if (verbose)
            result.expected_system = expected_system;

          // recalculate forces at the expected (calculated) positions
          gravitationFunction(expected_system, function (err, recalc_force_matrix) {
            if (err) {
              context.fail(err)
            } else {
              var recalc_force_list = [];
              var averaged_force_list = [];
              for (var i=0; i<recalc_force_matrix.length; i++) {
                var this_vector = recalc_force_matrix[i].shift();
                recalc_force_list.push(this_vector);
                averaged_force_list.push(averageTwoVectors(initial_force_list[i], this_vector));
              }
              if (verbose) {
                result.recalc_force_matrix = recalc_force_matrix;
                result.recalc_force_list = recalc_force_list;
                result.averaged_force_list = averaged_force_list;
              }
              //apply forces to objects and calculate updated positions and velocities
              updateKinematics(initial_system, averaged_force_list, timesize, function (err, final_system) {
                if (err) {
                  context.fail(err)
                } else {
                  result.system = final_system;

                  console.log("result");
                  console.log(JSON.stringify(result, null, 2));
                  context.succeed(result);
                }
              });
            }
          });
        }
      });
    }
  });
};

//<editor-fold desc="updateKinematics">
function updateKinematics(positions, force_list, timesize, callback) {
  var tasks = [];
  var updated_positions = [];

  for (var i=0; i<positions.length; i++) {
    var lambda_updateKinematics = new AWS.Lambda();
    var function_params = {
      "precision": precision,
      "time": timesize,
      "force": force_list[i],
      "body": positions[i]
    };

    var params = {
      FunctionName: "gravityModel-updateKinematics-development", /* required */
      InvocationType: "RequestResponse",
      LogType: 'None',
      Payload: JSON.stringify(function_params)
    };

    var this_lambda = generateLambdaWrapper(params, lambda_updateKinematics);
    tasks.push(this_lambda);
  }

  async.parallel(tasks, function(err, results) {
    for (var index=0; index<results.length; index++) {
      updated_positions.push(JSON.parse(results[index].Payload));
    }
    callback(null, updated_positions);
  });
}
//</editor-fold>

//<editor-fold desc="gravitationFunction">
function gravitationFunction(positions, callback) {
  var force_matrix = [];
  var tasks = [];

  for (var i=0; i<positions.length; i++) {
    var lambda_gravitationalForceCalculator = new AWS.Lambda();

    var function_params = {
      "precision": precision,
      "G": G,
      "index": i,
      "body": positions
    };

    var params = {
      FunctionName: "gravityModel-forceCalculator-development", /* required */
      InvocationType: "RequestResponse",
      LogType: 'None',
      Payload: JSON.stringify(function_params)
    };

    var this_lambda = generateLambdaWrapper(params, lambda_gravitationalForceCalculator);
    tasks.push(this_lambda);
  }

  async.parallel(tasks, function(err, results) {
    if (err) callback(err);
    for (var index=0; index<results.length; index++) {
      force_matrix.push(JSON.parse(results[index].Payload));
    }
    callback(null, force_matrix);
  });
}
//</editor-fold>

//<editor-fold desc="helper functions">
function generateLambdaWrapper(params, lambda_function) {
  return function(callback) {
    lambda_function.invoke(params, callback);
  }
}

function getPrecisionFromEvent(event) {
  if (event.precision)
    precision = event.precision;
  else
    precision = 5;

  return precision
};

function getBooleanValueFromEventValue(event_value) {
  var value = false;

  if (event_value && event_value == "true") {
    value = true;
  }

  return value;
};

function averageTwoVectors(one, two) {
  var x = new Big(one.x);
  x = x.plus(two.x);
  x = x.div(2);
  var y = new Big(one.y).plus(two.y).div(2);
  var z = new Big(one.z).plus(two.z).div(2);

  var result = {
    x: x.toPrecision(precision),
    y: y.toPrecision(precision),
    z: z.toPrecision(precision)
  };

  return result;
}

var Matrix = function (rows, columns)  {
  this.rows = rows;
  this.columns = columns;
  this.myarray = new Array(this.rows);
  for (var i=0; i < this.columns; i +=1) {
    this.myarray[i]=new Array(this.rows)
  }
  return this.myarray;
};
//</editor-fold>