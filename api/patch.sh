prj="glyds"
ser="beta"
ver="2.8.1"
#colls="c_init,c_bco,c_extract,c_drs,c_history,c_records"
colls="c_records"

python3 load_current_release.py -p $prj -s $ser -v $ver -c $colls
