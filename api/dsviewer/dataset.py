import os,sys
from flask_restx import Namespace, Resource, fields
from flask import (request, current_app, Response)
from dsviewer.document import get_one, get_many, get_many_text_search, get_ver_list, order_json_obj
from werkzeug.utils import secure_filename
from dsviewer.qc import run_qc
import datetime
import time
import subprocess
import json
import pytz
import hashlib
from dsviewer.db import get_mongodb



api = Namespace("dataset", description="Dataset APIs")

dataset_getall_query_model = api.model(
    'Dataset Get All Query', 
    {
    }
)

dataset_search_query_model = api.model(
    'Dataset Search Query',
    {
        'query': fields.String(required=True, default="", description='Query string')
    }
)



dataset_list_query_model = api.model(
    'Dataset List Query',
    {
        'list_id': fields.String(required=True, default="", description='List ID string')
    }
)



dataset_historylist_query_model = api.model(
    'Dataset History List Query',
    {
        'doctype': fields.String(required=True, default="track", description='e.g track or pair'),
        'dataversion': fields.String(required=True, default="2.3.1", description='data version'),
        'query': fields.String(required=True, default="masterlist", description='Query string')
    }
)


dataset_detail_query_model = api.model(
    'Dataset Detail Query',
    {
        'doctype': fields.String(required=True, default="track", description='e.g track or pair'),
        'dataversion': fields.String(required=True, default="2.3.1", description='data version'),
        'bcoid': fields.String(required=True, default="GLY_000001", description='BCO ID')
    }
)




dataset_historydetail_query_model = api.model(
    'Dataset History Detail Query',
    {
        'bcoid': fields.String(required=True, default="GLY_000001", description='BCO ID')
    }
)

pagecn_query_model = api.model(
    'Dataset Page Query',
    {
        'pageid': fields.String(required=True, default="faq", description='Page ID')
    }
)

init_query_model = api.model(
    'Init Query',
    {
    }
)

download_query_model = api.model(
    "List Download Query",
    {
        "id": fields.String(required=True, default=""),
        "format": fields.String(required=True, default="csv")
    }
)


ds_model = api.model('Dataset', {
    'id': fields.String(readonly=True, description='Unique dataset identifier'),
    'title': fields.String(required=True, description='Dataset title')
})





@api.route('/getall')
class DatasetGetAll(Resource):
    '''f dfdsfadsfas f '''
    @api.doc('getall_datasets')
    @api.expect(dataset_getall_query_model)
    def post(self):
        '''Get all datasets'''
        req_obj = request.json
        res_obj = {"recordlist":[]}
        r_one = get_many({"coll":"c_extract", "query":""})
        if "error" in r_one:
            return r_one
        
        for obj in r_one["recordlist"]:
            if "categories" in obj:
                if "tag" in obj["categories"]:
                    obj["categories"].pop("tag")



        #res_obj["recordlist"] = r_one["recordlist"]
        res_obj["recordlist"] = []
        idx = 0
        for obj in r_one["recordlist"]:
            obj["filename"] = obj["filename_list"]
            res_obj["recordlist"].append(obj)
            #for file_name in obj["filename_list"].split(","):
            #    s = json.dumps(obj)
            #    res_obj["recordlist"].append(json.loads(s))
            #    res_obj["recordlist"][idx]["filename"] = file_name
            #    idx += 1
    

        n = len(res_obj["recordlist"])
        res_obj["stats"] = {"total":n, "retrieved":n}
        return res_obj





@api.route('/search')
class DatasetSearch(Resource):
    '''f dfdsfadsfas f '''
    @api.doc('search_datasets')
    @api.expect(dataset_search_query_model)
    #@api.marshal_list_with(ds_model)
    def post(self):
        '''Search datasets'''
       
        req_obj = request.json
        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return error_obj
       
        hash_str = json.dumps(req_obj)
        hash_obj = hashlib.md5(hash_str.encode('utf-8'))
        list_id = hash_obj.hexdigest()
               
        coll_names = mongo_dbh.collection_names()
        #if "c_cache" in coll_names:
        #    res = get_one({"coll":"c_cache", "list_id":list_id})
        #    if "error" not in res:
        #        if "record" in res:
        #            return {"list_id":list_id}

        res_obj = {"recordlist":[]}
        r_one = get_many({"coll":"c_extract", "query":""})
        if "error" in r_one:
            return r_one


        bco_dict = {}
        for obj in r_one["recordlist"]:
            bco_dict[obj["bcoid"]] = {"filename":obj["filename"],"filename_list":obj["filename_list"], "categories":obj["categories"],
                "title":obj["title"]
            }

        if req_obj["query"] == "":
            #res_obj["recordlist"] = r_one["recordlist"]
            for obj in r_one["recordlist"]:
                for file_name in obj["filename_list"].split(","):
                    o = {"filename":file_name}
                    for k in obj:
                        if k != "filename":
                            o[k] = obj[k]
                    res_obj["recordlist"].append(o)
        else:
            #dataset body search
            req_obj["coll"] = "c_records"
            r_two = get_many_text_search(req_obj)
            if "error" in r_two:
                return r_two
            out_dict = {}
            for obj in r_two["recordlist"]:
                prefix, bco_idx, file_idx, row_idx = obj["recordid"].split("_")
                bco_id = prefix + "_" + bco_idx
                if bco_id not in bco_dict:
                    continue
                bco_title, file_name = bco_dict[bco_id]["title"], bco_dict[bco_id]["filename"]
                for file_name in bco_dict[bco_id]["filename_list"].split(","):
                    o = {
                        "recordid":obj["recordid"],
                        "bcoid":bco_id, "fileidx":file_idx,
                        "filename":file_name,
                        "title":bco_title,
                        "categories":bco_dict[bco_id]["categories"],
                        "rowlist":[]
                    }
                    if bco_id not in out_dict:
                        out_dict[bco_id] = o
                    out_dict[bco_id]["rowlist"].append(int(row_idx))
            for bco_id in sorted(out_dict):
                res_obj["recordlist"].append(out_dict[bco_id])
            

            #dataset metadata search
            seen = {}
            req_obj["coll"] = "c_bco"
            r_three = get_many_text_search(req_obj)
            if "error" in r_three:
                return r_three
            
            r_four = get_many(req_obj)
            if "error" in r_four:
                return r_four

            for doc in r_three["recordlist"] + r_four["recordlist"] :
                if "object_id" in doc:
                    bco_id = doc["object_id"].split("/")[-2]
                    seen[bco_id] = True
            for doc in r_one["recordlist"]:
                if doc["bcoid"] in seen and doc["bcoid"] not in out_dict:
                    res_obj["recordlist"].append(doc)



        n = len(res_obj["recordlist"])
        res_obj["stats"] = {"total":n, "retrieved":n}
        
        if n != 0:
            ts_format = "%Y-%m-%d %H:%M:%S %Z%z"
            ts = datetime.datetime.now(pytz.timezone('US/Eastern')).strftime(ts_format)
            cache_info = { "reqobj":req_obj, "ts":ts}
            cache_obj = { "list_id":list_id, "cache_info":cache_info, "results":res_obj}
            cache_coll = "c_cache"
            res = mongo_dbh[cache_coll].insert_one(cache_obj)
            res_obj = {"list_id":list_id}
        else:
            res_obj = {"status":0, "error":"no results found"}
   
        return res_obj



@api.route('/list')
class DatasetList(Resource):
    '''Get search results'''
    @api.doc('get_dataset')
    @api.expect(dataset_list_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get search results'''
        req_obj = request.json
        req_obj["coll"] = "c_cache"
        res = get_one(req_obj)
        if "error" in res:
            return res
        res_obj = {
            "status":1, 
            "recordlist":res["record"]["results"]["recordlist"],
            "stats":res["record"]["results"]["stats"],
            "searchquery":res["record"]["cache_info"]["reqobj"]["query"]
        }
        return res_obj





@api.route('/detail')
class DatasetDetail(Resource):
    '''Show a single dataset item'''
    @api.doc('get_dataset')
    @api.expect(dataset_detail_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get single dataset object'''
        req_obj = request.json
        
 
        req_obj["coll"] = "c_extract"
        extract_obj = get_one(req_obj)
        if "error" in extract_obj:
            extract_obj["coll"] = "c_extract"
            return extract_obj


        res = get_many_text_search({"coll":"c_records", "query":req_obj["bcoid"]})
        if "recordlist" not in res:
            res["recordlist"] = []

 
        row_list_one, row_list_two = [], []
        limit_one, limit_two = 10000, 10000
        row_count_one, row_count_two = 0, 0
        req_obj["rowlist"] = [] if "rowlist" not in req_obj else req_obj["rowlist"]

        #return res["recordlist"]

        tmp_list = []
        for obj in res["recordlist"]:
            bco_id = obj["recordid"].split("_")[0] + "_" + obj["recordid"].split("_")[1]
            if bco_id != req_obj["bcoid"]:
                continue
            tmp_list.append(bco_id)
            row_idx = int(obj["recordid"].split("_")[-1])
            #obj["row"] = obj["row"].replace("\\t", "\", \"")
            obj["row"] = obj["row"].replace("\t", "\", \"")
            row = json.loads(obj["row"])
            if row_idx in  req_obj["rowlist"] and row_count_one < limit_one:
                row_list_one.append(row)
                row_count_one += 1
            elif row_count_two < limit_two:
                row_list_two.append(row)
                row_count_two += 1
            if row_count_one > limit_one and row_count_two > limit_two:
                break



        if extract_obj["record"]["sampledata"]["type"] == "table":
            header_row = []
            for obj in extract_obj["record"]["sampledata"]["data"][0]:
                header_row.append(obj["label"])
            extract_obj["record"]["alldata"] = {"type":"table", "data":[]}
            extract_obj["record"]["resultdata"] = {"type":"table", "data":[]}
            extract_obj["record"]["resultdata"]["data"].append(header_row)
            extract_obj["record"]["alldata"]["data"].append(header_row)
            extract_obj["record"]["resultdata"]["data"] += row_list_one
            extract_obj["record"]["alldata"]["data"] += row_list_two
        elif extract_obj["record"]["filetype"] in ["gz", "zip"]:
            extract_obj["record"]["alldata"] = {"type":"html", "data":"<pre>"}
            extract_obj["record"]["resultdata"] = {"type":"html", "data":"<pre>"}
            r_list_one, r_list_two = [], []
            for row in row_list_one:
                r_list_one.append("\n"+row[0])
            for row in row_list_two:
                r_list_two.append("\n"+row[0])
            extract_obj["record"]["resultdata"]["data"] = "\n".join(r_list_one)
            extract_obj["record"]["alldata"]["data"] = "\n".join(r_list_two)
        elif extract_obj["record"]["sampledata"]["type"] in ["html"]:
            extract_obj["record"]["alldata"] = {"type":"html", "data":"<pre>"}
            extract_obj["record"]["resultdata"] = {"type":"html", "data":"<pre>"}
            r_list_one, r_list_two = [], []
            for row in row_list_one:
                rr = "\n>"+row[0] + "\n"+row[1] if len(row) > 1 else "\n>"+row[0]
                r_list_one.append(rr)
            for row in row_list_two:
                rr = "\n>"+row[0] + "\n"+row[1] if len(row) > 1 else "\n>"+row[0]
                r_list_two.append(rr)
            extract_obj["record"]["resultdata"]["data"] = "\n".join(r_list_one)
            extract_obj["record"]["alldata"]["data"] = "\n".join(r_list_two)
        elif extract_obj["record"]["sampledata"]["type"] in ["text"]:
            extract_obj["record"]["alldata"] = {"type":"html", "data":"<pre>"}
            extract_obj["record"]["resultdata"] = {"type":"html", "data":"<pre>"}
            r_list_one, r_list_two = [], []
            for row in row_list_one:
                r_list_one.append(row[0])
            for row in row_list_two:
                r_list_two.append(row[0])
            extract_obj["record"]["resultdata"]["data"] = "\n".join(r_list_one)
            extract_obj["record"]["alldata"]["data"] = "\n".join(r_list_two)

        extract_obj["record"].pop("sampledata")



        req_obj["coll"] = "c_history"
        req_obj["doctype"] = "track"
        history_obj = get_one(req_obj)
        if "error" in history_obj:
            history_obj["coll"] = "c_history"
            return history_obj


        ver_list = get_ver_list(req_obj["bcoid"])
        history_dict = {}
        tmp_list = []
        for ver in history_obj["record"]["history"]:
            if ver in ver_list:
                history_dict[ver] = history_obj["record"]["history"][ver]
            tmp_list.append([ver, ver in ver_list])
        #return tmp_list

        req_obj["coll"] = "c_bco"
        req_obj["bcoid"] = "https://biocomputeobject.org/%s" % (req_obj["bcoid"])
        bco_obj = get_one(req_obj)
        if "error" in bco_obj:
            bco_obj["coll"] = "c_bco"
            return bco_obj

        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "conf/config.json")
        config_obj = json.load(open(json_url))
        #return list(bco_obj["record"].keys())
        bco_obj["record"] = order_json_obj(bco_obj["record"], config_obj["bco_field_order"])
        #return list(bco_obj["record"].keys())
        res_obj = {
            "status":1,
            "record":{
                "extract":extract_obj["record"], 
                "bco":bco_obj["record"], 
                "history":history_dict
            }
        }

        return res_obj




@api.route('/pagecn')
class Dataset(Resource):
    '''Get static page content '''
    @api.doc('get_dataset')
    @api.expect(pagecn_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get static page content '''
        req_obj = request.json
        req_obj["coll"] = "c_html"
        res_obj = get_one(req_obj)
        return res_obj


@api.route('/historylist')
class HistoryList(Resource):
    '''Get dataset history list '''
    @api.doc('historylist')
    @api.expect(dataset_historylist_query_model)
    #@api.marshal_list_with(ds_model)
    def post(self):
        '''Get dataset history list '''
        req_obj = request.json
        req_obj["coll"] = "c_history"
        req_obj["query"] = "" if "query" not in req_obj else req_obj["query"]

        hist_obj = get_many(req_obj)
        if "error" in hist_obj:
            return hist_obj
        

        res_obj = {"tabledata":{"type": "table","data": []}}
        header_row = [
            {"type": "string", "label": "BCOID"}
            ,{"type": "string", "label": "File Name"}
            ,{"type": "number", "label": "Field Count"}
            ,{"type": "number", "label": "Fields Added"}
            ,{"type": "number", "label": "Fields Removed"}
            ,{"type": "number", "label": "Row Count"}
            ,{"type": "number", "label": "Rows Count Prev"}
            ,{"type": "number", "label": "Rows Count Change"}
            ,{"type": "number", "label": "ID Count"}
            ,{"type": "number", "label": "IDs Added"}
            ,{"type": "number", "label": "IDs Removed"}
            ,{"type": "string", "label": ""}

        ]
        f_list = ["file_name", 
            "field_count", "fields_added", "fields_removed", 
            "row_count", "row_count_last", "row_count_change",
            "id_count", "ids_added", "ids_removed"
        ]
        res_obj["tabledata"]["data"].append(header_row)
        for obj in hist_obj["recordlist"]:
            if "history" in obj:
                ver_one = req_obj["dataversion"]
                ver_two = ver_one.replace(".", "_")
                if ver_two in obj["history"]:
                    row = [obj["bcoid"]]
                    for f in f_list:
                        row.append(obj["history"][ver_two][f])
                    row.append("<a href=\"/%s/%s/history\">details</a>" % (obj["bcoid"],ver_one))
                    match_flag = True
                    idx_list = []
                    if req_obj["query"] != "":
                        q = req_obj["query"].lower()
                        for v in [row[0].lower(), row[1].lower()]:
                            idx_list.append(v.find(q))
                        match_flag = False if idx_list == [-1,-1] else match_flag

                    if match_flag == True:
                        res_obj["tabledata"]["data"].append(row)


        return res_obj


@api.route('/historydetail')
class HistoryDetail(Resource):
    '''Show a single dataset history object'''
    @api.doc('get_dataset')
    @api.expect(dataset_historydetail_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get single dataset history object'''
        req_obj = request.json
        req_obj["coll"] = "c_history"
        res_obj = get_one(req_obj)
        if "error" in res_obj:
            return res_obj

        res_obj["record"]["history"] = res_obj["record"]["history"][req_obj["dataversion"].replace(".","_")]
        return res_obj



@api.route('/init')
class Dataset(Resource):
    '''Get init '''
    @api.doc('get_dataset')
    @api.expect(init_query_model)
    def post(self):
        '''Get init '''
        req_obj = request.json
        req_obj["coll"] = "c_init"
        res_obj = get_one(req_obj)
        return res_obj



@api.route('/download/')
class Data(Resource):
    @api.expect(download_query_model)
    def post(self):
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "conf/config.json")
        config_obj = json.load(open(json_url))
        res_obj = {}
        req_obj = request.json
        req_obj["coll"] = "c_extract"
        extract_obj = get_one(req_obj)
        if "error" in extract_obj:
            return extract_obj
        header_row = []
        for obj in extract_obj["record"]["sampledata"]["data"][0]:
            header_row.append(obj["label"])

        res = get_many_text_search({"coll":"c_records", "query":req_obj["bcoid"]})
        if "error" in res:
            return res
        row_list = [header_row]
        for obj in res["recordlist"]:
            row_idx = int(obj["recordid"].split("_")[-1])
            row = json.loads(obj["row"])
            if row_idx in  req_obj["rowlist"]:
                row_list.append(row)
        res_obj = {"status":1, "rowlist":row_list}

        #mime = "text/csv"
        #if "format" in req_obj:
        #    if req_obj["format"].lower() == "tsv":
        #        mime = "text/tsv"
        #if mime == "text/csv":
        #    data_buffer = "\"%s\"" % ( "\",\"".join(header_row))
        #    for row in row_list:
        #        data_buffer += "\"%s\"" % ( "\",\"".join(row))
        #else:
            #data_buffer = "\t".join(header_row)
            #for row in row_list:
            #    data_buffer += "\t".join(row)
        #res_obj = Response(data_buffer, mimetype=mime)
        
        return res_obj

    @api.doc(False)
    def get(self):
        return self.post()










