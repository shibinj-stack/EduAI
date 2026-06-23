import os, json, io
import google.generativeai as genai
from PIL import Image

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_TEXT = "gemini-2.5-flash"
MODEL_VISION = "gemini-2.5-flash"

def _model(name=MODEL_TEXT):
return genai.GenerativeModel(name)

def chunk_text(text, chunk_size=4000):
return [
text[i + chunk_size]
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
return _model().generate_content(
f"Summarize concisely with bullet points and key concepts:\n\n{text}"
).text or ""

def summarize_large_text(text):
chunks = chunk_text(text, 4000)

summaries = []

for i, chunk in enumerate(chunks):
    print(f"Processing chunk {i+1}/{len(chunks)}")

    try:
        result = summarize(chunk)
        summaries.append(result)
    except Exception as e:
        print("Chunk error:", e)

combined = "\n".join(summaries)

return summarize(
    f"""

Create one final study guide from these summaries.

{combined}
"""
)

def generate_quiz(topic, num=5):
p = f"""
Create {num} multiple-choice questions on:

{topic}

Return ONLY valid JSON:

{{
"questions": [
{{
"q": "...",
"options": ["a","b","c","d"],
"answer": 0,
"explanation": "..."
}}
]
}}
"""

r = _model().generate_content(p).text

r = r.strip().strip("`")

if r.startswith("json"):
    r = r[4:].strip()

try:
    return json.loads(r)
except Exception:
    start = r.find("{")
    end = r.rfind("}") + 1
    return json.loads(r[start:end])

def generate_flashcards(notes, num=10):
p = f"""
Generate {num} flashcards.

Return ONLY JSON:

{{
"cards": [
{{
"front": "...",
"back": "..."
}}
]
}}

Notes:

{notes}
"""

r = _model().generate_content(p).text

r = r.strip().strip("`")

if r.startswith("json"):
    r = r[4:].strip()

try:
    return json.loads(r)
except Exception:
    start = r.find("{")
    end = r.rfind("}") + 1
    return json.loads(r[start:end])

def study_plan(subjects, exam_date):
return _model().generate_content(
f"""
Create a personalized daily study plan.

Subjects:
{subjects}

Exam Date:
{exam_date}

Use markdown tables.
"""
).text or ""

def solve_image(image_bytes, question_hint=""):
img = Image.open(io.BytesIO(image_bytes))

prompt = (
    question_hint
    or "Solve the question in this image. Provide step-by-step explanation and final answer."
)

return _model(MODEL_VISION).generate_content(
    [prompt, img]
).text or ""

def voice_chat(prompt, language="en-US"):
sys = f"Respond in language code {language}. Keep replies concise and spoken-friendly."
return chat(prompt, system=sys)
