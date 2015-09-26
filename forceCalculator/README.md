forceCalculator
===============

A lambda function that calculates the gravitational force between and array of objects and
one of the objects in the array.

Usage
=====

This function is the inner loop of the gravitational math.  Given an array of objects, it
calculates all the forces on one of those objects that are caused by the gravity of the other
objects.  It returns returns all the calculated force vectors as well as the sum of those vectors.


Input
=====

precision
---------

The number of significant figures in the final answer

G
-----

The gravitational constant

index
-----

The index of the item in the array to calculate the forces on

body
-----

An array of objects.  Each object has numerical properties of

    x:  position coordinate

    y:  position coordinate

    z:  position coordinate

    mass:  mass in units that align with the value of G

Output
======

An array of objects.  The first item in the array is a vector that is the sum of all the other
vectors in the array (with numerical x, y, z components).  The rest of the array is an ordered
list of force vectors that represent the force of gravity on the index body.  The index body
force on itself is left in the array.



Example input json
------------------

```js
{
  "precision": 9,
  "G": 6.6738e-11,
  "index": 0,
  "body": [
    {
      "x": 0,
      "y": 0,
      "z": 0,
      "mass": 100e20
    },
    {
      "x": 1,
      "y": 10,
      "z": 100,
      "mass": 500
    },
    {
      "x": -10,
      "y": -100,
      "z": -2000,
      "mass": 5
    },
    {
      "x": 20,
      "y": 20,
      "z": 20,
      "mass": 200
    }
  ]
}
```

Example output json
-------------------

```js
[
    {
        x: '6.45473640e+10',
        y: '6.75056057e+10',
        z: '9.70876071e+10'
    },
    {
        magnitude: '0.00000000',
        x: '0.00000000',
        y: '0.00000000',
        z: '0.00000000'
    },
    {
        magnitude: '3.30353430e+10',
        x: '328697677',
        y: '3.28697677e+9',
        z: '3.28697677e+10'
    },
    {
        magnitude: '832123.887',
        x: '-4155.37658',
        y: '-41553.7658',
        z: '-831075.316'
    },
    {
        magnitude: '1.11230000e+11',
        x: '6.42186704e+10',
        y: '6.42186704e+10',
        z: '6.42186704e+10'
    }
]
```

Notes
=====

uses Newtonian gravity formula
