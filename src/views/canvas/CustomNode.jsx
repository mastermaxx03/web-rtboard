import React from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography } from '@mui/material';

function CustomNode({ data, selected }) {
  // Construct the border style from individual properties
  const borderWidth = data.borderWidth ?? 1;
  const borderStyle = data.borderStyle || 'solid';
  const borderColor = data.borderColor || '#1a192b';

  return (
    <Paper
      elevation={selected ? 6 : 3}
      sx={{
        backgroundColor: data.color || '#eeeeee',
        padding: '10px 15px',
        borderRadius: '4px',
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        boxShadow: selected ? '0 0 0 2px dodgerblue' : 'none',
        width: 172
      }}
    >
      <Handle type="target" position={Position.Top} />

      <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>{data.deviceName}</Typography>

      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
}

export default CustomNode;
