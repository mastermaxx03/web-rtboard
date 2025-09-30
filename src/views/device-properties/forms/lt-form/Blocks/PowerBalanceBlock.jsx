import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const tile = (bg, fg) => ({
  p: 1.25,
  borderRadius: 2,
  bgcolor: bg,
  color: fg,
});

const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const fmtPct = (x) => (x == null || !Number.isFinite(x) ? 'N/A' : `${x.toFixed(1)}%`);
const fmtKw  = (x) => (x == null || !Number.isFinite(x) ? 'N/A' : `${x.toFixed(3)} kW`);

export default function PowerBalanceBlock({
  title = '3PH Power Balance (Total vs R+Y+B)',
  values = {},
}) {
  const ratio = toNum(values.power_balance_ratio_pct);
  const sum   = toNum(values.power_sum_kw);

  const calcLine = `Calculated: ${fmtPct(ratio)} (sum = ${fmtKw(sum)})`;

  return (
    <Box sx={{ borderRadius: 2, border: '1px solid #e4e6eb', p: 2 }}>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={tile('success.light', 'success.contrastText')}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Acceptable Range (Power Balance)
            </Typography>
            <Typography variant="body2">Up to 100%</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {calcLine}
            </Typography> */}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={tile('warning.light', 'warning.contrastText')}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Warning Threshold (Power Balance)
            </Typography>
            <Typography variant="body2">100% – 110%</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {calcLine}
            </Typography> */}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={tile('error.light', 'error.contrastText')}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Critical Threshold (Power Balance)
            </Typography>
            <Typography variant="body2">{'> 110%'}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {calcLine}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
