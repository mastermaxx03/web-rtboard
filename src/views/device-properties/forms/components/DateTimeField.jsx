import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

const DateTimeField = ({ field, value, onChange, error }) => {
  // This handler formats the selection into a standard ISO string for storage.
  const handleDateTimeChange = (newValue) => {
    const formattedValue = newValue ? newValue.toISOString() : '';
    onChange(field.id, formattedValue);
  };

  const dateTimeValue = value && dayjs(value).isValid() ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label={field.label}
        value={dateTimeValue}
        onChange={handleDateTimeChange}
        sx={{ width: '100%' }}
        slotProps={{
          textField: {
            required: field.required,
            error: !!error,
            helperText: error || field.helperText,
            fullWidth: true
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default DateTimeField;
