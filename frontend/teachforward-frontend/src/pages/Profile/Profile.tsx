import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Edit,
  Settings,
  School,
  TrendingUp,
  Security,
  Help,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  EmojiEvents,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);

  // Real user data from API
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    grade: '',
    school: '',
    location: '',
    joinDate: '',
    bio: '',
    subjects: [] as string[],
    goals: '',
    studyStyle: '',
    avatar: '',
    role: '',
    
    // Settings
    emailNotifications: true,
    smsNotifications: false,
    studyReminders: true,
    sessionReminders: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  const [stats, setStats] = useState({
    totalSessions: 0,
    completedAssignments: 0,
    averageScore: 0,
    hoursLearned: 0,
  });

  // Fetch user data and stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch user profile
        const userRes = await fetch('http://localhost:8000/auth/me', { headers });
        if (userRes.ok) {
          const user = await userRes.json();
          const nameParts = (user.full_name || '').split(' ');
          setUserData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            role: user.role || 'student',
            bio: user.bio || '',
            joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
          }));
        }

        // Fetch progress/stats
        const progressRes = await fetch('http://localhost:8000/progress/', { headers });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setStats({
            totalSessions: progressData.total_sessions || 0,
            completedAssignments: 0, // Will be calculated from submissions
            averageScore: progressData.average_grade || 0,
            hoursLearned: progressData.total_hours || 0,
          });
        }

        // Fetch submissions to count completed assignments
        const submissionsRes = await fetch('http://localhost:8000/homework/my-submissions', { headers });
        if (submissionsRes.ok) {
          const submissions = await submissionsRes.json();
          setStats(prev => ({
            ...prev,
            completedAssignments: submissions.length,
          }));
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchUserData();
  }, []);

  const achievements = [
    { id: 1, title: 'First Session', description: 'Completed your first tutoring session', earned: true },
    { id: 2, title: 'Study Streak', description: '7 days of consistent studying', earned: true },
    { id: 3, title: 'High Achiever', description: 'Maintained 85%+ average for a month', earned: true },
    { id: 4, title: 'Quiz Master', description: 'Scored 100% on 3 quizzes', earned: false },
    { id: 5, title: 'Dedicated Learner', description: '50 hours of study time', earned: false },
  ];

  const recentActivity = [
    { id: 1, activity: 'Completed Math session with Dr. Wilson', date: '2025-10-16', type: 'session' },
    { id: 2, activity: 'Submitted Physics lab report', date: '2025-10-15', type: 'assignment' },
    { id: 3, activity: 'Created flashcard set for Chemistry', date: '2025-10-14', type: 'study' },
    { id: 4, activity: 'Scored 92% on Calculus quiz', date: '2025-10-13', type: 'quiz' },
  ];

  const handleSaveProfile = () => {
    setEditMode(false);
    // Save profile data to backend
    console.log('Saving profile:', userData);
  };

  const handleInputChange = (field: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={userData.avatar}
                sx={{ width: 120, height: 120 }}
              >
                {userData.firstName[0]}{userData.lastName[0]}
              </Avatar>
              <Button
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 'auto',
                  borderRadius: '50%',
                  p: 1,
                }}
                variant="contained"
                onClick={() => setOpenAvatarDialog(true)}
              >
                <PhotoCamera fontSize="small" />
              </Button>
            </Box>
          </Grid>
          
          <Grid size="grow">
            <Typography variant="h4" gutterBottom>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {userData.grade} • {userData.school}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {userData.location}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userData.subjects.map((subject) => (
                <Chip key={subject} label={subject} size="small" />
              ))}
            </Box>
          </Grid>
          
          <Grid>
            <Button
              variant={editMode ? 'contained' : 'outlined'}
              startIcon={<Edit />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                {stats.totalSessions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {stats.averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {stats.hoursLearned}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" color="secondary.main">
                {stats.completedAssignments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Personal Info" icon={<Person />} />
            <Tab label="Academic Progress" icon={<TrendingUp />} />
            <Tab label="Achievements" icon={<EmojiEvents />} />
            <Tab label="Settings" icon={<Settings />} />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={userData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Bio"
                    value={userData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    sx={{ mr: 2 }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.activity}
                      secondary={activity.date}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Academic Progress Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Subject Progress
          </Typography>
          
          <Grid container spacing={3}>
            {userData.subjects.map((subject) => {
              const progress = Math.floor(Math.random() * 40) + 60; // Mock progress
              return (
                <Grid size={{ xs: 12, md: 4 }} key={subject}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {subject}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={progress} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {progress}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {Math.floor(Math.random() * 10) + 5} sessions completed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Achievements & Badges
          </Typography>
          
          <Grid container spacing={3}>
            {achievements.map((achievement) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                <Card
                  sx={{
                    opacity: achievement.earned ? 1 : 0.6,
                    border: achievement.earned ? '2px solid gold' : '1px solid #ddd',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EmojiEvents
                      sx={{
                        fontSize: 48,
                        color: achievement.earned ? 'gold' : 'grey.400',
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                    {achievement.earned && (
                      <Chip
                        label="Earned"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive important updates via email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive session reminders via SMS"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.smsNotifications}
                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CalendarToday />
              </ListItemIcon>
              <ListItemText
                primary="Study Reminders"
                secondary="Daily reminders to maintain study streak"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.studyReminders}
                    onChange={(e) => handleInputChange('studyReminders', e.target.checked)}
                  />
                }
                label=""
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Change Password"
                secondary="Update your account password"
              />
              <Button variant="outlined" size="small">
                Change
              </Button>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText
                primary="Help & Support"
                secondary="Get help with your account"
              />
              <Button variant="outlined" size="small">
                Contact
              </Button>
            </ListItem>
          </List>
        </TabPanel>
      </Paper>

      {/* Avatar Upload Dialog */}
      <Dialog open={openAvatarDialog} onClose={() => setOpenAvatarDialog(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a new profile picture (max 5MB, JPG/PNG)
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Choose File
            <input type="file" hidden accept="image/*" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvatarDialog(false)}>Cancel</Button>
          <Button variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
