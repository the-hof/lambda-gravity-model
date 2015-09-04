var Big = require('big.js');

exports.handler = function( event, context ) {
  //console.log("Received event: ", event);
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

  var gravitationalForce = {
    magnitude: magnitude.toPrecision(5),
    x: x.div(scale_ratio).toPrecision(5),
    y: y.div(scale_ratio).toPrecision(5),
    z: z.div(scale_ratio).toPrecision(5)
  };

  //console.log(gravitationalForce);

  context.succeed(gravitationalForce);
};