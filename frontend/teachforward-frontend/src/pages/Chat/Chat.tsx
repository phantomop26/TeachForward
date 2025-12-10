import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { Send } from '@mui/icons-material';

interface Message {
  sender_id?: number;
  content: string;
  timestamp?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId] = useState('1');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const url = `ws://localhost:8000/ws?user_id=${userId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages(prev => [...prev, msg]);
      } catch (err) {
        setMessages(prev => [...prev, { content: e.data }]);
      }
    };
    
    ws.onopen = () => console.log('WebSocket connected');
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);
    
    return () => ws.close();
  }, [userId]);

  const send = () => {
    if (!input.trim()) return;
    
    const message = {
      content: input,
      receiver_id: null
    };
    
    wsRef.current?.send(JSON.stringify(message));
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: 'calc(100vh - 150px)' }}>
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Live Chat</Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time messaging with tutors and students
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {messages.map((msg, i) => {
              const isCurrentUser = msg.sender_id?.toString() === userId;
              return (
                <React.Fragment key={i}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                      px: 0,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: isCurrentUser ? 0 : 56, ml: isCurrentUser ? 2 : 0 }}>
                      <Avatar sx={{ bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main' }}>
                        {isCurrentUser ? 'Y' : 'T'}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      {msg.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      )}
                    </Paper>
                  </ListItem>
                  {i < messages.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              );
            })}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
            />
            <IconButton color="primary" onClick={send} disabled={!input.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
