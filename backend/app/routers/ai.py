from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from ..deps import get_current_user
from ..models import User
import os
import json
import re
import io
from PyPDF2 import PdfReader

router = APIRouter(prefix="/ai", tags=["ai"])

# Get OpenAI client lazily (called when needed, not at module load)
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except ImportError:
        return None

class TextIn(BaseModel):
    text: str

class GenerateFlashcardsRequest(BaseModel):
    topic: str
    count: int = 5

class GenerateQuizRequest(BaseModel):
    topic: str
    num_questions: int = 5

class SummarizeRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

@router.post("/summarize")
def summarize(payload: TextIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Use OpenAI if available, otherwise fallback
    client = get_openai_client()
    if client is None:
        sentences = text.split('.')
        summary = '.'.join(sentences[:2]).strip()
        if not summary:
            summary = text[:200]
        return {"summary": summary}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant. Summarize the following text concisely in 2-3 sentences."},
                {"role": "user", "content": text}
            ],
            max_tokens=200,
            temperature=0.7
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary}
    except Exception as e:
        # Fallback to simple summarization
        sentences = text.split('.')
        summary = '.'.join(sentences[:2]).strip()
        if not summary:
            summary = text[:200]
        return {"summary": summary}

@router.post("/flashcards")
def flashcards(payload: TextIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Use OpenAI if available, otherwise fallback
    client = get_openai_client()
    if client is None:
        items = [s.strip() for s in text.split('\n') if s.strip()][:6]
        cards = []
        for i, it in enumerate(items, 1):
            cards.append({"q": f"Key point {i}", "a": it[:120]})
        return {"cards": cards}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a study assistant. Generate 5-6 flashcards from the text. Return JSON array with format: [{\"q\": \"question\", \"a\": \"answer\"}]"},
                {"role": "user", "content": text}
            ],
            max_tokens=500,
            temperature=0.7
        )
        cards_text = response.choices[0].message.content.strip()
        # Try to parse as JSON
        if cards_text.startswith('['):
            cards = json.loads(cards_text)
        else:
            # Extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'\[.*\]', cards_text, re.DOTALL)
            if json_match:
                cards = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse flashcards")
        return {"cards": cards}
    except Exception as e:
        # Fallback to simple flashcards
        items = [s.strip() for s in text.split('\n') if s.strip()][:6]
        cards = []
        for i, it in enumerate(items, 1):
            cards.append({"q": f"Key point {i}", "a": it[:120]})
        return {"cards": cards}

@router.post("/quiz")
def generate_quiz(payload: TextIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Use OpenAI if available, otherwise fallback
    client = get_openai_client()
    if client is None:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        questions = []
        for i, line in enumerate(lines[:5]):
            questions.append({
                "question": f"What is the main concept in: '{line[:50]}...'?",
                "options": [line[:30], "Alternative 1", "Alternative 2", "Alternative 3"],
                "correct_answer": 0
            })
        return {"questions": questions}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Generate 5 multiple-choice questions from the text. Return JSON array: [{\"question\": \"...\", \"options\": [\"a\", \"b\", \"c\", \"d\"], \"correct_answer\": 0}]. correct_answer is the index (0-3) of the right option."},
                {"role": "user", "content": text}
            ],
            max_tokens=800,
            temperature=0.7
        )
        quiz_text = response.choices[0].message.content.strip()
        # Try to parse as JSON
        if quiz_text.startswith('['):
            questions = json.loads(quiz_text)
        else:
            # Extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'\[.*\]', quiz_text, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse quiz")
        return {"questions": questions}
    except Exception as e:
        # Fallback to simple quiz
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        questions = []
        for i, line in enumerate(lines[:5]):
            questions.append({
                "question": f"What is the main concept in: '{line[:50]}...'?",
                "options": [line[:30], "Alternative 1", "Alternative 2", "Alternative 3"],
                "correct_answer": 0
            })
        return {"questions": questions}

@router.post("/concept-map")
def concept_map(payload: TextIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    # Use OpenAI if available, otherwise fallback
    client = get_openai_client()
    if client is None:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        nodes = []
        edges = []
        for i, line in enumerate(lines[:8]):
            nodes.append({"id": i, "label": line[:40], "type": "concept"})
            if i > 0:
                edges.append({"from": i - 1, "to": i, "label": "relates to"})
        return {"nodes": nodes, "edges": edges}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Generate a concept map from the text. Return JSON: {\"nodes\": [{\"id\": 0, \"label\": \"...\", \"type\": \"concept\"}], \"edges\": [{\"from\": 0, \"to\": 1, \"label\": \"relates to\"}]}"},
                {"role": "user", "content": text}
            ],
            max_tokens=600,
            temperature=0.7
        )
        map_text = response.choices[0].message.content.strip()
        # Try to parse as JSON
        if map_text.startswith('{'):
            concept_data = json.loads(map_text)
        else:
            # Extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'\{.*\}', map_text, re.DOTALL)
            if json_match:
                concept_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse concept map")
        return concept_data
    except Exception as e:
        # Fallback to simple concept map
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        nodes = []
        edges = []
        for i, line in enumerate(lines[:8]):
            nodes.append({"id": i, "label": line[:40], "type": "concept"})
            if i > 0:
                edges.append({"from": i - 1, "to": i, "label": "relates to"})
        return {"nodes": nodes, "edges": edges}

@router.post("/generate-flashcards")
def generate_flashcards(payload: GenerateFlashcardsRequest, current_user: User = Depends(get_current_user)):
    """Generate flashcards for a given topic using AI"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI service not available")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a helpful study assistant. Generate exactly {payload.count} flashcards about {payload.topic}. Return JSON array with format: [{{\"question\": \"...\", \"answer\": \"...\", \"difficulty\": \"Easy|Medium|Hard\"}}]. Make them educational and clear."},
                {"role": "user", "content": f"Create {payload.count} flashcards about {payload.topic}"}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        cards_text = response.choices[0].message.content.strip()
        
        # Parse JSON from response
        if cards_text.startswith('['):
            cards = json.loads(cards_text)
        else:
            json_match = re.search(r'\[.*\]', cards_text, re.DOTALL)
            if json_match:
                cards = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse flashcards")
        
        return {"flashcards": cards, "topic": payload.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")

@router.post("/generate-quiz")
def generate_quiz_endpoint(payload: GenerateQuizRequest, current_user: User = Depends(get_current_user)):
    """Generate a quiz for a given topic using AI"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI service not available")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a helpful study assistant. Generate exactly {payload.num_questions} multiple-choice questions about {payload.topic}. Return JSON array: [{{\"question\": \"...\", \"options\": [\"a\", \"b\", \"c\", \"d\"], \"correctAnswer\": 0}}]. correctAnswer is the index (0-3) of the right option."},
                {"role": "user", "content": f"Create {payload.num_questions} quiz questions about {payload.topic}"}
            ],
            max_tokens=1200,
            temperature=0.7
        )
        quiz_text = response.choices[0].message.content.strip()
        
        # Parse JSON from response
        if quiz_text.startswith('['):
            questions = json.loads(quiz_text)
        else:
            json_match = re.search(r'\[.*\]', quiz_text, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse quiz")
        
        return {"questions": questions, "topic": payload.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/summarize")
def summarize_text(payload: SummarizeRequest, current_user: User = Depends(get_current_user)):
    """Summarize text using AI"""
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    client = get_openai_client()
    if not client:
        # Fallback: simple summarization
        sentences = text.split('.')
        summary = '.'.join(sentences[:3]).strip()
        return {"content": summary or text[:300], "keyPoints": []}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant. Summarize the text and extract 3-5 key points. Return JSON: {\"summary\": \"...\", \"keyPoints\": [\"point1\", \"point2\", ...]}"},
                {"role": "user", "content": text}
            ],
            max_tokens=500,
            temperature=0.7
        )
        summary_text = response.choices[0].message.content.strip()
        
        # Parse JSON from response
        if summary_text.startswith('{'):
            summary_data = json.loads(summary_text)
        else:
            json_match = re.search(r'\{.*\}', summary_text, re.DOTALL)
            if json_match:
                summary_data = json.loads(json_match.group())
            else:
                summary_data = {"summary": summary_text, "keyPoints": []}
        
        return {
            "content": summary_data.get("summary", summary_text),
            "keyPoints": summary_data.get("keyPoints", [])
        }
    except Exception as e:
        # Fallback
        sentences = text.split('.')
        summary = '.'.join(sentences[:3]).strip()
        return {"content": summary or text[:300], "keyPoints": []}

@router.post("/chat")
def chat_with_ai(payload: ChatRequest, current_user: User = Depends(get_current_user)):
    """Chat with AI tutor"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI service not available")
    
    try:
        messages = [
            {"role": "system", "content": "You are a helpful AI study tutor. Answer questions clearly and concisely. Help students understand concepts, not just provide answers."}
        ]
        
        # Add conversation history
        for msg in payload.history[-10:]:  # Last 10 messages for context
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
        # Add current message
        messages.append({"role": "user", "content": payload.message})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content.strip()
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/parse-notes")
def parse_notes(payload: dict, current_user: User = Depends(get_current_user)):
    """Parse notes into organized sections and subsections with AI explanations"""
    title = payload.get("title", "").strip()
    content = payload.get("content", "").strip()
    
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content required")
    
    client = get_openai_client()
    if not client:
        # Fallback: simple parsing by paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        sections = []
        for i, para in enumerate(paragraphs[:5]):
            sections.append({
                "id": f"section-{i}",
                "title": f"Section {i+1}",
                "content": para,
                "subsections": []
            })
        return {"sections": sections}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant. Parse the note content into organized sections with titles, explanations, and subsections. Return JSON: {\"sections\": [{\"id\": \"1\", \"title\": \"...\", \"content\": \"explanation\", \"subsections\": [{\"id\": \"1.1\", \"title\": \"...\", \"content\": \"...\"}]}]}. Make it educational and well-structured."},
                {"role": "user", "content": f"Note Title: {title}\n\nContent:\n{content}"}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Parse JSON from response
        if result_text.startswith('{'):
            result = json.loads(result_text)
        else:
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse response")
        
        return result
    except Exception as e:
        # Fallback to simple parsing
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        sections = []
        for i, para in enumerate(paragraphs[:5]):
            sections.append({
                "id": f"section-{i}",
                "title": f"Section {i+1}",
                "content": para,
                "subsections": []
            })
        return {"sections": sections}

@router.post("/extract-pdf")
async def extract_pdf_text(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Extract text from uploaded PDF file"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Read the PDF file
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        
        # Extract text using PyPDF2
        reader = PdfReader(pdf_file)
        text = ""
        
        for page in reader.pages:
            text += page.extract_text() + "\n\n"
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        return {"text": text.strip(), "pages": len(reader.pages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")
