import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const tile = (bg, fg) => ({
  p: 1.25,
  borderRadius: 2,
  bgcolor: bg,
  color: fg
});

const fmtKw = (x) => (x == null || !Number.isFinite(x) ? 'N/A' : `${x.toFixed(3)} kW`);

export default function PowerBalanceBlock({ title = '3PH Power Balance (Total vs R+Y+B)', values = {} }) {
  const total = Number(values.total_rated_power_kw);
  const validTotal = Number.isFinite(total) && total > 0;

  const accUpper = validTotal ? total : null; // ≤ 100% of total
  const warnLo = validTotal ? total : null; // 100% of total
  const warnHi = validTotal ? total * 1.1 : null; // 110% of total
  const critLo = validTotal ? total * 1.1 : null; // > 110% of total

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
              Calculated Range: ≤ {fmtKw(accUpper)}
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
              Calculated Range: {fmtKw(warnLo)} – {fmtKw(warnHi)}
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
              Calculated Range: &gt; {fmtKw(critLo)}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
