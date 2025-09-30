import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const DateField = ({ field, value, onChange, error }) => {
  const handle = (d) => onChange(field.id, d ? d.format('YYYY-MM-DD') : '');
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={field.label}
        value={value ? dayjs(value) : null}
        onChange={handle}
        sx={{ width: '100%' }}
        slotProps={{
          textField: { fullWidth: true, required: field.required, size: 'small', error: !!error, helperText: error || field.helperText }
        }}
      />
    </LocalizationProvider>
  );
};
export default DateField;
