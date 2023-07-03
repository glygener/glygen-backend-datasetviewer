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
api/conf/config.json and app/conf/config.json 


## Step-1: Data download
Visit https://data.glygen.org/ftp/ to see what data release/version $VER you want to 
download (for example 2.0.2), and go to the "api" subdirectory to run the python script 
to download from that release. Since this will take long, use nohup as shown below.
  ```
  nohup python3 download_data.py -s $SER -v $VER > logfile.log &
  ```
where $SER is your deployment server which can be  dev, tst, beta or prd. It is also important 
that you download all legacy releases since the application allows access to datasets from 
older releases.


## Step-2: Creating and starting docker container for mongodb
From the "api" subdirectory, run the python script given to build and start a mongodb container:
  ```
  python3 create_mongodb_container.py -s $SER
  docker ps --all 
  ```
The last command should list docker all containers and you should see the container
you created `running_glyds_mongo_$SER`. To start this container, the best way is
to create a service file (/usr/lib/systemd/system/docker-glyds-mongo-$SER.service),
and place the following content in it. 

  ```
  [Unit]
  Description=Glyds MONGODB Container
  Requires=docker.service
  After=docker.service

  [Service]
  Restart=always
  ExecStart=/usr/bin/docker start -a running_glyds_mongo_$SER
  ExecStop=/usr/bin/docker stop -t 2 running_glyds_mongo_$SER

  [Install]
  WantedBy=default.target
  ```

This will allow you to start/stop the container with the following commands, and ensure
that the container will start on server reboot.

  ```
  $ sudo systemctl daemon-reload 
  $ sudo systemctl enable docker-glyds-mongo-$SER.service
  $ sudo systemctl start docker-glyds-mongo-$SER.service
  $ sudo systemctl stop docker-glyds-mongo-$SER.service
  ```


## Step-3: Initialize and populate your mongodb database
To init your mongodb, go to the "api" subdirectory and run (this should be done only one time):
  ```
  python3 init_mongodb.py -s $SER
  ```

You can load data from the most recent release you have downloaded using 
the following command:
  ```
  cd api
  python3 load_current_release.py -s $SER -v $VER -m full
  ```

To load data from downloaded legacy releases:
  ```
  cd api
  python3 load_legacy_release.py -s $SER -v $VER -m full
  ```
      
## Step-4: Creating docker container for the APIs
From the "api" subdirectory, run the python script given to build and start container:
  ```
  python3 create_api_container.py -s $SER
  docker ps --all
  ```
The last command should list docker all containers and you should see the container
you created `running_glyds_api_$SER`. To start this container, the best way is
to create a service file (/usr/lib/systemd/system/docker-glyds-api-$SER.service),
and place the following content in it.

  ```
  [Unit]
  Description=Glyds API Container
  Requires=docker.service
  After=docker.service

  [Service]
  Restart=always
  ExecStart=/usr/bin/docker start -a running_glyds_api_$SER
  ExecStop=/usr/bin/docker stop -t 2 running_glyds_api_$SER

  [Install]
  WantedBy=default.target
  ```
This will allow you to start/stop the container with the following commands, and ensure
that the container will start on server reboot.

  ```
  $ sudo systemctl daemon-reload 
  $ sudo systemctl enable docker-glyds-api-$SER.service
  $ sudo systemctl start docker-glyds-api-$SER.service
  $ sudo systemctl stop docker-glyds-api-$SER.service
  ```


## Step-5: Testing the APIs
From the "api" subdirectory, run the following to test the APIs

  ```
  http POST http://localhost:$API_PORT/misc/info
  http POST http://localhost:$API_PORT/dataset/search < queries/dataset_search.json
  http POST http://localhost:$API_PORT/dataset/detail < queries/dataset_detail.json
  http POST http://localhost:$API_PORT/dataset/historylist < queries/dataset_historylist.json
  http POST http://localhost:$API_PORT/dataset/historydetail < queries/dataset_historydetail.json
  http POST http://localhost:$API_PORT/dataset/submit < queries/dataset_submit.json
  http POST http://localhost:$API_PORT/gsd/submit < queries/gsd_submit.json
  http POST http://localhost:$API_PORT/dataset/glycan_finder < queries/dataset_glycan_finder.json
  ```
where $API_PORT the API port specified in the api/conf/config.json file.


# Installation of APP

## Setting config parameters
After cloning this repo, you will need to set the paramters given in
conf/config.json. The "app_port" is the port in the host that should 
map to docker container for the app.


## Creating and starting docker container for the APP

From the "app" subdirectory, run the python script given to build and start container:
  ```
  python3 create_app_container.py -s $SER
  docker ps --all
  ```
The last command should list docker all containers and you should see the container
you created `running_glyds_app_$SER`. To start this container, the best way is
to create a service file (/usr/lib/systemd/system/docker-glyds-app-$SER.service),
and place the following content in it.

  ```
  [Unit]
  Description=Glyds APP Container
  Requires=docker.service
  After=docker.service

  [Service]
  Restart=always
  ExecStart=/usr/bin/docker start -a running_glyds_app_$SER
  ExecStop=/usr/bin/docker stop -t 2 running_glyds_app_$SER

  [Install]
  WantedBy=default.target
  ```
This will allow you to start/stop the container with the following commands, and ensure
that the container will start on server reboot.

  ```
  $ sudo systemctl daemon-reload 
  $ sudo systemctl enable docker-glyds-app-$SER.service
  $ sudo systemctl start docker-glyds-app-$SER.service
  $ sudo systemctl stop docker-glyds-app-$SER.service
  ```


## Mapping APP and API containers to public domains
To map the APP and API containers to public domains (e.g. www.glyds.org and api.glyds.org),
add apache VirtualHost directives. This VirtualHost directive can be in a new f
ile (e.g. /etc/httpd/conf.d/glyds.conf).

  ```
  <VirtualHost *:443>
    ServerName www.glyds.org
    ProxyPass / http://127.0.0.1:$APP_PORT/
    ProxyPassReverse / http://127.0.0.1:$APP_PORT/
  </VirtualHost>

  <VirtualHost *:443>
    ServerName api.glyds.org
    ProxyPass / http://127.0.0.1:$API_PORT/
    ProxyPassReverse / http://127.0.0.1:$API_PORT/
  </VirtualHost>
  ```

where $APP_PORT and $API_PORT are your port for the APP and API ports 
in conf/config.json file. You need to restart apache after this changes using 
the following command:

   ```
   $ sudo apachectl restart 
   ```








