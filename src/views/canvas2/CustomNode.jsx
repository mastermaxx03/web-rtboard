import React from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography, Box, Tooltip } from '@mui/material';
import { DeviceIcon } from './iconLibrary';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useMachineStatus } from '../../contexts/MachineStatusContext';
function CustomNode({ data, selected }) {
  const { statuses } = useMachineStatus();

  const performanceInfo = statuses[data.deviceId] || { status: 'unknown', score: null };
  const currentStatus = performanceInfo.status;
  console.log(`[Custom Node] My ID is "${data.deviceId}". I am checking for my status. All statuses are:`, statuses);

  let borderColor = data.borderColor || '#1a192b';
  let borderWidth = data.borderWidth ?? 1;
  let borderStyle = data.borderStyle || 'solid'; // Start with the default
  let statusColor = '#9E9E9E';
  let glowClass = '';
  // --- END NEW ---

  if (currentStatus === 'critical') {
    borderColor = '#ef4444'; // Red
    borderWidth = 5; // Thicker
    borderStyle = 'solid';
    glowClass = 'node-glow-critical';
    statusColor = '#ef4444';
  } else if (currentStatus === 'warning') {
    borderColor = '#FFBF00'; // Yellow / Orange
    borderWidth = 4; // Thicker
    borderStyle = 'solid';
    glowClass = 'node-glow-warning';
    statusColor = '#FFBF00'; // Apply warning glow
  } else if (currentStatus === 'acceptable') {
    borderWidth = 2;
    borderStyle = 'solid';
    statusColor = '#22c55e';
  }

  // const wifiStatusColor = data.isActive === true ? '#4CAF50' : '#F44336';
  const deviceStatusColor = data.deviceStatus === true ? '#32CD32' : data.deviceStatus === false ? '#F44336' : '#9E9E9E';
  const tooltipContent = (
    <Box sx={{ p: 1, color: '#fff' }}>
      <Typography variant="body2" sx={{ color: '#000' }}>
        <strong>DID:</strong> {data.deviceId || 'N/A'}
      </Typography>

      {performanceInfo.score !== null && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#000' }}>
            <strong>RT Score:</strong> {performanceInfo.score}%
          </Typography>
          {/* This is the new status indicator dot */}
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: statusColor
            }}
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        {/* <Typography variant="body2" sx={{ color: '#000' }}>
          <strong>KPI Score:</strong> NA
        </Typography> */}
        {/* This is the new status indicator dot */}
        <Box />
      </Box>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="top"
      arrow
      slotProps={{
        popper: {
          sx: {
            zIndex: 10000,
            '& .MuiTooltip-tooltip': {
              backgroundColor: 'white', // Set background to white
              boxShadow: 3, // Add a subtle shadow for better contrast
              color: 'black' // Ensure default text color is black for general elements
            },
            '& .MuiTooltip-arrow': {
              color: 'white' // Ensure the arrow matches the background
            }
          }
        }
      }}
    >
      <Paper
        elevation={selected ? 6 : 3}
        className={glowClass}
        sx={{
          backgroundColor: data.color || '#eeeeee',
          padding: '10px 15px',
          borderRadius: '4px',
          border: `${borderWidth}px ${borderStyle} ${borderColor}`,
          boxShadow: selected ? '0 0 0 2px dodgerblue' : 'none',
          width: 120, // Make it narrower
          height: 150
        }}
      >
        <Handle type="target" position={Position.Top} />
        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
          {data.isActive === true ? (
            <WifiIcon sx={{ color: '#32CD32', fontSize: '18px' }} />
          ) : (
            <WifiOffIcon sx={{ color: '#F44336', fontSize: '18px' }} />
          )}
        </Box>
        {/* <Box
          sx={{
            width: 10,
            height: 10,
            backgroundColor: wifiStatusColor,
            borderRadius: '50%',
            position: 'absolute',
            top: 5,
            right: 5,
            border: '1px solid #fff'
          }}
        /> */}
        <Box
          sx={{
            width: 13,
            height: 13,
            backgroundColor: deviceStatusColor,
            borderRadius: '50%',
            position: 'absolute',
            top: 7, // Positioned below the first dot
            left: 5,
            border: '1px solid white'
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column', // Stack icon and text vertically
            alignItems: 'center', // Center horizontally
            justifyContent: 'center', // Center vertically within available space
            height: '100%', // Make sure this box takes up full height of the parent Paper
            paddingTop: '10px', // Add some padding to prevent content from touching the top handle
            paddingBottom: '10px', // Add some padding to prevent content from touching the bottom handle
            gap: '12px' // Increase space between icon and text
          }}
        >
          {/* Device Icon */}
          <DeviceIcon iconName={data.icon} style={{ width: '48px', height: '48px', display: 'block' }} />

          {/* Device Name Text */}
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '16px', // Make text bigger
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            {data.deviceName}
          </Typography>
        </Box>
        {/* <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <DeviceIcon iconName={data.icon} style={{ fontSize: '24px' }} />
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>{data.deviceName}</Typography>
        </Box> */}

        <Handle type="source" position={Position.Bottom} />
      </Paper>
    </Tooltip>
  );
}

export default CustomNode;
