var Big = require('big.js');

exports.handler = function( event, context ) {
  //console.log("Received event: ", event);
  precision =  getPrecisionFromEvent(event);

  x1 = new Big(event.one.x);
  y1 = new Big(event.one.y);
  z1 = new Big(event.one.z);

  x2 = new Big(event.two.x);
  y2 = new Big(event.two.y);
  z2 = new Big(event.two.z);

  var x = x1.minus(x2);
  var y = y1.minus(y2);
  var z = z1.minus(z2);

  var distance_squared = x.pow(2).plus(y.pow(2)).plus(z.pow(2));
  var distance = distance_squared.sqrt();
  //console.log("distance: ", distance.toPrecision(5));
  //console.log("distance_squared: ", distance_squared.toPrecision(5));

  //Double magnitude = (G * thisMass * thatMass) / distance_squared
  var thisMass = new Big(event.one.mass);
  var thatMass = new Big(event.two.mass);
  var G = new Big(event.G);
  var magnitude = G.times(thisMass).times(thatMass).div(distance_squared);
  //console.log("magnitude of force: ", magnitude.toPrecision(5));

  //Double scale_ratio = (distance/magnitude)
  var scale_ratio = distance.div(magnitude);

  var result = {
    magnitude: magnitude.toPrecision(precision),
    x: x.div(scale_ratio).toPrecision(precision),
    y: y.div(scale_ratio).toPrecision(precision),
    z: z.div(scale_ratio).toPrecision(precision)
  };

  console.log(result);

  context.succeed(result);
};

function getPrecisionFromEvent(event) {
  if (event.precision)
    precision = event.precision;
  else
    precision = 5

  return precision
};