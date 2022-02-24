import os,sys
import csv
import json
import traceback
from flask import (current_app)
from argosdb.db import get_mongodb, log_error, next_sequence_value




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
        coll_name =  req_obj["coll"]
        prj_obj = config_obj["collinfo"][coll_name]["get_one"]["prj"]
        qf_dict = config_obj["collinfo"][coll_name]["get_one"]["queryfields"]
        and_list = []
        for f in qf_dict:
            qf_obj = qf_dict[f]
            if qf_obj["required"] == True and f not in req_obj:
                msg = "field=%s is required query field"%(f)
                return {"status":0, "error":msg}
            if f in req_obj:
                val = req_obj[f]
                val = int(val) if qf_obj["datatype"] == "int" else val
                val = float(val) if qf_obj["datatype"] == "float" else val
                if qf_obj["operator"] == "$regex":
                    and_list.append({qf_obj["path"]:{'$regex':val,'$options':'i'}})
                elif qf_obj["operator"] == "$eq":
                    and_list.append({qf_obj["path"]:{'$eq':val}})

        qry_obj = {}
        if and_list != []:
            qry_obj = {"$and":and_list}

    
        if coll_name == "c_bco":
            coll_name += "_v-%s" % (current_app.config["DATA_VERSION"])

        res_obj = {"status":1}
        doc_list = []
        if prj_obj != {}:
            doc = mongo_dbh[coll_name].find_one(qry_obj, prj_obj)
        else:
            doc = mongo_dbh[coll_name].find_one(qry_obj)
        if "_id" in doc:
            doc.pop("_id")

        res_obj["record"] = doc
        res_obj["query"] = req_obj
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

        coll_name =  req_obj["coll"]
        prj_obj = config_obj["collinfo"][coll_name]["get_many"]["prj"]
        qf_dict = config_obj["collinfo"][coll_name]["get_many"]["queryfields"]

        and_list, or_list = [], []

        for f in qf_dict:
            qf_obj = qf_dict[f]
            if qf_obj["required"] == True and f not in req_obj:
                msg = "field=%s is required query field"%(f)
                return {"status":0, "error":msg}
            if f in req_obj:
                if f == "query":
                    if prj_obj != {} and req_obj[f].strip() != "":
                        for p in prj_obj.keys():
                            or_list.append({p:{'$regex':req_obj[f],'$options':'i'}})
                else:
                    val = req_obj[f]
                    val = int(val) if qf_obj["datatype"] == "int" else val
                    val = float(val) if qf_obj["datatype"] == "float" else val
                    if qf_obj["operator"] == "$regex":
                        and_list.append({qf_obj["path"]:{'$regex':val,'$options':'i'}})
                    elif qf_obj["operator"] == "$eq":
                        and_list.append({qf_obj["path"]:{'$eq':val}})
        
        if or_list != []:
            and_list.append({ "$or":or_list})

        qry_obj = {}
        if and_list != []:
            qry_obj = {"$and":and_list}
        
        
        if coll_name == "c_bco":
            coll_name += "_v-%s" % (current_app.config["DATA_VERSION"])

        res_obj = {"status":1, "recordlist":[]}
        doc_list = []
        if prj_obj != {}:
            doc_list = list(mongo_dbh[coll_name].find(qry_obj, prj_obj))
        else:
            doc_list = list(mongo_dbh[coll_name].find(qry_obj))
        
        for doc in doc_list:
            if coll_name.find("c_bco") != -1:
                res_obj["recordlist"].append(doc["extract"])
            else:
                res_obj["recordlist"].append(doc)
        res_obj["query"] = req_obj

    except Exception as e:
        res_obj =  log_error(traceback.format_exc())

    return res_obj





