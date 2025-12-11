import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  Add,
  Delete,
} from '@mui/icons-material';
import AIChatbot from '../../components/AIChatbot/AIChatbot';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

interface Tutor {
  id: number;
  full_name: string;
  email: string;
  role: string;
  subjects?: string;
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

const Sessions: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<string>('student');
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
  const [duration, setDuration] = useState(60);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [status, setStatus] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchUserRole();
    fetchTutors();
    fetchMySessions();
  }, []);

  useEffect(() => {
    if (userRole === 'tutor') {
      fetchMyStudents();
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  const fetchMyStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Use all-students endpoint to get all registered students for homework assignment
      const res = await fetch('http://localhost:8000/sessions/all-students', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTutors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/sessions/tutors', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTutors(data);
      }
    } catch (err) {
      console.error('Error fetching tutors:', err);
    }
  };

  const fetchMySessions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/sessions/my-sessions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setSnackbarMessage('Session deleted successfully');
        setSnackbarOpen(true);
        fetchMySessions();
      } else {
        const errorData = await res.json();
        setSnackbarMessage(errorData.detail || 'Failed to delete session');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setSnackbarMessage('Failed to delete session');
      setSnackbarOpen(true);
    }
  };

  const handleBookSession = async () => {
    if (!selectedTutor || !topic || !startTime) {
      setStatus('Please fill all fields');
      return;
    }

    try {
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('Session booked successfully!');
        setOpenBookDialog(false);
        setTopic('');
        setSelectedTutor(null);
        setStartTime(dayjs());
        fetchMySessions();
      } else {
        const error = await res.json();
        setStatus(error.detail || 'Failed to book session');
      }
    } catch (err) {
      setStatus('Error booking session');
    }
  };

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

  const handleAssignHomework = async () => {
    if (!assignmentTitle) {
      setStatus('Please enter assignment title');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        title: assignmentTitle,
        description: assignmentDescription,
        due_date: assignmentDueDate?.toISOString(),
        student_id: selectedStudent,
        session_id: selectedSession,
      };

      const res = await fetch('http://localhost:8000/sessions/assign-homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('Assignment created successfully!');
        setOpenAssignDialog(false);
        setAssignmentTitle('');
        setAssignmentDescription('');
        setAssignmentDueDate(dayjs().add(7, 'day'));
        setSelectedStudent(null);
        setSelectedSession(null);
      } else {
        const error = await res.json();
        setStatus(error.detail || 'Failed to create assignment');
      }
    } catch (err) {
      setStatus('Error creating assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tutoring Sessions
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Book sessions with qualified tutors
          </Typography>
        </Box>

        {status && (
          <Alert
            severity={status.includes('success') ? 'success' : 'error'}
            sx={{ mb: 2 }}
            onClose={() => setStatus('')}
          >
            {status}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          {userRole === 'student' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenBookDialog(true)}
              size="large"
            >
              Book New Session
            </Button>
          )}
          {userRole === 'tutor' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenAssignDialog(true)}
              size="large"
              color="secondary"
            >
              Assign Homework
            </Button>
          )}
        </Box>

        {/* My Sessions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            My Sessions
          </Typography>
          {sessions.length === 0 ? (
            <Alert severity="info">No sessions booked yet. Book your first session!</Alert>
          ) : (
            <Grid container spacing={3}>
              {sessions.map((session) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={session.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{session.topic}</Typography>
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule fontSize="small" />
                        <Typography variant="body2">
                          {formatDateTime(session.start)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      {session.zoom_link && (
                        <Button
                          size="small"
                          startIcon={<VideoCall />}
                          href={session.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Zoom Meeting
                        </Button>
                      )}
                      <Button
                        size="small"
                        onClick={() => window.location.href = `/session/${session.id}`}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Available Tutors */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Available Tutors
          </Typography>
          <Grid container spacing={3}>
            {tutors.map((tutor) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tutor.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {tutor.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{tutor.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tutor.email}
                        </Typography>
                      </Box>
                    </Box>
                    {tutor.subjects && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
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
                  </CardContent>
                  <CardActions>
                    {userRole === 'student' && (
                      <Button
                        size="small"
                        startIcon={<Schedule />}
                        onClick={() => {
                          setSelectedTutor(tutor.id);
                          setOpenBookDialog(true);
                        }}
                      >
                        Book Session
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Book Session Dialog */}
        <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book Tutoring Session</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Select Tutor"
                value={selectedTutor || ''}
                onChange={(e) => setSelectedTutor(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Choose a tutor...</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.full_name}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Calculus - Derivatives"
                fullWidth
              />

              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                minDateTime={dayjs()}
              />

              <TextField
                select
                label="Duration (minutes)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
            <Button onClick={handleBookSession} variant="contained">
              Book Session
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Homework Dialog */}
        <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Homework</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}
                  label="Select Student"
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                select
                label="Link to Session (Optional)"
                value={selectedSession || ''}
                onChange={(e) => setSelectedSession(e.target.value ? Number(e.target.value) : null)}
                SelectProps={{
                  native: true,
                }}
                helperText="Link assignment to a specific session"
              >
                <option value="">No Session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.topic} - {formatDateTime(session.start)}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Assignment Title"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="e.g., Complete Chapter 5 Exercises"
                fullWidth
                required
              />

              <TextField
                label="Description"
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                placeholder="Detailed instructions..."
                multiline
                rows={4}
                fullWidth
              />

              <DateTimePicker
                label="Due Date"
                value={assignmentDueDate}
                onChange={(newValue) => setAssignmentDueDate(newValue)}
                minDateTime={dayjs()}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignHomework} variant="contained">
              Create Assignment
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI Chatbot */}
        <AIChatbot />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default Sessions;
