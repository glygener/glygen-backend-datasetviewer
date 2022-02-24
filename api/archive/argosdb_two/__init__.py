import os
from flask import Flask
from flask_restx import Api, Resource, fields
#from werkzeug.middleware.proxy_fix import ProxyFix
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_restx import Api
from .dataset import api as dataset_api
from .cat import api as cat_api
from .dog import api as dog_api


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    cors = CORS(app, supports_credentials=True)

    api = Api(app, version='1.0', title='ArgosDB APIs', description='Documentation for the ArgosDB APIs',)
    api.add_namespace(dataset_api)
    api.add_namespace(cat_api)
    api.add_namespace(dog_api)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    if app.config["ENV"] == "production":
        app.config.from_pyfile('config.prd.py', silent=True)
    else:
        app.config.from_pyfile('config.dev.py', silent=True)

    jwt = JWTManager(app)

    app.add_url_rule('/', endpoint='index')

    return app

