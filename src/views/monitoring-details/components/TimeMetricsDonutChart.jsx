import React from 'react';
import { Card, CardHeader, CardContent, Typography, Grid, Box } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const TimeMetricsArcMeter = ({ totalHrs, runPct, idlePct }) => {
  const radius = 70;
  const strokeWidth = 14;
  const center = 100;
  const circleCircumference = 2 * Math.PI * radius;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const runAngle = runPct * 360;
  const idleAngle = idlePct * 360;

  return (
    <Card sx={{ width: 350, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 5, margin: '6px' }}>
      <CardHeader
        title="3Φ Current Consumption"
        action={
          <Typography variant="caption">
            <HistoryIcon color="inherit" />
          </Typography>
        }
        sx={{ pb: 0, pl: 1, pr: 2, pt: 1 }}
      />
      <CardContent sx={{ p: 0, pb: '0px !important' }}>
        <Grid container spacing={0}>
          <Grid item xs={7}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <path
                d={describeArc(center, center, radius, 135, 135 + idleAngle)}
                fill="none"
                stroke="#ff9800"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d={describeArc(center, center, radius, 135 + idleAngle, 135 + idleAngle + runAngle)}
                fill="none"
                stroke="#4caf50"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold">
                {totalHrs} Hr
              </text>
              <text x="100" y="115" textAnchor="middle" fontSize="10" fill="#888">
                Total
              </text>
            </svg>
          </Grid>

          <Grid item xs={5}>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
              <Typography key="run" sx={{ color: '#4caf50', fontSize: '1.2rem' }}>
                Run (&gt;50%)
              </Typography>
              <br />
              <Typography key="idle" sx={{ color: '#ff9800', fontSize: '1.2rem' }}>
                Idle (&lt;50%)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TimeMetricsArcMeter;
