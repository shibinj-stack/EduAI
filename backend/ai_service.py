import os, json, base64
import google.generativeai as genai
from PIL import Image
import io

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_TEXT = "gemini-1.5-flash"
MODEL_VISION = "gemini-1.5-flash"

def _model(name=MODEL_TEXT):
    return genai.GenerativeModel(name)

def chat(prompt, history=None, system=None):
    m = _model()
    msgs = []
    if system: msgs.append({"role": "user", "parts": [system]})
    for h in (history or []):
        msgs.append({"role": "user" if h["role"]=="user" else "model", "parts": [h["content"]]})
    msgs.append({"role": "user", "parts": [prompt]})
    r = m.generate_content(msgs)
    return r.text

def generate_quiz(topic, num=5):
    p = f"""Create {num} multiple-choice questions on "{topic}".
Return ONLY valid JSON: {{"questions":[{{"q":"...","options":["a","b","c","d"],"answer":0,"explanation":"..."}}]}}"""
    r = _model().generate_content(p).text
    r = r.strip().strip("`")
    if r.startswith("json"): r = r[4:].strip()
    return json.loads(r)

def generate_flashcards(notes, num=10):
    p = f"""Generate {num} flashcards from these notes. Return ONLY JSON:
{{"cards":[{{"front":"...","back":"..."}}]}}
Notes:\n{notes}"""
    r = _model().generate_content(p).text.strip().strip("`")
    if r.startswith("json"): r = r[4:].strip()
    return json.loads(r)

def summarize(text):
    return _model().generate_content(
        f"Summarize concisely with bullet points and key concepts:\n\n{text}"
    ).text

def study_plan(subjects, exam_date):
    return _model().generate_content(
        f"Create a personalized daily study plan and revision timetable. Subjects: {subjects}. Exam date: {exam_date}. Use markdown tables."
    ).text

def solve_image(image_bytes, question_hint=""):
    img = Image.open(io.BytesIO(image_bytes))
    p = f"{question_hint or 'Solve the question in this image.'} Provide a step-by-step explanation and final answer."
    return _model(MODEL_VISION).generate_content([p, img]).text

def voice_chat(prompt, language="en-US"):
    sys = f"Respond in language code {language}. Keep replies concise and spoken-friendly."
    return chat(prompt, system=sys)
