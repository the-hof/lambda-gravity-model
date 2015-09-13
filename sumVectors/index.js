var Big = require('big.js');

exports.handler = function( event, context ) {
  var precision =  getPrecisionFromEvent(event);
  var average = getAverageFromEvent(event);

  var x = new Big(0);
  var y = new Big(0);
  var z = new Big(0);

  for (var i=0; i<event.vectors.length; i++) {
    x = x.plus(event.vectors[i].x);
    y = y.plus(event.vectors[i].y);
    z = z.plus(event.vectors[i].z);
  }

  if (average) {
    x = x.div(event.vectors.length);
    y = y.div(event.vectors.length);
    z = z.div(event.vectors.length);
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
    precision = 5;

  return precision
};

function getAverageFromEvent(event) {
  var average = false;

  if (event.average && event.average == "true") {
    average = true;
  }

  return average;
}