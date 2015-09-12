var Big = require('big.js');

exports.handler = function( event, context ) {
  precision =  getPrecisionFromEvent(event);

  var x = new Big(0);
  var y = new Big(0);
  var z = new Big(0);

  for (var i=0; i<event.vectors.length; i++) {
    x = x.plus(event.vectors[i].x);
    y = y.plus(event.vectors[i].y);
    z = z.plus(event.vectors[i].z);
  }

  var result = {
    x: x.toPrecision(precision),
    y: y.toPrecision(precision),
    z: z.toPrecision(precision)
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