var Big = require('big.js');

// input:  A number called "precision"
// input:  A number called "time"
// input:  A vector called "vector" with "x" "y" "z" as properties
// input:  An object called 'body" with "x" "y" "z" "vx" "vy" "vz" "mass" as properties
// output:  An object called body, same type as input
exports.handler = function( event, context ) {
  precision =  getPrecisionFromEvent(event);

  var body = {
    x: new Big(event.body.x),
    y: new Big(event.body.y),
    z: new Big(event.body.z),
    vx: new Big(event.body.vx),
    vy: new Big(event.body.vy),
    vz: new Big(event.body.vz),
    mass: new Big(event.body.mass)
  };
  var force = {
    x: new Big(event.force.x),
    y: new Big(event.force.y),
    z: new Big(event.force.z)
  };

  body = calculateNewPosition(force, body, event.time);
  body = calculateNewVelocity(force, body, event.time);

  var result = {
    x: body.x.toPrecision(precision),
    y: body.y.toPrecision(precision),
    z: body.z.toPrecision(precision),
    vx: body.vx.toPrecision(precision),
    vy: body.vy.toPrecision(precision),
    vz: body.vz.toPrecision(precision)
  };

  console.log(result);

  context.succeed(body);
};


// v_next = v_cur + (Fnet / mass) * t
function calculateNewVelocity(force, body, time) {
  // assume mass isn't zero for now
  var mass = body.mass.toPrecision(5);

  var acceleration = {};
  acceleration.x = (force.x).div(mass).times(time);
  acceleration.y = (force.y).div(mass).times(time);
  acceleration.z = (force.z).div(mass).times(time);

  //console.log("acceleration.x = " + acceleration.x.toPrecision(5));
  //console.log("acceleration.y = " + acceleration.y.toPrecision(5));
  //console.log("acceleration.z = " + acceleration.z.toPrecision(5));

  body.vx = body.vx.plus(acceleration.x.toPrecision(5));
  body.vy = body.vy.plus(acceleration.y.toPrecision(5));
  body.vz = body.vz.plus(acceleration.z.toPrecision(5));

  return body;
};

//x_next = x_cur + (cur_vx * t) + ((1/2) (Fnet / mass) * t**2)
function calculateNewPosition(force, body, time) {
  var mass = body.mass.toPrecision(precision);

  var acceleration_component = {};
  acceleration_component.x = (force.x).div(mass).times(time).times(time).div(2);
  acceleration_component.y = (force.y).div(mass).times(time).times(time).div(2);
  acceleration_component.z = (force.z).div(mass).times(time).times(time).div(2);

  //console.log("acceleration_component.x = " + acceleration_component.x.toPrecision(5));
  //console.log("acceleration_component.y = " + acceleration_component.y.toPrecision(5));
  //console.log("acceleration_component.z = " + acceleration_component.z.toPrecision(5));

  var velocity_component = {};

  velocity_component.x = (body.vx).times(time);
  velocity_component.y = (body.vy).times(time);
  velocity_component.z = (body.vz).times(time);

  //console.log("velocity_component.x = " + velocity_component.x.toPrecision(5));
  //console.log("velocity_component.y = " + velocity_component.y.toPrecision(5));
  //console.log("velocity_component.z = " + velocity_component.z.toPrecision(5));

  body.x = body.x
    .plus(acceleration_component.x.toPrecision(precision))
    .plus(velocity_component.x.toPrecision(precision));
  body.y = body.y
    .plus(acceleration_component.y.toPrecision(precision))
    .plus(velocity_component.y.toPrecision(precision));
  body.z = body.z
    .plus(acceleration_component.z.toPrecision(precision))
    .plus(velocity_component.z.toPrecision(precision));

  return body;
}

function getPrecisionFromEvent(event) {
  if (event.precision)
    precision = event.precision;
  else
    precision = 5

  return precision
};