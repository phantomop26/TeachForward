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
      name: 'Sarah Johnson',
      role: 'High School Student',
      rating: 5,
      comment: 'TeachForward helped me improve my math grades from C to A! The tutors are amazing.',
      avatar: '/api/placeholder/40/40',
    },
    {
      name: 'Michael Chen',
      role: 'College Student',
      rating: 5,
      comment: 'The AI study tools are incredible. The concept maps really help me understand complex topics.',
      avatar: '/api/placeholder/40/40',
    },
    {
      name: 'Emily Davis',
      role: 'Parent',
      rating: 5,
      comment: 'My daughter loves the interactive sessions. The platform is user-friendly and effective.',
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
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                10,000+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Students Helped
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Qualified Tutors
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                50+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Subjects Covered
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                95%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Student Satisfaction
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          What Our Students Say
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Real feedback from students who have transformed their learning experience
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }} src={testimonial.avatar}>
                    {testimonial.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                  "{testimonial.comment}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Start Learning?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of students who have improved their grades with TeachForward
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
