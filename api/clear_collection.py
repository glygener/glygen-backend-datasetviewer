import os,sys
import string
from optparse import OptionParser
import glob
import json
from bson import json_util
import pymongo
from pymongo import MongoClient
import datetime
import subprocess

__version__="1.0"
__status__ = "Dev"

def write_progress_msg(msg, flag):
    ts = datetime.datetime.now()
    with open(log_file,  flag) as F:
        F.write("%s [%s]\n" % (msg, ts))
    return




###############################
def main():


    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog version___")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    parser.add_option("-v","--dataversion",action="store",dest="dataversion",help="2.0.2/2.0.3 ...")
    parser.add_option("-c","--coll",action="store",dest="coll",help="OPTIONAL c_glycan,c_protein ")
        

    (options,args) = parser.parse_args()

    for key in ([options.dataversion, options.server]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    global log_file

    server = options.server
    ver = options.dataversion
    
    config_obj = json.loads(open("./conf/config.json", "r").read())
    mongo_port = config_obj["dbinfo"]["port"][server]
    
    host = "mongodb://127.0.0.1:%s" % (mongo_port)
    rel_dir = config_obj["data_path"] + "/releases/data/"
    jsondb_dir = rel_dir + "/v-%s/jsondb/" % (ver)
    
    coll = options.coll

    db_name = config_obj["dbinfo"]["dbname"]
    db_user, db_pass = config_obj["dbinfo"][db_name]["user"], config_obj["dbinfo"][db_name]["password"]

    try:
        client = pymongo.MongoClient(host,
            username=db_user,
            password=db_pass,
            authSource=db_name,
            authMechanism='SCRAM-SHA-1',
            serverSelectionTimeoutMS=10000
        )
        client.server_info()
        dbh = client[db_name]
        if coll in ["c_extract", "c_bco", "c_history"]:
            coll = "%s_v-%s" % (coll, ver)
        #res = dbh[coll].delete_many({})
        res = dbh[coll].drop()
    except pymongo.errors.ServerSelectionTimeoutError as err:
        print (err)
    except pymongo.errors.OperationFailure as err:
        print (err)



if __name__ == '__main__':
    main()
