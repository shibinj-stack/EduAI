from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth as fb_auth
from firebase_db import init_firebase

init_firebase()

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = header.split(" ", 1)[1]
        try:
            decoded = fb_auth.verify_id_token(token)
            g.uid = decoded["uid"]
            g.email = decoded.get("email")
        except Exception as e:
            return jsonify({"error": f"Invalid token: {e}"}), 401
        return f(*args, **kwargs)
    return wrapper
