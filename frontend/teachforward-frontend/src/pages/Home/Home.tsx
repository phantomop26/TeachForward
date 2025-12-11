import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Paper,
  Chip,
} from '@mui/material';
import {
  School,
  Schedule,
  Psychology,
  VideoCall,
  Assignment,
  TrendingUp,
  PlayArrow,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Schedule fontSize="large" />,
      title: 'Flexible Scheduling',
      description: 'Book tutoring sessions at your convenience with our easy-to-use scheduling system.',
    },
    {
      icon: <VideoCall fontSize="large" />,
      title: 'Virtual Sessions',
      description: 'Connect with tutors through integrated video conferencing and interactive whiteboards.',
    },
    {
      icon: <Psychology fontSize="large" />,
      title: 'AI Study Tools',
      description: 'Access AI-powered flashcards, quizzes, concept maps, and personalized study materials.',
    },
    {
      icon: <Assignment fontSize="large" />,
      title: 'Homework Management',
      description: 'Submit assignments securely and track your progress with detailed analytics.',
    },
    {
      icon: <School fontSize="large" />,
      title: 'Qualified Tutors',
      description: 'Learn from verified tutors with expertise in various subjects and teaching methods.',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with comprehensive performance analytics.',
    },
  ];

  const testimonials = [
    {
      name: 'Student User',
      role: 'Beta Tester',
      rating: 5,
      comment: 'The platform makes it easy to connect with tutors and manage my study schedule in one place.',
      avatar: '/api/placeholder/40/40',
    },
    {
      name: 'Tutor User',
      role: 'Beta Tester',
      rating: 5,
      comment: 'Great tools for managing sessions and assignments. The AI study features are a nice addition.',
      avatar: '/api/placeholder/40/40',
    },
    {
      name: 'Project Team',
      role: 'Team B22',
      rating: 5,
      comment: 'Built as a senior design project to demonstrate modern web development and AI integration.',
      avatar: '/api/placeholder/40/40',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Learn Forward with AI-Powered Tutoring
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Connect with qualified tutors for personalized, interactive learning experiences.
            Boost your academic success with our advanced study tools and flexible scheduling.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Watch Demo
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose TeachForward?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Our platform combines human expertise with AI technology to deliver the best learning experience
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Platform Highlights
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%', boxShadow: 3 }}>
                <Schedule sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  24/7
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Platform Access
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%', boxShadow: 3 }}>
                <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  AI-Powered
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Study Tools
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%', boxShadow: 3 }}>
                <VideoCall sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Real-Time
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Video Sessions
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%', boxShadow: 3 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Secure
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Grade Tracking
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Platform Feedback
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Feedback from beta testers and project stakeholders
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  boxShadow: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 50, height: 50 }} src={testimonial.avatar}>
                    {testimonial.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Chip 
                      label={testimonial.role} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} size="small" />
                <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{testimonial.comment}"
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
            Experience our comprehensive learning platform with AI-powered study tools
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Start Learning Today
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
