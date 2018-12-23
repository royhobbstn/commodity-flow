#!/usr/bin/env bash

wget https://www2.census.gov/programs-surveys/cfs/guidance/cfs-area-shapefile-010215.zip
wget http://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_nation_20m.zip
unzip cfs-area-shapefile-010215.zip
unzip cb_2017_us_nation_20m.zip

ogr2ogr dissolve_cfs.shp CFS_AREA_shapefile_010215.shp -dialect sqlite -sql "SELECT ST_Union(geometry), CFS12GEOID, ANSI_ST, CFS12_AREA, CFS12_NAME FROM CFS_AREA_shapefile_010215 GROUP BY CFS12GEOID, ANSI_ST, CFS12_AREA, CFS12_NAME"

ogr2ogr simple_cfs.shp dissolve_cfs.shp -simplify 0.0001
ogr2ogr simple_usa.shp cb_2017_us_nation_20m.shp -simplify 0.0001

ogr2ogr -f GeoJSON -t_srs crs:84 CFS.geojson simple_cfs.shp
ogr2ogr -f GeoJSON -t_srs crs:84 USA.geojson simple_usa.shp

# create a centroid point for each CFS area
node --max-old-space-size=4096 createPoints.js