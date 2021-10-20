#!/bin/bash

for repository in schema whosonfirst geonames openaddresses openstreetmap polylines api placeholder interpolation pip-service; do
        git clone https://github.com/pelias/${repository}.git # clone from Github
        pushd $repository > /dev/null                         # switch into importer directory
        npm install                                           # install npm dependencies
        popd > /dev/null                                      # return to code directory
donez
