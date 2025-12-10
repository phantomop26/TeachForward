import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Avatar,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Chat, Send, SmartToy, School } from '@mui/icons-material';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am your AI study assistant. Ask me anything about your subjects, concepts, or homework!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setSending(true);

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
        content: 'Sorry, I could not connect to the AI service.' 
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: 4,
          zIndex: 1000,
          '&:hover': {
            boxShadow: 8,
          },
        }}
        aria-label="AI Assistant"
      >
        <Chat />
      </Fab>

      {/* AI Chat Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Study Assistant</DialogTitle>
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
              {sending && (
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
                onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                disabled={sending}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={sending || !chatInput.trim()}
                endIcon={<Send />}
              >
                Send
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIChatbot;
