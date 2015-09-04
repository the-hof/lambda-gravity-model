var Big = require('big.js');

exports.handler = function( event, context ) {
  var x = new Big(0);
  var y = new Big(0);
  var z = new Big(0);
  for (var i=0; i<event.vectors.length; i++) {
    x = x.plus(event.vectors[i].x);
    y = y.plus(event.vectors[i].y);
    z = z.plus(event.vectors[i].z);
  }

  var vectorx = {
    x: x.toPrecision(5),
    y: y.toPrecision(5),
    z: z.toPrecision(5)
  };

  console.log(vectorx);

  context.succeed(vectorx);
};