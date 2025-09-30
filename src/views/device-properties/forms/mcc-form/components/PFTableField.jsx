import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const PFTableField = ({ field, value, onChange, error, externalSchemeKey }) => {
  const hasSchemes = Array.isArray(field.schemes) && field.schemes.length > 0;

  const currentRows = useMemo(() => {
    if (hasSchemes && externalSchemeKey) {
      const scheme = field.schemes.find((s) => s.key === externalSchemeKey);
      return scheme?.rows || field.rows || [];
    }
    return field.rows || [];
  }, [hasSchemes, field.schemes, field.rows, externalSchemeKey]);

  useEffect(() => {
    onChange?.(field.id, currentRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSchemeKey]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        {field.label}
      </Typography>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {field.columns.map((col) => (
                <TableCell key={col.id} align="center" sx={{ fontWeight: 'bold' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(currentRows || []).map((row, idx) => (
              <TableRow key={idx}>
                {field.columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align="center"
                    sx={{
                      color: 'inherit',
                      fontWeight: col.id === 'incentive' || col.id === 'penalty' ? 'bold' : 'normal',
                      ...(col.id === 'incentive' && row[col.id] === '0%' && { color: 'info.main' }),
                      ...(col.id === 'incentive' && row[col.id] !== '0%' && { color: 'success.main' }),
                      ...(col.id === 'penalty' && row[col.id] === '0%' && { color: 'info.main' }),
                      ...(col.id === 'penalty' && row[col.id] !== '0%' && { color: 'error.main' })
                    }}
                  >
                    {row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {(!currentRows || currentRows.length === 0) && (
              <TableRow>
                <TableCell align="center" colSpan={field.columns.length} sx={{ color: 'text.secondary' }}>
                  No rows
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PFTableField;
