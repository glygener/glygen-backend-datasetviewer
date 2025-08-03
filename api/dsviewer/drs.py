import os,sys
from flask_restx import Namespace, Resource, fields
from flask import (request, current_app, Response)
from dsviewer.document import get_one, get_many, get_many_text_search, get_ver_list, order_json_obj
from werkzeug.utils import secure_filename
import datetime
import time
import subprocess
import json
import pytz
import hashlib
from dsviewer.db import get_mongodb

api = Namespace("drs", description="DRS APIs")



@api.route('/objects/<object_id>/')
@api.doc(params={"object_id": {"in": "query", "default": "GLY_000001_1"}})
class DRS(Resource):
    @api.doc('detail')
    def get(self, object_id):
        req_obj = {"id":object_id}
        req_obj["coll"] = "c_drs"
        res_obj = get_one(req_obj)
        http_code = 200
        if res_obj["status"] != 1:
            http_code = 500
            http_code = 404 if res_obj["error"] == "no record found" else http_code
        else:
            res_obj = res_obj["record"]

        return res_obj, http_code




@api.route('/objects/<object_id_one>/access/<object_id_two>')
@api.doc(params={"object_id_one": {"in": "query", "default": "GLY_000001_1"}, "object_id_two": {"in": "query", "default": "GLY_000001_1"}})
class DRS(Resource):
    @api.doc('access')
    def get(self, object_id_one, object_id_two):
        req_obj = {"id":object_id_one}
        req_obj["coll"] = "c_drs"
        res_obj = get_one(req_obj)
        http_code = 200
        if res_obj["status"] != 1:
            http_code = 500
            http_code = 404 if res_obj["error"] == "no record found" else http_code
        else:
            res_obj = {
                "url":res_obj["record"]["access_methods"][0]["access_url"]["url"]
            }
 
        return res_obj, http_code


@api.route('/service-info')
class DRS(Resource):
    @api.doc('service-info')
    def get(self):
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "conf/drs_service_info.json")
        res_obj = json.load(open(json_url))
        http_code = 200

        return res_obj, http_code

       

