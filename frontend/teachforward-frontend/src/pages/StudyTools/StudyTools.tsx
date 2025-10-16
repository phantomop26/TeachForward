import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Psychology,
  Quiz,
  AccountTree,
  Note,
  Add,
  Edit,
  Delete,
  PlayArrow,
  CheckCircle,
  Schedule,
  TrendingUp,
  Lightbulb,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: string;
}

interface QuizData {
  id: string;
  title: string;
  subject: string;
  questions: number;
  timeLimit: number;
  difficulty: string;
  score?: number;
  completed: boolean;
}

interface ConceptMap {
  id: string;
  title: string;
  subject: string;
  nodes: number;
  lastModified: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudyTools: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openFlashcardDialog, setOpenFlashcardDialog] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '', subject: '' });

  // Mock data
  const flashcards: Flashcard[] = [
    {
      id: '1',
      question: 'What is the derivative of x²?',
      answer: '2x',
      subject: 'Mathematics',
      difficulty: 'easy',
      lastReviewed: '2025-10-15',
    },
    {
      id: '2',
      question: 'What is Newton\'s first law of motion?',
      answer: 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
      subject: 'Physics',
      difficulty: 'medium',
      lastReviewed: '2025-10-14',
    },
    {
      id: '3',
      question: 'What is the chemical formula for water?',
      answer: 'H₂O',
      subject: 'Chemistry',
      difficulty: 'easy',
      lastReviewed: '2025-10-16',
    },
  ];

  const quizzes: QuizData[] = [
    {
      id: '1',
      title: 'Calculus Basics',
      subject: 'Mathematics',
      questions: 10,
      timeLimit: 30,
      difficulty: 'Medium',
      score: 85,
      completed: true,
    },
    {
      id: '2',
      title: 'Physics Fundamentals',
      subject: 'Physics',
      questions: 15,
      timeLimit: 45,
      difficulty: 'Hard',
      completed: false,
    },
    {
      id: '3',
      title: 'Chemical Reactions',
      subject: 'Chemistry',
      questions: 12,
      timeLimit: 25,
      difficulty: 'Easy',
      score: 92,
      completed: true,
    },
  ];

  const conceptMaps: ConceptMap[] = [
    {
      id: '1',
      title: 'Calculus Concepts',
      subject: 'Mathematics',
      nodes: 15,
      lastModified: '2025-10-15',
    },
    {
      id: '2',
      title: 'Thermodynamics',
      subject: 'Physics',
      nodes: 22,
      lastModified: '2025-10-14',
    },
    {
      id: '3',
      title: 'Organic Chemistry',
      subject: 'Chemistry',
      nodes: 18,
      lastModified: '2025-10-16',
    },
  ];

  const handleCreateFlashcard = () => {
    // Handle flashcard creation
    console.log('Creating flashcard:', newFlashcard);
    setOpenFlashcardDialog(false);
    setNewFlashcard({ question: '', answer: '', subject: '' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI-Powered Study Tools
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enhance your learning with intelligent study materials and interactive tools
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Psychology sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">{flashcards.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Flashcards Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Quiz sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">{quizzes.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Practice Quizzes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <AccountTree sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">{conceptMaps.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Concept Maps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">87%</Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Flashcards" icon={<Note />} />
            <Tab label="Practice Quizzes" icon={<Quiz />} />
            <Tab label="Concept Maps" icon={<AccountTree />} />
            <Tab label="AI Recommendations" icon={<Lightbulb />} />
          </Tabs>
        </Box>

        {/* Flashcards Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Your Flashcards</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenFlashcardDialog(true)}
            >
              Create Flashcard
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {flashcards.map((flashcard) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={flashcard.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={flashcard.subject} size="small" />
                      <Chip
                        label={flashcard.difficulty}
                        size="small"
                        color={getDifficultyColor(flashcard.difficulty) as any}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Q: {flashcard.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      A: {flashcard.answer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last reviewed: {flashcard.lastReviewed}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<PlayArrow />}>
                      Review
                    </Button>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Quizzes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Practice Quizzes</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* TODO: Add quiz dialog */}}
            >
              Generate Quiz
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid size={{ xs: 12, md: 6 }} key={quiz.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{quiz.title}</Typography>
                      {quiz.completed && <CheckCircle color="success" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Subject: {quiz.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {quiz.questions} questions • {quiz.timeLimit} minutes
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={quiz.difficulty}
                        size="small"
                        color={getDifficultyColor(quiz.difficulty) as any}
                      />
                      {quiz.score && (
                        <Chip label={`Score: ${quiz.score}%`} size="small" color="success" />
                      )}
                    </Box>
                    {quiz.score && (
                      <LinearProgress
                        variant="determinate"
                        value={quiz.score}
                        sx={{ mb: 2 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      variant={quiz.completed ? 'outlined' : 'contained'}
                      startIcon={<PlayArrow />}
                    >
                      {quiz.completed ? 'Retake' : 'Start Quiz'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Concept Maps Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Concept Maps</Typography>
            <Button variant="contained" startIcon={<Add />}>
              Create Map
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {conceptMaps.map((map) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={map.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {map.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Subject: {map.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {map.nodes} concepts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last modified: {map.lastModified}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" startIcon={<Edit />}>
                      Edit Map
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* AI Recommendations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            AI-Powered Study Recommendations
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Lightbulb sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6">Recommended Study Focus</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Based on your recent performance, we recommend focusing on:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Physics - Mechanics"
                        secondary="Score improvement needed (68% → target: 85%)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mathematics - Integration"
                        secondary="Review recommended (last studied 5 days ago)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Psychology sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Personalized Content</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    AI-generated study materials for you:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="📚 New Flashcard Set: Physics Formulas"
                        secondary="15 cards based on your weak areas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="🧠 Concept Map: Calculus Connections"
                        secondary="Visual connections between derivatives and integrals"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="📝 Practice Quiz: Mixed Review"
                        secondary="Adaptive questions targeting your knowledge gaps"
                      />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button variant="contained">
                    Generate Materials
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Create Flashcard Dialog */}
      <Dialog open={openFlashcardDialog} onClose={() => setOpenFlashcardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Flashcard</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Subject"
              value={newFlashcard.subject}
              onChange={(e) => setNewFlashcard({ ...newFlashcard, subject: e.target.value })}
              fullWidth
            />
            <TextField
              label="Question"
              value={newFlashcard.question}
              onChange={(e) => setNewFlashcard({ ...newFlashcard, question: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Answer"
              value={newFlashcard.answer}
              onChange={(e) => setNewFlashcard({ ...newFlashcard, answer: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFlashcardDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFlashcard} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyTools;
