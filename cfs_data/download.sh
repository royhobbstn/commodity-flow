#!/usr/bin/env bash

wget https://www2.census.gov/programs-surveys/cfs/datasets/2012/2012-pums-files/cfs-2012-pumf-csv.zip
wget https://www2.census.gov/programs-surveys/cfs/guidance/cfs-area-shapefile-010215.zip
wget https://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_nation_20m.zip
wget https://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_zcta510_500k.zip

unzip cfs-2012-pumf-csv.zip
mv cfs_2012_pumf_csv.txt cfs_2012_pumf.csv

unzip cfs-area-shapefile-010215.zip
unzip cb_2017_us_nation_20m.zip
unzip cb_2017_us_zcta510_500k.zip

ogr2ogr dissolve_cfs.shp CFS_AREA_shapefile_010215.shp -dialect sqlite -sql "SELECT ST_Union(geometry), CFS12GEOID, ANSI_ST, CFS12_AREA, CFS12_NAME FROM CFS_AREA_shapefile_010215 GROUP BY CFS12GEOID, ANSI_ST, CFS12_AREA, CFS12_NAME"

ogr2ogr simple_cfs.shp dissolve_cfs.shp -simplify 0.0001
ogr2ogr simple_usa.shp cb_2017_us_nation_20m.shp -simplify 0.0001
ogr2ogr simple_zip.shp cb_2017_us_zcta510_500k.shp -simplify 0.00001

ogr2ogr -f GeoJSON -t_srs crs:84 CFS.geojson simple_cfs.shp
ogr2ogr -f GeoJSON -t_srs crs:84 USA.geojson simple_usa.shp
ogr2ogr -f GeoJSON -t_srs crs:84 zip.geojson simple_zip.shp

# create a centroid point for each CFS area, assign a zip
node --max-old-space-size=4096 createPoints.js

# parse cfs .csv file
node parseCFS.js
