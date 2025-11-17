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


    server = "tst"

    config_obj = json.loads(open("./conf/config.json", "r").read())
    mongo_port = config_obj["dbinfo"]["port"][server]
    
    host = "mongodb://127.0.0.1:%s" % (mongo_port)
    glydb_user, glydb_pass = config_obj["dbinfo"]["glydb"]["user"], config_obj["dbinfo"]["glydb"]["password"]
    glydb_db =  config_obj["dbinfo"]["glydb"]["db"]

    try:
        client = pymongo.MongoClient(host,
            username=glydb_user,
            password=glydb_pass,
            authSource=glydb_db,
            authMechanism='SCRAM-SHA-1',
            serverSelectionTimeoutMS=10000
        )
        client.server_info()
        dbh = client[glydb_db]
        coll = "c_records"
        res = dbh[coll].create_index([("$**", pymongo.TEXT)])
    except pymongo.errors.ServerSelectionTimeoutError as err:
        print (err)
    except pymongo.errors.OperationFailure as err:
        print (err)



if __name__ == '__main__':
    main()
