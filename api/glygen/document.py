import os,sys
import csv
import json
import traceback
import pymongo
from flask import (current_app)
from glygen.db import get_mongodb, log_error, next_sequence_value




def get_one(req_obj):

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")
    config_obj = json.load(open(json_url))

    try:
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return error_obj
        if "coll" not in req_obj:
            return {"status":0, "error":"no collection specified"}
        if req_obj["coll"] not in config_obj["collinfo"]:
            return {"status":0, "error":"unknown collection name"}
        
        init_obj = mongo_dbh["c_init"].find_one({})

        coll_name =  req_obj["coll"]
        prj_obj = config_obj["collinfo"][coll_name]["get_one"]["prj"]
        qf_dict = config_obj["collinfo"][coll_name]["get_one"]["queryfields"]
        qry_obj = get_mongo_query(qf_dict, req_obj)
        if "error" in qry_obj:
            return qry_obj
        #return {"error":"xxxxx", "query":qry_obj}


        data_ver = req_obj["dataversion"] if "dataversion" in req_obj else init_obj["dataversion"]
        if coll_name in  ["c_extract", "c_bco", "c_history"]:
            coll_name += "_v-%s" % (data_ver)

        res_obj = {"status":1}
        doc = {}
        if prj_obj != {}:
            doc = mongo_dbh[coll_name].find_one(qry_obj, prj_obj)
        else:
            doc = mongo_dbh[coll_name].find_one(qry_obj)
        if doc == None:
            msg = "No '%s' record found for your query" % (coll_name)
            #return {"status":0, "error":msg, "query":qry_obj}
            return {"status":0, "error":msg}

        if "_id" in doc:
            doc.pop("_id")

        res_obj["record"] = doc
        #res_obj["query"] = req_obj
    except Exception as e:
        res_obj =  log_error(traceback.format_exc())

    return res_obj


def get_many(req_obj):

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")
    config_obj = json.load(open(json_url))

    try:
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return error_obj
        if "coll" not in req_obj:
            return {"status":0, "error":"no collection specified"}
        if req_obj["coll"] not in config_obj["collinfo"]:
            return {"status":0, "error":"unknown collection name"}

        init_obj = mongo_dbh["c_init"].find_one({})
        
        coll_name =  req_obj["coll"]
        prj_obj = config_obj["collinfo"][coll_name]["get_many"]["prj"]
        sort_field = ""
        if "sortfield" in config_obj["collinfo"][coll_name]["get_many"]:
            sort_field = config_obj["collinfo"][coll_name]["get_many"]["sortfield"]

        qf_dict = config_obj["collinfo"][coll_name]["get_many"]["queryfields"]
        qry_obj = get_mongo_query(qf_dict, req_obj)
        if "error" in qry_obj:
            return qry_obj

        
        data_ver = init_obj["dataversion"]
        if coll_name in  ["c_extract", "c_bco", "c_history"]:
            coll_name += "_v-%s" % (data_ver)

        res_obj = {"status":1, "query":qry_obj, "coll":coll_name, "recordlist":[]}
        doc_list = []
        if prj_obj != {}:
            if sort_field == "":
                doc_list = list(mongo_dbh[coll_name].find(qry_obj, prj_obj))
            else:
                doc_list = list(mongo_dbh[coll_name].find(qry_obj, prj_obj).sort([(sort_field, pymongo.ASCENDING)]))
        else:
            if sort_field == "":
                doc_list = list(mongo_dbh[coll_name].find(qry_obj))
            else:
                doc_list = list(mongo_dbh[coll_name].find(qry_obj).sort([(sort_field,  pymongo.ASCENDING)]))
        #return {"error":"xxxx", "query":qry_obj, "hitcount":len(doc_list)}


        for doc in doc_list:
            if "_id" in doc:
                doc.pop("_id")
            if coll_name.find("c_extract") != -1:
                if "categories" in doc:
                    res_obj["recordlist"].append(doc)
            else:
                res_obj["recordlist"].append(doc)
        #res_obj["query"] = req_obj

    except Exception as e:
        res_obj =  log_error(traceback.format_exc())

    return res_obj




def get_mongo_query(qf_dict, req_obj):

    tmp_list_one = []
    for f in qf_dict:
        qf_obj = qf_dict[f]
        if qf_obj["required"] == True and f not in req_obj:
            msg = "field=%s is required query field"%(f)
            return {"status":0, "error":msg}
        if f in req_obj:
            query_val = req_obj[f].strip()
            if query_val != "":
                query_val = int(query_val) if qf_obj["datatype"] == "int" else query_val
                query_val = float(query_val) if qf_obj["datatype"] == "float" else query_val
                tmp_list_two = []
                for p_obj in qf_obj["pathlist"]:
                    o = {p_obj["path"]:{p_obj["operator"]:query_val}}
                    if p_obj["operator"] == "$regex":
                        o = {p_obj["path"]:{p_obj["operator"]:query_val, "$options":"i"}}
                    tmp_list_two.append(o)
                tmp_list_one.append({qf_obj["junction"]:tmp_list_two})

    o = {"$and":tmp_list_one} if tmp_list_one != [] else {}
    return o


