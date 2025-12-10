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
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Upload,
  Download,
  Assignment,
  Schedule,
  FileUpload,
} from '@mui/icons-material';
import AIChatbot from '../../components/AIChatbot/AIChatbot';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

interface AssignmentData {
  id: number;
  tutor_id: number;
  title: string;
  description: string;
  due_date: string;
}

interface SubmissionData {
  id: number;
  assignment_id: number;
  student_id: number;
  file_path: string;
  grade: string | null;
  feedback: string | null;
  created_at: string;
}

const Homework: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: dayjs() as Dayjs | null,
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/homework/assignments', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/homework/my-submissions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const fd = new FormData();
      fd.append('title', newAssignment.title);
      fd.append('description', newAssignment.description);
      if (newAssignment.due_date) {
        fd.append('due_date', newAssignment.due_date.toISOString());
      }

      const res = await fetch('http://localhost:8000/homework/create', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (res.ok) {
        setStatus('Assignment created successfully');
        setOpenCreateDialog(false);
        setNewAssignment({ title: '', description: '', due_date: dayjs() });
        fetchAssignments();
      } else {
        setStatus('Failed to create assignment');
      }
    } catch (err) {
      setStatus('Error creating assignment');
    }
  };

  const handleSubmitHomework = async () => {
    if (!file || !selectedAssignment) {
      setStatus('Please select a file');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const fd = new FormData();
      fd.append('assignment_id', selectedAssignment.toString());
      fd.append('file', file);

      const res = await fetch('http://localhost:8000/homework/submit', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (res.ok) {
        await res.json();
        setStatus('Homework submitted successfully');
        setOpenSubmitDialog(false);
        setFile(null);
        setSelectedAssignment(null);
        fetchSubmissions();
      } else {
        setStatus('Submission failed');
      }
    } catch (err) {
      setStatus('Error submitting homework');
    }
  };

  const getStatusColor = (grade: string | null) => {
    if (!grade) return 'warning';
    const numGrade = parseInt(grade);
    if (numGrade >= 90) return 'success';
    if (numGrade >= 70) return 'info';
    return 'error';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Homework & Assignments
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your assignments and submissions
          </Typography>
        </Box>

        {status && (
          <Alert severity={status.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setStatus('')}>
            {status}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="All Assignments" icon={<Assignment />} />
            <Tab label="My Submissions" icon={<Upload />} />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Available Assignments</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Assignment
              </Button>
            </Box>

            <Grid container spacing={3}>
              {assignments.map((assignment) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={assignment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule fontSize="small" />
                        <Typography variant="caption">
                          Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Upload />}
                        onClick={() => {
                          setSelectedAssignment(assignment.id);
                          setOpenSubmitDialog(true);
                        }}
                      >
                        Submit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              My Submissions
            </Typography>

            <List>
              {submissions.map((submission) => {
                const assignment = assignments.find(a => a.id === submission.assignment_id);
                return (
                  <Card key={submission.id} sx={{ mb: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1">
                              {assignment?.title || `Assignment #${submission.assignment_id}`}
                            </Typography>
                            <Chip
                              label={submission.grade ? `Grade: ${submission.grade}` : 'Pending'}
                              color={getStatusColor(submission.grade) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Submitted: {new Date(submission.created_at).toLocaleString()}
                            </Typography>
                            {submission.feedback && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Feedback: {submission.feedback}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <IconButton>
                        <Download />
                      </IconButton>
                    </ListItem>
                  </Card>
                );
              })}
            </List>
          </Box>
        )}

        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                label="Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
              />
              <DateTimePicker
                label="Due Date"
                value={newAssignment.due_date}
                onChange={(newValue) => setNewAssignment({ ...newAssignment, due_date: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAssignment} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit Homework</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Typography variant="body2">
                Upload your homework file (PDF, DOC, or image)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUpload />}
                fullWidth
              >
                {file ? file.name : 'Choose File'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitHomework} variant="contained" disabled={!file}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI Chatbot */}
        <AIChatbot />
      </Container>
    </LocalizationProvider>
  );
};

export default Homework;
