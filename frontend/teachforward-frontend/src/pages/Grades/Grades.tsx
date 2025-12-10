import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  School,
  Assignment,
  Timer,
  TrendingUp,
} from '@mui/icons-material';
import AIChatbot from '../../components/AIChatbot/AIChatbot';

interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  semester: string;
  color: string;
}

interface GradeComponent {
  id: number;
  course_id: number;
  name: string;
  weight: number;
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

const Grades: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openComponentDialog, setOpenComponentDialog] = useState(false);
  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studyTime, setStudyTime] = useState(0);

  // Course form
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseSemester, setCourseSemester] = useState('Fall 2025');

  // Grade component form (category like "Homework", "Midterm")
  const [componentName, setComponentName] = useState('');
  const [componentWeight, setComponentWeight] = useState(0);

  // Grade entry form (individual grades like "Homework 1: 85/100")
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [entryName, setEntryName] = useState('');
  const [entryScore, setEntryScore] = useState(0);
  const [entryMaxScore, setEntryMaxScore] = useState(100);

  // Track study time
  useEffect(() => {
    const startTime = Date.now();
    
    const updateStudyTime = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setStudyTime(prev => prev + elapsed);
      
      // Save to backend
      const token = localStorage.getItem('access_token');
      if (token) {
        fetch('http://localhost:8000/grades/study-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ duration: elapsed }),
        }).catch(console.error);
      }
    };

    const interval = setInterval(updateStudyTime, 60000); // Update every minute
    
    return () => {
      clearInterval(interval);
      updateStudyTime(); // Save final time
    };
  }, []);

  // Load data
  useEffect(() => {
    loadCourses();
    loadStudyTime();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch('http://localhost:8000/grades/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const loadGradeComponents = async (courseId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch(`http://localhost:8000/grades/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Backend returns course with grade_components and grade_entries
        setGradeComponents(data.grade_components || []);
        setGradeEntries(data.grade_entries || []);
      }
    } catch (err) {
      console.error('Failed to load grade data:', err);
    }
  };

  const loadStudyTime = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch('http://localhost:8000/grades/study-time/total', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudyTime(data.total_seconds || 0);
      }
    } catch (err) {
      console.error('Failed to load study time:', err);
    }
  };

  const handleAddCourse = async () => {
    if (!courseName.trim() || !courseCode.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/grades/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: courseName,
          code: courseCode,
          credits: courseCredits,
          semester: courseSemester,
          color: getRandomColor(),
        }),
      });

      if (res.ok) {
        await loadCourses();
        setOpenCourseDialog(false);
        resetCourseForm();
      } else {
        setError('Failed to add course');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGradeComponent = async () => {
    if (!selectedCourse || !componentName.trim() || componentWeight <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/grades/courses/${selectedCourse}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: componentName,
          weight: componentWeight,
        }),
      });

      if (res.ok) {
        await loadGradeComponents(selectedCourse);
        setOpenComponentDialog(false);
        resetComponentForm();
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Failed to add grade component');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGradeEntry = async () => {
    if (!selectedCourse || !selectedComponent || !entryName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/grades/courses/${selectedCourse}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          component_id: selectedComponent,
          name: entryName,
          score: entryScore,
          max_score: entryMaxScore,
        }),
      });

      if (res.ok) {
        await loadGradeComponents(selectedCourse);
        setOpenEntryDialog(false);
        resetEntryForm();
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Failed to add grade entry');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseGrade = (courseId: number): number => {
    const components = gradeComponents.filter(gc => gc.course_id === courseId);
    if (components.length === 0) return 0;

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    components.forEach(comp => {
      // Get all entries for this component
      const entries = gradeEntries.filter(e => e.component_id === comp.id);
      
      if (entries.length > 0) {
        // Calculate average percentage for this component
        const componentAvg = entries.reduce((sum, entry) => {
          return sum + (entry.score / entry.max_score) * 100;
        }, 0) / entries.length;
        
        totalWeightedGrade += componentAvg * comp.weight;
        totalWeight += comp.weight;
      }
    });

    return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
  };

  const calculateOverallGPA = (): number => {
    if (courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const grade = calculateCourseGrade(course.id);
      const gpa = gradeToGPA(grade);
      totalPoints += gpa * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateOverallAverageGrade = (): number => {
    if (courses.length === 0) return 0;

    const grades = courses.map(course => calculateCourseGrade(course.id));
    const validGrades = grades.filter(g => g > 0);
    
    if (validGrades.length === 0) return 0;
    
    return validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
  };

  const gradeToGPA = (percentage: number): number => {
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.7;
    if (percentage >= 87) return 3.3;
    if (percentage >= 83) return 3.0;
    if (percentage >= 80) return 2.7;
    if (percentage >= 77) return 2.3;
    if (percentage >= 73) return 2.0;
    if (percentage >= 70) return 1.7;
    if (percentage >= 67) return 1.3;
    if (percentage >= 65) return 1.0;
    return 0.0;
  };

  const gradeToLetter = (percentage: number): string => {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  const getRandomColor = () => {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const resetCourseForm = () => {
    setCourseName('');
    setCourseCode('');
    setCourseCredits(3);
    setCourseSemester('Fall 2025');
  };

  const resetComponentForm = () => {
    setComponentName('');
    setComponentWeight(0);
  };

  const resetEntryForm = () => {
    setSelectedComponent(null);
    setEntryName('');
    setEntryScore(0);
    setEntryMaxScore(100);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Grade Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your coursework, assignments, and study time
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall GPA</Typography>
              </Box>
              <Typography variant="h3">{calculateOverallGPA().toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Based on {courses.length} courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h3">
                {calculateOverallAverageGrade() > 0 
                  ? `${Math.round(calculateOverallAverageGrade())}%` 
                  : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {gradeToLetter(calculateOverallAverageGrade())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Courses</Typography>
              </Box>
              <Typography variant="h3">{courses.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                This semester
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timer color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Study Hours</Typography>
              </Box>
              <Typography variant="h3">{formatStudyTime(studyTime)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total time tracked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Course Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCourseDialog(true)}
        >
          Add Course
        </Button>
      </Box>

      {/* Courses List */}
      <Grid container spacing={3}>
        {courses.map((course) => {
          const courseGrade = calculateCourseGrade(course.id);
          const letterGrade = gradeToLetter(courseGrade);
          const courseComponents = gradeComponents.filter(gc => gc.course_id === course.id);

          return (
            <Grid size={{ xs: 12 }} key={course.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h5">{course.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.code} • {course.credits} credits • {course.semester}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={letterGrade} 
                        color={courseGrade >= 90 ? 'success' : courseGrade >= 80 ? 'primary' : courseGrade >= 70 ? 'warning' : 'error'}
                        sx={{ fontSize: '1.2rem', fontWeight: 'bold', px: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {courseGrade.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        loadGradeComponents(course.id);
                        setOpenComponentDialog(true);
                      }}
                    >
                      Add Grade Category
                    </Button>
                    {courseComponents.length > 0 && (
                      <Button
                        size="small"
                        startIcon={<Add />}
                        variant="contained"
                        onClick={() => {
                          setSelectedCourse(course.id);
                          loadGradeComponents(course.id);
                          setOpenEntryDialog(true);
                        }}
                      >
                        Add Grade Entry
                      </Button>
                    )}
                  </Box>

                  {courseComponents.length > 0 && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell align="right">Weight</TableCell>
                            <TableCell align="right">Entries</TableCell>
                            <TableCell align="right">Average</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {courseComponents.map((comp) => {
                            const entries = gradeEntries.filter(e => e.component_id === comp.id);
                            const hasEntries = entries.length > 0;
                            const avgPercentage = hasEntries 
                              ? entries.reduce((sum, e) => sum + (e.score / e.max_score) * 100, 0) / entries.length 
                              : 0;
                            
                            return (
                              <TableRow key={comp.id}>
                                <TableCell>{comp.name}</TableCell>
                                <TableCell align="right">{comp.weight}%</TableCell>
                                <TableCell align="right">{entries.length} entries</TableCell>
                                <TableCell align="right">
                                  {hasEntries ? (
                                    <Chip 
                                      label={`${avgPercentage.toFixed(1)}%`}
                                      size="small"
                                      color={avgPercentage >= 90 ? 'success' : avgPercentage >= 80 ? 'primary' : avgPercentage >= 70 ? 'warning' : 'error'}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      setSelectedCourse(course.id);
                                      setSelectedComponent(comp.id);
                                      setOpenEntryDialog(true);
                                    }}
                                  >
                                    <Add fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error">
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Show individual grade entries */}
                  {gradeEntries.filter(e => e.course_id === course.id).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Individual Grades</Typography>
                      {gradeEntries.filter(e => e.course_id === course.id).map((entry) => {
                        const component = gradeComponents.find(c => c.id === entry.component_id);
                        const percentage = (entry.score / entry.max_score) * 100;
                        return (
                          <Chip
                            key={entry.id}
                            label={`${component?.name}: ${entry.name} - ${entry.score}/${entry.max_score} (${percentage.toFixed(1)}%)`}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            onDelete={() => {/* TODO: implement delete */}}
                          />
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Course Dialog */}
      <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Credits"
              type="number"
              value={courseCredits}
              onChange={(e) => setCourseCredits(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1, max: 6 }}
            />
            <TextField
              label="Semester"
              value={courseSemester}
              onChange={(e) => setCourseSemester(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCourse} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Grade Component Dialog (Category like Homework, Midterm) */}
      <Dialog open={openComponentDialog} onClose={() => setOpenComponentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Grade Category</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category Type</InputLabel>
              <Select
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                label="Category Type"
              >
                <MenuItem value="Homework">Homework</MenuItem>
                <MenuItem value="Quiz">Quiz</MenuItem>
                <MenuItem value="Midterm">Midterm</MenuItem>
                <MenuItem value="Final">Final Exam</MenuItem>
                <MenuItem value="Project">Project</MenuItem>
                <MenuItem value="Participation">Participation</MenuItem>
                <MenuItem value="Attendance">Attendance</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Weight (%)"
              type="number"
              value={componentWeight}
              onChange={(e) => setComponentWeight(parseFloat(e.target.value))}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Percentage of final grade (e.g., Homework = 30%)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComponentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddGradeComponent} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Grade Entry Dialog (Individual grade like "Homework 1: 85/100") */}
      <Dialog open={openEntryDialog} onClose={() => setOpenEntryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Grade Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedComponent || ''}
                onChange={(e) => setSelectedComponent(Number(e.target.value))}
                label="Category"
              >
                {gradeComponents.filter(gc => gc.course_id === selectedCourse).map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.name} ({comp.weight}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Assignment Name"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              fullWidth
              placeholder="e.g., Homework 1, Quiz 3, etc."
            />
            <TextField
              label="Score Earned"
              type="number"
              value={entryScore}
              onChange={(e) => setEntryScore(parseFloat(e.target.value))}
              fullWidth
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label="Maximum Score"
              type="number"
              value={entryMaxScore}
              onChange={(e) => setEntryMaxScore(parseFloat(e.target.value))}
              fullWidth
              inputProps={{ min: 0, step: 0.1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Example: Homework 1 scored 85 out of 100
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEntryDialog(false)}>Cancel</Button>
          <Button onClick={handleAddGradeEntry} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Grade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Chatbot */}
      <AIChatbot />
    </Container>
  );
};

export default Grades;
