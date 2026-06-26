import os
import io
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from auth import require_auth
import ai_service
import firestore_service as fs
import PyPDF2

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


@app.get("/")
def health():
    return {"ok": True, "service": "AI Study Buddy API"}


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
def get_settings():
    return jsonify(fs.get_settings(g.uid))


@app.post("/settings")
@require_auth
def post_settings():
    return jsonify(fs.save_settings(g.uid, request.json or {}))


@app.get("/stats")
@require_auth
def stats():
    return jsonify(fs.get_stats(g.uid))


# ---------- AI Tutor ----------
@app.post("/tutor")
@require_auth
def tutor():
    data = request.json or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    history = fs.list_chat(g.uid)
    reply = ai_service.chat(message, history=history)

    fs.add_chat(g.uid, "user", message)
    fs.add_chat(g.uid, "assistant", reply)
    fs.increment_stat(g.uid, "ai_questions_asked")

    return jsonify({"reply": reply})


@app.get("/tutor/history")
@require_auth
def history():
    return jsonify(fs.list_chat(g.uid))


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
    topic = (data.get("topic") or "").strip()

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    num = int(data.get("num", 5))

    out = ai_service.generate_quiz(topic, num)
    fs.save_quiz(g.uid, {"topic": topic, **out})

    return jsonify(out)


# ---------- Flashcards ----------
@app.post("/flashcards")
@require_auth
def flashcards():
    data = request.json or {}
    notes = (data.get("notes") or "").strip()

    if not notes:
        return jsonify({"error": "Notes are required"}), 400

    num = int(data.get("num", 10))

    out = ai_service.generate_flashcards(notes, num)
    fs.save_flashcards(g.uid, out.get("cards", []))

    return jsonify(out)


# ---------- Summarize ----------
@app.post("/summarize")
@require_auth
def summarize():
    try:
        data = request.json or {}
        text = (data.get("text") or "").strip()

        if not text:
            return jsonify({"error": "Text is required"}), 400

        summary = ai_service.summarize(text)
        return jsonify({"summary": summary})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- Study Planner ----------
@app.post("/plan")
@require_auth
def plan():
    data = request.json or {}

    subjects = (data.get("subjects") or "").strip()
    days_left = data.get("days_left")

    if not subjects:
        return jsonify({"error": "Subjects are required"}), 400

    try:
        days_left = int(days_left)
    except (TypeError, ValueError):
        return jsonify({"error": "Valid days_left is required"}), 400

    if days_left < 1:
        return jsonify({"error": "days_left must be greater than 0"}), 400

    plan = ai_service.study_plan(subjects, days_left)

    return jsonify({
        "plan": plan
    })

# ---------- Image Doubt Solver ----------
@app.post("/solve-image")
@require_auth
def solve_image():
    f = request.files.get("image")
    if not f:
        return jsonify({"error": "No image uploaded"}), 400

    hint = request.form.get("hint", "")
    answer = ai_service.solve_image(f.read(), hint)

    return jsonify({"answer": answer})


# ---------- PDF Pack ----------
# Summary only using Gemini to reduce quota usage and avoid worker timeout.
@app.post("/pdf-pack")
@require_auth
def pdf_pack():
    try:
        f = request.files.get("pdf")

        if not f:
            return jsonify({"error": "No PDF uploaded"}), 400

        reader = PyPDF2.PdfReader(io.BytesIO(f.read()))

        # Read max first 100 pages
        text = "\n".join(
            (p.extract_text() or "")
            for p in reader.pages[:100]
        )

        # Limit total extracted text sent into summarizer
        text = text[:15000].strip()

        if not text:
            return jsonify({"error": "Could not extract text from this PDF"}), 400

        summary = ai_service.summarize_large_text(text)

        fs.increment_stat(g.uid, "pdfs_uploaded")

        return jsonify({
            "summary": summary,
            "flashcards": [],
            "quiz": []
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
    message = (d.get("message") or "").strip()
    language = d.get("language", "en-US")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    return jsonify({
        "reply": ai_service.voice_chat(message, language)
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True
    )
