import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

_db = None

def init_firebase():
    global _db

    if _db:
        return _db

    if not firebase_admin._apps:

        firebase_json = os.getenv("FIREBASE_CREDENTIALS")

        if not firebase_json:
            raise Exception("FIREBASE_CREDENTIALS not found")

        cred_dict = json.loads(firebase_json)

        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db

db = init_firebase()
