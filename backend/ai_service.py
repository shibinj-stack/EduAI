import os
import json
import io
import google.generativeai as genai
from PIL import Image

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_TEXT = "gemini-2.5-flash"
MODEL_VISION = "gemini-2.5-flash"


def _model(name=MODEL_TEXT):
    return genai.GenerativeModel(name)


def chunk_text(text, chunk_size=4000):
    return [
        text[i:i + chunk_size]
        for i in range(0, len(text), chunk_size)
    ]


def chat(prompt, history=None, system=None):
    m = _model()
    msgs = []

    if system:
        msgs.append({
            "role": "user",
            "parts": [system]
        })

    for h in (history or []):
        msgs.append({
            "role": "user" if h["role"] == "user" else "model",
            "parts": [h["content"]]
        })

    msgs.append({
        "role": "user",
        "parts": [prompt]
    })

    r = m.generate_content(msgs)
    return r.text or ""


def summarize(text):
    r = _model().generate_content(
        f"Summarize concisely with bullet points and key concepts:\n\n{text}"
    )
    return r.text or ""


def summarize_large_text(text):
    chunks = chunk_text(text, 4000)
    summaries = []

    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i + 1}/{len(chunks)}")
        try:
            result = summarize(chunk)
            if result:
                summaries.append(result)
        except Exception as e:
            print("Chunk error:", e)

    if not summaries:
        return "Could not generate summary for this PDF."

    # If only one chunk, avoid an extra Gemini call
    if len(summaries) == 1:
        return summaries[0]

    combined = "\n".join(summaries)

    final_summary = summarize(
        f"""
Create one final clean study summary from these chunk summaries.
Keep it concise, student-friendly, and organized with bullet points.

Chunk summaries:
{combined}
"""
    )

    return final_summary or combined


def _safe_json_parse(text):
    text = (text or "").strip().strip("`")

    if text.startswith("json"):
        text = text[4:].strip()

    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end != 0:
            return json.loads(text[start:end])
        raise ValueError("Model did not return valid JSON.")


def generate_quiz(topic, num=5):
    p = f"""
Create {num} multiple-choice questions on the following topic/content:

{topic}

Return ONLY valid JSON in this exact format:

{{
  "questions": [
    {{
      "q": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Why this answer is correct"
    }}
  ]
}}
"""
    r = _model().generate_content(p)
    return _safe_json_parse(r.text if r else "")


def generate_flashcards(notes, num=10):
    p = f"""
Generate {num} flashcards from these notes.

Return ONLY valid JSON in this exact format:

{{
  "cards": [
    {{
      "front": "Question / Term",
      "back": "Answer / Explanation"
    }}
  ]
}}

Notes:
{notes}
"""
    r = _model().generate_content(p)
    return _safe_json_parse(r.text if r else "")

def study_plan(subjects, days_left):
    prompt = f"""
Create a {days_left}-day study plan.

Subjects:
{subjects}

Rules:
- Divide the subjects evenly across {days_left} days.
- Reserve the last 2 days only for revision and practice tests.
- Study approximately equal time for each subject.
- Return ONLY a markdown table.

Table format:

| Day | Subjects | Tasks |
|-----|----------|-------|

Keep every task short and concise.
Do not add introductions or explanations.
"""

    r = _model().generate_content(prompt)
    return r.text or ""


def solve_image(image_bytes, question_hint=""):
    img = Image.open(io.BytesIO(image_bytes))
    prompt = question_hint or "Solve the question in this image. Provide a step-by-step explanation and final answer."
    r = _model(MODEL_VISION).generate_content([prompt, img])
    return r.text or ""


def voice_chat(prompt, language="en-US"):
    sys = f"Respond in language code {language}. Keep replies concise and spoken-friendly."
    return chat(prompt, system=sys)
