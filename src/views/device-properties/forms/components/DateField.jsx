import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const DateField = ({ field, value, onChange, error }) => {
  // The MUI DatePicker's onChange returns a dayjs object.
  // This handler formats it to a 'YYYY-MM-DD' string before calling the main form's onChange.
  const handleDateChange = (newValue) => {
    const formattedValue = newValue ? newValue.format('YYYY-MM-DD') : '';
    onChange(field.id, formattedValue);
  };

  // The DatePicker component requires a dayjs object or null, not a string.
  // We convert the string value from our form state here.
  const dateValue = value ? dayjs(value) : null;

  return (
    // LocalizationProvider is required by @mui/x-date-pickers to handle date logic.
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={field.label}
        value={dateValue}
        onChange={handleDateChange}
        sx={{ width: '100%' }} // Ensure it takes up the full grid width
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

export default DateField;
