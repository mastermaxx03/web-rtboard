// src/views/device-properties/forms/components/PhoneNumberField.jsx

import React from "react";
import { TextField, Typography, Grid } from "@mui/material";

const PhoneNumberField = ({ field, value, error, onChange }) => {
  const handleChange = (e) => {
    let v = e.target.value;

    // Strip non-digits
    v = v.replace(/\D/g, "");

    // Limit to 10 digits
    if (v.length > 10) v = v.slice(0, 10);

    onChange(field.id, v);
  };

  const fieldLabel = (
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {field.label}
      {field.required && <span style={{ color: "red" }}> *</span>}
    </Typography>
  );

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={5}>
        {fieldLabel}
      </Grid>
      <Grid item xs={12} sm={7}>
        <TextField
          fullWidth
          size="small"
          placeholder={field.placeholder || "10-digit mobile number"}
          value={value || ""}
          onChange={handleChange}
          error={!!error}
          helperText={error || field.helperText || "Enter valid 10-digit Indian mobile number"}
          inputProps={{
            minLength: 10, 
            maxLength: 10, 
            inputMode: "numeric",
            pattern: "[6-9][0-9]{9}",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default PhoneNumberField;
