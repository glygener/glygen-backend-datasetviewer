import os
import bcrypt
import json
import traceback
import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)
from flask_jwt_extended import (
    jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies, get_csrf_token,
    set_refresh_cookies, unset_jwt_cookies
)
from werkzeug.security import check_password_hash, generate_password_hash
from argosdb.db import get_mongodb, log_error
bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/login', methods=('GET', 'POST'))
def login():

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "conf/config.json")

    try:
        username = request.json.get("email", None)
        password = request.json.get("password", None)

        mongo_dbh, error_obj = get_mongodb()
        if error_obj != {}:
            return jsonify(error_obj), 200

        user = mongo_dbh["c_users"].find_one({'email' : username })       
        error = None
        if user is None:
            error = 'Incorrect username.'
        else:
            stored_password = user['password'].encode('utf-8')
            submitted_password = password.encode('utf-8')
            if bcrypt.hashpw(submitted_password, stored_password) != stored_password:
                error = 'Incorrect password.'
        
        res_obj = {"status":1}
        if error is None:
            # Create the tokens we will be sending back to the user
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)

            # Return the double submit values in the resulting JSON
            # instead of in additional cookies
            
            res_obj["access_csrf"] = get_csrf_token(access_token)
            res_obj["refresh_csrf"] = get_csrf_token(refresh_token)
            res_obj["username"] = username 
            res_obj = jsonify(res_obj)

            # We still need to call these functions to set the
            # JWTs in the cookies
            set_access_cookies(res_obj, access_token)
            set_refresh_cookies(res_obj, refresh_token)
        else:
            res_obj = jsonify({"status":0, "error":error})
    except Exception as e:
        res_obj =  jsonify(log_error(traceback.format_exc()))
        

    return res_obj, 200





def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view

@bp.route('/refresh', methods=('GET', 'POST'))
@jwt_refresh_token_required
def refresh():
    # Create the new access token
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)

    # Set the access JWT and CSRF double submit protection cookies
    # in this response
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, access_token)
    return resp, 200


# Because the JWTs are stored in an httponly cookie now, we cannot
# log the user out by simply deleting the cookie in the frontend.
# We need the backend to send us a response to delete the cookies
# in order to logout. unset_jwt_cookies is a helper function to
# do just that.
@bp.route('/logout', methods=('GET', 'POST'))
def logout():
    res_obj = jsonify({"status": 1})
    unset_jwt_cookies(res_obj)
    return res_obj, 200




# Protect a route with jwt_required, which will kick out requests
# without a valid JWT present.
@bp.route("/protected", methods=["GET", "POST"])
@jwt_required
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200




