// src/components/ui/CardTitle.jsx
import { Typography } from '@mui/material';

export const CardTitle = ({ children }) => (
  <Typography variant="h6" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
);
