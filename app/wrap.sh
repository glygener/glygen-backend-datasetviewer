prj="glyds"
#srv="prd"
#srv="beta"
srv="tst"

sudo systemctl stop docker-$prj-app-$srv.service
python3 create_app_container.py -s $srv
sudo systemctl start docker-$prj-app-$srv.service


