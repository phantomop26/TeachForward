import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  Assignment,
  TrendingUp,
  Person,
  Add,
  Edit,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

interface Session {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  duration: number;
}

interface AssignmentData {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
}

const Dashboard: React.FC = () => {
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');

  // Mock data - in a real app, this would come from an API
  const upcomingSessions: Session[] = [
    {
      id: '1',
      tutorName: 'Dr. Sarah Wilson',
      subject: 'Mathematics',
      date: '2025-10-17',
      time: '14:00',
      status: 'upcoming',
      duration: 60,
    },
    {
      id: '2',
      tutorName: 'Prof. Michael Brown',
      subject: 'Physics',
      date: '2025-10-19',
      time: '10:00',
      status: 'upcoming',
      duration: 90,
    },
    {
      id: '3',
      tutorName: 'Ms. Emily Davis',
      subject: 'Chemistry',
      date: '2025-10-20',
      time: '16:00',
      status: 'upcoming',
      duration: 60,
    },
  ];

  const assignments: AssignmentData[] = [
    {
      id: '1',
      title: 'Calculus Problem Set',
      subject: 'Mathematics',
      dueDate: '2025-10-18',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      subject: 'Physics',
      dueDate: '2025-10-20',
      status: 'submitted',
    },
    {
      id: '3',
      title: 'Chemical Equations Quiz',
      subject: 'Chemistry',
      dueDate: '2025-10-15',
      status: 'graded',
      score: 85,
    },
  ];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
  const tutors = ['Dr. Sarah Wilson', 'Prof. Michael Brown', 'Ms. Emily Davis', 'Dr. John Smith'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      case 'submitted': return 'info';
      case 'graded': return 'success';
      default: return 'default';
    }
  };

  const handleScheduleSession = () => {
    // Handle session scheduling logic here
    console.log('Scheduling session:', {
      date: selectedDate,
      subject: selectedSubject,
      tutor: selectedTutor,
    });
    setOpenScheduleDialog(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, Student!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's your learning dashboard
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VideoCall color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">8</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sessions This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">3</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Assignments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">87%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">24h</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Study Time
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Upcoming Sessions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Upcoming Sessions</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenScheduleDialog(true)}
                >
                  Schedule Session
                </Button>
              </Box>
              
              <List>
                {upcomingSessions.map((session) => (
                  <ListItem key={session.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{session.subject}</Typography>
                          <Chip
                            label={session.status}
                            color={getStatusColor(session.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">Tutor: {session.tutorName}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <CalendarToday fontSize="small" />
                            <Typography variant="body2">{session.date}</Typography>
                            <AccessTime fontSize="small" />
                            <Typography variant="body2">{session.time} ({session.duration}min)</Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Button variant="outlined" size="small">
                      Join Session
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Assignments */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Assignments</Typography>
              <List>
                {assignments.map((assignment) => (
                  <ListItem key={assignment.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{assignment.title}</Typography>
                          <Chip
                            label={assignment.status}
                            color={getStatusColor(assignment.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">Subject: {assignment.subject}</Typography>
                          <Typography variant="body2">Due: {assignment.dueDate}</Typography>
                          {assignment.score && (
                            <Typography variant="body2" color="success.main">
                              Score: {assignment.score}%
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <IconButton>
                      <Edit />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Progress Tracking */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Subject Progress</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mathematics</Typography>
                  <Typography variant="body2">85%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Physics</Typography>
                  <Typography variant="body2">72%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={72} />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Chemistry</Typography>
                  <Typography variant="body2">90%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={90} />
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth startIcon={<VideoCall />}>
                  Start Study Session
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Assignment />}>
                  Submit Assignment
                </Button>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                  View Progress Report
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Schedule Session Dialog */}
        <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule New Session</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                fullWidth
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Tutor"
                value={selectedTutor}
                onChange={(e) => setSelectedTutor(e.target.value)}
                fullWidth
              >
                {tutors.map((tutor) => (
                  <MenuItem key={tutor} value={tutor}>
                    {tutor}
                  </MenuItem>
                ))}
              </TextField>
              
              <DateTimePicker
                label="Date and Time"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleScheduleSession} variant="contained">Schedule</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;
