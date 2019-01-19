#!/usr/bin/env bash
wget https://s3-us-west-2.amazonaws.com/misc-public-files-dt/cfs_points.geojson
wget https://www2.census.gov/programs-surveys/cfs/datasets/2012/2012-pums-files/cfs-2012-pumf-csv.zip
wget https://www2.census.gov/geo/tiger/GENZ2017/shp/cb_2017_us_zcta510_500k.zip

unzip cfs-2012-pumf-csv.zip
mv cfs_2012_pumf_csv.txt cfs_2012_pumf.csv

unzip cb_2017_us_zcta510_500k.zip

ogr2ogr simple_zip.shp cb_2017_us_zcta510_500k.shp -simplify 0.00001
ogr2ogr -f GeoJSON -t_srs crs:84 zip.geojson simple_zip.shp

# create a centroid point for each CFS area, assign a zip
node --max-old-space-size=4096 createPoints.js

# parse cfs .csv file
node parseCFS.js
