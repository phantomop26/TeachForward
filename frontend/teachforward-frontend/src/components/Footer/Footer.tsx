import React from 'react';
import { Box, Container, Typography, Link, IconButton, Grid } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              TeachForward
            </Typography>
            <Typography variant="body2" color="inherit">
              Connecting students with qualified tutors for personalized, accessible, and interactive learning experiences.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Features
            </Typography>
            <Link href="#" color="inherit" display="block">
              Session Scheduling
            </Link>
            <Link href="#" color="inherit" display="block">
              Virtual Tutoring
            </Link>
            <Link href="#" color="inherit" display="block">
              AI Study Tools
            </Link>
            <Link href="#" color="inherit" display="block">
              Performance Tracking
            </Link>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="inherit" display="block">
              Help Center
            </Link>
            <Link href="#" color="inherit" display="block">
              Contact Us
            </Link>
            <Link href="#" color="inherit" display="block">
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" display="block">
              Terms of Service
            </Link>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={5}>
          <Typography variant="body2" color="inherit" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' TeachForward. All rights reserved. Team B22 - Fall 2025'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
