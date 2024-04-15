import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from flask_restx import Api, Resource, fields

from .dataset import api as dataset_api





def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.url_map.strict_slashes = False

    #CORS(app, supports_credentials=True)
    CORS(app)

    api = Api(app, version='1.0', title='GlyGen Dataset APIs', description='Documentation for the GlyGen Dataset APIs',)
    api.add_namespace(dataset_api)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    if app.config["ENV"] == "production":
        app.config.from_pyfile('config.prd.py', silent=True)
    else:
        app.config.from_pyfile('config.dev.py', silent=True)

    jwt = JWTManager(app)



    from . import db

    from . import misc
    app.register_blueprint(misc.bp)

    from . import gsd
    app.register_blueprint(gsd.bp)


    app.add_url_rule('/', endpoint='index')



    return app
