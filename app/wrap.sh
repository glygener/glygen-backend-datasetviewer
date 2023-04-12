sudo systemctl stop docker-glygen-glyds-app.service
python3 create_app_container.py -s tst
sudo systemctl start docker-glygen-glyds-app.service

