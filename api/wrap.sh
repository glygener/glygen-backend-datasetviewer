ver="2.0.2"
#python3 download_data.py -v $ver

#python3 start_mongodb_container.py
#python3 init_mongodb.py
#python3 load_objects.py -v $ver -m full
python3 start_api_container.py
#python3 start_app_container.py
