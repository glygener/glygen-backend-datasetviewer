# Requirements
The following must be available on your server:

* pymongo
* httpie
* jsonref
* jsonschema
* Node.js and npm
* docker


# Installation of APIs

## Setting config parameters
After cloning this repo, you will need to set the paramters given in
api/conf/config.json


## Step-1: Data download
Visit https://data.glygen.org/ftp/ to see what data release/version {VER} you want to 
download (for example 2.0.2), and go to the "api" subdirectory to run the python script 
to download from that release. Since this will take long, use nohup as shown below.
  ```
  nohup python3 download_data.py -v {VER} > logfile.log &
  ```
It is also important that you download all legacy releases since the application allows
access to datasets from older releases.


## Step-2: Starting the mongodb container
From the "api" subdirectory, run the python script given to build and start a mongodb container:
  ```
  python3 start_mongodb_container.py
  docker ps
  ```
The last command should list docker containers and you should see one named
"running_glyds_mongo_tst".


## Step-3: Initialize and populate your mongodb database
To init your mongodb, go to the "api" subdirectory and run (this should be done only one time):
  ```
  python3 init_mongodb.py
  ```

You can load data from the most recent release you have downloaded using 
the following command:
  ```
  cd api
  python3 load_current_release.py -v {VER} -m full
  ```

To load data from downloaded legacy releases:
  ```
  cd api
  python3 load_legacy_release.py -v {VER} -m full
  ```
      
## Step-4: Building and starting the docker container for the APIs
From the "api" subdirectory, run the python script given to build and start container:
  ```
  python3 start_api_container.py
  docker ps
  ```
The last command should list docker containers and you should see one named
"running_glyds_tst_api".


## Step-5: Testing the APIs
From the "api" subdirectory, run the following to test the APIs

  ```
  http POST http://localhost:9090/misc/info
  http POST http://localhost:9090/dataset/search < queries/dataset_search.json
  http POST http://localhost:9090/dataset/detail < queries/dataset_detail.json
  http POST http://localhost:9090/dataset/historylist < queries/dataset_historylist.json
  http POST http://localhost:9090/dataset/historydetail < queries/dataset_historydetail.json
  http POST http://localhost:9090/dataset/submit < queries/dataset_submit.json
  http POST http://localhost:9090/gsd/submit < queries/gsd_submit.json
  http POST http://localhost:9090/dataset/glycan_finder < queries/dataset_glycan_finder.json
  ```


# Installation of APP

## Setting config parameters
After cloning this repo, you will need to set the paramters given in
conf/config.json. The "server" paramater can be "tst" or "prd" for
test or production server respectively. The "app_port" is the port
in the host that should map to docker container for the app.


## Building and starting the docker container for the APP

From the "app" subdirectory, run the python script given to build and start container:
  ```
  python3 start_app_container.py
  docker ps
  ```
The last command should list docker containers and you should see one named
"running_glyds_tst_app".



## Setting public domains to the 
To serve the APP at a given public domain name such as www.glyds.org,
add the following lines to your apache VirtualHost directive 
(assuming the "app_port" you have selected in the conf/config.json 
 configuration to be 5050)


  ```
  <VirtualHost *:443>
    ServerName www.glyds.org
    ProxyPass / http://127.0.0.1:5050/
    ProxyPassReverse / http://127.0.0.1:5050/
  </VirtualHost>
  ```









