import os,sys
import json
import traceback
import csv
from flask import (Blueprint,request,jsonify,current_app)
from glyds.db import get_mongodb, log_error, next_sequence_value
from flask_restx import Resource, Api
from werkzeug.utils import secure_filename

bp = Blueprint('misc', __name__, url_prefix='/misc')

#api = Api(current_app)
api = Api(bp)



@bp.route('/hello_world', methods=('GET', 'POST'))
def hello_world():
    res_obj = {
        "message":"Hello World!",
        "instance_path":current_app.instance_path,
        "secret_key":current_app.config["SECRET_KEY"]
    }
    return jsonify(res_obj), 200


@bp.route('/upload', methods=('GET', 'POST'))
def upload():
    
    res_obj = {"config":{}}
    error_list = []
    if request.method != 'POST':
        error_list.append({"error":"only POST requests are accepted"})
    elif 'file' not in request.files:
        error_list.append({"error":"no file parameter given"})
    else:
        file = request.files['file']
        if file.filename == '':
            error_list.append({"error":"no filename given"})
        else:
            file_name = secure_filename(file.filename)
            out_file = os.path.join(current_app.config['DATA_PATH'], file_name)
            res_obj["out_file"] = out_file
            file.save(out_file)

    if error_list != []:
        return jsonify({"error_list":error_list}), 200

    return jsonify(res_obj), 200



@bp.route('/info', methods=('GET', 'POST'))
def info():
    res_obj = {"config":{}}
    k_list = ["DATA_PATH", "MAX_CONTENT_LENGTH"]
    for k in k_list:
        if k in current_app.config:
            res_obj["config"][k] = current_app.config[k]
    mongo_dbh, error_obj = get_mongodb()
    res_obj["connection_status"] = "success" if error_obj == {} else error_obj
    return jsonify(res_obj), 200



@bp.route('/verlist', methods=('GET', 'POST'))
def verlist():
    dbh, error_obj = get_mongodb()
    if error_obj != {}:
        return error_obj
    
    res_obj = []
    for coll in dbh.collection_names():
        if coll.find("c_bco_v-") != -1:
            rel = coll[8:]
            res_obj.append(rel)

    return jsonify(res_obj), 200

