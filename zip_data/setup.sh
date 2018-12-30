#!/usr/bin/env bash

wget https://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_zcta510_500k.zip
unzip cb_2017_us_zcta510_500k.zip
ogr2ogr simple_zip.shp cb_2017_us_zcta510_500k.shp -simplify 0.01
ogr2ogr -f GeoJSON -t_srs crs:84 zip.geojson simple_zip.shp

