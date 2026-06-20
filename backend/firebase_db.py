import os, json
import firebase_admin
from firebase_admin import credentials, firestore, auth as fb_auth

def init_firebase():
    if firebase_admin._apps:
        return
    svc_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if svc_json:
        cred = credentials.Certificate(json.loads(svc_json))
    else:
        cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

init_firebase()
db = firestore.client()
