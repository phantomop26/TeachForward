# Grades - Technical Documentation

## Overview
The Grades page provides comprehensive grade tracking with weighted calculations, GPA computation, and study time monitoring. It allows students to manage courses, grade components, and individual grade entries with automatic weighted average calculations.

---

## Architecture & Implementation

### Frontend Implementation
**Location:** `frontend/teachforward-frontend/src/pages/Grades/Grades.tsx`

#### Component Structure
- **Type:** React Functional Component with TypeScript
- **Lines of Code:** ~800 lines
- **State Management:** React useState hooks (20+ state variables)
- **External Libraries:**
  - Material-UI v7 (UI components, dialogs, forms)
  - Day.js (date handling)

#### Key Interfaces
```typescript
interface Course {
  id: number;
  name: string;
  code: string;
  instructor?: string;
  semester?: string;
  color?: string;
  grade_components: GradeComponent[];
  grade_entries: GradeEntry[];
}

interface GradeComponent {
  id: number;
  course_id: number;
  name: string;
  weight: number;  // Percentage (0-100)
}

interface GradeEntry {
  id: number;
  course_id: number;
  component_id: number;
  name: string;
  score: number;
  max_score: number;
  date?: string;
  notes?: string;
}
```

---

## Features & Implementation Details

### 1. Statistics Dashboard (4 Cards)

#### GPA Calculation (4.0 Scale)

**Letter Grade to GPA Mapping:**
```typescript
const letterToGPA = (letter: string): number => {
  const gradeMap: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[letter] || 0.0;
};
```

**Percentage to Letter Grade:**
```typescript
const percentageToLetter = (percentage: number): string => {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  return 'F';
};
```

**GPA Calculation Process:**
```typescript
const calculateGPA = () => {
  let totalPoints = 0;
  let courseCount = 0;
  
  courses.forEach(course => {
    const percentage = calculateCourseGrade(course);
    if (percentage !== null) {
      const letter = percentageToLetter(percentage);
      totalPoints += letterToGPA(letter);
      courseCount++;
    }
  });
  
  return courseCount > 0 ? (totalPoints / courseCount).toFixed(2) : '0.00';
};
```

#### Average Grade Calculation

**Weighted Average Formula:**
```
For each course:
  1. Group entries by component
  2. Calculate component average: avg = Σ(score/max_score) / count
  3. Apply weight: weighted = avg × component_weight
  4. Sum all weighted components: course_grade = Σ(weighted) / 100
  
Overall average = Σ(course_grades) / number_of_courses
```

**Implementation:**
```typescript
const calculateCourseGrade = (course: Course): number | null => {
  if (!course.grade_components.length || !course.grade_entries.length) {
    return null;
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Process each component
  course.grade_components.forEach(component => {
    // Get entries for this component
    const entries = course.grade_entries.filter(
      e => e.component_id === component.id
    );
    
    if (entries.length > 0) {
      // Calculate component average
      const componentAvg = entries.reduce((sum, entry) => 
        sum + (entry.score / entry.max_score), 0
      ) / entries.length;
      
      // Apply weight
      weightedSum += componentAvg * component.weight;
      totalWeight += component.weight;
    }
  });
  
  // Return weighted percentage
  return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;
};
```

#### Study Hours Display

**API Endpoint:**
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

**Data Source:** `study_sessions` table (tracked separately)

---

### 2. Course Management

#### Add Course

**Dialog Fields:**
- Course Name (required) - e.g., "Calculus I"
- Course Code (optional) - e.g., "MATH 101"
- Instructor (optional) - e.g., "Dr. Smith"
- Semester (optional) - e.g., "Fall 2025"
- Color (optional) - Color picker for visual organization

**API Call:**
```typescript
const handleAddCourse = async () => {
  const token = localStorage.getItem('access_token');
  const payload = {
    name: courseName,
    code: courseCode,
    instructor: instructor,
    semester: semester,
    color: selectedColor
  };
  
  const res = await fetch('http://localhost:8000/grades/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};
```

**Backend Endpoint:**
```python
@router.post("/courses", response_model=schemas.CourseOut)
def create_course(
    course_in: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    course = models.Course(
        student_id=current_user.id,
        name=course_in.name,
        code=course_in.code,
        instructor=course_in.instructor,
        semester=course_in.semester,
        color=course_in.color
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course
```

#### Delete Course

**Cascade Delete:** When a course is deleted, all associated components and entries are automatically deleted

**Database Relationship:**
```python
class Course(Base):
    grade_components = relationship(
        "GradeComponent", 
        back_populates="course", 
        cascade="all, delete-orphan"
    )
    grade_entries = relationship(
        "GradeEntry", 
        back_populates="course", 
        cascade="all, delete-orphan"
    )
```

**API Call:**
```python
@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.student_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(course)
    db.commit()
    return {"ok": True}
```

---

### 3. Grade Component Management

#### Add Component

**Purpose:** Define grading categories with weights

**Examples:**
- "Assignments" - Weight: 30%
- "Midterm Exam" - Weight: 25%
- "Final Exam" - Weight: 30%
- "Attendance" - Weight: 10%
- "Participation" - Weight: 5%

**Weight Validation:**
```typescript
// Warning if weights don't sum to 100%
const totalWeight = course.grade_components.reduce(
  (sum, comp) => sum + comp.weight, 0
);

if (totalWeight !== 100) {
  console.warn(`Course "${course.name}" weights sum to ${totalWeight}%`);
}
```

**API Call:**
```python
@router.post("/components", response_model=schemas.GradeComponentOut)
def create_component(
    component_in: schemas.GradeComponentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify course ownership
    course = db.query(models.Course).filter(
        models.Course.id == component_in.course_id,
        models.Course.student_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    component = models.GradeComponent(
        course_id=component_in.course_id,
        name=component_in.name,
        weight=component_in.weight
    )
    db.add(component)
    db.commit()
    db.refresh(component)
    return component
```

#### Delete Component

**Cascade Delete:** Deleting a component deletes all associated grade entries

```python
class GradeComponent(Base):
    entries = relationship(
        "GradeEntry", 
        back_populates="component", 
        cascade="all, delete-orphan"
    )
```

---

### 4. Grade Entry Management

#### Add Grade Entry

**Dialog Fields:**
- **Select Component:** Dropdown of course components
- **Entry Name:** e.g., "Assignment 1", "Quiz 3", "Midterm"
- **Score:** Actual points earned (e.g., 85)
- **Max Score:** Maximum possible points (e.g., 100)
- **Date:** Optional date of assessment
- **Notes:** Optional additional information

**Percentage Calculation:**
```typescript
const percentage = (score / max_score) * 100;
// Example: (85 / 100) * 100 = 85%
```

**API Call:**
```python
@router.post("/entries", response_model=schemas.GradeEntryOut)
def create_entry(
    entry_in: schemas.GradeEntryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify ownership through course
    course = db.query(models.Course).filter(
        models.Course.id == entry_in.course_id,
        models.Course.student_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(status_code=404)
    
    entry = models.GradeEntry(
        course_id=entry_in.course_id,
        component_id=entry_in.component_id,
        name=entry_in.name,
        score=entry_in.score,
        max_score=entry_in.max_score,
        date=entry_in.date,
        notes=entry_in.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
```

#### Delete Grade Entry

**Simple Delete:** Only removes the specific entry
```python
@router.delete("/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session, current_user):
    entry = db.query(models.GradeEntry)\
        .join(models.Course)\
        .filter(
            models.GradeEntry.id == entry_id,
            models.Course.student_id == current_user.id
        ).first()
    
    if not entry:
        raise HTTPException(404)
    
    db.delete(entry)
    db.commit()
    return {"ok": True}
```

---

## Database Integration

### Tables

#### 1. `courses`
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR NOT NULL,
  code VARCHAR,
  instructor VARCHAR,
  semester VARCHAR,
  color VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `grade_components`
```sql
CREATE TABLE grade_components (
  id INTEGER PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  name VARCHAR NOT NULL,
  weight FLOAT NOT NULL,  -- Percentage weight (0-100)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `grade_entries`
```sql
CREATE TABLE grade_entries (
  id INTEGER PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  component_id INTEGER REFERENCES grade_components(id) NOT NULL,
  name VARCHAR NOT NULL,
  score FLOAT NOT NULL,
  max_score FLOAT NOT NULL,
  date DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `study_sessions`
```sql
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INTEGER,
  activity_type VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Example Calculations

### Example 1: Single Course with Multiple Components

**Course:** Calculus I

**Components:**
| Component | Weight |
|-----------|--------|
| Assignments | 30% |
| Midterm | 30% |
| Final | 40% |

**Grade Entries:**
- Assignments: 85/100, 90/100, 88/100 → Avg: 87.67%
- Midterm: 78/100 → Avg: 78%
- Final: 92/100 → Avg: 92%

**Weighted Calculation:**
```
Assignments: 87.67 × 0.30 = 26.30
Midterm:     78.00 × 0.30 = 23.40
Final:       92.00 × 0.40 = 36.80
─────────────────────────────────
Course Grade:               86.50%
```

**Letter Grade:** B+
**GPA Contribution:** 3.3

### Example 2: Multiple Courses

**Student's Courses:**
1. Calculus I: 86.5% → B+ → 3.3 GPA
2. English Lit: 92.0% → A- → 3.7 GPA
3. Chemistry: 89.5% → B+ → 3.3 GPA

**Overall Average Grade:**
```
(86.5 + 92.0 + 89.5) / 3 = 89.33%
```

**Overall GPA:**
```
(3.3 + 3.7 + 3.3) / 3 = 3.43
```

---

## API Endpoints

### Courses
- `POST /grades/courses` - Create course
- `GET /grades/courses` - List user's courses
- `DELETE /grades/courses/{id}` - Delete course (cascade)

### Components
- `POST /grades/components` - Create grade component
- `GET /grades/components?course_id={id}` - List components for course
- `DELETE /grades/components/{id}` - Delete component (cascade)

### Entries
- `POST /grades/entries` - Create grade entry
- `GET /grades/entries?course_id={id}` - List entries for course
- `DELETE /grades/entries/{id}` - Delete entry

### Stats
- `GET /grades/study-hours` - Get total study hours

---

## Key Design Decisions

### 1. Why Weighted Components?
**Decision:** Support flexible grading with weighted categories
**Reasoning:**
- Reflects real academic grading systems
- Different assessments have different importance
- Allows accurate GPA calculation
- Flexible for various course structures

### 2. Why Store Individual Entries?
**Decision:** Store each assessment separately instead of just component averages
**Reasoning:**
- Track individual performance over time
- See grade trends (improving/declining)
- Allows "what-if" scenarios (dropping lowest grade)
- More detailed analytics

### 3. Why Client-Side GPA Calculation?
**Decision:** Calculate GPA in frontend instead of backend endpoint
**Reasoning:**
- Instant updates without API calls
- No additional database queries
- Simple formula, no complex logic
- Easy to recalculate on data changes

**Trade-off:** GPA not stored in database (recalculated each time)

### 4. Why Separate study_sessions Table?
**Decision:** Track study time separately from grade data
**Reasoning:**
- Study time ≠ grade achievement
- Different tracking mechanism (start/stop timer)
- Can analyze time vs. grade correlation
- Independent feature from grade tracking

---

## Common Issues & Solutions

### Issue 1: Weights Don't Sum to 100%
**Problem:** Components add up to 95% or 105%
**Solution:** Display warning, still calculate with available weights
```typescript
if (totalWeight !== 100) {
  // Normalize to 100%
  const normalizedGrade = (weightedSum / totalWeight) * 100;
}
```

### Issue 2: Course Grade Shows "N/A"
**Causes:**
- No components defined
- No entries added
- All entries have 0 max_score

**Solutions:**
- Add at least one component
- Add at least one grade entry
- Ensure max_score > 0

### Issue 3: GPA Calculation Incorrect
**Cause:** Percentage to letter grade cutoffs vary by institution
**Solution:** Make cutoffs configurable
```typescript
// Could move to user settings
const gradeScale = {
  A: 93, A_minus: 90,
  B_plus: 87, B: 83, // etc.
};
```

---

## Complete API Reference

### Grades Router (`/grades`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| POST | `/grades/courses` | Yes | Create a new course | `CourseCreate` | `CourseOut` |
| GET | `/grades/courses` | Yes | Get all user's courses | - | `List[CourseOut]` |
| GET | `/grades/courses/{course_id}` | Yes | Get specific course | - | `CourseOut` |
| DELETE | `/grades/courses/{course_id}` | Yes | Delete a course | - | `{message}` |
| POST | `/grades/courses/{course_id}/components` | Yes | Add grade component | `GradeComponentCreate` | `GradeComponentOut` |
| DELETE | `/grades/components/{component_id}` | Yes | Delete component | - | `{message}` |
| POST | `/grades/courses/{course_id}/entries` | Yes | Add grade entry | `GradeEntryCreate` | `GradeEntryOut` |
| DELETE | `/grades/entries/{entry_id}` | Yes | Delete entry | - | `{message}` |
| GET | `/grades/courses/{course_id}/grade` | Yes | Calculate course grade | - | `{weighted_grade, letter_grade, gpa}` |
| POST | `/grades/study-session/start` | Yes | Start study timer | `{course_id}` | `StudySessionOut` |
| POST | `/grades/study-session/end` | Yes | End study timer | `{session_id}` | `{total_seconds}` |
| GET | `/grades/study-session/active` | Yes | Get active study session | - | `StudySessionOut or null` |
| GET | `/grades/study-hours` | Yes | Get total study time | - | `{total_seconds}` |

### Example Requests

**1. Create Course:**
```bash
POST /grades/courses
Headers: Authorization: Bearer <token>
Body: {
  "name": "Calculus I",
  "code": "MATH 101",
  "credits": 4,
  "semester": "Fall 2025",
  "color": "#2196f3"
}
Response: {
  "id": 1,
  "student_id": 5,
  "name": "Calculus I",
  "code": "MATH 101",
  "credits": 4,
  "semester": "Fall 2025",
  "color": "#2196f3"
}
```

**2. Add Grade Component:**
```bash
POST /grades/courses/1/components
Headers: Authorization: Bearer <token>
Body: {
  "name": "Midterm",
  "weight": 30
}
Response: {
  "id": 1,
  "course_id": 1,
  "name": "Midterm",
  "weight": 30
}
```

**3. Add Grade Entry:**
```bash
POST /grades/courses/1/entries
Headers: Authorization: Bearer <token>
Body: {
  "component_id": 1,
  "name": "Midterm Exam 1",
  "score": 85,
  "max_score": 100
}
```

**4. Calculate Course Grade:**
```bash
GET /grades/courses/1/grade
Headers: Authorization: Bearer <token>
Response: {
  "weighted_grade": 87.5,
  "letter_grade": "B+",
  "gpa": 3.3,
  "component_grades": [
    {"component": "Midterm", "average": 85.0, "weight": 30}
  ]
}
```

**5. Start Study Timer:**
```bash
POST /grades/study-session/start
Headers: Authorization: Bearer <token>
Body: {"course_id": 1}
Response: {
  "id": 1,
  "student_id": 5,
  "course_id": 1,
  "start_time": "2025-12-10T15:30:00Z",
  "end_time": null
}
```

**6. End Study Timer:**
```bash
POST /grades/study-session/end
Headers: Authorization: Bearer <token>
Body: {"session_id": 1}
Response: {
  "total_seconds": 3600,
  "formatted": "1h 0m"
}
```

---

## Future Enhancements

1. **Grade Prediction:** "What grade do I need on final to get an A?"
2. **Trend Analysis:** Graph showing grade progression over time
3. **Custom Grade Scales:** User-defined letter grade cutoffs
4. **Credit Hours:** Weight GPA by credit hours
5. **Cumulative GPA:** Track GPA across semesters
6. **Grade Export:** CSV/PDF export of grade data
7. **Target Grades:** Set goals and track progress
8. **Grade Distribution:** Show percentile ranking
9. **What-If Calculator:** Simulate grade scenarios
10. **Semester Comparison:** Compare performance across semesters
