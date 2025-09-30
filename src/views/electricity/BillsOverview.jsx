// src/views/electricity/BillsOverview.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup,
    TextField, Button, Divider, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { listBills } from '../electricity/e';
import AddIcon from '@mui/icons-material/Add';


const clamp12Months = (start, end) => {
    const s = dayjs(start + '-01');
    let e = dayjs(end + '-01');
    if (e.diff(s, 'month') > 11) e = s.add(11, 'month');
    return [s.format('YYYY-MM'), e.format('YYYY-MM')];
};

const monthsBetween = (startYYYYMM, endYYYYMM) => {
    const s = dayjs(startYYYYMM + '-01');
    const e = dayjs(endYYYYMM + '-01');
    const out = [];
    let d = s.startOf('month');
    while (d.isBefore(e) || d.isSame(e, 'month')) {
        out.push(d.format('YYYY-MM'));
        d = d.add(1, 'month');
    }
    return out;
};

const StatusChip = ({ value }) => {
    const map = {
        paid: { label: 'PAID', color: 'success' },
        not_paid: { label: 'NOT PAID', color: 'warning' },
        pre_paid: { label: 'PRE-PAID', color: 'info' }
    };
    const cfg = map[value] || { label: value, color: 'default' };
    return <Chip size="small" color={cfg.color} label={cfg.label} />;
};

export default function BillsOverview() {
    const navigate = useNavigate();
    const now = dayjs();
    const defaultStart = now.subtract(11, 'month').format('YYYY-MM');
    const defaultEnd = now.format('YYYY-MM');

    const [metric, setMetric] = useState('amount'); // 'amount' | 'units'
    const [start, setStart] = useState(defaultStart);
    const [end, setEnd] = useState(defaultEnd);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const [s, e] = clamp12Months(start, end);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        listBills({ startMonth: s, endMonth: e })
            .then((data) => { if (isMounted) setRows(data); })
            .finally(() => isMounted && setLoading(false));
        return () => { isMounted = false; };
    }, [s, e]);

    const months = useMemo(() => monthsBetween(s, e), [s, e]);

    const seriesData = useMemo(() => {
        const map = Object.fromEntries(months.map((m) => [m, 0]));
        for (const b of rows) {
            if (map[b.month] !== undefined) {
                map[b.month] += metric === 'amount' ? b.amount : b.units;
            }
        }
        return months.map((m) => map[m]);
    }, [months, rows, metric]);

    const option = useMemo(() => ({
        grid: { left: 100, right: 24, top: 24, bottom: 24 },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            valueFormatter: (v) =>
                metric === 'amount'
                    ? `₹ ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : `${Number(v).toLocaleString()} kWh`
        },
        xAxis: {
            type: 'value',
            name: metric === 'amount' ? 'Amount (₹)' : 'Units (kWh)'
        },
        yAxis: {
            type: 'category',
            data: months.map((m) => dayjs(m + '-01').format('MMM YYYY'))
        },
        series: [
            {
                type: 'bar',
                data: seriesData,
                barWidth: 18,
                itemStyle: { borderRadius: [0, 6, 6, 0] }
            }
        ]
    }), [months, seriesData, metric]);

    const onPreset = (type) => {
        if (type === 'last12') {
            setStart(now.subtract(11, 'month').format('YYYY-MM'));
            setEnd(now.format('YYYY-MM'));
        } else if (type === 'thisYear') {
            const y = now.format('YYYY');
            setStart(`${y}-01`);
            setEnd(now.format('YYYY-MM'));
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" sx={{ flex: 1 }}>
                    Electricity — Bills Overview
                </Typography>
                <IconButton onClick={() => onPreset('last12')} title="Reset to last 12 months">
                    <RestartAltIcon />
                </IconButton>
            </Stack>

            <Paper sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <ToggleButtonGroup
                        exclusive
                        value={metric}
                        onChange={(_, v) => v && setMetric(v)}
                        size="small"
                    >
                        <ToggleButton value="amount">Total Bill Amount</ToggleButton>
                        <ToggleButton value="units">Total Units Consumed</ToggleButton>
                    </ToggleButtonGroup>

                    <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                        <TextField
                            label="Start month"
                            type="month"
                            size="small"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            inputProps={{ max: end }}
                        />
                        <TextField
                            label="End month"
                            type="month"
                            size="small"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            inputProps={{ min: start }}
                        />
                        <Button variant="outlined" onClick={() => onPreset('thisYear')}>This Year</Button>
                        <Button variant="outlined" onClick={() => onPreset('last12')}>Last 12M</Button>
                        <Typography variant="caption" sx={{ ml: 'auto' }} color="text.secondary">
                            Max 12 months window
                        </Typography>

                        <Stack direction="row" alignItems="right" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/electricity')}
                            >
                                Add Bill
                            </Button>
                        </Stack>

                    </Stack>
                </Stack>

                <Box sx={{ mt: 2 }}>
                    <ReactECharts
                        notMerge
                        lazyUpdate
                        option={option}
                        style={{ height: Math.max(320, months.length * 36) }}
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Submitted Bills</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {loading ? 'Loading…' : `${rows.length} record(s)`}
                    </Typography>
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Bill No.</TableCell>
                                <TableCell align="right">Units (kWh)</TableCell>
                                <TableCell align="right">Amount (₹)</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {months.map((m) => {
                                const bill = rows.find((b) => b.month === m);
                                return (
                                    <TableRow key={m} hover selected={!!bill}>
                                        <TableCell>{dayjs(m + '-01').format('MMM YYYY')}</TableCell>
                                        <TableCell>{bill?.bill_no || '—'}</TableCell>
                                        <TableCell align="right">
                                            {bill ? bill.units.toLocaleString() : '0'}
                                        </TableCell>
                                        <TableCell align="right">
                                            {bill ? `₹ ${bill.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '₹ 0'}
                                        </TableCell>
                                        <TableCell>
                                            {bill ? <StatusChip value={bill.status} /> : <Chip size="small" label="No bill" />}
                                        </TableCell>
                                        <TableCell>
                                            {bill ? dayjs(bill.submitted_at).format('DD MMM YYYY, HH:mm') : '—'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {bill ? (
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => navigate(`/electricity/${bill.id}`)}
                                                    title="More details"
                                                    size="small"
                                                >
                                                    <OpenInNewIcon />
                                                </IconButton>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">—</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Stack>
    );
}
