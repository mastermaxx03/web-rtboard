import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tokan] = useState('a'); // as in your code

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (e) => e.preventDefault();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/canvas2', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email';
    if (!password) return 'Password is required';
    if (!tokan) return 'Tokan is required';
    return '';
  };

  // ✅ New helper: redirect to attempted URL after login
  const redirectAfterLogin = () => {
    const redirectTo = localStorage.getItem('redirectTo') || '/canvas2';
    localStorage.removeItem('redirectTo');
    window.location.href = redirectTo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const v = validate();
    if (v) return setError(v);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_AUTH}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tokan })
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data?.errors)) {
          return setError(data.errors.map((er) => er.msg).join(', '));
        }
        return setError(data?.message || 'Login failed');
      }

      // Backend returns: [{"message":"Login successful","accessToken":"...","refreshToken":"...","userData":{...}}]
      const payload = Array.isArray(data) ? data[0] : data;

      // Persist login data
      localStorage.setItem('loginData', JSON.stringify(payload));
      if (payload?.accessToken) localStorage.setItem('accessToken', payload.accessToken);
      if (payload?.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);
      if (payload?.userData) localStorage.setItem('userData', JSON.stringify(payload.userData));

      // Redirect to attempted page or dashboard
      redirectAfterLogin();
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-login"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email Address / Username"
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          label="Password"
        />
      </FormControl>

      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <Typography variant="subtitle1" component={Link} to="/pages/forgot-password" color="primary" sx={{ textDecoration: 'none' }}>
            Forgot Password?
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button color="primary" fullWidth size="large" type="submit" variant="contained">
          Sign In
        </Button>
      </Box>
    </form>
  );
}
