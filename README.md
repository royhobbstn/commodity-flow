# commodity-flow
Simple Web-Server to serve requests for Commodity Flow Survey Data.
Created to supplement the [Network-Mapping](https://github.com/royhobbstn/network-mapping) demo project.

## Install

Requires NodeJS 10+, wget, ogr2ogr, unzip

```
npm install
npm run setup
```

## Run

```
npm run server
```

## Data

```
GET http://localhost:8080/get-data?naics=212,311
```

To GET all data, you can ignore the `naics` query option.
