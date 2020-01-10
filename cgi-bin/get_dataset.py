#!/usr/bin/python
import os,sys
reload(sys)
sys.setdefaultencoding("ISO-8859-1")

import string
import commands
import csv
import traceback

from Bio import SeqIO
from Bio.Seq import Seq


from optparse import OptionParser
import glob
from bson import json_util, ObjectId
import json
import util
import cgi


import pymongo
from pymongo import MongoClient



__version__="1.0"
__status__ = "Dev"



##############################
def get_preview(doc, path_obj, obj_ver):



    out_json = {"status":1, "errormsg":"", "info":{}}
    out_json["info"]["title"] = doc["provenance_domain"]["name"] 
    desc = doc["usability_domain"][0] if doc["usability_domain"] != [] else ""
    #desc = desc[0:100] if len(desc) > 100 else desc
    out_json["info"]["description"] =  desc


    file_name = doc["io_domain"]["output_subdomain"][0]["uri"]["filename"].strip()
    file_type = file_name.split(".")[-1]


    out_json["info"]["filename"] = file_name
    out_json["info"]["filetype"] = file_type
    out_json["info"]["objid"] = doc["bco_id"].split("/")[-1].split(".")[0]
    out_json["info"]["filestatus"] = False               
    out_json["txtbuffer"] = ""

    
    cmd = "cat " + path_obj["htmlpath"] + "/ln2wwwdata/reviewed/release-notes.txt"
    release_info = commands.getoutput(cmd).strip()
    current_version = release_info.split(" ")[0]
    out_json["versions"] = [release_info]
    out_json["selectedversion"] = obj_ver if obj_ver != None else current_version

    file_list = glob.glob(path_obj["htmlpath"] + "/ln2wwwdata/reviewed/v-*/release-notes.txt")
    for rel_file in file_list:
        if os.path.exists(rel_file):
            cmd = "cat " + rel_file
            release_info = commands.getoutput(cmd).strip()
            ver = release_info.split(" ")[0]
            file_path = path_obj["htmlpath"] + "/ln2wwwdata/reviewed/%s/%s" % (ver,out_json["info"]["filename"])
            if os.path.isfile(file_path) == True:
                out_json["versions"].append(release_info)


    data_dir = path_obj["htmlpath"] + "/ln2wwwdata/reviewed/"
    if obj_ver != None and obj_ver != current_version:
            data_dir += obj_ver + "/"
    file_path = data_dir + out_json["info"]["filename"]
    if os.path.exists(file_path) == False:
        out_json["info"]["filestatus"] = False
        return out_json
    else:
        species_short = file_name.split("_")[0]
        if file_type in ["csv", "tsv"]:
            delim = "," if file_type == "csv" else "\t"
            out_json["dataframe"] = []
            with open(file_path, 'r') as FR:
                csvGrid = csv.reader(FR, delimiter=delim, quotechar='"')
                rowCount = 0
                for row in csvGrid:
                    rowCount += 1
                    tmp_row = []
                    for val in row:
                        val = str(val).encode('utf-8').strip()
                        tmp_row.append(val)
                    out_json["dataframe"].append(tmp_row)
                    if rowCount == 1:
                        tmpList = []
                        for j in xrange(0, len(row)):
                            tmpList.append("string")
                        out_json["dataframe"].append(tmpList)
                    if rowCount == 85:
                        break
        elif file_type == "fasta":
            out_json["seqobjects"] = []
            seqCount = 0
            in_file = path_obj["htmlpath"] + "/ln2wwwdata/reviewed/" + file_name
            for record in SeqIO.parse(in_file, "fasta"):
                seqCount += 1
                seqId = record.id
                seqDesc = record.description
                seqBody = str(record.seq.upper())
                out_json["seqobjects"].append({"seqid":seqId, "seqdesc":seqDesc, "seqbody":seqBody})
                if seqCount == 10:
                    break
        elif file_type in ["rdf"]:
            in_file = path_obj["htmlpath"] + "/ln2wwwdata/reviewed/" + file_name
            with open(in_file, 'r') as FR:
                lineCount = 0
                for line in FR:
                    lineCount += 1
                    out_json["txtbuffer"] += line
                    if lineCount == 100:
                        break
        elif file_type in ["gp", "gb", "nt"]:
            in_file = path_obj["htmlpath"] + "/ln2wwwdata/reviewed/" + file_name
            with open(in_file, 'r') as FR:
                lineCount = 0
                for line in FR:
                    lineCount += 1
                    out_json["txtbuffer"] += line
                    if lineCount == 200:
                        break
        elif file_type in ["png"] or file_name == "glycan_images.tar.gz":
            file_list = glob.glob(path_obj["htmlpath"] + "/ln2wwwdata/glycanimages/*.png")
            for f in file_list[1000:1010]:
                recordId = f.split("/")[-1].split(".")[0]
                url = root_obj["htmlroot"] + "/ln2wwwdata/glycanimages/"  + f.split("/")[-1]
                out_json["txtbuffer"] +=  "%s <br>" % (recordId)
                out_json["txtbuffer"] += "<img src=\"%s\"><hr><br>" % (url)
        elif file_type in ["aln"]:
            file_list = glob.glob(path_obj["htmlpath"] + "/ln2wwwdata/aln/"+species_short+"/*.aln")
            for f in file_list[0:10]:
                recordId = f.split("/")[-1].split(".")[0]
                out_json["txtbuffer"] +=  "%s" % (recordId)
                with open(f, 'r') as FR:
                    for line in FR:
                        out_json["txtbuffer"] += line
                    out_json["txtbuffer"] += "\n\n"
        else:
            out_json["txtbuffer"] +=  "Please implement service for " + file_type + " preview!"


    return out_json



###############################
def main():

    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog " + __version__)
    msg = "Input JSON text"
    parser.add_option("-j","--injson",action="store",dest="injson",help=msg)


    form_dict = cgi.FieldStorage()
    (options,args) = parser.parse_args()
    local_flag = False
    in_json = {}
    if len(form_dict.keys()) > 0:
        in_json = json.loads(form_dict["injson"].value) if "injson" in form_dict else {}
    else:
        local_flag = True
        for key in ([options.injson]):
            if not (key):
                parser.print_help()
                sys.exit(0)
        in_json = json.loads(options.injson)



    global config_json
    global db_obj
    global client
    global root_obj


    print "Content-Type: application/json"
    print   

    

    out_json = {}
    try:
        config_json = json.loads(open("conf/config.json", "r").read())
        custom_config_json = json.loads(open("conf/config.custom.json", "r").read())
        db_obj = custom_config_json[config_json["server"]]["dbinfo"]
        path_obj = custom_config_json[config_json["server"]]["pathinfo"]
        root_obj = custom_config_json[config_json["server"]]["rootinfo"]
    except Exception, e:
        print json.dumps({"taskstatus":0, "errormsg":"Loading config failed!"})
        sys.exit()


    try:
        client = MongoClient('mongodb://localhost:27017',
            username=db_obj["mongodbuser"],
            password=db_obj["mongodbpassword"],
            authSource=db_obj["mongodbname"],
            authMechanism='SCRAM-SHA-1',
            serverSelectionTimeoutMS=10000
        )
        client.server_info()
        dbh = client[db_obj["mongodbname"]]
        
        obj_id = in_json["objid"].replace(db_obj["dsprefix"], "")
        obj_id = db_obj["bcourl"] % (obj_id)
        obj_ver = in_json["objver"] if "objver" in in_json else ""
        query_obj = {"bco_id":obj_id}
        bco_collection = "c_bco_v-" + config_json["datarelease"]
       
        doc = dbh[bco_collection].find_one(query_obj)
        if doc != None:
            out_json = get_preview(doc, custom_config_json[config_json["server"]]["pathinfo"], obj_ver)

    except pymongo.errors.ServerSelectionTimeoutError as err:
        out_json = {"taskstatus":0, "errormsg":"Connection to mongodb failed!"}
    except pymongo.errors.OperationFailure as err:
        out_json = {"taskstatus":0, "errormsg":"MongoDB auth failed!"}

    version_one, version_two = config_json["moduleversion"],config_json["datarelease"]
    out_json["dmversions"] = "Viewer-%s | Data-%s" % (version_one, version_two)
    print json.dumps(out_json, indent=4)



if __name__ == '__main__':
	main()

