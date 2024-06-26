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
    parser.add_option("-p","--project",action="store",dest="project",help="glyds/argosdb/airmd")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    parser.add_option("-v","--dataversion",action="store",dest="dataversion",help="2.0.2/2.0.3 ...")
    parser.add_option("-c","--coll",action="store",dest="coll",help="OPTIONAL c_glycan,c_protein ")
        

    (options,args) = parser.parse_args()

    for key in ([options.project, options.server, options.dataversion]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    global log_file

    project = options.project
    server = options.server
    ver = options.dataversion
    
    config_file = "conf/config_%s.json" % (project)
    config_obj = json.loads(open(config_file, "r").read())
    mongo_port = config_obj["dbinfo"]["port"][server]
    
    host = "mongodb://127.0.0.1:%s" % (mongo_port)
    rel_dir = config_obj["data_path"] + "/releases/data/"
    jsondb_dir = rel_dir + "/v-%s/jsondb/" % (ver)
    

    #DEBUG = True
    DEBUG = False
    recordsdb_pattern = "*"
    if DEBUG:
        recordsdb_pattern = "GLY_00095*"
        #recordsdb_pattern = "GLY_000476"
        #recordsdb_pattern = "GLY_000491"
        #recordsdb_pattern = "GLY_000814"
        #recordsdb_pattern = "GLY_000815"
        #recordsdb_pattern = "GLY_000821"


    coll_list = []
    if options.coll != None:
        coll_list = options.coll.split(",")
    else:
        for d in config_obj["downloads"]["jsondb"]:
            coll = "c_" + d[:-2]
            coll_list.append("c_" + d[:-2])


    db_name = config_obj["dbinfo"]["dbname"]
    db_user, db_pass = config_obj["dbinfo"][db_name]["user"], config_obj["dbinfo"][db_name]["password"]

    bco_root = "https://biocomputeobject.org"

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
        for coll in coll_list:
            log_file = "logs/%s_loading_progress_%s.txt" % (coll, server)
            msg = "\n ... started loading %s " % (coll)
            write_progress_msg(msg, "w")

            db = "%sdb" % (coll[2:])
            subdir_list = [jsondb_dir + "/"  + db]
            if coll == "c_records":
                subdir_list = sorted(glob.glob(jsondb_dir + "/" + db + "/" + recordsdb_pattern))

            if coll in ["c_extract", "c_bco", "c_history"]:
                coll = "%s_v-%s" % (coll, ver)
            if DEBUG == False:
                res = dbh[coll].drop()
            for subdir in subdir_list:
                s_d = subdir.split("/")[-1] 
                if DEBUG == True and coll == "c_records":
                    bco_id = s_d
                    tmp_res = dbh[coll].delete_one({"bcoid":bco_id})
                    print ("cleared", bco_id)

                #if int(s_d.split("_")[1]) <= 823:
                #    continue
                file_list = glob.glob(subdir + "/*.json")
                nrecords, ntotal = 0, len(file_list)
                for in_file in sorted(file_list):
                    bco_id = in_file.split("/")[-2]
                    doc = json.loads(open(in_file, "r").read())
                    if "_id" in doc:
                        doc.pop("_id")
                    if coll == "c_records":
                        ntotal = 1000 * len(file_list)
                        for r in doc:
                            r["bcoid"] = bco_id
                            result = dbh[coll].insert_one(r)
                            nrecords += 1
                            if nrecords != 0 and nrecords%1000 == 0:
                                ts = datetime.datetime.now()
                                msg = " ... loaded %s/%s documents" % (nrecords, ntotal)
                                msg += " to %s (from %s)" % (coll, s_d)
                                write_progress_msg(msg, "a")
                    else:
                        if "object_id" in doc:
                            bco_id = doc["object_id"].split("/")[-2]
                            doc["object_id"] = "%s/%s/%s" % (bco_root, bco_id, ver)
                        result = dbh[coll].insert_one(doc)     
                        nrecords += 1
                        if nrecords != 0 and nrecords%1000 == 0:
                            ts = datetime.datetime.now()
                            msg = " ... loaded %s/%s documents" % (nrecords, ntotal)
                            msg += " to %s (from %s)" % (coll, s_d)
                            write_progress_msg(msg, "a")
                msg = " ... finished loading %s/%s documents" % (nrecords, ntotal)
                msg += " to %s (from %s)" % (coll, s_d)
                write_progress_msg(msg, "a")
                ts = datetime.datetime.now()
            for c in ["c_records", "c_bco"]:
                if coll.find(c) != -1:
                    res = dbh[coll].create_index([("$**", pymongo.TEXT)])

        os.chdir(rel_dir)
        cmd = "rm -f current"
        x = subprocess.getoutput(cmd)
        cmd = "ln -s v-%s current" % (ver)
        x = subprocess.getoutput(cmd)
    except pymongo.errors.ServerSelectionTimeoutError as err:
        print (err)
    except pymongo.errors.OperationFailure as err:
        print (err)



if __name__ == '__main__':
    main()
