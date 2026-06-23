import os, io
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from auth import require_auth
import ai_service, firestore_service as fs
import PyPDF2

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/")
def health(): return {"ok": True, "service": "AI Study Buddy API"}

# ---------- Profile / Settings ----------
@app.get("/profile")
@require_auth
def get_profile():
    return jsonify(fs.get_profile(g.uid) or {"email": g.email})

@app.post("/profile")
@require_auth
def post_profile():
    return jsonify(fs.upsert_profile(g.uid, request.json or {}))

@app.get("/settings")
@require_auth
def get_settings(): return jsonify(fs.get_settings(g.uid))

@app.post("/settings")
@require_auth
def post_settings(): return jsonify(fs.save_settings(g.uid, request.json or {}))

@app.get("/stats")
@require_auth
def stats(): return jsonify(fs.get_stats(g.uid))

# ---------- AI Tutor ----------
@app.post("/tutor")
@require_auth
def tutor():
    data = request.json or {}
    history = fs.list_chat(g.uid)
    reply = ai_service.chat(data["message"], history=history)
    fs.add_chat(g.uid, "user", data["message"])
    fs.add_chat(g.uid, "assistant", reply)
    fs.increment_stat(g.uid, "ai_questions_asked")
    return jsonify({"reply": reply})

@app.get("/tutor/history")
@require_auth
def history(): return jsonify(fs.list_chat(g.uid))

@app.delete("/tutor/history")
@require_auth
def clear_history():
    n = fs.clear_chat(g.uid)
    return jsonify({"deleted": n})

# ---------- Quiz ----------
@app.post("/quiz")
@require_auth
def quiz():
    data = request.json or {}
    out = ai_service.generate_quiz(data["topic"], data.get("num", 5))
    fs.save_quiz(g.uid, {"topic": data["topic"], **out})
    return jsonify(out)

# ---------- Flashcards ----------
@app.post("/flashcards")
@require_auth
def flashcards():
    data = request.json or {}
    out = ai_service.generate_flashcards(data["notes"], data.get("num", 10))
    fs.save_flashcards(g.uid, out.get("cards", []))
    return jsonify(out)

# ---------- Summarize ----------
@app.post("/summarize")
@require_auth
def summarize():
    return jsonify({"summary": ai_service.summarize((request.json or {})["text"])})

# ---------- Study Planner ----------
@app.post("/plan")
@require_auth
def plan():
    d = request.json or {}
    return jsonify({"plan": ai_service.study_plan(d["subjects"], d["exam_date"])})

# ---------- Image Doubt Solver ----------
@app.post("/solve-image")
@require_auth
def solve_image():
    f = request.files.get("image")
    if not f: return {"error": "no image"}, 400
    hint = request.form.get("hint", "")
    return jsonify({"answer": ai_service.solve_image(f.read(), hint)})

# ---------- PDF Pack ----------
@app.post("/pdf-pack")
@require_auth
def pdf_pack():
try:
f = request.files.get("pdf")

    if not f:
        return {"error": "No PDF uploaded"}, 400

    reader = PyPDF2.PdfReader(io.BytesIO(f.read()))

    text = "\n".join(
        (p.extract_text() or "")
        for p in reader.pages[:100]
    )

    text = text[:15000]

    summary = ai_service.summarize_large_text(text)

    cards = ai_service.generate_flashcards(summary, 8)

    quiz = ai_service.generate_quiz(summary, 5)

    fs.increment_stat(g.uid, "pdfs_uploaded")

    return jsonify({
        "summary": summary,
        "flashcards": cards.get("cards", []),
        "quiz": quiz.get("questions", [])
    })

except Exception as e:
    import traceback
    traceback.print_exc()
    return jsonify({"error": str(e)}), 500

# ---------- Voice ----------
@app.post("/voice")
@require_auth
def voice():
    d = request.json or {}
    return jsonify({"reply": ai_service.voice_chat(d["message"], d.get("language", "en-US"))})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
