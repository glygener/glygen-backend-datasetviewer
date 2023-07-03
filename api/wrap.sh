srv="prd"
#srv="beta"
#srv="tst"


sudo systemctl stop docker-glyds-api-$srv.service
python3 create_api_container.py -s $srv
sudo systemctl start docker-glyds-api-$srv.service


