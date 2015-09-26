gravitationalPhysics
====================

A lambda function that applies gravitational physics to an array of objects

Usage
=====

This function takes the "system" state, which is all the parameters that define the laws
of physics to obey as well as the state of all the objects within the system, and returns
an updated system state after it has advanced the simulation one timestep.

There are some metadata parameters that are used to control the simulation.  The "number"
is a counting number that is used to represent the passage of time.  Generally a simulation
should start with a "number" of "1" and run for as many timesteps as are allowed by the
"max_timesteps" property.

The "verbose" parameter is a boolean that, when set, tells the function to "show it's work"
and save whatever interim calculations were used to support the updated state.

Input
=====

precision
---------

The number of significant figures in the final answer

G
-----

The gravitational constant for the mass, distance, and time units used

timesize
--------

The number of time units in each timestep (so 3600 would be one hour if the unit is seconds)

verbose
-------

Either "true" or "false".  If set to true, the output will include all the calculated forces

number
------

An integer that describes the timestep number in the simulation.  It will be incremented by
one

max_timesteps
-------------

A parameter that defines the maximum allowable value for the "number" parameter.  The function
will not calculate anything if this value is equal to or less than the "number" parameter

system
------

An array of objects.  Each object has numerical properties of

            x:  position coordinate

            y:  position coordinate

            z:  position coordinate

            vx:  velocity vector component

            vy:  velocity vector component

            vz:  velocity vector component

            mass:  mass in units that align with the value of G

            radius:  radius in units that align with the value of G

Each object also has a string property of

            name:  A unique string that identifies the object

Output
======

The output is an object with the same format as the input and represents the state of the
system at the timestep following the one that was passed in.  If the "verbose" parameter is
set to "true", the output will also contain all the forces calculated as well as any interim
calculations that were used

Example input json
------------------

```js
{
  "precision": 9,
  "G": 6.6738e-11,
  "timesize": 3600,
  "number": 1,
  "system": [
    {
      "name": "Sun",
      "x": 0,
      "y": 0,
      "z": 0,
      "vx": 0,
      "vy": 0,
      "vz": 0,
      "mass": 1.9885e30,
      "radius": 696000000
    },
    {
      "name": "Earth",
      "x": 1.471e11,
      "y": 0,
      "z": 0,
      "vx": 0,
      "vy": 30300,
      "vz": 0,
      "mass": 5.97219e24,
      "radius": 6371000
    }
  ]
}
```

Example output json
------------------

```js
{
  "precision": 9,
  "G": 6.6738e-11,
  "timesize": 3600,
  "number": 2,
  "verbose": false,
  "system": [
    {
      "x": "147099960258.1223",
      "y": "109079985.2649743",
      "z": "0",
      "vx": "-22.079",
      "vy": "30299.9918139",
      "vz": "0",
      "mass": "5.97219e+24"
    },
    {
      "x": "0.119359338",
      "y": "0.0000442546508",
      "z": "0",
      "vx": "0.000066311",
      "vy": "2.4586e-8",
      "vz": "0",
      "mass": "1.9885e+30"
    }
  ]
}
```

Notes
=====

Currently the output is sorted by the name of the input body and does not preserve
the meta properties of name or radius.  This will be updated.