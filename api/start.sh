server="tst"
image="glyds_tst_api"
api_container="running_"$image
network="glyds_backend"
port="9090"
data_path="/data/shared/glyds/"
mongo_db="glydb"
user="glydbadmin"
pass="glydbpass"
conn_str="mongodb://$user:$pass@localhost:27017/?authSource=$mongo_db"


docker run -dit --name $api_container --network $network -p 127.0.0.1:$port:80 -v $data_path:$data_path -e MONGODB_CONNSTRING=$conn_str -e DB_NAME=$mongo_db -e DATA_PATH=$data_path -e SERVER=$server $image

