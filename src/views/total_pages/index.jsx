import React, { useMemo, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,              // ✅ FIX: added this import
  TableSortLabel,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

/* ---------------------- Page Registry (seed) ---------------------- */
const TELEMETRY = [
  { name: 'Telemetry · LL Voltage', path: '/telemetry/llVoltage', developer: 'Rohit' },
  { name: 'Telemetry · LN Voltage', path: '/telemetry/lnVoltage', developer: 'Rohit' },
  { name: 'Telemetry · Current', path: '/telemetry/current', developer: 'Rohit' },
  { name: 'Telemetry · Power', path: '/telemetry/power', developer: 'Rohit' },
  { name: 'Telemetry · Harmonics', path: '/telemetry/harmonics', developer: 'Rohit' },
  { name: 'Telemetry · PF', path: '/telemetry/pf', developer: 'Rohit' },
  { name: 'Telemetry · Frequency', path: '/telemetry/frequency', developer: 'Rohit' },
  { name: 'Telemetry · Energy', path: '/telemetry/energy', developer: 'Rohit' },
  { name: 'Telemetry · Total Power', path: '/telemetry/totalPower', developer: 'Rohit' }
];

const HISTORICAL = [
  { name: 'Historical · RTW2H', path: '/historical/RTW2H', developer: 'Animesh' },
  { name: 'Historical · RTW3H', path: '/historical/RTW3H', developer: 'Animesh' },
  { name: 'Historical · RTW4H', path: '/historical/RTW4H', developer: 'Rohit' },
  { name: 'Historical · RTW5H', path: '/historical/RTW5H', developer: 'Animesh' },
  { name: 'Historical · RTW6H', path: '/historical/RTW6H', developer: 'Pratik' },
  { name: 'Historical · RTW7H', path: '/historical/RTW7H', developer: 'Pratik' },
  { name: 'Historical · RTW8H', path: '/historical/RTW8H', developer: 'Pratik' },
  { name: 'Historical · RTW11H', path: '/historical/RTW11H', developer: 'Animesh' },
  { name: 'Historical · RTW13H', path: '/historical/RTW13H', developer: 'Animesh' }
];

const EBW = [
  { name: 'EBW · Consumption Trend', path: '/ebw/ebw1', developer: 'Animesh' },
  { name: 'EBW · Demand Details', path: '/ebw/ebw2', developer: 'Animesh' },
  { name: 'EBW · Billing Demand Analysis', path: '/ebw/ebw3', developer: 'Animesh' },
  { name: 'EBW · TOD Cost Analysis', path: '/ebw/ebw4', developer: 'Animesh' },
  { name: 'EBW · Power Factor Analysis', path: '/ebw/ebw5', developer: 'Animesh' },
  { name: 'EBW · Load Factor', path: '/ebw/ebw6', developer: 'Animesh' },
  { name: 'EBW · Bill Component', path: '/ebw/ebw7', developer: 'Animesh' },
  { name: 'EBW · Incentives & Rebates', path: '/ebw/ebw8', developer: 'Animesh' }
];

const PSW = [
  { name: 'Plant Summary · Energy Source', path: '/psw/psw3', developer: 'Animesh' },
  { name: 'Plant Summary · Energy Efficiency', path: '/psw/psw4', developer: 'Animesh' },
  { name: 'Plant Summary · Top 5 Consumptions', path: '/psw/psw5', developer: 'Animesh' },
  { name: 'Plant Summary · Power Outages', path: '/psw/psw7.0', developer: 'Animesh' },
  { name: 'Plant Summary · Plant Breakdown', path: '/psw/psw7.1', developer: 'Animesh' },
  { name: 'Plant Summary · Live Energy Cost', path: '/psw/psw9', developer: 'Animesh' },
  { name: 'Plant Summary · Cost Saving Benchmark', path: '/psw/psw10', developer: 'Animesh' },
  { name: 'Plant Summary · Top 5 Energy Costs', path: '/psw/psw11', developer: 'Animesh' },
  { name: 'Plant Summary · PF/MD Surcharge', path: '/psw/psw12.0', developer: 'Animesh' },
  { name: 'Plant Summary · Energy Loss Costing', path: '/psw/psw12.1', developer: 'Animesh' },
  { name: 'Plant Summary · Energy Charges', path: '/psw/pswa', developer: 'Animesh' }
];

const SINGLES = [
  { name: 'Alert Log', path: '/alert-log', developer: 'Rohit' },
  { name: 'Electricity Bill', path: '/electricity', developer: 'Pratik' },
  { name: 'Total Pages (this)', path: '/total-pages', developer: 'Rohit' },
  { name: 'Date Package', path: '/date-demo-pro', developer: 'Rohit' },
  { name: 'RT Cost', path: '/rt-cost', developer: 'Rohit' },
  { name: 'Electricity Overview', path: '/electricity-overview', developer: 'Pratik' },
  { name: 'Electricity Detail', path: '/electricity/bill-2025-06', developer: 'Pratik' },
  { name: 'Icons', path: '/icons', developer: 'Pratik' }
];

const SEED_PAGES = [...TELEMETRY, ...HISTORICAL, ...EBW, ...PSW, ...SINGLES];

const devChip = (name) => {
  switch (name) {
    case 'Rohit':
      return { color: 'primary' };
    case 'Animesh':
      return { color: 'secondary' };
    case 'Pratik':
      return { color: 'success' };
    default:
      return { color: 'default' };
  }
};

export default function TotalPages() {
  const [pages, setPages] = useState(SEED_PAGES);
  const [order, setOrder] = useState('asc');
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', path: '', developer: '' });

  const sorted = useMemo(() => {
    const arr = [...pages];
    arr.sort((a, b) => (order === 'asc' ? a.developer.localeCompare(b.developer) : b.developer.localeCompare(a.developer)));
    return arr;
  }, [pages, order]);

  const toggleSort = () => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));

  const openAdd = () => {
    setForm({ name: '', path: '', developer: '' });
    setEditIndex(null);
    setDlgOpen(true);
  };
  const openEdit = (idx) => {
    setForm(pages[idx]);
    setEditIndex(idx);
    setDlgOpen(true);
  };
  const saveForm = () => {
    if (!form.name.trim() || !form.path.trim() || !form.developer.trim()) return;
    setPages((prev) => {
      const next = [...prev];
      if (editIndex !== null) next[editIndex] = form;
      else next.push(form);
      return next;
    });
    setDlgOpen(false);
  };

  return (
    <MainCard
      title="Total Pages"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Add Page
        </Button>
      }
    >
      <TableContainer
        sx={{
          borderRadius: 2,
          '& table': { borderCollapse: 'separate', borderSpacing: 0 },
          '& tbody tr:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { borderBottomWidth: 2 } }}>
              <TableCell sx={{ width: '55%' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Page
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '20%' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Action
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '25%' }}>
                <TableSortLabel active direction={order} onClick={toggleSort}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Developer
                  </Typography>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.map((p, i) => (
              <TableRow key={`${p.path}-${i}`} hover sx={{ transition: 'background 120ms ease', '& td': { borderBottomColor: 'divider' } }}>
                <TableCell>
                  <Link href={p.path} target="_blank" rel="noopener noreferrer" underline="hover" color="primary" sx={{ fontWeight: 700 }}>
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Open in new tab">
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<LaunchIcon />}
                        component="a"
                        href={p.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999 }}
                      >
                        Open
                      </Button>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(i)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={p.developer} size="small" variant="outlined" {...devChip(p.developer)} sx={{ fontWeight: 700 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editIndex !== null ? 'Edit Page' : 'Add Page'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Page Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus fullWidth />
          <TextField label="Path (route)" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} fullWidth />
          <TextField label="Developer" value={form.developer} onChange={(e) => setForm({ ...form, developer: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button onClick={saveForm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
