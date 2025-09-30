// ButtonAckField.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';

export default function ButtonAckField({ field, value, onChange }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAcknowledge = () => {
    // mark field as acknowledged
    if (onChange) {
      onChange(field.id, true);
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant={field.variant || 'contained'}
        color={field.color || 'primary'}
        onClick={handleClick}
      >
        {field.label || 'Acknowledge & Submit'}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        {field.dialogTitle && <DialogTitle>{field.dialogTitle}</DialogTitle>}
        <DialogContent dividers>
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              fontFamily: 'inherit'
            }}
          >
            {field.dialogContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAcknowledge} variant="contained" color="primary">
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
