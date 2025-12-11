import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  Assignment,
  TrendingUp,
  Add,
  CalendarToday,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AIChatbot from '../../components/AIChatbot/AIChatbot';

interface Session {
  id: number;
  tutor_id: number;
  student_id: number;
  start: string;
  end: string;
  topic: string;
  status: string;
}

interface AssignmentData {
  id: number;
  title: string;
  description: string;
  due_date: string;
  tutor_id: number;
}

interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  grade: string | null;
  created_at: string;
}

interface Progress {
  total_sessions: number;
  total_hours: number;
  average_grade: number | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'session' | 'assignment' | 'custom';
  description?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('User');
  
  // Real data from API
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progress, setProgress] = useState<Progress>({
    total_sessions: 0,
    total_hours: 0,
    average_grade: null,
  });
  const [courseGrades, setCourseGrades] = useState<number[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  useEffect(() => {
    // Load custom events from localStorage
    const savedEvents = localStorage.getItem('customCalendarEvents');
    if (savedEvents) {
      setCustomEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch user info
      const userRes = await fetch('http://localhost:8000/auth/me', { headers });
      if (userRes.ok) {
        const user = await userRes.json();
        setUserName(user.full_name || user.email);
      }

      // Fetch sessions (for both students and tutors)
      const sessionsRes = await fetch('http://localhost:8000/sessions/my-sessions', { headers });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData || []);
      }

      // Fetch assignments
      const assignmentsRes = await fetch('http://localhost:8000/homework/assignments', { headers });
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData || []);
      }

      // Fetch submissions
      const submissionsRes = await fetch('http://localhost:8000/homework/submissions', { headers });
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData || []);
      }

      // Fetch progress
      const progressRes = await fetch('http://localhost:8000/progress/', { headers });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData || { total_sessions: 0, total_hours: 0, average_grade: null });
      }

      // Fetch courses and calculate average grade
      const coursesRes = await fetch('http://localhost:8000/grades/courses', { headers });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const grades = [];
        for (const course of coursesData) {
          const gradeRes = await fetch(`http://localhost:8000/grades/courses/${course.id}/grade`, { headers });
          if (gradeRes.ok) {
            const gradeData = await gradeRes.json();
            if (gradeData.weighted_grade !== null) {
              grades.push(gradeData.weighted_grade);
            }
          }
        }
        setCourseGrades(grades);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPendingAssignments = () => {
    const submittedIds = submissions.map(s => s.assignment_id);
    return assignments.filter(a => !submittedIds.includes(a.id));
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions
      .filter(s => new Date(s.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  };

  const getCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    
    // Add upcoming sessions
    sessions.forEach(session => {
      if (new Date(session.start) > new Date()) {
        events.push({
          id: `session-${session.id}`,
          title: session.topic || 'Tutoring Session',
          date: formatDate(session.start),
          time: formatTime(session.start),
          type: 'session',
        });
      }
    });
    
    // Add pending assignments
    getPendingAssignments().forEach(assignment => {
      events.push({
        id: `assignment-${assignment.id}`,
        title: assignment.title,
        date: formatDate(assignment.due_date),
        time: '',
        type: 'assignment',
      });
    });
    
    // Add custom events
    customEvents.forEach(event => {
      events.push(event);
    });
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleAddCustomEvent = () => {
    if (!eventTitle || !eventDate) return;
    
    const newEvent: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      type: 'custom',
      description: eventDescription,
    };
    
    const updatedEvents = [...customEvents, newEvent];
    setCustomEvents(updatedEvents);
    localStorage.setItem('customCalendarEvents', JSON.stringify(updatedEvents));
    
    // Reset form
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventDescription('');
    setOpenEventDialog(false);
  };

  const handleDeleteCustomEvent = (eventId: string) => {
    const updatedEvents = customEvents.filter(e => e.id !== eventId);
    setCustomEvents(updatedEvents);
    localStorage.setItem('customCalendarEvents', JSON.stringify(updatedEvents));
  };

  const calculateAverageGrade = (): string => {
    if (courseGrades.length === 0) return 'N/A';
    const avg = courseGrades.reduce((sum, grade) => sum + grade, 0) / courseGrades.length;
    return `${Math.round(avg)}%`;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {userName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your learning dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Sessions
                  </Typography>
                  <Typography variant="h4">{progress.total_sessions}</Typography>
                </Box>
                <Schedule color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Assignments
                  </Typography>
                  <Typography variant="h4">{getPendingAssignments().length}</Typography>
                </Box>
                <Assignment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Average Grade
                  </Typography>
                  <Typography variant="h4">
                    {calculateAverageGrade()}
                  </Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Study Hours
                  </Typography>
                  <Typography variant="h4">{progress.total_hours}h</Typography>
                </Box>
                <VideoCall color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Upcoming Sessions</Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                onClick={() => navigate('/sessions')}
              >
                Book Session
              </Button>
            </Box>
            
            {getUpcomingSessions().length === 0 ? (
              <Alert severity="info">
                No upcoming sessions. Book a tutoring session to get started!
              </Alert>
            ) : (
              <List>
                {getUpcomingSessions().map((session) => (
                  <ListItem
                    key={session.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={session.topic || 'Session'}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {formatDate(session.start)} at {formatTime(session.start)}
                          </Typography>
                          <br />
                          <Chip
                            label={session.status}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Assignments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Assignments</Typography>
              <Button
                startIcon={<Assignment />}
                variant="outlined"
                size="small"
                onClick={() => navigate('/homework')}
              >
                View All
              </Button>
            </Box>
            
            {getPendingAssignments().length === 0 ? (
              <Alert severity="success">
                All caught up! No pending assignments.
              </Alert>
            ) : (
              <List>
                {getPendingAssignments().slice(0, 3).map((assignment) => (
                  <ListItem
                    key={assignment.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <>
                          {assignment.description && (
                            <>
                              <Typography component="span" variant="body2">
                                {assignment.description.substring(0, 50)}
                                {assignment.description.length > 50 ? '...' : ''}
                              </Typography>
                              <br />
                            </>
                          )}
                          <Typography component="span" variant="body2" color="error">
                            Due: {formatDate(assignment.due_date)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Calendar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Calendar</Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                onClick={() => setOpenEventDialog(true)}
              >
                Add Event
              </Button>
            </Box>
            
            {getCalendarEvents().length === 0 ? (
              <Alert severity="info">
                No upcoming events. Schedule a session or check your assignments!
              </Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {getCalendarEvents().slice(0, 7).map((event) => (
                  <ListItem
                    key={event.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: event.type === 'session' ? 'primary.50' : event.type === 'assignment' ? 'warning.50' : 'success.50',
                    }}
                    secondaryAction={
                      event.type === 'custom' ? (
                        <IconButton edge="end" onClick={() => handleDeleteCustomEvent(event.id)} color="error">
                          <Delete />
                        </IconButton>
                      ) : null
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {event.type === 'session' && <Schedule fontSize="small" />}
                          {event.type === 'assignment' && <Assignment fontSize="small" />}
                          {event.type === 'custom' && <CalendarToday fontSize="small" />}
                          <Typography variant="subtitle2">{event.title}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {event.date}
                          </Typography>
                          {event.time && (
                            <>
                              {' • '}
                              <Typography component="span" variant="body2">
                                {event.time}
                              </Typography>
                            </>
                          )}
                          {event.description && (
                            <>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                            </>
                          )}
                          <br />
                          <Chip
                            label={event.type === 'session' ? 'Session' : event.type === 'assignment' ? 'Assignment' : 'Event'}
                            size="small"
                            color={event.type === 'session' ? 'primary' : event.type === 'assignment' ? 'warning' : 'success'}
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/sessions')}
                  sx={{ py: 2 }}
                >
                  Book Session
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/homework')}
                  sx={{ py: 2 }}
                >
                  View Homework
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VideoCall />}
                  onClick={() => navigate('/chat')}
                  sx={{ py: 2 }}
                >
                  Start Chat
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/study-tools')}
                  sx={{ py: 2 }}
                >
                  Study Tools
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Custom Event Dialog */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g., Study Session, Exam, Meeting"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Time (Optional)"
            type="time"
            fullWidth
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Add any notes or details..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddCustomEvent}
            variant="contained"
            disabled={!eventTitle || !eventDate}
          >
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Chatbot */}
      <AIChatbot />
    </Container>
  );
};

export default Dashboard;
