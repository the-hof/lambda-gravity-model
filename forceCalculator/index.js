var Big = require('big.js');

exports.handler = function( event, context ) {
  precision = getPrecisionFromEvent(event);
  var index = parseInt(event.index);
  var force_list = [];

  var sumForces = {
    x: new Big(0),
    y: new Big(0),
    z: new Big(0)
  };

  for (var i=0; i<event.body.length; i++) {
    var force = calculateGravitationalForce(event.body[i], event.body[index], event.G);
    force_list.push({
      magnitude: force.magnitude.toPrecision(precision),
      x: force.x.toPrecision(precision),
      y: force.y.toPrecision(precision),
      z: force.z.toPrecision(precision)
    });


    sumForces.x = (sumForces.x).plus(force.x);
    sumForces.y = (sumForces.y).plus(force.y);
    sumForces.z = (sumForces.z).plus(force.z);
  }

  force_list.unshift({
    //magnitude: sumForces.magnitude.toPrecision(precision),
    x: sumForces.x.toPrecision(precision),
    y: sumForces.y.toPrecision(precision),
    z: sumForces.z.toPrecision(precision)
  });

  var result = force_list;

  console.log(result);
  context.succeed(result);
};

function getPrecisionFromEvent(event) {
  if (event.precision)
    precision = event.precision;
  else
    precision = 5;

  return precision
};

function calculateGravitationalForce(one, two, G) {
  if ((one.x == two.x) && (one.y == two.y) && (one.z == two.z)) {
    return {
      magnitude: new Big(0),
      x: new Big(0),
      y: new Big(0),
      z: new Big(0)
    }
  }
  x1 = new Big(one.x);
  y1 = new Big(one.y);
  z1 = new Big(one.z);

  x2 = new Big(two.x);
  y2 = new Big(two.y);
  z2 = new Big(two.z);

  var x = x1.minus(x2);
  var y = y1.minus(y2);
  var z = z1.minus(z2);

  var distance_squared = x.pow(2).plus(y.pow(2)).plus(z.pow(2));
  var distance = distance_squared.sqrt();

  //Double magnitude = (G * thisMass * thatMass) / distance_squared
  var thisMass = new Big(one.mass);
  var thatMass = new Big(two.mass);
  var G = new Big(G);
  var magnitude = G.times(thisMass).times(thatMass).div(distance_squared);

  //Double scale_ratio = (distance/magnitude)
  var scale_ratio = distance.div(magnitude);

  var bigResult = {
    magnitude: magnitude,
    x: x.div(scale_ratio),
    y: y.div(scale_ratio),
    z: z.div(scale_ratio)
  };

  return bigResult;

  /*
  var result = {
    magnitude: magnitude.toPrecision(precision),
    x: x.div(scale_ratio).toPrecision(precision),
    y: y.div(scale_ratio).toPrecision(precision),
    z: z.div(scale_ratio).toPrecision(precision)
  };
  */
}