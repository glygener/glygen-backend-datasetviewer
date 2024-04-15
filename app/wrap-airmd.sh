prj="airmd"
srv="dev"


sudo systemctl stop docker-$prj-app-$srv.service
python3 create_app_container.py -p $prj -s $srv
sudo systemctl start docker-$prj-app-$srv.service


