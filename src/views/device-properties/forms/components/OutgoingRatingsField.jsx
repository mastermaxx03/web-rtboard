import React, { useEffect } from 'react';
import { Grid, TextField, Typography } from '@mui/material';

const MAX_OUTGOINGS = 10;

/**
 * Renders exactly `count` numeric inputs and keeps `value` (array) in sync.
 * - Resizes `value` to `count` while preserving already typed values.
 * - Emits changes via onChange([...]).
 */
export default function OutgoingRatingsField({
  label = 'Outgoing Busbar Ratings (A)',
  count = 0,
  value = [],
  onChange,
  errorMap = {}, // optional: {0: 'Required', 2: 'Invalid', ...}
}) {
  // Clamp count between 0 and MAX_OUTGOINGS
  const n = Math.max(0, Math.min(parseInt(count, 10) || 0, MAX_OUTGOINGS));

  useEffect(() => {
    // Ensure array length matches clamped count
    if (!Array.isArray(value)) {
      onChange(Array.from({ length: n }, () => ''));
      return;
    }
    if (value.length !== n) {
      const resized = Array.from({ length: n }, (_, i) => value[i] ?? '');
      onChange(resized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {label}
          {n ? ` — ${n} ${n === 1 ? 'rating' : 'ratings'}` : ''}
        </Typography>
      </Grid>

      {Array.from({ length: n }).map((_, idx) => (
        <Grid item xs={12} key={idx}>
          <TextField
            type="number"
            size="small"
            fullWidth
            label={`Outgoing #${idx + 1} (A)`}
            inputProps={{ min: 0, max: 10000 }}
            value={(value && value[idx]) ?? ''}
            error={Boolean(errorMap?.[idx])}
            helperText={errorMap?.[idx] ?? ''}
            onChange={(e) => {
              const next = Array.isArray(value) ? [...value] : Array.from({ length: n }, () => '');
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
        </Grid>
      ))}

      {n === 0 && (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Set <b>Number of Outgoings</b> (max {MAX_OUTGOINGS}) to generate rating fields.
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
