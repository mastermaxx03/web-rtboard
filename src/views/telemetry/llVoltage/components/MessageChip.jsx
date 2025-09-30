import React from 'react';
import { Chip } from '@mui/material';

export const MessageChip = ({ message, severity }) => {
  const color =
    message === 'Returned to Normal' ? 'success' : severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'default';
  return <Chip size="small" color={color} label={message} sx={{ fontWeight: 700 }} />;
};
