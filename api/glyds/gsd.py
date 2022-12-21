import os,sys
import json
import traceback
import csv
import hashlib

from flask import (Blueprint,request,jsonify,current_app)
from glyds.db import get_mongodb, log_error, next_sequence_value
from flask_restx import Resource, Api
from werkzeug.utils import secure_filename

bp = Blueprint('gsd', __name__, url_prefix='/gsd')


api = Api(bp)


@bp.route('/submit', methods=('GET', 'POST'))
def submit():


    req_obj = request.json

    res_obj = {"config":{}}
    server =  current_app.config["SERVER"]
    upload_dir = current_app.config["DATA_PATH"] + "/uploads/gsd/%s/" % (server)

    server_domain = "https://data.glygen.org/"
    if server in ["dev", "tst"]:
        server_domain = "https://data.%s.glygen.org/" % (server)
    elif server in ["beta"]:
        server_domain = "https://%s-data.glygen.org/" % (server)

    req_obj["md5sum"] = hashlib.md5(json.dumps(req_obj).encode('utf-8')).hexdigest()

    file_name = req_obj["name"].replace(" ", "_").lower() + "_" +  req_obj["md5sum"]

    res_obj = {"status":1}
    try:
        out_file =  upload_dir + "%s.json" % (file_name)
        if os.path.isdir(upload_dir) == False:
            res_obj = {"error":"upload directory does not exist", "status":0}
            return jsonify(res_obj), 200

        with open(out_file, "w") as FW:
            FW.write("%s\n" % (json.dumps(req_obj, indent=4)))
        url = server_domain + "/ln2uploads/gsd/%s/%s.json" % (server, file_name)
        msg = "There has been GSD term submission from "
        msg += "%s(%s)." % (req_obj["name"], req_obj["email"])
        msg += " Click on %s to see details for the submission." % (url)
        email_obj = {
            "sender_email":"rykahsay@gwu.edu",
            "receiver_list":["rykahsay@gwu.edu"],
            "subject":"GSD term submission from %s" % (req_obj["name"]),
            "body":msg
        }
        #o = send_email(email_obj)
        #if "error_list" in o:
        #    return o
    except Exception as e:
        res_obj = {"error":"submit failed! --> " + str(e) , "status":0}

    return jsonify(res_obj), 200


