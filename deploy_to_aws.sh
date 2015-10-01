#!/bin/bash

cd forceCalculator
./node_modules/.bin/node-lambda deploy
cd ../updateKinematics
./node_modules/.bin/node-lambda deploy
cd ../gravitationalPhysics
./node_modules/.bin/node-lambda deploy
cd ..