var Big = require('big.js');
async = require("async");

exports.handler = function( event, context ) {
  precision =  getPrecisionFromEvent(event);

  
};

function getPrecisionFromEvent(event) {
  if (event.precision)
    precision = event.precision;
  else
    precision = 5

  return precision
};