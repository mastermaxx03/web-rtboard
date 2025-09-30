// src/views/telemetry/llVoltage/components/PerformanceChip.jsx
import React from 'react';
import { Chip } from '@mui/material';
import { PERFORMANCE } from '../utils';

const colorMap = {
  [PERFORMANCE.ACCEPTABLE]: 'success',
  [PERFORMANCE.WARNING]: 'warning',
  [PERFORMANCE.CRITICAL]: 'error'
};

export default function PerformanceChip({ value }) {
  return <Chip size="small" color={colorMap[value] || 'default'} label={value} sx={{ fontWeight: 700 }} />;
}
