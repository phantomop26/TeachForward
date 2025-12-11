# Study Tools - Technical Documentation

## Overview
The Study Tools page provides AI-powered and manual learning tools including flashcard generation, quiz creation, text summarization, PDF note extraction, and personal note-taking with hierarchical organization.

---

## Architecture & Implementation

### Frontend Implementation
**Location:** `frontend/teachforward-frontend/src/pages/StudyTools/StudyTools.tsx`

#### Component Structure
- **Type:** React Functional Component with TypeScript
- **Lines of Code:** ~1468 lines
- **State Management:** React useState hooks (30+ state variables)
- **Tab-Based Interface:** 5 tabs (Flashcards, Quizzes, Summaries, AI Notes, Personal Notes)
- **External Libraries:**
  - Material-UI v7 (UI components, tabs, dialogs)
  - OpenAI GPT-4o-mini (AI features)

---

## Tab 1: Flashcards

### AI Flashcard Generation

**Input:** Text content (pasted or typed)
**Process:** OpenAI generates question-answer pairs
**Output:** Interactive flashcard deck

#### Frontend Implementation
```typescript
const generateFlashcards = async () => {
  const token = localStorage.getItem('access_token');
  const payload = { text: inputText };
  
  const res = await fetch('http://localhost:8000/ai/generate-flashcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  setFlashcards(data.flashcards);
};
```

#### Backend Endpoint
```python
@router.post("/generate-flashcards")
async def generate_flashcards(request: FlashcardRequest):
    client = get_openai_client()
    
    prompt = f"""Generate 10 flashcards from this text. 
    Format as JSON array: [{{"question": "Q1", "answer": "A1"}}, ...]
    
    Text: {request.text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    content = response.choices[0].message.content
    flashcards = json.loads(content)
    
    return {"flashcards": flashcards}
```

#### OpenAI Client Initialization
```python
# app/routers/ai.py
import os
from openai import OpenAI

def get_openai_client():
    """Create OpenAI client with API key from environment"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    return OpenAI(api_key=api_key)
```

**Key Fix:** Dynamic client creation (not global variable) to ensure .env file is loaded first

#### Flashcard Display
```typescript
<Card>
  <CardContent onClick={handleFlip}>
    {flipped ? (
      <Typography>{flashcard.answer}</Typography>
    ) : (
      <Typography>{flashcard.question}</Typography>
    )}
  </CardContent>
  <CardActions>
    <Button onClick={handleNext}>Next</Button>
    <Typography>{currentIndex + 1} / {flashcards.length}</Typography>
  </CardActions>
</Card>
```

### Manual Flashcards

**Storage:** localStorage (key: `study_flashcards_${userId}`)

**Interface:**
```typescript
interface ManualFlashcard {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}
```

**CRUD Operations:**
```typescript
// Create
const addFlashcard = () => {
  const newCard: ManualFlashcard = {
    id: Date.now().toString(),
    question: questionInput,
    answer: answerInput,
    created_at: new Date().toISOString()
  };
  
  const updated = [...manualFlashcards, newCard];
  setManualFlashcards(updated);
  localStorage.setItem(
    `study_flashcards_${userId}`, 
    JSON.stringify(updated)
  );
};

// Delete
const deleteFlashcard = (id: string) => {
  const updated = manualFlashcards.filter(card => card.id !== id);
  setManualFlashcards(updated);
  localStorage.setItem(
    `study_flashcards_${userId}`, 
    JSON.stringify(updated)
  );
};
```

---

## Tab 2: Quizzes

### AI Quiz Generation

**Input:** Text content
**Process:** OpenAI generates multiple-choice questions
**Output:** Interactive quiz with scoring

#### Quiz Structure
```typescript
interface QuizQuestion {
  question: string;
  options: string[];     // 4 options (A, B, C, D)
  correct_answer: string; // Letter of correct option
}
```

#### Backend Generation
```python
@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    client = get_openai_client()
    
    prompt = f"""Generate 5 multiple choice questions from this text.
    Format as JSON array:
    [{{
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct_answer": "A"
    }}, ...]
    
    Text: {request.text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    content = response.choices[0].message.content
    quiz_questions = json.loads(content)
    
    return {"questions": quiz_questions}
```

#### Quiz Taking Interface
```typescript
const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
const [showResults, setShowResults] = useState(false);
const [score, setScore] = useState(0);

const handleAnswerSelect = (questionIndex: number, answer: string) => {
  setSelectedAnswers({
    ...selectedAnswers,
    [questionIndex]: answer
  });
};

const handleSubmitQuiz = () => {
  let correctCount = 0;
  
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correct_answer) {
      correctCount++;
    }
  });
  
  setScore(correctCount);
  setShowResults(true);
};
```

#### Results Display
```typescript
<Typography variant="h5">
  Score: {score} / {questions.length}
</Typography>
<Typography>
  Percentage: {((score / questions.length) * 100).toFixed(0)}%
</Typography>

{questions.map((q, idx) => (
  <Box>
    <Typography>
      {idx + 1}. {q.question}
    </Typography>
    <Typography color={
      selectedAnswers[idx] === q.correct_answer ? 'success' : 'error'
    }>
      Your answer: {selectedAnswers[idx]}
      {selectedAnswers[idx] !== q.correct_answer && (
        ` (Correct: ${q.correct_answer})`
      )}
    </Typography>
  </Box>
))}
```

### Manual Quizzes

**Storage:** localStorage
**Features:** Same as AI quizzes but user-created

---

## Tab 3: Summaries

### AI Text Summarization

**Input:** Long text
**Process:** OpenAI generates concise summary
**Output:** Formatted summary with key points

#### Backend Endpoint
```python
@router.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    client = get_openai_client()
    
    prompt = f"""Summarize this text in 3-5 paragraphs, highlighting key points:
    
    Text: {request.text}"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=500
    )
    
    summary = response.choices[0].message.content
    
    return {"summary": summary}
```

**Parameters:**
- `temperature=0.5`: More focused and deterministic
- `max_tokens=500`: Limit summary length

#### Display
```typescript
<Paper elevation={2} sx={{ p: 3 }}>
  <Typography variant="h6">Summary</Typography>
  <Divider sx={{ my: 2 }} />
  <Typography style={{ whiteSpace: 'pre-line' }}>
    {summary}
  </Typography>
</Paper>
```

---

## Tab 4: AI Notes (PDF Extraction)

### PDF Processing with OpenAI

**Input:** PDF file upload
**Process:** Extract text → Send to OpenAI for structured notes
**Output:** Organized notes with sections

#### File Upload
```typescript
const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/ai/parse-notes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  const data = await res.json();
  setPdfNotes(data.notes);
};
```

#### Backend PDF Processing
```python
from PyPDF2 import PdfReader
import io

@router.post("/parse-notes")
async def parse_notes(file: UploadFile = File(...)):
    # Read PDF
    pdf_content = await file.read()
    pdf_file = io.BytesIO(pdf_content)
    reader = PdfReader(pdf_file)
    
    # Extract text from all pages
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    
    # Send to OpenAI for structuring
    client = get_openai_client()
    
    prompt = f"""Extract and organize notes from this text.
    Create sections with headings and bullet points.
    Format as markdown.
    
    Text: {text[:4000]}"""  # Limit to first 4000 chars
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    notes = response.choices[0].message.content
    
    return {"notes": notes}
```

**Dependencies:**
```python
# requirements.txt
PyPDF2==3.0.1
```

---

## Tab 5: Personal Notes

### Hierarchical Note Structure

**No AI - Pure Manual Note-Taking**

#### Data Structure
```typescript
interface PersonalNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  sections: PersonalNoteSection[];
}

interface PersonalNoteSection {
  id: string;
  title: string;
  content: string;
  subsections: PersonalNoteSubsection[];
}

interface PersonalNoteSubsection {
  id: string;
  title: string;
  content: string;
}
```

#### Storage
**Location:** localStorage (key: `personal_notes_${userId}`)
**Format:** JSON string

#### CRUD Operations

**Create Note:**
```typescript
const createNote = () => {
  const newNote: PersonalNote = {
    id: Date.now().toString(),
    title: noteTitle,
    content: noteContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: []
  };
  
  const updated = [...notes, newNote];
  setNotes(updated);
  saveToLocalStorage(updated);
};
```

**Add Section to Note:**
```typescript
const addSection = (noteId: string) => {
  const newSection: PersonalNoteSection = {
    id: Date.now().toString(),
    title: sectionTitle,
    content: sectionContent,
    subsections: []
  };
  
  const updated = notes.map(note => {
    if (note.id === noteId) {
      return {
        ...note,
        sections: [...note.sections, newSection],
        updated_at: new Date().toISOString()
      };
    }
    return note;
  });
  
  setNotes(updated);
  saveToLocalStorage(updated);
};
```

**Add Subsection to Section:**
```typescript
const addSubsection = (noteId: string, sectionId: string) => {
  const newSubsection: PersonalNoteSubsection = {
    id: Date.now().toString(),
    title: subsectionTitle,
    content: subsectionContent
  };
  
  const updated = notes.map(note => {
    if (note.id === noteId) {
      return {
        ...note,
        sections: note.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              subsections: [...section.subsections, newSubsection]
            };
          }
          return section;
        }),
        updated_at: new Date().toISOString()
      };
    }
    return note;
  });
  
  setNotes(updated);
  saveToLocalStorage(updated);
};
```

#### Display Hierarchy
```typescript
<Accordion>
  <AccordionSummary>
    <Typography variant="h5">{note.title}</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography>{note.content}</Typography>
    
    {/* Sections */}
    {note.sections.map(section => (
      <Accordion key={section.id}>
        <AccordionSummary>
          <Typography variant="h6">{section.title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{section.content}</Typography>
          
          {/* Subsections */}
          {section.subsections.map(subsection => (
            <Box key={subsection.id} sx={{ ml: 4, mt: 2 }}>
              <Typography variant="subtitle1">
                {subsection.title}
              </Typography>
              <Typography>{subsection.content}</Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    ))}
  </AccordionDetails>
</Accordion>
```

---

## AI Integration Details

### OpenAI Configuration

**Model:** GPT-4o-mini
**Reasoning:**
- Cost-effective ($0.15/1M input tokens)
- Fast response times
- Sufficient capability for educational tasks
- Lower latency than GPT-4

### API Key Management

**Environment Variable:**
```bash
# .env
OPENAI_API_KEY=sk-proj-...
```

**Backend Loading:**
```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
```

**Security:**
- API key never exposed to frontend
- Backend proxy for all OpenAI calls
- .env file in .gitignore

### Token Usage Optimization

**Strategies:**
1. **Prompt Engineering:** Clear, concise prompts
2. **Text Truncation:** Limit input length
3. **Temperature Tuning:** Lower temp for factual tasks
4. **Max Tokens:** Limit response length

**Example:**
```python
# For summaries: Deterministic, concise
temperature=0.5, max_tokens=500

# For flashcards: Creative, varied
temperature=0.7, max_tokens=1000
```

---

## Data Flow: AI Flashcard Generation

```
┌─────────────────┐
│   Student       │
│   Pastes Text   │
│   in Textbox    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Clicks "Generate"          │
│  Frontend validates:        │
│  - Text not empty           │
│  - Text length < 5000 chars │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /ai/generate-         │
│       flashcards            │
│  Body: { text: "..." }      │
│  Authorization: Bearer token│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend: generate_         │
│           flashcards()      │
│  - Validates token          │
│  - Gets current user        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  get_openai_client()        │
│  - Loads OPENAI_API_KEY     │
│  - Creates OpenAI client    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  client.chat.completions    │
│       .create()             │
│  - model: "gpt-4o-mini"     │
│  - prompt: flashcard format │
│  - temperature: 0.7         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  OpenAI API                 │
│  Processes request          │
│  Returns JSON response      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend parses response    │
│  - Extracts content         │
│  - Parses JSON              │
│  - Validates structure      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Return to frontend         │
│  { flashcards: [...] }      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend updates state     │
│  - setFlashcards(data)      │
│  - Switches to view mode    │
│  - Shows first card         │
└─────────────────────────────┘
```

---

## Common Issues & Solutions

### Issue 1: OpenAI Timeout (25 seconds, 0 tokens)
**Cause:** Client initialized before .env loaded
**Solution:** Dynamic client creation
```python
# Wrong
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # Too early

# Correct
def get_openai_client():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # Lazy loading
```

### Issue 2: PDF Text Extraction Garbled
**Cause:** PDF has images/scanned text
**Solutions:**
- Use OCR (Tesseract) for scanned PDFs
- Check if PDF is text-based first
- Provide error message to user

### Issue 3: localStorage Full
**Cause:** Too many notes/flashcards (5-10 MB limit)
**Solutions:**
- Implement pagination
- Move to backend storage
- Add cleanup/archive feature

### Issue 4: JSON Parse Error from OpenAI
**Cause:** OpenAI returns markdown-wrapped JSON
**Solution:**
```python
content = response.choices[0].message.content

# Strip markdown code blocks
if content.startswith("```json"):
    content = content.replace("```json\n", "").replace("\n```", "")

flashcards = json.loads(content)
```

---

## Key Design Decisions

### 1. Why GPT-4o-mini Instead of GPT-4?
**Decision:** Use cheaper, faster model
**Reasoning:**
- Educational tasks don't need GPT-4's full power
- 10x cheaper ($0.15 vs $1.50 per 1M tokens)
- Faster response times (better UX)
- Still highly capable for structured outputs

### 2. Why localStorage for Manual Content?
**Decision:** Store user-created content locally
**Reasoning:**
- No backend changes needed
- Instant access (no API calls)
- Works offline
- Simple implementation

**Trade-off:** Not synced across devices

### 3. Why Separate AI and Manual Tabs?
**Decision:** Don't mix AI and manual flashcards
**Reasoning:**
- Clear distinction of sources
- Different management workflows
- Prevents confusion
- Easier to implement separate storage

### 4. Why Limit PDF to 4000 Characters?
**Decision:** Truncate extracted text
**Reasoning:**
- OpenAI token limits (4096 for gpt-4o-mini input)
- Cost control
- Faster processing
- Most PDFs front-load important content

---

## Complete API Reference

### AI Tools Router (`/ai`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| POST | `/ai/summarize` | Yes | Summarize text content | `{content}` | `{summary}` |
| POST | `/ai/flashcards` | Yes | Generate flashcards from content | `{content, num_cards}` | `{flashcards: [{question, answer}]}` |
| POST | `/ai/quiz` | Yes | Generate quiz questions | `{content, num_questions}` | `{questions: [{question, options, correct}]}` |
| POST | `/ai/concept-map` | Yes | Create concept relationships | `{content}` | `{concepts: [{name, related}]}` |
| POST | `/ai/generate-flashcards` | Yes | AI flashcards from notes | `{note_ids}` | `{flashcards: [...]}` |
| POST | `/ai/generate-quiz` | Yes | AI quiz from notes | `{note_ids, num_questions}` | `{questions: [...]}` |
| POST | `/ai/chat` | Yes | Study assistant chatbot | `{message, context}` | `{response}` |
| POST | `/ai/parse-notes` | Yes | Extract structured data from text | `{content}` | `{sections: [...]}` |
| POST | `/ai/extract-pdf` | Yes | Extract text from PDF | `multipart/form-data (file)` | `{text, page_count}` |

### Example Requests

**1. Summarize Notes:**
```bash
POST /ai/summarize
Headers: Authorization: Bearer <token>
Body: {
  "content": "Photosynthesis is the process by which plants... [long text]"
}
Response: {
  "summary": "Photosynthesis converts light energy into chemical energy using chlorophyll. The process occurs in two stages: light-dependent reactions and the Calvin cycle."
}
```

**2. Generate Flashcards:**
```bash
POST /ai/flashcards
Headers: Authorization: Bearer <token>
Body: {
  "content": "The mitochondria is the powerhouse of the cell...",
  "num_cards": 5
}
Response: {
  "flashcards": [
    {
      "question": "What is the primary function of mitochondria?",
      "answer": "To produce ATP through cellular respiration"
    },
    {
      "question": "Where is the electron transport chain located?",
      "answer": "In the inner mitochondrial membrane"
    }
  ]
}
```

**3. Generate Quiz:**
```bash
POST /ai/quiz
Headers: Authorization: Bearer <token>
Body: {
  "content": "Newton's Laws of Motion...",
  "num_questions": 3
}
Response: {
  "questions": [
    {
      "question": "Which law states an object in motion stays in motion?",
      "options": ["First Law", "Second Law", "Third Law", "Law of Gravitation"],
      "correct": 0
    }
  ]
}
```

**4. Chat with Study Assistant:**
```bash
POST /ai/chat
Headers: Authorization: Bearer <token>
Body: {
  "message": "Explain the difference between mitosis and meiosis",
  "context": "I'm studying cell biology for my exam tomorrow"
}
Response: {
  "response": "Great question! Mitosis produces two identical daughter cells for growth and repair, while meiosis creates four genetically different cells for reproduction..."
}
```

**5. Extract PDF Content:**
```bash
POST /ai/extract-pdf
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
  file: lecture_notes.pdf (binary)
Response: {
  "text": "Chapter 1: Introduction to Biology\n\nBiology is the study of life...",
  "page_count": 25
}
```

**6. Create Concept Map:**
```bash
POST /ai/concept-map
Headers: Authorization: Bearer <token>
Body: {
  "content": "Cellular respiration involves glycolysis, Krebs cycle..."
}
Response: {
  "concepts": [
    {"name": "Cellular Respiration", "related": ["Glycolysis", "Krebs Cycle", "Electron Transport"]},
    {"name": "Glycolysis", "related": ["Glucose", "Pyruvate", "ATP"]}
  ]
}
```

---

## Future Enhancements

1. **Spaced Repetition:** Implement SM-2 algorithm for optimal review intervals
2. **OCR Support:** Handle scanned PDFs with Tesseract
3. **Audio Notes:** Transcribe lectures with Whisper API
4. **Collaborative Notes:** Share notes with classmates
5. **Export Options:** PDF, Markdown, Anki deck export
6. **Advanced Search:** Full-text search across all notes
7. **Tags & Categories:** Organize by subject/topic
8. **Version History:** Track note changes over time
9. **AI Chat:** Conversational study assistant
10. **Practice Mode:** Adaptive quiz difficulty based on performance
