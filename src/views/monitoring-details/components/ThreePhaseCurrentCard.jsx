import React from 'react';
import { Card, CardHeader, CardContent, Typography, Grid, Box } from '@mui/material';
import { RadialBarChart, RadialBar, Legend, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import HistoryIcon from '@mui/icons-material/History';

const ThreePhaseCurrentCard = ({ IR, IY, IB }) => {
  const data = [
    { name: 'IR', value: IR, fill: '#ff4c4c' },
    { name: 'IY', value: IY, fill: '#ffa500' },
    { name: 'IB', value: IB, fill: '#4c9aff' }
  ];

  const average = ((IR + IY + IB) / 3).toFixed(1);
  const maxDev = Math.max(Math.abs(IR - average), Math.abs(IY - average), Math.abs(IB - average)).toFixed(1);

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
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={7.5}>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={data} startAngle={180} endAngle={-180}>
                <PolarAngleAxis type="number" domain={[0, Math.max(IR, IY, IB)]} angleAxisId={0} tick={false} />
                <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={5} />
              </RadialBarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={4.5}>
            {/* {data.map((d) => (
              <Typography key={d.name} variant="body2" sx={{ color: d.fill }}>
                {d.name}: {d.value.toFixed(2)} A
              </Typography>
            ))} */}

            <Typography key={IR} variant="body2" sx={{ color: '#ff4c4c' }}>
              I<sub>R</sub>: {IR.toFixed(2)} A
            </Typography>
            <Typography key={IY} variant="body2" sx={{ color: '#ffa500' }}>
              I<sub>Y</sub>: {IY.toFixed(2)} A
            </Typography>
            <Typography key={IB} variant="body2" sx={{ color: '#4c9aff' }}>
              I<sub>B</sub>: {IB.toFixed(2)} A
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                I<sub>Avg</sub>: {average} A
              </Typography>
              <Typography variant="body2">Max Dev: {maxDev} A</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ThreePhaseCurrentCard;
