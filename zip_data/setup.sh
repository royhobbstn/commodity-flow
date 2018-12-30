#!/usr/bin/env bash

wget ftp://ftp2.census.gov/geo/tiger/TIGER2018/ZCTA5/tl_2018_us_zcta510.zip
unzip tl_2018_us_zcta510.zip
ogr2ogr simple_zip.shp tl_2018_us_zcta510.shp -simplify 0.01
ogr2ogr -f GeoJSON -t_srs crs:84 zip.geojson simple_zip.shp

node createZipCoordLookup.js