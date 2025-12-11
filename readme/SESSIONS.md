# Sessions - Technical Documentation

## Overview
The Sessions page facilitates the connection between students and tutors, allowing students to book tutoring sessions and tutors to assign homework to their students. It displays available tutors with their subjects and manages session bookings.

---

## Architecture & Implementation

### Frontend Implementation
**Location:** `frontend/teachforward-frontend/src/pages/Sessions/Sessions.tsx`

#### Component Structure
- **Type:** React Functional Component with TypeScript
- **Lines of Code:** ~566 lines
- **State Management:** React useState hooks (17+ state variables)
- **External Libraries:**
  - Material-UI v7 (UI components, dialogs, forms)
  - Day.js (date-time handling)
  - Material-UI Date Pickers (DateTimePicker component)

#### Key State Variables
```typescript
const [tutors, setTutors] = useState<Tutor[]>([]);
const [sessions, setSessions] = useState<Session[]>([]);
const [students, setStudents] = useState<Student[]>([]);
const [userRole, setUserRole] = useState<string>('student');
const [openBookDialog, setOpenBookDialog] = useState(false);
const [openAssignDialog, setOpenAssignDialog] = useState(false);
const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
const [selectedSession, setSelectedSession] = useState<number | null>(null);
```

#### TypeScript Interfaces
```typescript
interface Tutor {
  id: number;
  full_name: string;
  email: string;
  role: string;
  subjects?: string;  // Comma-separated list
}

interface Session {
  id: number;
  tutor_id: number;
  student_id: number;
  start: string;
  end: string;
  topic: string;
  status: string;
  zoom_link?: string;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  student_id?: number;
  session_id?: number;
}

interface Student {
  id: number;
  full_name: string;
  email: string;
}
```

---

## Features & Implementation Details

### 1. Role-Based UI (Student vs Tutor)

#### Role Detection
```typescript
const fetchUserRole = async () => {
  const token = localStorage.getItem('access_token');
  const res = await fetch('http://localhost:8000/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setUserRole(data.role);
};
```

#### Conditional Rendering
**Students See:**
- List of available tutors with subjects
- "Book New Session" button
- Their booked sessions
- Book Session button on each tutor card

**Tutors See:**
- List of available tutors (read-only)
- "Assign Homework" button
- Their scheduled sessions (with students)
- No booking functionality (tutors don't book sessions)

---

### 2. Tutor Subject Display

#### Database Schema
**Table:** `users`
**Field:** `subjects` (TEXT)
**Format:** Comma-separated string (e.g., "Math,Physics,Chemistry")

#### Backend Implementation
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    full_name = Column(String)
    role = Column(String, default="student")
    subjects = Column(String, nullable=True)  # New field
```

#### API Endpoint
```python
@router.get("/tutors", response_model=List[schemas.UserOut])
def tutors(db: Session = Depends(get_db)):
    return crud.list_tutors(db)
```

**CRUD Function:**
```python
def list_tutors(db: Session):
    return db.query(models.User)\
        .filter(models.User.role == "tutor")\
        .all()
```

#### Frontend Display
```typescript
{tutor.subjects && (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    {tutor.subjects.split(',').map((subject, idx) => (
      <Chip
        key={idx}
        label={subject.trim()}
        size="small"
        color="primary"
        variant="outlined"
      />
    ))}
  </Box>
)}
```

**Visual Result:** Each subject appears as a colored chip below the tutor's name

---

### 3. Session Booking (Students Only)

#### Booking Dialog Fields
1. **Select Tutor:** Dropdown of all available tutors
2. **Topic:** Free text (e.g., "Calculus - Derivatives")
3. **Start Time:** DateTimePicker (minimum: current time)
4. **Duration:** Dropdown (30, 60, 90, 120 minutes)

#### Booking Logic
```typescript
const handleBookSession = async () => {
  const token = localStorage.getItem('access_token');
  const endTime = startTime.add(duration, 'minute');
  
  const payload = {
    tutor_id: selectedTutor,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    topic: topic,
  };

  const res = await fetch('http://localhost:8000/sessions/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};
```

#### Backend Endpoint
```python
@router.post("/book", response_model=schemas.SessionOut)
def book_session(
    session_in: schemas.SessionCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    student_id = current_user.id
    return crud.create_session(db, student_id, session_in)
```

**CRUD Function with Zoom Integration:**
```python
def create_session(db: Session, student_id: int, session_in: schemas.SessionCreate):
    """
    Create a tutoring session with real Zoom meeting integration
    Falls back to mock link if Zoom API is not configured
    """
    from .zoom_api import get_zoom_api, ZoomAPIError
    from datetime import datetime
    
    zoom_link = None
    zoom_api = get_zoom_api()
    
    if zoom_api:
        try:
            # Calculate duration in minutes
            start_dt = datetime.fromisoformat(session_in.start.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(session_in.end.replace('Z', '+00:00'))
            duration_minutes = int((end_dt - start_dt).total_seconds() / 60)
            
            # Create real Zoom meeting
            meeting = zoom_api.create_meeting(
                topic=session_in.topic or "Tutoring Session",
                start_time=start_dt,
                duration_minutes=duration_minutes
            )
            zoom_link = meeting["join_url"]
            
        except ZoomAPIError as e:
            print(f"Zoom API error, falling back to mock link: {e}")
            zoom_link = _generate_mock_zoom_link()
    else:
        # Fallback to mock link if Zoom not configured
        zoom_link = _generate_mock_zoom_link()
    
    session = models.SessionBooking(
        student_id=student_id,
        tutor_id=session_in.tutor_id,
        start=session_in.start,
        end=session_in.end,
        topic=session_in.topic,
        zoom_link=zoom_link,
        status="scheduled"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
```

#### Zoom API Integration

**Location:** `backend/app/zoom_api.py`

**How It Works:**
1. **Server-to-Server OAuth:** Uses Zoom's recommended authentication method for backend apps
2. **Access Token Caching:** Tokens are cached until expiry to reduce API calls
3. **Real Meeting Creation:** Creates actual Zoom meetings with join URLs
4. **Graceful Fallback:** If Zoom credentials aren't configured, uses mock links for development

**Zoom API Configuration:**
```python
# Required environment variables in .env
ZOOM_ACCOUNT_ID=your-zoom-account-id
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
```

**Key Functions:**
- `get_access_token()` - Obtains OAuth token from Zoom
- `create_meeting()` - Creates scheduled Zoom meeting with settings
- `delete_meeting()` - Removes Zoom meeting (for cancellations)

**Meeting Settings:**
```python
settings = {
    "host_video": True,
    "participant_video": True,
    "join_before_host": True,  # Students can join early
    "mute_upon_entry": False,
    "waiting_room": False,     # Instant access
    "audio": "both",           # VoIP + Phone
    "meeting_authentication": False  # No account required
}
```

**Setup Instructions:** See `backend/ZOOM_SETUP.md` for detailed credential setup

**Dependencies Added:**
- `PyJWT==2.8.0` - JWT token handling for Zoom OAuth
- `requests==2.31.0` - HTTP client for Zoom API calls


---

### 4. Assignment Creation (Tutors Only)

#### Why This Feature?
Tutors need to assign homework to students they're tutoring. Assignments can be:
- General (all students)
- Student-specific
- Linked to a specific tutoring session

#### Database Schema Updates

**Before:**
```sql
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  due_date DATETIME
);
```

**After (Added Fields):**
```sql
ALTER TABLE assignments ADD COLUMN student_id INTEGER REFERENCES users(id);
ALTER TABLE assignments ADD COLUMN session_id INTEGER REFERENCES sessions(id);
```

**Migration Script:** `backend/migrations/add_subjects_and_assignment_fields.py`

#### Assignment Dialog Fields
1. **Select Student:** Dropdown (optional, "All Students" if empty)
2. **Link to Session:** Dropdown of tutor's sessions (optional)
3. **Assignment Title:** Required text field
4. **Description:** Multiline text area
5. **Due Date:** DateTimePicker

#### Tutor's Students List
**How It Works:** Tutors can only see students who have booked sessions with them

**API Endpoint:**
```python
@router.get("/my-students", response_model=List[schemas.UserOut])
def get_my_students(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can view their students")
    
    # Get unique student IDs from sessions
    student_ids = db.query(models.SessionBooking.student_id)\
        .filter(models.SessionBooking.tutor_id == current_user.id)\
        .distinct()\
        .all()
    
    student_ids = [sid[0] for sid in student_ids]
    students = db.query(models.User).filter(models.User.id.in_(student_ids)).all()
    return students
```

#### Assignment Creation Logic
```typescript
const handleAssignHomework = async () => {
  const token = localStorage.getItem('access_token');
  
  const payload = {
    title: assignmentTitle,
    description: assignmentDescription,
    due_date: assignmentDueDate?.toISOString(),
    student_id: selectedStudent,      // null = all students
    session_id: selectedSession,       // null = not linked to session
  };

  const res = await fetch('http://localhost:8000/sessions/assign-homework', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};
```

#### Backend Endpoint
```python
@router.post("/assign-homework", response_model=schemas.AssignmentOut)
def assign_homework(
    assignment_in: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create an assignment for a specific student or session (tutor only)"""
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can assign homework")
    
    assignment = models.Assignment(
        tutor_id=current_user.id,
        student_id=assignment_in.student_id,    # Can be None
        session_id=assignment_in.session_id,    # Can be None
        title=assignment_in.title,
        description=assignment_in.description,
        due_date=assignment_in.due_date
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
```

---

### 5. My Sessions Display

#### Session Cards
Each session card shows:
- **Topic:** Session subject/title
- **Status Chip:** Color-coded status indicator
- **Start Time:** Formatted date and time
- **Join Zoom Button:** If zoom_link exists
- **View Details:** Navigation to session detail page

#### Status Colors
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'success';    // Green
    case 'pending': return 'warning';      // Yellow
    case 'completed': return 'info';       // Blue
    case 'cancelled': return 'error';      // Red
    default: return 'default';             // Gray
  }
};
```

#### Date Formatting
```typescript
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
// Output: "Dec 15, 2025, 02:30 PM"
```

---

## Database Integration

### Tables Used

#### 1. `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  hashed_password VARCHAR NOT NULL,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'student',
  bio TEXT,
  rating INTEGER,
  subjects VARCHAR,  -- NEW: Comma-separated subjects
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `sessions` (SessionBooking model)
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  tutor_id INTEGER REFERENCES users(id) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  topic VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  zoom_link VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `assignments`
```sql
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(id) NOT NULL,
  student_id INTEGER REFERENCES users(id),      -- NEW: Optional
  session_id INTEGER REFERENCES sessions(id),   -- NEW: Optional
  title VARCHAR NOT NULL,
  description TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### 1. `GET /sessions/tutors`
**Purpose:** Get list of all tutors with their subjects
**Response:**
```json
[
  {
    "id": 2,
    "email": "dr.wilson@teachforward.com",
    "full_name": "Dr. Sarah Wilson",
    "role": "tutor",
    "subjects": "Math,Physics,Chemistry,Biology,English"
  }
]
```

### 2. `POST /sessions/book`
**Purpose:** Book a tutoring session
**Request:**
```json
{
  "tutor_id": 2,
  "start": "2025-12-15T14:00:00Z",
  "end": "2025-12-15T15:00:00Z",
  "topic": "Calculus - Derivatives"
}
```
**Response:**
```json
{
  "id": 45,
  "student_id": 10,
  "tutor_id": 2,
  "start": "2025-12-15T14:00:00Z",
  "end": "2025-12-15T15:00:00Z",
  "topic": "Calculus - Derivatives",
  "status": "scheduled",
  "zoom_link": null
}
```

### 3. `GET /sessions/my-sessions`
**Purpose:** Get current user's sessions (student or tutor view)
**Logic:**
- Students: See sessions where they are the student
- Tutors: See sessions where they are the tutor

### 4. `POST /sessions/assign-homework`
**Purpose:** Create assignment (tutor only)
**Request:**
```json
{
  "title": "Complete Chapter 5 Exercises",
  "description": "Solve problems 1-20",
  "due_date": "2025-12-20T23:59:00Z",
  "student_id": 10,
  "session_id": 45
}
```

### 5. `GET /sessions/my-students`
**Purpose:** Get list of students who booked with tutor
**Authorization:** Tutor only
**Response:** List of User objects

### 6. `GET /auth/me`
**Purpose:** Get current user info (including role)
**Response:**
```json
{
  "id": 1,
  "email": "student@example.com",
  "full_name": "John Doe",
  "role": "student"
}
```

---

## Data Flow: Session Booking

```
┌─────────────────┐
│   Student       │
│   Clicks        │
│ "Book Session"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Opens Dialog               │
│  - Select Tutor             │
│  - Enter Topic              │
│  - Pick Date/Time           │
│  - Choose Duration          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  handleBookSession()        │
│  Creates payload with:      │
│  - tutor_id                 │
│  - start (ISO datetime)     │
│  - end (calculated)         │
│  - topic                    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /sessions/book        │
│  Authorization: Bearer token│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend: book_session()    │
│  - Validates token          │
│  - Gets current_user        │
│  - Extracts student_id      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  crud.create_session()      │
│  - Creates SessionBooking   │
│  - Sets status="scheduled"  │
│  - Saves to database        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Database Insert            │
│  INSERT INTO sessions       │
│  (student_id, tutor_id,     │
│   start, end, topic, status)│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Return Session Object      │
│  to Frontend                │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend Updates           │
│  - Close dialog             │
│  - Show success message     │
│  - Refresh session list     │
└─────────────────────────────┘
```

---

## Data Flow: Assignment Creation

```
┌─────────────────┐
│   Tutor         │
│   Clicks        │
│"Assign Homework"│
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  fetchMyStudents()           │
│  GET /sessions/my-students   │
│  Populates student dropdown  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Opens Dialog                │
│  - Select Student (optional) │
│  - Link Session (optional)   │
│  - Title (required)          │
│  - Description               │
│  - Due Date                  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  handleAssignHomework()      │
│  Validates: title required   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  POST /sessions/             │
│       assign-homework        │
│  Authorization: Bearer token │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Backend: assign_homework()  │
│  - Checks role == "tutor"    │
│  - Gets current_user.id      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Create Assignment Object    │
│  - tutor_id = current user   │
│  - student_id (can be NULL)  │
│  - session_id (can be NULL)  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Database Insert             │
│  INSERT INTO assignments     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Student views on            │
│  Homework page               │
│  (filtered by student_id)    │
└──────────────────────────────┘
```

---

## Key Design Decisions

### 1. Why Role-Based UI?
**Decision:** Show different buttons based on user role
**Reasoning:**
- Students book sessions, tutors don't book for themselves
- Tutors assign homework, students don't create assignments
- Cleaner UX: Users only see relevant actions
- Prevents unauthorized actions on frontend

### 2. Why Optional student_id in Assignments?
**Decision:** Allow assignments without specific student
**Reasoning:**
- Tutors can create general assignments (all students see it)
- Tutors can create student-specific assignments
- Flexible system for different use cases

**Database Query Logic:**
```python
# Students see:
WHERE student_id = current_user.id OR student_id IS NULL

# Tutors see:
WHERE tutor_id = current_user.id
```

### 3. Why Link Assignments to Sessions?
**Decision:** Optional session_id in assignments
**Reasoning:**
- Context: Assignment related to specific tutoring session
- Tracking: See which sessions generated homework
- Future: Display assignments within session detail view
- Not required: Assignments can exist independently

### 4. Why Comma-Separated Subjects?
**Decision:** Store subjects as single string instead of separate table
**Reasoning:**
- Simplicity: No joins needed
- Flexibility: Easy to add/remove subjects
- Performance: One query to get tutor with subjects
**Trade-off:** Harder to filter tutors by specific subject (future enhancement)

---

## Security Considerations

### 1. Role-Based Access Control
```python
if current_user.role != "tutor":
    raise HTTPException(status_code=403, detail="Only tutors can assign homework")
```
- Backend enforces role restrictions
- Frontend hides UI, but backend validates

### 2. Student List Isolation
- Tutors only see students who booked with them
- Query filters by tutor_id in sessions table
- No exposure of all students

### 3. JWT Authentication
- All endpoints require valid JWT token
- Token contains user_id and role
- Validated on every request

---

## Common Issues & Solutions

### Issue 1: Subjects Not Showing
**Problem:** Tutor cards don't display subjects
**Cause:** Database not migrated
**Solution:** Run migration script
```bash
python backend/migrations/add_subjects_and_assignment_fields.py
python backend/migrations/populate_tutor_subjects.py
```

### Issue 2: Assignment Dialog Empty Student List
**Problem:** No students appear in dropdown
**Cause:** Tutor has no booked sessions yet
**Solution:** Normal behavior - student must book session first

### Issue 3: Can't Book Session in Past
**Problem:** DateTimePicker allows past dates
**Solution:** Set minDateTime prop
```typescript
<DateTimePicker
  minDateTime={dayjs()}  // Minimum is now
/>
```

---

## Complete API Reference

### Sessions Router (`/sessions`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| GET | `/sessions/tutors` | No | Get all tutors with subjects | - | `List[UserOut]` |
| POST | `/sessions/book` | Yes | Book a tutoring session | `SessionCreate` | `SessionOut` |
| GET | `/sessions/my-sessions` | Yes | Get user's sessions (role-based) | - | `List[SessionOut]` |
| PUT | `/sessions/{session_id}/status` | Yes | Update session status | `{status: string}` | `{ok: bool, session}` |
| POST | `/sessions/assign-homework` | Tutor | Create assignment | `AssignmentCreate` | `AssignmentOut` |
| GET | `/sessions/my-students` | Tutor | Get students with booked sessions | - | `List[UserOut]` |
| GET | `/sessions/all-students` | Tutor | Get all registered students | - | `List[UserOut]` |
| DELETE | `/sessions/{session_id}` | Yes | Delete session | - | `{message: string}` |

### Example Requests

**1. Book Session:**
```bash
POST /sessions/book
Headers: Authorization: Bearer <token>
Body: {
  "tutor_id": 2,
  "start": "2025-12-15T14:00:00Z",
  "end": "2025-12-15T15:00:00Z",
  "topic": "Calculus Help"
}
```

**2. Get My Sessions:**
```bash
GET /sessions/my-sessions
Headers: Authorization: Bearer <token>
Response: [{
  "id": 1,
  "student_id": 5,
  "tutor_id": 2,
  "start": "2025-12-15T14:00:00Z",
  "end": "2025-12-15T15:00:00Z",
  "topic": "Calculus Help",
  "status": "scheduled",
  "zoom_link": "https://zoom.us/j/123456789"
}]
```

**3. Assign Homework:**
```bash
POST /sessions/assign-homework
Headers: Authorization: Bearer <token>
Body: {
  "title": "Chapter 5 Exercises",
  "description": "Complete problems 1-20",
  "due_date": "2025-12-20T23:59:00Z",
  "student_id": 5,
  "session_id": 1
}
```

**4. Delete Session:**
```bash
DELETE /sessions/6
Headers: Authorization: Bearer <token>
Response: {"message": "Session deleted successfully"}
```

---

## Future Enhancements

1. **Subject-Based Tutor Filtering:** Search tutors by subject
2. **Recurring Sessions:** Book multiple sessions at once
3. **Session Ratings:** Students rate tutors after sessions
4. **Availability Calendar:** Tutors set available time slots
5. **Assignment Templates:** Pre-filled assignment formats
6. **Bulk Assignment Creation:** Assign to multiple students at once
7. **Session Notes:** Tutors add notes after each session
8. **Session Reminders:** Email/SMS notifications before sessions
