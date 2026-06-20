from firebase_db import db
from firebase_admin import firestore
from datetime import datetime

def get_profile(uid):
    doc = db.collection("profiles").document(uid).get()
    return doc.to_dict() if doc.exists else None

def upsert_profile(uid, data):
    data["updated_at"] = datetime.utcnow().isoformat()
    db.collection("profiles").document(uid).set(data, merge=True)
    return get_profile(uid)

def get_settings(uid):
    doc = db.collection("settings").document(uid).get()
    return doc.to_dict() if doc.exists else {"theme": "light", "auto_read": False, "language": "en-US", "voice": ""}

def save_settings(uid, data):
    db.collection("settings").document(uid).set(data, merge=True)
    return get_settings(uid)

def increment_stat(uid, field, by=1):
    ref = db.collection("stats").document(uid)
    ref.set({field: firestore.Increment(by)}, merge=True)

def get_stats(uid):
    doc = db.collection("stats").document(uid).get()
    return doc.to_dict() if doc.exists else {}

def add_chat(uid, role, content):
    db.collection("users").document(uid).collection("chat").add({
        "role": role, "content": content, "ts": datetime.utcnow().isoformat()
    })

def list_chat(uid, limit=100):
    q = db.collection("users").document(uid).collection("chat").order_by("ts").limit(limit)
    return [d.to_dict() for d in q.stream()]

def clear_chat(uid):
    col = db.collection("users").document(uid).collection("chat")
    deleted = 0
    for doc in col.stream():
        doc.reference.delete()
        deleted += 1
    return deleted

def save_quiz(uid, payload):
    payload["ts"] = datetime.utcnow().isoformat()
    db.collection("users").document(uid).collection("quizzes").add(payload)
    increment_stat(uid, "quizzes_completed")

def save_flashcards(uid, cards):
    db.collection("users").document(uid).collection("flashcards").add({
        "cards": cards, "ts": datetime.utcnow().isoformat()
    })
    increment_stat(uid, "flashcards_generated", by=len(cards))
