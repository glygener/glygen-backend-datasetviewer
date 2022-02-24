from flask_restx import Namespace, Resource, fields
from flask import (request, current_app)
from argosdb.document import get_one, get_many


api = Namespace("Dataset", description="Dataset APIs")

search_query_model = api.model(
    'Dataset Search Query', 
    {
        'coll': fields.String(required=True, description='Target collection'),
        'query': fields.String(required=True, description='Query string')
    }
)

detail_query_model = api.model(
    'Dataset Detail Query',
    {
        'coll': fields.String(required=True, description='Target collection'),
        'bcoid': fields.String(required=True, description='BCO ID')
    }
)

pagecn_query_model = api.model(
    'Dataset Page Query',
    {
        'coll': fields.String(required=True, description='Target collection'),
        'pageid': fields.String(required=True, description='Page ID')
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
    @api.expect(search_query_model)
    #@api.marshal_list_with(ds_model)
    def post(self):
        '''Search datasets'''
        req_obj = request.json
        res_obj = get_many(req_obj)
        return res_obj


@api.route('/detail')
class Dataset(Resource):
    '''Show a single dataset item'''
    @api.doc('get_dataset')
    @api.expect(detail_query_model)
    #@api.marshal_with(ds_model)
    def post(self):
        '''Get single dataset object'''
        req_obj = request.json
        res_obj = get_one(req_obj)
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
        res_obj = get_one(req_obj)
        return res_obj



