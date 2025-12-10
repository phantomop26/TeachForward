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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Fab,
} from '@mui/material';
import {
  Psychology,
  Quiz as QuizIcon,
  AutoStories,
  Chat,
  Add,
  Delete,
  Send,
  SmartToy,
  School,
  Edit,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Flashcard {
  id: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: string;
}

interface QuizData {
  id: string;
  topic: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Summary {
  id: string;
  topic: string;
  content: string;
  keyPoints: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  sections: NoteSection[];
  createdAt: string;
}

interface NoteSection {
  id: string;
  title: string;
  content: string;
  subsections: NoteSubsection[];
}

interface NoteSubsection {
  id: string;
  title: string;
  content: string;
}

interface PersonalNote {
  id: string;
  title: string;
  sections: PersonalNoteSection[];
  createdAt: string;
}

interface PersonalNoteSection {
  id: string;
  title: string;
  content: string;
  subsections: PersonalNoteSubsection[];
}

interface PersonalNoteSubsection {
  id: string;
  title: string;
  content: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const StudyTools: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [openFlashcardDialog, setOpenFlashcardDialog] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [manualFlashcard, setManualFlashcard] = useState({ question: '', answer: '', difficulty: 'Medium' });
  const [openManualFlashcardDialog, setOpenManualFlashcardDialog] = useState(false);

  // Quizzes
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [openManualQuizDialog, setOpenManualQuizDialog] = useState(false);
  const [manualQuizTopic, setManualQuizTopic] = useState('');
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);

  // Summaries
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
  const [summaryTopic, setSummaryTopic] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // AI Chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am your AI study assistant. Ask me anything about your subjects, concepts, or homework!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [openAITutor, setOpenAITutor] = useState(false);

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [parsingNote, setParsingNote] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractingPDF, setExtractingPDF] = useState(false);

  // Personal Notes
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([]);
  const [openPersonalNoteDialog, setOpenPersonalNoteDialog] = useState(false);
  const [personalNoteTitle, setPersonalNoteTitle] = useState('');
  const [personalNoteSections, setPersonalNoteSections] = useState<PersonalNoteSection[]>([{
    id: 'section-1',
    title: '',
    content: '',
    subsections: []
  }]);

  const [error, setError] = useState('');

  // Generate Flashcards with AI
  const handleGenerateFlashcards = async () => {
    if (!flashcardTopic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGeneratingFlashcards(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic: flashcardTopic, count: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        const newFlashcards: Flashcard[] = data.flashcards.map((fc: any, idx: number) => ({
          id: `fc-${Date.now()}-${idx}`,
          topic: flashcardTopic,
          question: fc.question,
          answer: fc.answer,
          difficulty: fc.difficulty || 'medium',
        }));
        setFlashcards([...flashcards, ...newFlashcards]);
        setOpenFlashcardDialog(false);
        setFlashcardTopic('');
      } else {
        setError('Failed to generate flashcards');
      }
    } catch (err) {
      setError('Error generating flashcards');
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  // Generate Quiz with AI
  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGeneratingQuiz(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic: quizTopic, num_questions: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        const newQuiz: QuizData = {
          id: `quiz-${Date.now()}`,
          topic: quizTopic,
          questions: data.questions,
        };
        setQuizzes([...quizzes, newQuiz]);
        setOpenQuizDialog(false);
        setQuizTopic('');
      } else {
        setError('Failed to generate quiz');
      }
    } catch (err) {
      setError('Error generating quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Generate Summary with AI
  const handleGenerateSummary = async () => {
    if (!summaryTopic.trim() || !summaryContent.trim()) {
      setError('Please enter both topic and content');
      return;
    }

    setGeneratingSummary(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: summaryContent }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSummary: Summary = {
          id: `summary-${Date.now()}`,
          topic: summaryTopic,
          content: data.content || data.summary,
          keyPoints: data.keyPoints || data.key_points || [],
        };
        setSummaries([...summaries, newSummary]);
        setOpenSummaryDialog(false);
        setSummaryTopic('');
        setSummaryContent('');
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError('Error generating summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Send Chat Message to AI
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setSendingMessage(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          message: chatInput,
          history: chatMessages.slice(-10),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: data.response 
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Manual Flashcard Creation
  const handleAddManualFlashcard = () => {
    if (!manualFlashcard.question.trim() || !manualFlashcard.answer.trim()) {
      setError('Please fill in both question and answer');
      return;
    }

    const newFlashcard: Flashcard = {
      id: `fc-manual-${Date.now()}`,
      topic: flashcardTopic || 'Manual',
      question: manualFlashcard.question,
      answer: manualFlashcard.answer,
      difficulty: manualFlashcard.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
    };

    setFlashcards([...flashcards, newFlashcard]);
    setManualFlashcard({ question: '', answer: '', difficulty: 'Medium' });
    setOpenManualFlashcardDialog(false);
  };

  // Manual Quiz Creation
  const handleAddManualQuiz = () => {
    if (!manualQuizTopic.trim()) {
      setError('Please enter a quiz topic');
      return;
    }

    const validQuestions = manualQuestions.filter(q => 
      q.question.trim() && q.options.every(opt => opt.trim())
    );

    if (validQuestions.length === 0) {
      setError('Please add at least one complete question');
      return;
    }

    const newQuiz: QuizData = {
      id: `quiz-manual-${Date.now()}`,
      topic: manualQuizTopic,
      questions: validQuestions,
    };

    setQuizzes([...quizzes, newQuiz]);
    setManualQuizTopic('');
    setManualQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setOpenManualQuizDialog(false);
  };

  const addQuestionToManualQuiz = () => {
    setManualQuestions([...manualQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateManualQuestion = (index: number, field: string, value: any) => {
    const updated = [...manualQuestions];
    if (field === 'question' || field === 'correctAnswer') {
      (updated[index] as any)[field] = value;
    } else if (field.startsWith('option')) {
      const optIndex = parseInt(field.replace('option', ''));
      updated[index].options[optIndex] = value;
    }
    setManualQuestions(updated);
  };

  // Parse and Explain Note with AI
  const handleParseNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError('Please enter both title and content');
      return;
    }

    setParsingNote(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/parse-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });

      if (res.ok) {
        const data = await res.json();
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: noteTitle,
          content: noteContent,
          sections: data.sections || [],
          createdAt: new Date().toISOString(),
        };
        setNotes([...notes, newNote]);
        setNoteTitle('');
        setNoteContent('');
        setUploadedFile(null);
        setOpenNoteDialog(false);
      } else {
        setError('Failed to parse note');
      }
    } catch (err) {
      setError('Error parsing note');
    } finally {
      setParsingNote(false);
    }
  };

  // Handle PDF Upload and Extract Text
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploadedFile(file);
    setExtractingPDF(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/ai/extract-pdf', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setNoteTitle(file.name.replace('.pdf', ''));
        setNoteContent(data.text || '');
      } else {
        setError('Failed to extract text from PDF');
      }
    } catch (err) {
      setError('Error extracting PDF text');
    } finally {
      setExtractingPDF(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Personal Notes Handlers
  const handleAddPersonalNote = () => {
    const newNote: PersonalNote = {
      id: `personal-note-${Date.now()}`,
      title: personalNoteTitle,
      sections: personalNoteSections.filter(s => s.title || s.content),
      createdAt: new Date().toISOString(),
    };
    setPersonalNotes([...personalNotes, newNote]);
    setPersonalNoteTitle('');
    setPersonalNoteSections([{ id: 'section-1', title: '', content: '', subsections: [] }]);
    setOpenPersonalNoteDialog(false);
  };

  const handleDeletePersonalNote = (id: string) => {
    setPersonalNotes(personalNotes.filter(n => n.id !== id));
  };

  const handleAddSection = () => {
    setPersonalNoteSections([
      ...personalNoteSections,
      { id: `section-${Date.now()}`, title: '', content: '', subsections: [] }
    ]);
  };

  const handleUpdateSection = (index: number, field: 'title' | 'content', value: string) => {
    const updatedSections = [...personalNoteSections];
    updatedSections[index][field] = value;
    setPersonalNoteSections(updatedSections);
  };

  const handleDeleteSection = (index: number) => {
    setPersonalNoteSections(personalNoteSections.filter((_, i) => i !== index));
  };

  const handleAddSubsection = (sectionIndex: number) => {
    const updatedSections = [...personalNoteSections];
    updatedSections[sectionIndex].subsections.push({
      id: `subsection-${Date.now()}`,
      title: '',
      content: ''
    });
    setPersonalNoteSections(updatedSections);
  };

  const handleUpdateSubsection = (
    sectionIndex: number,
    subsectionIndex: number,
    field: 'title' | 'content',
    value: string
  ) => {
    const updatedSections = [...personalNoteSections];
    updatedSections[sectionIndex].subsections[subsectionIndex][field] = value;
    setPersonalNoteSections(updatedSections);
  };

  const handleDeleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const updatedSections = [...personalNoteSections];
    updatedSections[sectionIndex].subsections.splice(subsectionIndex, 1);
    setPersonalNoteSections(updatedSections);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI-Powered Study Tools
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enhance your learning with intelligent study materials powered by AI
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Flashcards
              </Typography>
              <Typography variant="h4">{flashcards.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Quizzes
              </Typography>
              <Typography variant="h4">{quizzes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Summaries
              </Typography>
              <Typography variant="h4">{summaries.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                AI Notes
              </Typography>
              <Typography variant="h4">{notes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Personal Notes
              </Typography>
              <Typography variant="h4">{personalNotes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Psychology />} label="Flashcards" />
          <Tab icon={<QuizIcon />} label="Quizzes" />
          <Tab icon={<AutoStories />} label="Summaries" />
          <Tab icon={<School />} label="AI Notes" />
          <Tab icon={<Edit />} label="Personal Notes" />
        </Tabs>

        {/* Flashcards Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenFlashcardDialog(true)}
            >
              Generate with AI
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setOpenManualFlashcardDialog(true)}
            >
              Add Manually
            </Button>
          </Box>

          {flashcards.length === 0 ? (
            <Alert severity="info">
              No flashcards yet. Generate with AI or add manually!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {flashcards.map((card) => (
                <Grid size={{ xs: 12, md: 6 }} key={card.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip label={card.topic} color="primary" size="small" />
                        <Chip label={card.difficulty} size="small" />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        Q: {card.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        A: {card.answer}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setFlashcards(flashcards.filter(f => f.id !== card.id))}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Quizzes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenQuizDialog(true)}
            >
              Generate with AI
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setOpenManualQuizDialog(true)}
            >
              Add Manually
            </Button>
          </Box>

          {quizzes.length === 0 ? (
            <Alert severity="info">
              No quizzes yet. Generate with AI or add manually!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {quizzes.map((quiz) => (
                <Grid size={{ xs: 12 }} key={quiz.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {quiz.topic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {quiz.questions.length} questions
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {quiz.questions.map((q, idx) => (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {idx + 1}. {q.question}
                          </Typography>
                          {q.options.map((option, optIdx) => (
                            <Typography
                              key={optIdx}
                              variant="body2"
                              sx={{
                                ml: 2,
                                color: optIdx === q.correctAnswer ? 'success.main' : 'text.secondary',
                                fontWeight: optIdx === q.correctAnswer ? 'bold' : 'normal',
                              }}
                            >
                              {String.fromCharCode(65 + optIdx)}. {option}
                              {optIdx === q.correctAnswer && ' ✓'}
                            </Typography>
                          ))}
                        </Box>
                      ))}
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setQuizzes(quizzes.filter(q => q.id !== quiz.id))}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Summaries Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenSummaryDialog(true)}
            >
              Generate Summary with AI
            </Button>
          </Box>

          {summaries.length === 0 ? (
            <Alert severity="info">
              No summaries yet. Click "Generate Summary with AI" to create one!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {summaries.map((summary) => (
                <Grid size={{ xs: 12 }} key={summary.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {summary.topic}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {summary.content}
                      </Typography>
                      {summary.keyPoints.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Key Points:
                          </Typography>
                          {summary.keyPoints.map((point, idx) => (
                            <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                              • {point}
                            </Typography>
                          ))}
                        </>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setSummaries(summaries.filter(s => s.id !== summary.id))}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Notes Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenNoteDialog(true)}
            >
              Add Note
            </Button>
          </Box>

          {notes.length === 0 ? (
            <Alert severity="info">
              No notes yet. Add a note and AI will parse it into sections and explanations!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {notes.map((note) => (
                <Grid size={{ xs: 12 }} key={note.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {note.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      {note.sections.map((section, sIdx) => (
                        <Box key={section.id} sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {section.title}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {section.content}
                          </Typography>
                          
                          {section.subsections && section.subsections.length > 0 && (
                            <Box sx={{ ml: 3 }}>
                              {section.subsections.map((subsection, ssIdx) => (
                                <Box key={subsection.id} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    • {subsection.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {subsection.content}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Personal Notes Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenPersonalNoteDialog(true)}
            >
              Add Personal Note
            </Button>
          </Box>

          {personalNotes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Edit sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No personal notes yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first note with sections and subsections
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {personalNotes.map((note) => (
                <Grid size={{ xs: 12 }} key={note.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {note.title}
                        </Typography>
                        <IconButton
                          onClick={() => handleDeletePersonalNote(note.id)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Created: {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                      
                      {note.sections.map((section, sIdx) => (
                        <Box key={section.id} sx={{ ml: 2, mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {section.title}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            {section.content}
                          </Typography>
                          
                          {section.subsections.length > 0 && (
                            <Box sx={{ ml: 3 }}>
                              {section.subsections.map((subsection, ssIdx) => (
                                <Box key={subsection.id} sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {subsection.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {subsection.content}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Floating AI Tutor Button */}
      <Fab
        color="primary"
        onClick={() => setOpenAITutor(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          boxShadow: 4,
          '&:hover': {
            boxShadow: 8,
          },
        }}
      >
        <Chat />
      </Fab>

      {/* AI Tutor Dialog */}
      <Dialog open={openAITutor} onClose={() => setOpenAITutor(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Study Tutor</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {chatMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, maxWidth: '70%' }}>
                    {msg.role === 'assistant' && (
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SmartToy />
                      </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                    </Paper>
                    {msg.role === 'user' && (
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <School />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              ))}
              {sendingMessage && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SmartToy />
                  </Avatar>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}
            </Box>

            {/* Chat Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about your studies..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                disabled={sendingMessage}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={sendingMessage || !chatInput.trim()}
                endIcon={<Send />}
              >
                Send
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAITutor(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Note (AI will parse and explain)</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={extractingPDF ? <CircularProgress size={20} /> : <Add />}
              disabled={extractingPDF}
              fullWidth
            >
              {extractingPDF ? 'Extracting PDF...' : uploadedFile ? `Uploaded: ${uploadedFile.name}` : 'Upload PDF'}
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={handlePDFUpload}
              />
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }}>OR</Divider>
          
          <TextField
            label="Note Title"
            fullWidth
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="e.g., Chapter 5: Evolution"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Note Content"
            fullWidth
            multiline
            rows={12}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Paste your lecture notes, textbook chapter, or study material here..."
            helperText="AI will parse this into organized sections with explanations"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenNoteDialog(false); setUploadedFile(null); }}>Cancel</Button>
          <Button
            onClick={handleParseNote}
            variant="contained"
            disabled={parsingNote}
            startIcon={parsingNote ? <CircularProgress size={20} /> : <Add />}
          >
            {parsingNote ? 'Parsing...' : 'Parse & Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Personal Note Dialog */}
      <Dialog open={openPersonalNoteDialog} onClose={() => setOpenPersonalNoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Personal Note</DialogTitle>
        <DialogContent>
          <TextField
            label="Note Title"
            fullWidth
            value={personalNoteTitle}
            onChange={(e) => setPersonalNoteTitle(e.target.value)}
            placeholder="e.g., My Study Notes"
            sx={{ mb: 3, mt: 1 }}
          />
          
          <Typography variant="h6" gutterBottom>
            Sections
          </Typography>
          
          {personalNoteSections.map((section, sIdx) => (
            <Card key={section.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Section {sIdx + 1}
                </Typography>
                {personalNoteSections.length > 1 && (
                  <IconButton onClick={() => handleDeleteSection(sIdx)} color="error" size="small">
                    <Delete />
                  </IconButton>
                )}
              </Box>
              
              <TextField
                label="Section Title"
                fullWidth
                value={section.title}
                onChange={(e) => handleUpdateSection(sIdx, 'title', e.target.value)}
                placeholder="e.g., Introduction"
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Section Content"
                fullWidth
                multiline
                rows={3}
                value={section.content}
                onChange={(e) => handleUpdateSection(sIdx, 'content', e.target.value)}
                placeholder="Write section content here..."
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subsections
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleAddSubsection(sIdx)}
                >
                  Add Subsection
                </Button>
              </Box>
              
              {section.subsections.map((subsection, ssIdx) => (
                <Box key={subsection.id} sx={{ ml: 2, mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Subsection {ssIdx + 1}
                    </Typography>
                    <IconButton onClick={() => handleDeleteSubsection(sIdx, ssIdx)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                  
                  <TextField
                    label="Subsection Title"
                    fullWidth
                    size="small"
                    value={subsection.title}
                    onChange={(e) => handleUpdateSubsection(sIdx, ssIdx, 'title', e.target.value)}
                    placeholder="e.g., Key Point 1"
                    sx={{ mb: 1 }}
                  />
                  
                  <TextField
                    label="Subsection Content"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={subsection.content}
                    onChange={(e) => handleUpdateSubsection(sIdx, ssIdx, 'content', e.target.value)}
                    placeholder="Write subsection content here..."
                  />
                </Box>
              ))}
            </Card>
          ))}
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddSection}
            sx={{ mt: 2 }}
          >
            Add Section
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPersonalNoteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddPersonalNote}
            variant="contained"
            disabled={!personalNoteTitle.trim()}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Flashcards Dialog */}
      <Dialog open={openFlashcardDialog} onClose={() => setOpenFlashcardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Flashcards with AI</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic"
            fullWidth
            value={flashcardTopic}
            onChange={(e) => setFlashcardTopic(e.target.value)}
            placeholder="e.g., Calculus Derivatives, World War II, Photosynthesis"
            helperText="Enter a topic and AI will generate 5 flashcards for you"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFlashcardDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateFlashcards}
            variant="contained"
            disabled={generatingFlashcards}
            startIcon={generatingFlashcards ? <CircularProgress size={20} /> : <Psychology />}
          >
            {generatingFlashcards ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Quiz Dialog */}
      <Dialog open={openQuizDialog} onClose={() => setOpenQuizDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Quiz with AI</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic"
            fullWidth
            value={quizTopic}
            onChange={(e) => setQuizTopic(e.target.value)}
            placeholder="e.g., Biology Cell Structure, Algebra Equations"
            helperText="Enter a topic and AI will generate a 5-question quiz for you"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuizDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateQuiz}
            variant="contained"
            disabled={generatingQuiz}
            startIcon={generatingQuiz ? <CircularProgress size={20} /> : <QuizIcon />}
          >
            {generatingQuiz ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Summary Dialog */}
      <Dialog open={openSummaryDialog} onClose={() => setOpenSummaryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Summary with AI</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Topic"
            fullWidth
            value={summaryTopic}
            onChange={(e) => setSummaryTopic(e.target.value)}
            placeholder="e.g., Chapter 5 - Evolution"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content to Summarize"
            fullWidth
            multiline
            rows={8}
            value={summaryContent}
            onChange={(e) => setSummaryContent(e.target.value)}
            placeholder="Paste your notes, lecture content, or textbook chapter here..."
            helperText="AI will create a concise summary with key points"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSummaryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateSummary}
            variant="contained"
            disabled={generatingSummary}
            startIcon={generatingSummary ? <CircularProgress size={20} /> : <AutoStories />}
          >
            {generatingSummary ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Flashcard Dialog */}
      <Dialog open={openManualFlashcardDialog} onClose={() => setOpenManualFlashcardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Flashcard Manually</DialogTitle>
        <DialogContent>
          <TextField
            label="Question"
            fullWidth
            value={manualFlashcard.question}
            onChange={(e) => setManualFlashcard({ ...manualFlashcard, question: e.target.value })}
            placeholder="e.g., What is photosynthesis?"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Answer"
            fullWidth
            multiline
            rows={3}
            value={manualFlashcard.answer}
            onChange={(e) => setManualFlashcard({ ...manualFlashcard, answer: e.target.value })}
            placeholder="e.g., The process by which plants convert light energy..."
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Difficulty"
            fullWidth
            value={manualFlashcard.difficulty}
            onChange={(e) => setManualFlashcard({ ...manualFlashcard, difficulty: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManualFlashcardDialog(false)}>Cancel</Button>
          <Button onClick={handleAddManualFlashcard} variant="contained">
            Add Flashcard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Quiz Dialog */}
      <Dialog open={openManualQuizDialog} onClose={() => setOpenManualQuizDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Quiz Manually</DialogTitle>
        <DialogContent>
          <TextField
            label="Quiz Topic"
            fullWidth
            value={manualQuizTopic}
            onChange={(e) => setManualQuizTopic(e.target.value)}
            placeholder="e.g., World War II"
            sx={{ mb: 3, mt: 1 }}
          />
          
          {manualQuestions.map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Question {qIndex + 1}</Typography>
              <TextField
                label="Question"
                fullWidth
                value={q.question}
                onChange={(e) => updateManualQuestion(qIndex, 'question', e.target.value)}
                placeholder="Enter your question"
                sx={{ mb: 2 }}
              />
              
              {q.options.map((opt, optIndex) => (
                <TextField
                  key={optIndex}
                  label={`Option ${String.fromCharCode(65 + optIndex)}`}
                  fullWidth
                  value={opt}
                  onChange={(e) => updateManualQuestion(qIndex, `option${optIndex}`, e.target.value)}
                  placeholder={`Enter option ${String.fromCharCode(65 + optIndex)}`}
                  sx={{ mb: 1 }}
                />
              ))}
              
              <TextField
                select
                label="Correct Answer"
                fullWidth
                value={q.correctAnswer}
                onChange={(e) => updateManualQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                SelectProps={{ native: true }}
                sx={{ mt: 1 }}
              >
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
                <option value={3}>D</option>
              </TextField>
            </Box>
          ))}
          
          <Button onClick={addQuestionToManualQuiz} startIcon={<Add />} sx={{ mt: 1 }}>
            Add Another Question
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManualQuizDialog(false)}>Cancel</Button>
          <Button onClick={handleAddManualQuiz} variant="contained">
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyTools;
