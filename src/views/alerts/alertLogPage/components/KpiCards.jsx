// src/views/alertLogPage/components/KpiCards.jsx
import React from 'react';
import Grid from '@mui/material/Grid2';
import { Card, Stack, Typography, Box } from '@mui/material';

const CARD_HEIGHT = 104; // uniform height for all cards

export const KpiCards = ({ statsView, totalsView, activeCard, toggleCard }) => {
  const config = [
    {
      key: 'PENDING_CRIT',
      title: 'Pending Critical',
      value: statsView.pending_critical,
      total: totalsView?.pending_critical ?? null,
      subtitle: 'Unacknowledged Critical alerts (you)',
      bg: '#FDE7E7',
      border: '#F5C2C2',
      textColor: '#D32F2F'
    },
    {
      key: 'PENDING_WARN',
      title: 'Pending Warning',
      value: statsView.pending_warning,
      total: totalsView?.pending_warning ?? null,
      subtitle: 'Unacknowledged Warning alerts (you)',
      bg: '#FFF3CD',
      border: '#FFE08A',
      textColor: '#F57C00'
    },
    {
      key: 'ACK_CRIT',
      title: 'Acknowledged Critical',
      value: statsView.ack_critical,
      total: totalsView?.ack_critical ?? null,
      subtitle: 'Acknowledged Critical (you)',
      bg: '#E6F4EA',
      border: '#B7E0C2',
      textColor: '#2E7D32'
    },
    {
      key: 'ACK_WARN',
      title: 'Acknowledged Warning',
      value: statsView.ack_warning,
      total: totalsView?.ack_warning ?? null,
      subtitle: 'Acknowledged Warning (you)',
      bg: '#F0FFF4',
      border: '#C9F5D7',
      textColor: '#1B5E20'
    }
  ];

  // compute total alerts for ALL
  const allTotal =
    (totalsView?.pending_critical ?? 0) +
    (totalsView?.pending_warning ?? 0) +
    (totalsView?.ack_critical ?? 0) +
    (totalsView?.ack_warning ?? 0);

  return (
    <>
      {/* ALL button first on the left (slimmer width), same height */}
      <Grid size={{ xs: 6, sm: 3, md: 1.2 }} key="ALL">
        <Card
          onClick={() => toggleCard('ALL')}
          sx={{
            borderRadius: 1.5,
            bgcolor: '#E3F2FD',
            border: '1px solid',
            borderColor: '#90CAF9',
            cursor: 'pointer',
            userSelect: 'none',
            ...activeCard('ALL')
          }}
        >
          <Box
            sx={{
              height: CARD_HEIGHT,
              px: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Stack alignItems="center" spacing={0.8}>
              {/* Title on top */}
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1565C0' }}>
                Total Alerts
              </Typography>
              {/* Number below, smaller */}
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1565C0' }}>
                {allTotal}
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Grid>

      {/* The 4 KPI cards (same as before) */}
      {config.map((c) => (
        <Grid key={c.key} size={{ xs: 12, sm: 6, md: 2.625 }}>
          <Card
            onClick={() => toggleCard(c.key)}
            sx={{
              borderRadius: 1.5,
              bgcolor: c.bg,
              border: '1px solid',
              borderColor: c.border,
              cursor: 'pointer',
              userSelect: 'none',
              ...activeCard(c.key)
            }}
          >
            <Box sx={{ height: CARD_HEIGHT, px: 1.5, py: 1.25, display: 'flex', alignItems: 'stretch' }}>
              <Stack gap={0.5} justifyContent="space-between" sx={{ width: '100%' }}>
                <Typography variant="overline" sx={{ letterSpacing: 1.2, color: c.textColor }}>
                  {c.title.toUpperCase()}
                </Typography>

                {/* value + optional (Total : X) */}
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {c.value}
                  </Typography>
                  {c.total != null && (
                    <Typography variant="h5" sx={{ fontWeight: 700, color: c.textColor }}>
                      (Total : {c.total})
                    </Typography>
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  {c.subtitle}
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Grid>
      ))}
    </>
  );
};
