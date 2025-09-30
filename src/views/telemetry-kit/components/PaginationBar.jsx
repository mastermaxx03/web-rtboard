// src/views/telemetry-kit/components/PaginationBar.jsx
import React from 'react';
import { Box, Pagination, Stack, Typography } from '@mui/material';

export default function PaginationBar({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Total: {total ?? 0}
        </Typography>
        <Pagination
          size="small"
          color="primary"
          page={page}
          count={totalPages}
          onChange={(_, p) => onChange(p)}
          siblingCount={1}
          boundaryCount={1}
        />
      </Stack>
    </Box>
  );
}
