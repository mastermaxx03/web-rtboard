// src/components/ui/card.jsx
import { Card as MuiCard, CardContent as MuiCardContent } from '@mui/material';
import { CardHeader as MuiCardHeader } from '@mui/material';

export const CardTitle = ({ children }) => (
  <Typography variant="h6" fontWeight="bold">
    {children}
  </Typography>
);

export const Card = MuiCard;
export const CardContent = MuiCardContent;
export const CardHeader = MuiCardHeader;
