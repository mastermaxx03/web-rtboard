import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function AuthForget() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code+password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // ====== BLOCK ACCESS IF LOGGED IN ======
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // user is logged in -> redirect away from forget password page
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Email is required');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_AUTH}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to send reset code');
        return;
      }
      setMessage(data.message || 'Check your email for the code.');
      setStep(2);
    } catch (err) {
      setError('Failed to send reset code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!code) {
      setError('Code is required');
      return;
    }
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_AUTH}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCode: code, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }
      setSuccess(true);
      setMessage(data.message || 'Password reset successful!');
      setTimeout(() => navigate('/pages/login'), 2000);
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  return (
    <form onSubmit={step === 1 ? handleEmailSubmit : handleResetPassword}>
      {step === 1 && (
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-email-forgot">Email Address</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-forgot"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{}}
          />
        </FormControl>
      )}
      {step === 2 && (
        <>
          <Typography color="success.primary" sx={{ mb: 2, textAlign: 'center' }}>
            {message}
          </Typography>
          <FormControl fullWidth sx={{ ...theme.typography.customInput, mb: 2 }}>
            <InputLabel htmlFor="outlined-adornment-code">Code</InputLabel>
            <OutlinedInput
              id="outlined-adornment-code"
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{}}
            />
          </FormControl>
          <FormControl fullWidth sx={{ ...theme.typography.customInput, mb: 2 }}>
            <InputLabel htmlFor="outlined-adornment-password-reset">New Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-reset"
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              inputProps={{}}
              label="New Password"
            />
          </FormControl>
          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              inputProps={{}}
              label="Confirm Password"
            />
          </FormControl>
        </>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      {step === 1 && (
        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
              Recover Password
            </Button>
          </AnimateButton>
        </Box>
      )}
      {step === 2 && (
        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button color="secondary" fullWidth size="large" type="submit" variant="contained" disabled={success}>
              {success ? 'Password Reset!' : 'Set New Password'}
            </Button>
          </AnimateButton>
        </Box>
      )}
      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Grid>
          <Typography variant="subtitle1" component={Link} to="/pages/login" color="secondary" sx={{ textDecoration: 'none' }}>
            Go to Login
          </Typography>
        </Grid>
      </Grid>
    </form>
  );
}
