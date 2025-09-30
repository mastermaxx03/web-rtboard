import React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

export default function MainCard({ title, secondary, subtitle, children }) {
  const hasHeader = Boolean(title || secondary || subtitle);
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 28px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {hasHeader && (
        <>
          <Box sx={{ p: 2, background: 'white' }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Box>{secondary}</Box>
            </Stack>
          </Box>
          <Divider />
        </>
      )}
      <CardContent sx={{ p: 0 }}>{children}</CardContent>
    </Card>
  );
}
