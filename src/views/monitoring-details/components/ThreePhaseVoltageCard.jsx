import React from 'react';
import { Card, CardHeader, CardContent, Typography, Grid, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import HistoryIcon from '@mui/icons-material/History';

const ThreePhaseVoltageCard = ({ VRY, VYB, VBR }) => {
  const voltages = [
    { name: 'VRY', value: VRY },
    { name: 'VYB', value: VYB },
    { name: 'VBR', value: VBR }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const average = ((VRY + VYB + VBR) / 3).toFixed(2);
  const maxDev = Math.max(Math.abs(VRY - average), Math.abs(VYB - average), Math.abs(VBR - average)).toFixed(2);

  return (
    <Card sx={{ width: 350, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 5, margin: '6px' }}>
      <CardHeader
        title="3Ph L-L Voltage"
        action={
          <Typography variant="caption">
            <HistoryIcon color="inherit" />
          </Typography>
        }
        sx={{ pb: 0, pl: 1, pr: 2, pt: 1 }}
      />
      <CardContent>
        <Grid container spacing={0}>
          <Grid item xs={7.5}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={voltages} dataKey="value" nameKey="name" outerRadius={50} innerRadius={20} label={({ name }) => name}>
                  {voltages.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={4.5}>
            {/* {voltages.map((v) => (
              <Typography key={v.name} variant="body2">
                {v.name}: {v.value.toFixed(2)} V
              </Typography>
            ))} */}

            <Typography key={VRY} variant="body2" color="#0088FE">
              V<sub>RY</sub> : {VRY.toFixed(2)} V
            </Typography>

            <Typography key={VRY} variant="body2" color="#00C49F">
              V<sub>YB</sub> : {VYB.toFixed(2)} V
            </Typography>

            <Typography key={VRY} variant="body2" color="#FFBB28">
              V<sub>BR</sub> : {VBR.toFixed(2)} V
            </Typography>

            <Box mt={1}>
              <br />

              <Typography variant="body2">
                V<sub>avg</sub>: {average} V
              </Typography>

              <Typography variant="body2">Max Dev: {maxDev} V</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ThreePhaseVoltageCard;
