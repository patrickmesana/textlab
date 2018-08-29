#!/usr/bin/env bash
VIS_FOLDER=./webapp
cp -a ./output/. $VIS_FOLDER/src/input
cd ./webapp
CACHING_MODE="FILE_SYS" babel-node src/data.js --presets es2015,stage-2