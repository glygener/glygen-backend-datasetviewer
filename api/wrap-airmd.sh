prj="airmd"
srv="dev"


sudo systemctl stop docker-$prj-api-$srv.service
python3 create_api_container.py -p $prj -s $srv
sudo systemctl start docker-$prj-api-$srv.service


