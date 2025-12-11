# Dashboard - Technical Documentation

## Overview
The Dashboard serves as the central hub of the TeachForward platform, providing students with a comprehensive overview of their academic progress, upcoming sessions, assignments, and a calendar for scheduling.

---

## Architecture & Implementation

### Frontend Implementation
**Location:** `frontend/teachforward-frontend/src/pages/Dashboard/Dashboard.tsx`

#### Component Structure
- **Type:** React Functional Component with TypeScript
- **Lines of Code:** ~690 lines
- **State Management:** React useState hooks (15+ state variables)
- **External Libraries:** 
  - Material-UI v7 (UI components)
  - FullCalendar (calendar functionality)
  - Day.js (date manipulation)

#### Key State Variables
```typescript
const [stats, setStats] = useState({
  totalSessions: 0,
  studyHours: 0,
  averageGrade: 0,
  upcomingAssignments: 0
});
const [sessions, setSessions] = useState<Session[]>([]);
const [assignments, setAssignments] = useState<Assignment[]>([]);
const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
```

---

## Features & Implementation Details

### 1. Statistics Cards (4 Cards)

#### Total Sessions
- **API Endpoint:** `GET /sessions/my-sessions`
- **Calculation:** `sessions.length`
- **Display:** Count of all booked sessions
- **Code:**
```typescript
const fetchSessions = async () => {
  const res = await fetch('http://localhost:8000/sessions/my-sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setSessions(data);
};
```

#### Study Hours
- **API Endpoint:** `GET /grades/study-hours`
- **Database Source:** `study_sessions` table
- **Calculation:** Sum of `duration_minutes / 60`
- **Display:** Total hours with decimal precision

#### Average Grade
- **API Endpoint:** `GET /grades/courses`
- **Calculation Method:**
  1. Fetch all courses with grade components
  2. Calculate weighted average for each course
  3. Compute overall average across all courses
- **Formula:** 
```
For each course:
  weighted_grade = Σ(component_score × component_weight) / 100
  
Overall average = Σ(weighted_grade) / number_of_courses
```
- **Fixed Issue:** Originally pulled from `progress` table (always null), now calculates from actual grade data

#### Upcoming Assignments
- **API Endpoint:** `GET /homework/assignments`
- **Filter Logic:** 
```typescript
assignments.filter(a => 
  a.due_date && 
  new Date(a.due_date) > new Date()
).length
```

### 2. Upcoming Sessions List

**Data Source:** `GET /sessions/my-sessions`

**Filter Logic:**
```typescript
const upcomingSessions = sessions
  .filter(s => new Date(s.start) >= new Date())
  .sort((a, b) => new Date(a.start) - new Date(b.start))
  .slice(0, 5); // Show first 5
```

**Display Components:**
- Session topic (title)
- Formatted date/time
- Status chip (color-coded: confirmed=green, pending=yellow, completed=blue, cancelled=red)
- "Join Zoom Meeting" button (if zoom_link exists)

**Status Color Mapping:**
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'completed': return 'info';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};
```

### 3. Pending Assignments List

**Data Source:** `GET /homework/assignments`

**Filter & Sort:**
```typescript
const pendingAssignments = assignments
  .filter(a => a.due_date && new Date(a.due_date) > new Date())
  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  .slice(0, 5);
```

**Display Components:**
- Assignment title
- Due date (formatted: "Dec 15, 2025, 11:59 PM")
- "View Details" button (navigates to `/homework`)

### 4. Interactive Calendar

**Library:** FullCalendar with Day Grid Plugin

#### Event Types

**1. Session Events (Auto-populated)**
```typescript
{
  title: session.topic,
  start: session.start,
  end: session.end,
  color: '#1976d2',
  extendedProps: { type: 'session', sessionId: session.id }
}
```

**2. Assignment Events (Auto-populated)**
```typescript
{
  title: assignment.title,
  start: assignment.due_date,
  allDay: true,
  color: '#ed6c02',
  extendedProps: { type: 'assignment' }
}
```

**3. Custom Events (User-created)**
- **Storage:** localStorage (key: `dashboard_custom_events_${userId}`)
- **Structure:**
```typescript
interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
}
```

#### Calendar Features

**Add Custom Event:**
1. Click date on calendar → Opens dialog
2. Fill in title, start time, end time, description
3. Saves to localStorage
4. Automatically appears on calendar

**Delete Custom Event:**
1. Click event → Opens event details dialog
2. Click "Delete Event" button
3. Removes from localStorage
4. Updates calendar view

**localStorage Implementation:**
```typescript
// Save
localStorage.setItem(
  `dashboard_custom_events_${userId}`, 
  JSON.stringify(customEvents)
);

// Load
const saved = localStorage.getItem(`dashboard_custom_events_${userId}`);
if (saved) {
  setCustomEvents(JSON.parse(saved));
}
```

---

## Database Integration

### Tables Used

#### 1. `sessions` (SessionBooking)
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  tutor_id INTEGER REFERENCES users(id),
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  topic VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  zoom_link VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `assignments`
```sql
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(id),
  student_id INTEGER REFERENCES users(id),
  session_id INTEGER REFERENCES sessions(id),
  title VARCHAR NOT NULL,
  description TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `courses`
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  name VARCHAR NOT NULL,
  code VARCHAR,
  instructor VARCHAR,
  semester VARCHAR,
  color VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `study_sessions`
```sql
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INTEGER,
  activity_type VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Used

### 1. `GET /sessions/my-sessions`
**Purpose:** Fetch user's tutoring sessions

**Backend Code:**
```python
@router.get("/my-sessions", response_model=List[schemas.SessionOut])
def get_my_sessions(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    if current_user.role == "student":
        return crud.get_sessions_for_student(db, current_user.id)
    elif current_user.role == "tutor":
        return crud.get_sessions_for_tutor(db, current_user.id)
    return []
```

**CRUD Function:**
```python
def get_sessions_for_student(db: Session, student_id: int):
    return db.query(models.SessionBooking)\
        .filter(models.SessionBooking.student_id == student_id)\
        .order_by(models.SessionBooking.start.desc())\
        .all()
```

### 2. `GET /homework/assignments`
**Purpose:** Fetch assignments (filtered by student)

**Backend Code:**
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

### 3. `GET /grades/courses`
**Purpose:** Fetch courses with grade components

**Backend Code:**
```python
@router.get("/courses", response_model=List[schemas.CourseOut])
def get_courses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    courses = db.query(models.Course)\
        .filter(models.Course.student_id == current_user.id)\
        .all()
    return courses
```

### 4. `GET /grades/study-hours`
**Purpose:** Calculate total study hours

**Backend Code:**
```python
@router.get("/study-hours")
def get_study_hours(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    total_minutes = db.query(func.sum(models.StudySession.duration_minutes))\
        .filter(models.StudySession.student_id == current_user.id)\
        .scalar() or 0
    
    return {"total_hours": round(total_minutes / 60, 1)}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard.tsx                         │
│                      (React Component)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   useEffect()     │
                    │   on mount        │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ fetchStats() │      │ fetchSessions│     │fetchAssignments│
└──────┬───────┘      └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ GET /grades/ │      │ GET /sessions│     │ GET /homework│
│ courses      │      │ /my-sessions │     │ /assignments │
│ study-hours  │      └──────┬───────┘     └──────┬───────┘
└──────┬───────┘             │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                        │
│                  (app/routers/*.py)                       │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                    SQLAlchemy ORM                         │
│                     (app/crud.py)                         │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                   SQLite Database                         │
│           (dev.db - sessions, assignments,                │
│            courses, study_sessions tables)                │
└──────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Why Separate Stats API Calls?
**Decision:** Make individual API calls instead of one aggregate endpoint
**Reasoning:**
- Modularity: Each stat can be updated independently
- Reusability: Same endpoints used across different pages
- Flexibility: Easy to add/remove stats without breaking other features

### 2. Why localStorage for Custom Events?
**Decision:** Store custom calendar events in browser localStorage
**Reasoning:**
- No backend changes needed
- Fast access (no API calls)
- Per-user storage (keyed by userId)
- Simple CRUD operations
**Trade-off:** Events not synced across devices

### 3. Why FullCalendar Library?
**Decision:** Use FullCalendar instead of building custom calendar
**Reasoning:**
- Professional UI with built-in features
- Handles edge cases (timezone, DST, leap years)
- Mobile-responsive
- Supports multiple event sources
- Active maintenance and documentation

---

## Performance Considerations

### Data Fetching Strategy
- **Parallel Fetches:** All API calls made simultaneously using Promise.all pattern
- **Loading States:** Individual loading states for each section
- **Error Handling:** Try-catch blocks with user-friendly error messages

### Optimization Techniques
1. **Memoization:** Calendar events recalculated only when data changes
2. **Slicing:** Display only first 5 sessions/assignments (pagination-ready)
3. **Conditional Rendering:** Components render only when data exists
4. **Debouncing:** Calendar date changes debounced to reduce re-renders

---

## Testing Approach

### Manual Testing Checklist
- [ ] Stats cards display correct numbers
- [ ] Sessions list shows upcoming sessions in chronological order
- [ ] Assignments list shows pending assignments with correct due dates
- [ ] Calendar displays all event types with correct colors
- [ ] Custom events can be added and deleted
- [ ] Custom events persist after page refresh
- [ ] Clicking events opens appropriate dialogs
- [ ] Zoom links work correctly
- [ ] Navigation to homework page works
- [ ] Average grade calculation is accurate

---

## Common Issues & Solutions

### Issue 1: Average Grade Showing N/A
**Problem:** Progress table `average_grade` always null
**Solution:** Calculate from actual course grades using weighted averages
**Code Location:** Dashboard.tsx, lines 100-120

### Issue 2: Calendar Events Not Updating
**Problem:** Adding custom event doesn't refresh calendar
**Solution:** Force re-render by updating calendarEvents state
```typescript
setCalendarEvents([...calculatedEvents]);
```

### Issue 3: localStorage Not Working
**Problem:** Custom events disappear after refresh
**Solution:** Ensure userId is available before setting localStorage key
```typescript
if (userId) {
  localStorage.setItem(`dashboard_custom_events_${userId}`, ...);
}
```

---

## Complete API Reference

### Dashboard Data Sources

The dashboard aggregates data from multiple routers. Here are the key endpoints used:

| Module | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| **Sessions** | `GET /sessions/my-sessions` | Yes | Upcoming tutoring sessions | `List[SessionOut]` |
| **Homework** | `GET /homework/assignments` | Yes | Assigned homework | `List[AssignmentOut]` |
| **Homework** | `GET /homework/my-submissions` | Yes | Submitted assignments | `List[SubmissionOut]` |
| **Grades** | `GET /grades/courses` | Yes | All courses | `List[CourseOut]` |
| **Grades** | `GET /grades/study-hours` | Yes | Total study time | `{total_seconds}` |
| **Progress** | `GET /progress/me` | Yes | Learning progress | `ProgressOut` |
| **Auth** | `GET /auth/me` | Yes | Current user info | `UserOut` |

### Example Dashboard Data Flow

**1. Load Dashboard (Student View):**
```bash
# Fetch user profile
GET /auth/me
Headers: Authorization: Bearer <token>
Response: {
  "id": 5,
  "email": "student@example.com",
  "full_name": "John Doe",
  "user_type": "student"
}

# Fetch upcoming sessions
GET /sessions/my-sessions
Response: [
  {
    "id": 1,
    "tutor_name": "Dr. Smith",
    "subject": "Calculus",
    "start": "2025-12-15T14:00:00Z",
    "end": "2025-12-15T15:00:00Z",
    "status": "confirmed"
  }
]

# Fetch homework assignments
GET /homework/assignments
Response: [
  {
    "id": 1,
    "title": "Essay on ML",
    "due_date": "2025-12-20T23:59:00Z",
    "submitted": false
  }
]

# Fetch courses
GET /grades/courses
Response: [
  {
    "id": 1,
    "name": "Calculus I",
    "semester": "Fall 2025",
    "current_grade": 87.5
  }
]

# Fetch study time
GET /grades/study-hours
Response: {
  "total_seconds": 18000
}
```

**2. Load Dashboard (Tutor View):**
```bash
# Same auth/me endpoint

# Fetch sessions (shows students' booked sessions)
GET /sessions/my-sessions
Response: [
  {
    "id": 2,
    "student_name": "Jane Smith",
    "subject": "Physics",
    "start": "2025-12-16T10:00:00Z"
  }
]

# Fetch submissions to grade
GET /homework/submissions
Response: [
  {
    "id": 1,
    "assignment_title": "Essay on ML",
    "student_name": "John Doe",
    "submitted_at": "2025-12-19T14:30:00Z",
    "score": null
  }
]
```

**3. Calendar Integration:**
The dashboard calendar combines data from:
- **Sessions** (from `/sessions/my-sessions`)
- **Homework Due Dates** (from `/homework/assignments`)
- **Custom Events** (stored in localStorage)

All events are displayed on a unified FullCalendar component.

---

## Future Enhancements

1. **Backend Storage for Custom Events:** Sync across devices
2. **Calendar Export:** ICS file generation for external calendars
3. **Reminders:** Email/push notifications for upcoming events
4. **Advanced Filtering:** Filter calendar by event type
5. **Study Time Tracker:** Start/stop timer directly from dashboard
6. **Grade Trends:** Graph showing grade progression over time
7. **Session Analytics:** Most productive study times, tutor ratings
