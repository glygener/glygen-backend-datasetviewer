ver_list="1.5.12 1.5.23 1.5.30 1.7.13 1.9.9 1.10.6 1.4.5 1.5.13 1.5.27 1.5.36 1.8.24 1.11.2 1.5.11 1.5.18 1.5.28 1.7.10 1.8.25"

for ver in $ver_list
do
    python3 download_data.py -v $ver
    done
