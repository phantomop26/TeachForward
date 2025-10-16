import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  TextField,
  Divider,
  Avatar,
} from '@mui/material';
import {
  VideoCall,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  Assignment,
  Save,
  Clear,
  Brush,
  Circle,
  CropSquare,
  ShowChart,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

const TutoringSession: React.FC = () => {
  const { sessionId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Dr. Sarah Wilson',
      message: 'Hello! Ready to start our mathematics session?',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      sender: 'You',
      message: 'Yes, I have some questions about calculus derivatives.',
      timestamp: '10:01 AM',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  // Mock session data
  const sessionData = {
    id: sessionId,
    tutorName: 'Dr. Sarah Wilson',
    subject: 'Mathematics',
    topic: 'Calculus - Derivatives',
    startTime: '10:00 AM',
    duration: 60,
    status: 'active',
  };

  // Whiteboard drawing functions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2;
        context.strokeStyle = '#000000';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const context = canvas.getContext('2d');
      if (context) {
        setIsDrawing(true);
        context.beginPath();
        context.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineTo(x, y);
        context.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2, height: 'calc(100vh - 100px)' }}>
      {/* Session Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {sessionData.subject} Session with {sessionData.tutorName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Topic: {sessionData.topic} • Started: {sessionData.startTime}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`${sessionData.duration} min`} color="primary" />
            <Chip label={sessionData.status} color="success" />
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 120px)' }}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, md: isChatOpen ? 8 : 12 }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Video Area */}
            <Box sx={{ height: '40%', position: 'relative', backgroundColor: '#000', borderRadius: '4px 4px 0 0' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <IconButton
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <VideoCall /> : <VideocamOff />}
                </IconButton>
                <IconButton
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  onClick={() => setIsAudioOn(!isAudioOn)}
                >
                  {isAudioOn ? <Mic /> : <MicOff />}
                </IconButton>
                <IconButton
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                >
                  {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
                <IconButton
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Box>
              
              {/* Video placeholder */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Video Conference Area</Typography>
              </Box>
              
              {/* Small self-video */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  width: 150,
                  height: 100,
                  backgroundColor: '#333',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Typography variant="caption">You</Typography>
              </Box>
            </Box>

            {/* Whiteboard Area */}
            <Box sx={{ height: '60%', display: 'flex', flexDirection: 'column' }}>
              {/* Whiteboard Toolbar */}
              <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    color={currentTool === 'brush' ? 'primary' : 'default'}
                    onClick={() => setCurrentTool('brush')}
                  >
                    <Brush />
                  </IconButton>
                  <IconButton
                    color={currentTool === 'circle' ? 'primary' : 'default'}
                    onClick={() => setCurrentTool('circle')}
                  >
                    <Circle />
                  </IconButton>
                  <IconButton
                    color={currentTool === 'square' ? 'primary' : 'default'}
                    onClick={() => setCurrentTool('square')}
                  >
                    <CropSquare />
                  </IconButton>
                  <IconButton
                    color={currentTool === 'line' ? 'primary' : 'default'}
                    onClick={() => setCurrentTool('line')}
                  >
                    <ShowChart />
                  </IconButton>
                  <Divider orientation="vertical" flexItem />
                  <IconButton onClick={clearWhiteboard}>
                    <Clear />
                  </IconButton>
                  <IconButton>
                    <Save />
                  </IconButton>
                  <Divider orientation="vertical" flexItem />
                  <IconButton>
                    <ZoomIn />
                  </IconButton>
                  <IconButton>
                    <ZoomOut />
                  </IconButton>
                </Box>
              </Box>

              {/* Whiteboard Canvas */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair',
                    backgroundColor: 'white',
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Side Panel */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: isChatOpen ? 'block' : 'none' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">Chat</Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {message.sender[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {message.sender} • {message.timestamp}
                    </Typography>
                    <Typography variant="body2">{message.message}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button size="small" onClick={handleSendMessage}>
                      Send
                    </Button>
                  ),
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Controls */}
      <Paper sx={{ mt: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Chat />}
            onClick={() => setIsChatOpen(!isChatOpen)}
            color={isChatOpen ? 'primary' : 'inherit'}
          >
            Chat
          </Button>
          <Button variant="outlined" startIcon={<Assignment />}>
            Share Files
          </Button>
          <Button variant="contained" color="error">
            End Session
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TutoringSession;
