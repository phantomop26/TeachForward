# Homework - Technical Documentation

## Overview
The Homework page manages the complete assignment lifecycle: tutors create assignments, students submit work, and tutors grade submissions. It handles file uploads, assignment tracking, and feedback delivery.

---

## Architecture & Implementation

### Frontend Implementation
**Location:** `frontend/teachforward-frontend/src/pages/Homework/Homework.tsx`

#### Component Structure
- **Type:** React Functional Component with TypeScript
- **State Management:** React useState hooks
- **External Libraries:**
  - Material-UI v7 (UI components, file upload)
  - Day.js (date formatting)

#### Key State Variables
```typescript
const [assignments, setAssignments] = useState<Assignment[]>([]);
const [submissions, setSubmissions] = useState<Submission[]>([]);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [userRole, setUserRole] = useState<string>('student');
```

---

## Features & Implementation Details

### 1. Assignment Display

#### For Students
**View:** List of assignments assigned to them or general assignments

**API Endpoint Used:**
```python
@router.get("/assignments", response_model=List[schemas.AssignmentOut])
def list_assignments(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    if current_user.role == "tutor":
        return crud.get_assignments(db, tutor_id=current_user.id)
    else:
        # Students see assignments assigned to them or general assignments
        query = db.query(models.Assignment).filter(
            (models.Assignment.student_id == current_user.id) | 
            (models.Assignment.student_id == None)
        )
        return query.all()
```

**Filtering Logic:**
```sql
SELECT * FROM assignments 
WHERE student_id = :current_user_id 
   OR student_id IS NULL
ORDER BY due_date ASC
```

#### For Tutors
**View:** All assignments they created

**Filtering Logic:**
```sql
SELECT * FROM assignments 
WHERE tutor_id = :current_user_id
ORDER BY created_at DESC
```

### 2. File Upload System

#### Frontend File Selection
```typescript
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files[0]) {
    setSelectedFile(event.target.files[0]);
  }
};
```

#### Submission Process
```typescript
const handleSubmit = async (assignmentId: number) => {
  if (!selectedFile) {
    alert('Please select a file');
    return;
  }

  const formData = new FormData();
  formData.append('assignment_id', assignmentId.toString());
  formData.append('file', selectedFile);

  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/homework/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};
```

**Note:** No `Content-Type` header needed - browser sets it automatically with boundary for multipart/form-data

#### Backend File Handling

**Endpoint:**
```python
@router.post("/submit")
def submit_assignment(
    assignment_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    path = save_upload_file(file)
    submission = models.Submission(
        assignment_id=assignment_id, 
        student_id=current_user.id, 
        file_path=path
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {"submission_id": submission.id}
```

**File Storage Function:**
```python
# app/files.py
import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return path"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    filename = f"{datetime.now().timestamp()}_{upload_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path
```

**File Storage Structure:**
```
uploads/
├── 1702237800.5_assignment1.pdf
├── 1702238901.2_homework2.docx
└── 1702239102.8_essay.pdf
```

### 3. Submission Management

#### View Submissions (Students)

**API Endpoint:**
```python
@router.get("/my-submissions", response_model=List[schemas.SubmissionOut])
def get_my_submissions(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    return crud.get_submissions_for_student(db, current_user.id)
```

**CRUD Function:**
```python
def get_submissions_for_student(db: Session, student_id: int):
    return db.query(models.Submission)\
        .filter(models.Submission.student_id == student_id)\
        .order_by(models.Submission.created_at.desc())\
        .all()
```

**Display Information:**
- Submission date/time
- Assignment title
- File name
- Grade (if graded)
- Feedback (if provided)
- Download link

#### View Submissions (Tutors)

**API Endpoint:**
```python
@router.get("/submissions")
def list_submissions(
    assignment_id: int, 
    db: Session = Depends(get_db)
):
    submissions = db.query(models.Submission)\
        .filter(models.Submission.assignment_id == assignment_id)\
        .all()
    
    return [{
        "id": s.id,
        "student_id": s.student_id,
        "file_path": s.file_path,
        "grade": s.grade,
        "feedback": s.feedback
    } for s in submissions]
```

**Use Case:** Tutor clicks "View Submissions" on an assignment to see all student submissions

### 4. Grading System

#### Grading Interface
**Who:** Tutors only
**Access:** Click "Grade" button on submission

**Form Fields:**
1. Grade (text field - can be letter grade or percentage)
2. Feedback (multiline text area)

#### Grading Logic
```typescript
const handleGrade = async (submissionId: number) => {
  const formData = new FormData();
  formData.append('submission_id', submissionId.toString());
  formData.append('grade', gradeValue);
  formData.append('feedback', feedbackText);

  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/homework/grade', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};
```

#### Backend Grading Endpoint
```python
@router.post("/grade")
def grade_submission(
    submission_id: int = Form(...),
    grade: str = Form(...),
    feedback: str = Form(None),
    db: Session = Depends(get_db)
):
    submission = db.query(models.Submission).get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.grade = grade
    submission.feedback = feedback
    db.commit()
    
    return {"ok": True}
```

**Grade Storage:** Flexible string field (supports "A+", "95%", "Excellent", etc.)

### 5. File Download

#### Download Endpoint
```python
@router.get("/file")
def get_file(path: str):
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)
```

**Usage:**
```typescript
<a href={`http://localhost:8000/homework/file?path=${submission.file_path}`}>
  Download File
</a>
```

**FastAPI FileResponse:**
- Automatically sets Content-Type based on file extension
- Handles large files with streaming
- Sets appropriate headers for download

---

## Database Integration

### Tables Used

#### 1. `assignments`
```sql
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(id) NOT NULL,
  student_id INTEGER REFERENCES users(id),
  session_id INTEGER REFERENCES sessions(id),
  title VARCHAR NOT NULL,
  description TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Key Relationships:**
- `tutor_id`: Who created the assignment
- `student_id`: Specific student (NULL = all students)
- `session_id`: Linked to specific tutoring session (NULL = independent)

#### 2. `submissions`
```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) NOT NULL,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  file_path VARCHAR,
  grade VARCHAR,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Key Relationships:**
- `assignment_id`: Which assignment this submission is for
- `student_id`: Who submitted
- `file_path`: Local file system path
- `grade`: Tutor-assigned grade (NULL if not graded yet)
- `feedback`: Tutor comments (NULL if not provided)

---

## Data Flow: Assignment Submission

```
┌─────────────────┐
│   Student       │
│   Views         │
│   Assignment    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Clicks "Choose File"       │
│  Browser opens file picker  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  handleFileChange()         │
│  Stores File object         │
│  in state: selectedFile     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Clicks "Submit"            │
│  Validation: file selected? │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Creates FormData           │
│  - append('assignment_id')  │
│  - append('file', File obj) │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /homework/submit      │
│  Content-Type: multipart/   │
│                form-data    │
│  Authorization: Bearer token│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend: submit_assignment │
│  - Receives UploadFile      │
│  - Gets current_user        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  save_upload_file()         │
│  - Creates uploads/ dir     │
│  - Generates unique name    │
│  - Saves file to disk       │
│  - Returns file path        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Create Submission Record   │
│  INSERT INTO submissions    │
│  (assignment_id, student_id,│
│   file_path)                │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Return Success             │
│  {submission_id: 123}       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend Updates           │
│  - Show success message     │
│  - Refresh submission list  │
│  - Clear file selection     │
└─────────────────────────────┘
```

---

## Data Flow: Grading Process

```
┌─────────────────┐
│   Tutor         │
│   Views         │
│   Submissions   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  GET /homework/submissions  │
│  ?assignment_id=123         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Displays list of           │
│  submissions with:          │
│  - Student name             │
│  - Submission date          │
│  - File download link       │
│  - Grade button             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Tutor clicks "Grade"       │
│  Opens grading dialog       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Tutor enters:              │
│  - Grade (e.g., "A", "95%") │
│  - Feedback (optional)      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /homework/grade       │
│  FormData:                  │
│  - submission_id            │
│  - grade                    │
│  - feedback                 │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend: grade_submission  │
│  - Find submission by ID    │
│  - Update grade field       │
│  - Update feedback field    │
│  - Commit to database       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  UPDATE submissions         │
│  SET grade = 'A',           │
│      feedback = 'Great work'│
│  WHERE id = 456             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Student Views              │
│  "My Submissions"           │
│  - Sees updated grade       │
│  - Reads feedback           │
└─────────────────────────────┘
```

---

## API Endpoints

### 1. `POST /homework/create`
**Purpose:** Create new assignment (used in Sessions page, not directly on Homework page)
**Authorization:** Tutor only
**Note:** Now primarily using `/sessions/assign-homework` endpoint

### 2. `GET /homework/assignments`
**Purpose:** List assignments filtered by user role
**Students:** See assignments assigned to them + general assignments
**Tutors:** See all assignments they created

### 3. `POST /homework/submit`
**Purpose:** Submit assignment file
**Authorization:** Student
**Content-Type:** multipart/form-data
**Request:**
```
assignment_id: 123
file: [File object]
```

### 4. `GET /homework/my-submissions`
**Purpose:** Get student's submissions
**Authorization:** Student
**Returns:** List of submissions with grades and feedback

### 5. `GET /homework/submissions?assignment_id=123`
**Purpose:** Get all submissions for an assignment
**Authorization:** Tutor
**Returns:** List of submissions from all students

### 6. `POST /homework/grade`
**Purpose:** Grade a submission
**Authorization:** Tutor
**Request:**
```
submission_id: 456
grade: "A"
feedback: "Excellent work!"
```

### 7. `GET /homework/file?path=uploads/file.pdf`
**Purpose:** Download submitted file
**Returns:** File with appropriate Content-Type header

---

## Key Design Decisions

### 1. Why Local File Storage?
**Decision:** Store files in `uploads/` directory on server
**Reasoning:**
- Simple implementation for MVP
- No external dependencies (S3, etc.)
- Direct file access with FileResponse
- Lower cost for development

**Production Considerations:**
- Should migrate to cloud storage (AWS S3, Google Cloud Storage)
- Current setup doesn't scale horizontally
- No built-in backup/redundancy

### 2. Why Flexible Grade Field (String)?
**Decision:** Store grades as VARCHAR instead of numeric
**Reasoning:**
- Supports multiple grading systems (letter grades, percentages, rubrics)
- Teachers have different grading styles
- Can store "A+", "95%", "Excellent", "4/5", etc.

**Trade-off:** Harder to calculate numeric averages (would need parsing)

### 3. Why FormData for File Upload?
**Decision:** Use FormData instead of JSON with base64
**Reasoning:**
- Browser native file handling
- No encoding overhead (base64 increases size by ~33%)
- FastAPI UploadFile handles streaming efficiently
- Standard practice for file uploads

### 4. Why Optional Feedback on Grading?
**Decision:** Feedback field can be NULL
**Reasoning:**
- Quick grading: tutors can just enter grade
- Detailed grading: tutors can add comments
- Flexibility for different teaching styles

---

## Security Considerations

### 1. File Upload Validation
**Current Implementation:** Basic validation
**Improvements Needed:**
```python
def save_upload_file(upload_file: UploadFile) -> str:
    # TODO: Add file size limit
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    
    # TODO: Validate file type
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.zip'}
    
    # TODO: Scan for malware
    # virus_scan(upload_file)
```

### 2. File Access Control
**Current Issue:** Any authenticated user can download any file if they know the path
**Solution Needed:**
```python
@router.get("/file")
def get_file(path: str, current_user=Depends(get_current_user)):
    # Verify user has permission to access this file
    submission = db.query(Submission).filter(Submission.file_path == path).first()
    if not submission:
        raise HTTPException(404)
    
    # Check: is user the student who submitted OR the tutor who assigned?
    if submission.student_id != current_user.id and \
       submission.assignment.tutor_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    return FileResponse(path)
```

### 3. SQL Injection Prevention
**Protection:** SQLAlchemy ORM automatically parameterizes queries
```python
# Safe - parameterized
db.query(models.Assignment).filter(models.Assignment.id == assignment_id)

# Unsafe - string concatenation (not used in our code)
db.execute(f"SELECT * FROM assignments WHERE id = {assignment_id}")
```

---

## Common Issues & Solutions

### Issue 1: File Upload Returns 413 (Payload Too Large)
**Cause:** Default nginx/server limit
**Solution:** Increase max body size in server config
```nginx
client_max_body_size 50M;
```

### Issue 2: File Path Not Found on Download
**Cause:** File moved or deleted, relative path issue
**Solution:** 
- Use absolute paths
- Add error handling
- Validate file exists before serving

### Issue 3: FormData Empty on Backend
**Cause:** Wrong Content-Type header set manually
**Solution:** Don't set Content-Type header - let browser set it with boundary
```typescript
// Wrong
headers: { 'Content-Type': 'multipart/form-data' }

// Correct
headers: { Authorization: `Bearer ${token}` }
// Browser adds: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

---

## Performance Considerations

### 1. File Streaming
FastAPI's `UploadFile` uses streaming:
```python
# Memory-efficient - streams file in chunks
with open(file_path, "wb") as buffer:
    shutil.copyfileobj(upload_file.file, buffer)
```

### 2. Query Optimization
Avoid N+1 queries when loading submissions with assignments:
```python
# Good - one query with join
submissions = db.query(models.Submission)\
    .join(models.Assignment)\
    .filter(models.Submission.student_id == student_id)\
    .all()

# Bad - N queries
submissions = db.query(models.Submission).filter(...).all()
for submission in submissions:
    assignment = db.query(models.Assignment).get(submission.assignment_id)
```

---

## Complete API Reference

### Homework Router (`/homework`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| POST | `/homework/create` | Yes (Tutor) | Create homework assignment | `AssignmentCreate` | `AssignmentOut` |
| GET | `/homework/assignments` | Yes | Get assigned homework | - | `List[AssignmentOut]` |
| POST | `/homework/submit` | Yes (Student) | Submit assignment | `multipart/form-data` | `SubmissionOut` |
| GET | `/homework/my-submissions` | Yes (Student) | Get own submissions | - | `List[SubmissionOut]` |
| GET | `/homework/submissions` | Yes (Tutor) | Get all submissions | `?assignment_id=` | `List[SubmissionOut]` |
| POST | `/homework/grade` | Yes (Tutor) | Grade submission | `{submission_id, score, feedback}` | `SubmissionOut` |
| GET | `/homework/file` | Yes | Download submission file | `?submission_id=` | File download |

### Example Requests

**1. Create Assignment (Tutor):**
```bash
POST /homework/create
Headers: Authorization: Bearer <token>
Body: {
  "title": "Essay on Machine Learning",
  "description": "Write a 5-page essay on ML applications",
  "due_date": "2025-12-20T23:59:00Z",
  "student_ids": [5, 7, 9]
}
Response: {
  "id": 1,
  "title": "Essay on Machine Learning",
  "description": "Write a 5-page essay on ML applications",
  "due_date": "2025-12-20T23:59:00Z",
  "tutor_id": 3,
  "created_at": "2025-12-10T10:00:00Z"
}
```

**2. Get Assignments (Student):**
```bash
GET /homework/assignments
Headers: Authorization: Bearer <token>
Response: [
  {
    "id": 1,
    "title": "Essay on Machine Learning",
    "description": "Write a 5-page essay...",
    "due_date": "2025-12-20T23:59:00Z",
    "tutor_id": 3,
    "tutor_name": "Dr. Smith",
    "submitted": false,
    "submission": null
  }
]
```

**3. Submit Assignment (Student):**
```bash
POST /homework/submit
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
  assignment_id: 1
  file: essay.pdf (binary)
Response: {
  "id": 1,
  "assignment_id": 1,
  "student_id": 5,
  "file_path": "uploads/homework_1_5_1639135200.pdf",
  "submitted_at": "2025-12-19T14:30:00Z",
  "score": null,
  "feedback": null
}
```

**4. Grade Submission (Tutor):**
```bash
POST /homework/grade
Headers: Authorization: Bearer <token>
Body: {
  "submission_id": 1,
  "score": 92,
  "feedback": "Excellent analysis! Well-structured arguments."
}
Response: {
  "id": 1,
  "score": 92,
  "feedback": "Excellent analysis!...",
  "graded_at": "2025-12-19T16:00:00Z"
}
```

**5. Download Submission File:**
```bash
GET /homework/file?submission_id=1
Headers: Authorization: Bearer <token>
Response: (File download with proper Content-Disposition header)
```

---

## Future Enhancements

1. **Cloud Storage:** Migrate to AWS S3 or similar
2. **File Preview:** Show PDF/images in browser without download
3. **Version Control:** Allow resubmission with version history
4. **Plagiarism Detection:** Integrate with Turnitin or similar
5. **Rubric Grading:** Structured grading criteria
6. **Batch Grading:** Grade multiple submissions at once
7. **Assignment Templates:** Pre-made assignment formats
8. **Due Date Reminders:** Email notifications
9. **Late Submission Policy:** Automatic penalty calculation
10. **File Compression:** Automatic compression for large files
