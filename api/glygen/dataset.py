import os,sys
from flask_restx import Namespace, Resource, fields
from flask import (request, current_app)
from glygen.document import get_one, get_many
from werkzeug.utils import secure_filename
from glygen.qc import run_qc
import datetime
import subprocess
import json

api = Namespace("dataset", description="Dataset APIs")

dataset_search_query_model = api.model(
    'Dataset Search Query', 
    {
        'query': fields.String(required=True, default="", description='Query string')
    }
)

dataset_historylist_query_model = api.model(
    'Dataset History List Query',
    {
        'query': fields.String(required=True, default="", description='Query string')
    }
)

dataset_detail_query_model = api.model(
    'Dataset Detail Query',
    {
        'bcoid': fields.String(required=True, default="GLY_000001", description='BCO ID'),
        'dataversion': fields.String(required=False, default="1.12.1", description='Dataset Release [e.g: 1.12.1]'),
    }
)

dataset_upload_query_model = api.model(
    'Dataset Upload Query',
    {
        "format":fields.String(required=True, default="", description='File Format [csv/tsv]'),
        "qctype":fields.String(required=True, default="", description='QC Type [basic/single_glyco_site]'),
        "dataversion":fields.String(required=True, default="", description='Data Release [e.g: 1.12.1]')
    }
)

dataset_submit_query_model = api.model(
    'Dataset Submit Query',
    {
        'fname': fields.String(required=True, default="", description='First name'),
        'lname': fields.String(required=True, default="", description='Last name'),
        'email': fields.String(required=True, default="", description='Email address'),
        'affilation': fields.String(required=True, default="", description='Affilation')
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


ds_model = api.model('Dataset', {
    'id': fields.String(readonly=True, description='Unique dataset identifier'),
    'title': fields.String(required=True, description='Dataset title')
})


@api.route('/search')
class DatasetList(Resource):
    '''f dfdsfadsfas f '''
    @api.doc('search_datasets')
    @api.expect(dataset_search_query_model)
    #@api.marshal_list_with(ds_model)
    def post(self):
        '''Search datasets'''
        req_obj = request.json
        req_obj["coll"] = "c_extract"
        res_obj = get_many(req_obj)
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
            return extract_obj
        req_obj["coll"] = "c_bco"
        req_obj["bcoid"] = "https://biocomputeobject.org/%s/%s" % (req_obj["bcoid"], req_obj["dataversion"])
        bco_obj = get_one(req_obj)
        if "error" in bco_obj:
            return bco_obj
        res_obj = {"extract":extract_obj, "bco":bco_obj}

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
        res_obj = get_many(req_obj)
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



@api.route('/upload', methods=['GET', 'POST'])
class DatasetUpload(Resource):
    '''Upload dataset item'''
    @api.doc('upload_dataset')
    @api.expect(dataset_upload_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Upload dataset'''
        res_obj = {}
        req_obj = request.form
        error_obj = {}
        if request.method != 'POST':
            error_obj = {"error":"only POST requests are accepted"}
        elif 'userfile' not in request.files and 'file' not in request.files:
            error_obj = {"error":"no file parameter given"}
        else:
            file = request.files['userfile'] if "userfile" in request.files else request.files['file']
            file_format = req_obj["format"]
            qc_type = req_obj["qctype"]
            data_version = req_obj["dataversion"]
            file_data = []
            if file.filename == '':
                error_obj = {"error":"no filename given"}
            else:
                file_name = secure_filename(file.filename)
                data_path, ser = current_app.config["DATA_PATH"], current_app.config["SERVER"]
                out_file = "%s/userdata/%s/tmp/%s" % (data_path, ser, file_name)
                file.save(out_file)
                res_obj = {
                    "inputinfo":{"name":file_name, "format":file_format}, 
                    "summary":{"fatal_qc_flags":0, "total_qc_flags":0},
                    "failedrows":[]
                }
                error_obj = run_qc(out_file, file_format, res_obj, qc_type, data_version)
        res_obj = error_obj if error_obj != {} else res_obj
        return res_obj


@api.route('/submit')
class Dataset(Resource):
    '''Submit dataset '''
    @api.doc('get_dataset')
    @api.expect(dataset_submit_query_model)
    def post(self):
        '''Submit dataset '''
        req_obj = request.json
        data_path, ser = current_app.config["DATA_PATH"], current_app.config["SERVER"]
        src_file = "%s/userdata/%s/tmp/%s" % (data_path, ser, req_obj["filename"])
        dst_dir = "%s/userdata/%s/%s" % (data_path, ser, req_obj["affilation"])
        if os.path.isfile(src_file) == False:
            res_obj = {"error":"submitted filename does not exist!", "status":0}
        else:
            if os.path.isdir(dst_dir) == False:
                dst_dir = "%s/userdata/%s/%s" % (data_path, ser, "other")
            today = datetime.datetime.today()
            yy, mm, dd = today.year, today.month, today.day
            dst_file = "%s/%s_%s_%s_%s" % (dst_dir, mm, dd, yy, req_obj["filename"])
            json_file = ".".join(dst_file.split(".")[:-1]) + ".json"

            cmd = "cp %s %s" % (src_file, dst_file)
            x, y = subprocess.getstatusoutput(cmd)
            if os.path.isfile(dst_file) == False:
                res_obj = {"error":"save file failed!", "status":0}
            else:
                res_obj = {"confirmation":"Dataset file has been submitted successfully!", "status":1}
                with open(json_file, "w") as FW:
                    FW.write("%s\n" % (json.dumps(req_obj, indent=4)))
        return res_obj





