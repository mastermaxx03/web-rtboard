import { FaExternalLinkAlt } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SketchPicker } from 'react-color';
import { DeviceIcon, iconList } from './iconLibrary';
import SaveIcon from '@mui/icons-material/Save';
import ColorLensIcon from '@mui/icons-material/ColorLens';
const darkBorderColors = ['#000000', '#424242', '#B71C1C', '#1A237E', '#004D40', '#1B5E20'];
import { useNavigate } from 'react-router-dom';
export default function InspectorPanel({ node, onStyleChange, onClose, onPropertyChangeAndSave }) {
  if (!node) return null;
  const navigate = useNavigate();

  const presetColors = ['#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9', '#FFF9C4', '#FFE0B2', '#D7CCC8'];

  const [localDeviceName, setLocalDeviceName] = useState(node.data.deviceName || '');
  const [localDeviceId, setLocalDeviceId] = useState(node.data.deviceId || '');
  const [currentColor, setCurrentColor] = useState(node.data.color || '#fff');
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [note, setNote] = useState(node.data.note || '');
  const [localSlaveId, setLocalSlaveId] = useState(node.data.SlaveId || '');
  //warning before property type
  const [dialogStep, setDialogStep] = useState(0); // 0 = closed, 1 = first warning, 2 = second warning
  const [pendingTypeChange, setPendingTypeChange] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  // We will reuse the dialog for the final configuration form

  useEffect(() => {
    setLocalDeviceName(node.data.deviceName || '');
    setLocalDeviceId(node.data.deviceId || '');
    setCurrentColor(node.data.color || '#fff');
    setNote(node.data.note || '');
    setLocalSlaveId(node.data.SlaveId || '');
  }, [node.id, node.data.deviceName, node.data.deviceId, node.data.color, node.data.note, node.data.SlaveId]);

  const handleTypeChangeAttempt = (event) => {
    // Don't change the value yet, just store it and start the confirmation
    setPendingTypeChange(event.target.value);
    setDialogStep(1); // Open the first warning dialog
  };

  const handleConfirmation = () => {
    setDialogStep(2); // Move to the second warning
  };
  const handleKeyDown = (event) => {
    // Check if the key is 'Delete' or 'Backspace'
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Stop the event from bubbling up to the global listeners
      event.stopPropagation();
    }
  };

  // const handleFinalConfirmation = async () => {
  //   onStyleChange(node.id, { propertyType: pendingTypeChange });
  //   await onSave();
  //   const deviceId = node.data.deviceId;
  //   const newType = pendingTypeChange;

  //   if (deviceId && newType) {
  //     const path = `/canvas2/device-properties?did=${deviceId}&type=${newType}`;

  //     navigate(path);
  //   }

  //   // Reset and open the config form
  //   handleCloseDialog();
  // };
  const handleFinalConfirmation = async () => {
    // Call the single, powerful function from the parent and wait for the result
    const success = await onPropertyChangeAndSave(node.id, { propertyType: pendingTypeChange });

    // Only navigate if the save was successful
    if (success) {
      const deviceId = node.data.deviceId;
      const newType = pendingTypeChange;

      // --- THIS IS THE CORRECTED LINE ---
      const path = `/canvas2/device-properties?did=${deviceId}&type=${newType}`;

      navigate(path);
    }

    handleCloseDialog();
  };
  const handleCloseDialog = () => {
    setDialogStep(0);
    setPendingTypeChange(null);
    setConfirmText('');
  };

  const handleChange = (property, value) => {
    onStyleChange(node.id, { [property]: value });
  };
  const handleSaveNote = () => {
    onStyleChange(node.id, { note: note });
    // we can add a notification here to confirm the save
  };

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
  };

  const handleColorChangeComplete = (color) => {
    onStyleChange(node.id, { color: color.hex });
  };
  const isConfigDisabled = !node.data.propertyType;

  return (
    <Paper
      elevation={3}
      sx={{
        width: '280px',
        p: 2,
        zIndex: 10,
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Properties
        </Typography>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <InputLabel>Panel Type</InputLabel>
        <Select
          label="Panel Type"
          value={node.data.propertyType || ''}
          onChange={handleTypeChangeAttempt} // Use the new handler
        >
          <MenuItem value={'LT'}>LT</MenuItem>
          <MenuItem value={'HT'}>HT</MenuItem>
          <MenuItem value={'MCC'}>MCC</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Panel Name"
        fullWidth
        variant="outlined"
        size="small"
        value={localDeviceName}
        onChange={(e) => setLocalDeviceName(e.target.value)}
        onBlur={() => handleChange('deviceName', localDeviceName)}
        sx={{ mt: 2 }}
        onKeyDown={handleKeyDown}
      />
      <Dialog open={dialogStep > 0} onClose={handleCloseDialog}>
        {dialogStep === 1 && (
          <>
            <DialogTitle>Change Panel Type?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Changing the panel type will reset its current properties. You will need to fill out the configuration form again.
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleConfirmation} variant="contained" color="warning">
                Proceed
              </Button>
            </DialogActions>
          </>
        )}
        {dialogStep === 2 && (
          <>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                This action cannot be undone. To proceed, please type CONFIRM in the box below.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Type CONFIRM to proceed"
                type="text"
                fullWidth
                variant="outlined"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleFinalConfirmation} variant="contained" color="error" disabled={confirmText !== 'CONFIRM'}>
                Confirm Change
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --- 5. NEW: Placeholder Configuration Form Dialog --- */}

      <TextField
        label="Device ID"
        fullWidth
        variant="outlined"
        size="small"
        value={localDeviceId}
        onChange={(e) => setLocalDeviceId(e.target.value)}
        onBlur={() => handleChange('deviceId', localDeviceId)}
        sx={{ mt: 2 }}
        onKeyDown={handleKeyDown}
      />
      <TextField
        label="Slave ID"
        fullWidth
        variant="outlined"
        size="small"
        value={localSlaveId}
        onChange={(e) => setLocalSlaveId(e.target.value)}
        onBlur={() => handleChange('SlaveId', localSlaveId)}
        sx={{ mt: 2 }}
        onKeyDown={handleKeyDown}
      />

      {/* --- 3. ADD Note Box and Save Button --- */}
      <TextField
        label="Note"
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        size="small"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        inputProps={{
          maxLength: 180 // Enforce character limit
        }}
        helperText={`${note.length} / 180`} // Show character count
        sx={{ mt: 2 }}
        onKeyDown={handleKeyDown}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSaveNote}
          // Disable button if note hasn't changed to prevent unnecessary saves
          disabled={note === (node.data.note || '')}
        >
          Save Note
        </Button>
      </Box>
      <Tooltip title={isConfigDisabled ? 'Please select a Panel Type first' : 'More Details'}>
        {/* The Box component now acts as the link and its container */}
        <Box
          component="a"
          href={!isConfigDisabled ? `/canvas2/device-properties?did=${node.data.deviceId}&type=${node.data.propertyType}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (isConfigDisabled) e.preventDefault();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 1,
            textDecoration: 'none',
            // Conditional styling based on whether a type is selected
            color: isConfigDisabled ? 'text.disabled' : 'primary.main',
            cursor: isConfigDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          <FaExternalLinkAlt size="14px" />
          <Typography variant="body2">Configuration</Typography>
        </Box>
      </Tooltip>
      {/*icon picker section*/}

      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
        <InputLabel>Icon</InputLabel>
        <Select
          label="Icon"
          value={node.data.icon || 'Custom'} // Set the current value
          onChange={(e) => handleChange('icon', e.target.value)}
          // This part controls how the SELECTED item is displayed in the box
          renderValue={(selectedIconName) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeviceIcon iconName={selectedIconName} />
              {selectedIconName}
            </Box>
          )}
        >
          {/* This part maps your iconList to create the dropdown options */}
          {iconList.map((iconName) => (
            <MenuItem key={iconName} value={iconName}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DeviceIcon iconName={iconName} />
                <Typography variant="body2">{iconName}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* TextFields with all necessary props restored */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Fill Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* Map over the 7 preset colors to create swatches */}
          {presetColors.map((color) => (
            <Tooltip title={color} key={color}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  // Add a highlight if this color is the currently selected one
                  outline: node.data.color === color ? '2px solid dodgerblue' : 'none',
                  outlineOffset: '2px'
                }}
                onClick={() => onStyleChange(node.id, { color: color })}
              />
            </Tooltip>
          ))}

          {/* This is the 8th option to open the full color picker */}
          <Tooltip title="Custom Color">
            <IconButton
              onClick={() => setColorPickerVisible(!isColorPickerVisible)}
              size="small"
              sx={{ border: '1px dashed #ccc', borderRadius: '4px' }}
            >
              <ColorLensIcon />
            </IconButton>
          </Tooltip>

          {/* The full color picker now appears relative to this container */}
          {isColorPickerVisible && (
            <Box sx={{ position: 'absolute', zIndex: 2, top: '100%', right: 0, mt: '8px' }}>
              <Paper elevation={4}>
                <SketchPicker color={currentColor} onChange={handleColorChange} onChangeComplete={handleColorChangeComplete} />
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
      {/* <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Border Color
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {darkBorderColors.map((color) => (
          <Box
            key={`border-${color}`}
            sx={{ width: 24, height: 24, backgroundColor: color, borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' }}
            onClick={() => handleChange('borderColor', color)}
          />
        ))}
      </Box>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Border Style
      </Typography>
      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <InputLabel>Style</InputLabel>
        <Select label="Style" defaultValue={node.data.borderStyle || 'solid'} onChange={(e) => handleChange('borderStyle', e.target.value)}>
          <MenuItem value="solid">Solid</MenuItem>
          <MenuItem value="dashed">Dashed</MenuItem>
          <MenuItem value="dotted">Dotted</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Border Thickness
      </Typography>
      <Slider
        defaultValue={node.data.borderWidth || 1}
        step={1}
        min={0}
        max={10}
        valueLabelDisplay="auto"
        onChangeCommitted={(e, value) => handleChange('borderWidth', value)}
      /> */}
    </Paper>
  );
}
