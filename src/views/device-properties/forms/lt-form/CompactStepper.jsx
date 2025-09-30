import React from 'react';
import { Stepper, Step, StepLabel, Tooltip, Box } from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ElectricalServicesOutlinedIcon from '@mui/icons-material/ElectricalServicesOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/** Slim connector line */
const SlimConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.divider,
  },
}));

/** Custom bubble icon */
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
        fontSize: 18,
      }}
    >
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
            borderRadius: '50%',
          }}
        />
      )}
    </Box>
  );
}

/**
 * props:
 * - steps: [{ label, shortLabel?, icon? }]
 * - activeStep: number
 * - onStepClick?: (index) => void
 */
export default function HtCompactStepper({ steps, activeStep, onStepClick }) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      connector={<SlimConnector />}
      sx={{
        mb: 2,
        '& .MuiStepLabel-label': { display: 'none' }, // hide default labels
      }}
    >
      {steps.map((s, i) => (
        <Step
          key={s.label}
          completed={i < activeStep}
          onClick={onStepClick ? () => onStepClick(i) : undefined}
          sx={{ cursor: onStepClick ? 'pointer' : 'default' }}
        >
          <StepLabel StepIconComponent={BubbleStepIcon} icon={s.icon} />
          <Tooltip title={s.label} placement="top">
            <Box
              sx={{
                mt: 0.5,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: { xs: 'none', sm: 'block' },
                textAlign: 'center',
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

/** Reusable default icon set (7 icons) */
export const defaultLtStepIcons = [
  <BuildCircleOutlinedIcon fontSize="small" />,
  <ElectricalServicesOutlinedIcon fontSize="small" />,
  <TuneOutlinedIcon fontSize="small" />,
  <BoltOutlinedIcon fontSize="small" />,
  <EnergySavingsLeafOutlinedIcon fontSize="small" />,
  <GraphicEqOutlinedIcon fontSize="small" />,
  <HandymanOutlinedIcon fontSize="small" />,
  <SettingsIcon fontSize='small' />,
  <HistoryToggleOffIcon fontSize='small' />,
  <CheckCircleOutlineIcon fontSize='small' />,
  <VisibilityIcon fontSize='small' />

  
];
