updateKinematics
================

A lambda function that updates the position and velocity vectors of an object given
the object's current position and velocity as well as a force vector

Usage
=====

This function calculates the effects of a force on an object over a period of time

Input
=====

precision
---------

The number of significant figures in the final answer

time
-----

The amount of time to simulate

body
-----

The body being acted upon.  It has numerical properties of

        x:  position coordinate

        y:  position coordinate

        z:  position coordinate

        vx:  velocity vector component

        vy:  velocity vector component

        vz:  velocity vector component

        mass:  mass in units that align with the value of G

force
-----

A vector (with numerical x, y, z components) that represents a force on the object

Output
======

An object that has numerical properties of

       x:  position coordinate

       y:  position coordinate

       z:  position coordinate

       vx:  velocity vector component

       vy:  velocity vector component

       vz:  velocity vector component


Example input json
------------------

```js
{
  "time": 1,
  "precision": 2,
  "force": {
    "x": 10,
    "y": 100,
    "z": 1000
  },
  "body": {
    "x": 0,
    "y": 0,
    "z": 0,
    "vx": -1,
    "vy": -2,
    "vz": -3,
    "mass": 100
  }
}
```

Example output json
------------------

```js
{
    x: '-0.95',
    y: '-1.5',
    z: '2.0',
    vx: '-0.90',
    vy: '-1.0',
    vz: '7.0'
}
```

Notes
=====

Split off into its own lambda function because it may need to get more computationally
involved later with things like tides, collisions, and hydrostatics