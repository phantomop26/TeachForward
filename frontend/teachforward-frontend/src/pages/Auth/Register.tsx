import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  School,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    
    // Step 2: Profile Info
    grade: '',
    school: '',
    subjects: [] as string[],
    goals: '',
    
    // Step 3: Preferences
    studyStyle: '',
    availability: '',
    timezone: '',
    agreeToTerms: false,
    receiveUpdates: false,
  });

  const steps = ['Basic Information', 'Academic Profile', 'Preferences'];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Geography', 'Computer Science', 'Economics', 'Art'
  ];

  const grades = [
    'Elementary School', 'Middle School', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade', 'College Freshman', 'College Sophomore',
    'College Junior', 'College Senior', 'Graduate Student'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }
    
    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration data:', formData);
      
      // Mock successful registration
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Registering with ${provider}`);
    // Implement social registration logic
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </Box>
            
            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            
            <TextField
              select
              required
              fullWidth
              label="I am a"
              value={formData.userType}
              onChange={(e) => handleInputChange('userType', e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
            </TextField>
            
            <TextField
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              required
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Current Grade/Level"
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
            >
              {grades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="School/Institution"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
            />
            
            <TextField
              select
              fullWidth
              label="Subjects of Interest"
              value={formData.subjects}
              onChange={(e) => handleInputChange('subjects', e.target.value)}
              SelectProps={{
                multiple: true,
              }}
              helperText="Select multiple subjects you want to study or teach"
            >
              {subjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Learning Goals"
              placeholder="What would you like to achieve with TeachForward?"
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Preferred Study Style"
              value={formData.studyStyle}
              onChange={(e) => handleInputChange('studyStyle', e.target.value)}
            >
              <MenuItem value="visual">Visual (diagrams, charts)</MenuItem>
              <MenuItem value="auditory">Auditory (discussions, explanations)</MenuItem>
              <MenuItem value="kinesthetic">Kinesthetic (hands-on activities)</MenuItem>
              <MenuItem value="mixed">Mixed approach</MenuItem>
            </TextField>
            
            <TextField
              select
              fullWidth
              label="Availability"
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', e.target.value)}
            >
              <MenuItem value="mornings">Mornings (6 AM - 12 PM)</MenuItem>
              <MenuItem value="afternoons">Afternoons (12 PM - 6 PM)</MenuItem>
              <MenuItem value="evenings">Evenings (6 PM - 10 PM)</MenuItem>
              <MenuItem value="weekends">Weekends only</MenuItem>
              <MenuItem value="flexible">Flexible</MenuItem>
            </TextField>
            
            <TextField
              select
              fullWidth
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <MenuItem value="EST">Eastern Time (EST)</MenuItem>
              <MenuItem value="CST">Central Time (CST)</MenuItem>
              <MenuItem value="MST">Mountain Time (MST)</MenuItem>
              <MenuItem value="PST">Pacific Time (PST)</MenuItem>
            </TextField>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" color="primary">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" color="primary">Privacy Policy</Link>
                  </Typography>
                }
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.receiveUpdates}
                    onChange={(e) => handleInputChange('receiveUpdates', e.target.checked)}
                    color="primary"
                  />
                }
                label="I want to receive updates about new features and study tips"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <School sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            <Typography component="h1" variant="h4" color="primary.main">
              TeachForward
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
            Create Your Account
          </Typography>

          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Social Registration (only on first step) */}
          {activeStep === 0 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={() => handleSocialRegister('Google')}
                  sx={{ py: 1.5 }}
                >
                  Continue with Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialRegister('Facebook')}
                  sx={{ py: 1.5 }}
                >
                  Continue with Facebook
                </Button>
              </Box>

              <Divider sx={{ width: '100%', my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Or register with email
                </Typography>
              </Divider>
            </>
          )}

          {/* Form Content */}
          <Box sx={{ width: '100%' }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ py: 1.5, px: 4 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{ py: 1.5, px: 4 }}
              >
                Next
              </Button>
            )}
          </Box>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
