import React from 'react';
import { Stepper, Step, StepLabel, Tooltip, Box, StepConnector, styled } from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ElectricalServicesOutlinedIcon from '@mui/icons-material/ElectricalServicesOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';

/** --- visuals: slimmer connector line --- */
const SlimConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${StepConnector.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.divider
  }
}));

/** --- custom step icon bubble --- */
function BubbleStepIcon(props) {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: completed || active ? 'common.white' : 'text.secondary',
        bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
        position: 'relative',
        fontSize: 18
      }}
    >
      {/* `icon` can be a node because we pass it via StepLabel's `icon` prop */}
      {icon}
      {completed && (
        <CheckCircleIcon
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            fontSize: 18,
            color: 'success.main',
            bgcolor: 'background.paper',
            borderRadius: '50%'
          }}
        />
      )}
    </Box>
  );
}

/**
 * steps: [{ label, shortLabel, icon }]
 * activeStep: number
 * onStepClick?: (index) => void
 */
export default function CompactStepper({ steps, activeStep, onStepClick }) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      connector={<SlimConnector />}
      sx={{
        mb: 2,
        '& .MuiStepLabel-label': {
          // we’ll provide our own tiny label; hide the default
          display: 'none'
        }
      }}
    >
      {steps.map((s, i) => (
        <Step
          key={s.label}
          completed={i < activeStep}
          onClick={onStepClick ? () => onStepClick(i) : undefined}
          sx={{ cursor: onStepClick ? 'pointer' : 'default' }}
        >
          <StepLabel StepIconComponent={BubbleStepIcon} icon={s.icon}>
            {/* (won’t render because label hidden via CSS) */}
          </StepLabel>

          {/* Our tiny label under each icon (with full label in a tooltip) */}
          <Tooltip title={s.label} placement="top">
            <Box
              sx={{
                mt: 0.5,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                // hide text on very small screens → icons only
                display: { xs: 'none', sm: 'block' },
                textAlign: 'center'
              }}
            >
              {s.shortLabel || s.label}
            </Box>
          </Tooltip>
        </Step>
      ))}
    </Stepper>
  );
}

/** Export a default MCC icon set you can reuse */
export const defaultMccStepIcons = [
  <BuildCircleOutlinedIcon fontSize="small" />, // Machine Info
  <ElectricalServicesOutlinedIcon fontSize="small" />, // Input & Protection
  <TuneOutlinedIcon fontSize="small" />, // Current Settings
  <BoltOutlinedIcon fontSize="small" />, // Power Monitoring
  <EnergySavingsLeafOutlinedIcon fontSize="small" />, // Energy & PF
  <GraphicEqOutlinedIcon fontSize="small" />, // Harmonics (THD)
  <HandymanOutlinedIcon fontSize="small" /> // Maintenance & General
];
