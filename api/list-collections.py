import os,sys
import string
from optparse import OptionParser
import glob
import json
from bson import json_util
import pymongo
from pymongo import MongoClient
import datetime


__version__="1.0"
__status__ = "Dev"



###############################
def main():

    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog version___")
    parser.add_option("-p","--project",action="store",dest="project",help="glyds/arogsdb/airmd")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")

    (options,args) = parser.parse_args()

    for key in ([options.project, options.server]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    server = options.server
    project = options.project

            
    config_file = "conf/config_%s.json" % (project) 
    config_obj = json.loads(open(config_file, "r").read())
    #mongo_port = config_obj["dbinfo"]["port"][server]
    mongo_port = "27017"
    host = "mongodb://127.0.0.1:%s" % (mongo_port)


    db_name = "glydb_beta" if server == "beta" else "glydb"
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
        for c in dbh.list_collection_names():
            print (c)

    except pymongo.errors.ServerSelectionTimeoutError as err:
        print (err)
    except pymongo.errors.OperationFailure as err:
        print (err)



if __name__ == '__main__':
    main()
