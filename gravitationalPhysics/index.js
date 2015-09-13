var Big = require('big.js');
var async = require("async");
var AWS = require('aws-sdk');

exports.handler = function( event, context ) {
  precision =  getPrecisionFromEvent(event);
  G = event.G;
  timesize = event.timesize;
  verbose = getBooleanValueFromEventValue(event.verbose);
  var timestep_number = parseInt(event.number) + 1;

  var initial_system = event.system;
  initial_system.sort(function (a, b) {
      return (a.name).localeCompare(b.name)
    });

  var result = {
    precision: precision,
    G: G,
    timesize: timesize,
    timestep_number: timestep_number
  };

  if (verbose)
    result.initial_system = initial_system;

  AWS.config.loadFromPath('./awsconfig.json');

  //calculate the gravitational forces at the initial positions
  gravitationFunction(initial_system, function (err, initial_force_matrix) {
    if (err) {
      context.fail(err);
    } else {
      if (verbose)
        result.initial_force_matrix = initial_force_matrix;

      //reduce initial force vectors from arrays to 1 vector per object
      sumVectorsAcrossMatrix(initial_force_matrix, function (err, initial_force_list) {
        if (err) {
          context.fail(err);
        } else {
          if (verbose)
            result.initial_force_list = initial_force_list;

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
                  if (verbose)
                    result.recalculated_force_matrix = recalc_force_matrix;

                  // reduce recalculated force vectors from arrays to 1 vector per object
                  sumVectorsAcrossMatrix(recalc_force_matrix, function(err, recalc_force_list) {
                    if (verbose)
                      result.recalculated_force_list = recalc_force_list;

                    // average force vectors together
                    averageForceVectors(initial_force_list, recalc_force_list, function(err, averaged_force_list) {
                      if (err) {
                        context.fail(err)
                      } else {
                        if (verbose)
                          result.averaged_force_list = averaged_force_list;

                        //recalculate the "final" positions and velocities using the averaged forces
                        updateKinematics(initial_system, averaged_force_list, timesize, function(error, final_system) {
                          if (err) {
                            context.fail(err)
                          } else {
                            result.system = final_system;

                            //console.log("result");
                            //console.log(JSON.stringify(result, null, 2));
                            context.succeed(result);
                          }
                        });
                      }
                    })
                  })
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

//<editor-fold desc="averageForceVectors">
function averageForceVectors(initial_forces, final_forces, callback) {
  var tasks = [];
  var force_list = [];

  for (var i=0; i<initial_forces.length; i++) {
    var lambda_sumVectors = new AWS.Lambda();
    var vector_list = [];
    vector_list.push(initial_forces[i]);
    vector_list.push(final_forces[i]);

    var function_params = {
      "precision": precision,
      "average": "true",
      "vectors": vector_list
    };

    var params = {
      FunctionName: "gravityModel-sumVectors-development", /* required */
      InvocationType: "RequestResponse",
      LogType: 'None',
      Payload: JSON.stringify(function_params)
    };

    var this_lambda = generateLambdaWrapper(params, lambda_sumVectors);
    tasks.push(this_lambda);
  }

  async.parallel(tasks, function(err, results) {
    for (var index=0; index<results.length; index++) {
      force_list.push(JSON.parse(results[index].Payload));
    }
    callback(null, force_list);
  });
}
//</editor-fold>

//<editor-fold desc="sumVectors">
function sumVectorsAcrossMatrix(force_matrix, callback) {
  var tasks = [];
  var force_list = [];

  for (var i=0; i<force_matrix.length; i++) {
    var lambda_sumVectors = new AWS.Lambda();

    var function_params = {
      "precision": precision,
      "vectors": force_matrix[i]
    };

    var params = {
      FunctionName: "gravityModel-sumVectors-development", /* required */
      InvocationType: "RequestResponse",
      LogType: 'None',
      Payload: JSON.stringify(function_params)
    };

    var this_lambda = generateLambdaWrapper(params, lambda_sumVectors);
    tasks.push(this_lambda);
  }

  async.parallel(tasks, function(err, results) {
    for (var index=0; index<results.length; index++) {
      force_list.push(JSON.parse(results[index].Payload));
    }
    callback(null, force_list);
  });
};
//</editor-fold>

//<editor-fold desc="gravitationFunction">
function gravitationFunction(positions, callback) {
  var force_matrix = new Matrix(positions.length, positions.length);
  var tasks = [];

  for (var i=0; i<positions.length; i++) {
    force_matrix[i][i] = {magnitude: 0, x: 0, y: 0, z: 0};

    for (var j=positions.length-1; j>i; j--) {

      var lambda_gravitationalForceCalculator = new AWS.Lambda();

      var function_params = {
        "precision": precision,
        "G": G,
        "one": {
          "x": positions[i].x,
          "y": positions[i].y,
          "z": positions[i].z,
          "mass": positions[i].mass
        },
        "two": {
          "x": positions[j].x,
          "y": positions[j].y,
          "z": positions[j].z,
          "mass": positions[j].mass
        }
      };

      var params = {
        FunctionName: "gravityModel-calculateGravitationalForce-development", /* required */
          InvocationType: "RequestResponse",
        LogType: 'None',
        Payload: JSON.stringify(function_params)
      };

      var this_lambda = generateLambdaWrapper(params, lambda_gravitationalForceCalculator);
      tasks.push(this_lambda);
    }
  }

  async.parallel(tasks, function(err, results) {
    if (err) callback(err);
    var i=0;
    var j=(positions.length)-1;
    for (var index=0; index<results.length; index++) {
      force_matrix[i][j] = flipVector(JSON.parse(results[index].Payload));
      force_matrix[j][i] = JSON.parse(results[index].Payload);
      j = j-1;
      if (j==i) {
        i = i+1;
        j=(positions.length)-1;
      }
    }

    callback(null, force_matrix);
  });

  //<editor-fold desc="flip vector">
  function flipVector(vector) {
    var result = {
      magnitude: vector.magnitude,
      x: vector.x * -1,
      y: vector.y * -1,
      z: vector.z * -1
    };

    return result
  }
  //</editor-fold>
};
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