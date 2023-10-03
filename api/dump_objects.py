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
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    parser.add_option("-v","--dataversion",action="store",dest="dataversion",help="2.0.2")
    parser.add_option("-c","--coll",action="store",dest="coll",help="collection")

    (options,args) = parser.parse_args()

    for key in ([options.dataversion,options.coll, options.server]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    ver = options.dataversion
    coll = options.coll
    server = options.server

    if coll in ["c_extract", "c_bco", "c_history"]:
        coll = "%s_v-%s" % (coll, ver)
            

    config_obj = json.loads(open("./conf/config.json", "r").read())
    mongo_port = config_obj["dbinfo"]["port"][server]
    host = "mongodb://127.0.0.1:%s" % (mongo_port)
    #host = "mongodb://localhost:%s" % (mongo_port)

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
        q = {}
        #q = {"row":{"$regex":"kinase", "$options":"i"}}
        #q = {"$and": [ {"$or": [{ "row": {"$options": "i","$regex": "kinase"}}]}]}
        #q = { "$text": { "$search": "\"sarscov2_protein_signalp_annotation\"" } }
        n = dbh[coll].count_documents(q)
        print (n)
        exit()
        #for doc in dbh[coll].find(q).skip(1).limit(100):
        for doc in dbh[coll].find(q):
            if "_id" in doc:
                doc.pop("_id")
            print (json.dumps(doc, indent=4))
    except pymongo.errors.ServerSelectionTimeoutError as err:
        print (err)
    except pymongo.errors.OperationFailure as err:
        print (err)



if __name__ == '__main__':
    main()
