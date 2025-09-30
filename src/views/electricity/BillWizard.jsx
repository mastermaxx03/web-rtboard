import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  Stepper,
  Step,
  StepButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const ELECTRICITY_BILL_API = import.meta.env.VITE_APP_API_ELECTRICITY_BILL;

/* ----------------------------- Discoms (sample) --------------------------- */
const DISCOMS = [
  { value: '', label: 'Select State Board / DISCOM', default: true },
  { value: 'MSEDCL', label: 'Maharashtra – MSEDCL (Mahavitaran)' },
  { value: 'TANGEDCO', label: 'Tamil Nadu – TANGEDCO' },
  { value: 'BESCOM', label: 'Karnataka – BESCOM' },
  { value: 'KSEB', label: 'Kerala – KSEB' },
  { value: 'Others', label: 'Other / Not listed' }
];

/* ----------------------------- Board heuristics --------------------------- */
const BOARD_PATTERNS = {
  DEFAULT: [],
  MSEDCL: [/MSEDCL/i, /MAHADISCOM/i, /MAHARASHTRA/i],
  TANGEDCO: [/TANGEDCO/i, /TNEB/i, /TAMIL\s*NADU/i],
  BESCOM: [/BESCOM/i, /BANGALORE/i],
  KSEB: [/KSEB/i, /KERALA/i],
  Others: []
};

const guessBoardFromFilename = (name = '') => {
  for (const [code, patterns] of Object.entries(BOARD_PATTERNS)) {
    if (patterns.some((rx) => rx.test(name))) return code;
  }
  return null;
};
const checkBoardMismatch = (fileList, selectedBoard) => {
  const mismatches = [];
  Array.from(fileList).forEach((f) => {
    const guessed = guessBoardFromFilename(f.name);
    if ((selectedBoard !== 'Others' && guessed && guessed !== selectedBoard) || (selectedBoard === 'Others' && guessed)) {
      mismatches.push({ name: f.name, guessed });
    }
  });
  return mismatches;
};

/* ----------------------------- Fields & Labels ---------------------------- */

const FIELDS = [
  // Section 1 – Consumer & Connection
  'consumer_number',
  'consumer_name',
  'bill_month',
  'date_of_connection',
  'tariff',
  'feeder_voltage_kv',
  // Section 2 – Load & Demand
  'sanctioned_load_kw',
  'connected_load_kw',
  'contract_demand_kva',
  'demand_75pct_kva',
  'recorder_max_demand',
  'billed_demand_kva',
  // Section 3 – PF & Efficiency
  'assessed_pf',
  'billed_pf',
  // Section 4 – Energy & Charges
  'total_consumption_units',
  'demand_charges',
  'energy_charges',
  'tod_tariff_ec',
  'wheeling_charge',
  'fac',
  'electricity_duty',
  // Section 5 – Rates & Factors
  'billed_demand_rate_rskva',
  'total_consumption_rate_per_units',
  'wheeling_rate_rsu',
  'fac_rate_psu',
  'tax_on_sale_rate_psu',
  // Section 6 – Incentives & Penalties
  'bulk_consumption_rebate',
  'incremental_consumption_rebate',
  'charges_for_excess_demand',
  // Section 7 – Final Bill Summary
  'total_current_bill',
  'total_bill_amount_rounded'
];

const LABELS = {
  assessed_pf: 'Assessed P.F.',
  bill_month: 'BILL OF SUPPLY FOR THE MONTH OF',
  consumer_number: 'Consumer No.',
  consumer_name: 'Consumer Name',
  recorder_max_demand: 'Recorder Max Demand (KVA)',
  sanctioned_load_kw: 'Sanctioned Load (KW)',
  connected_load_kw: 'Connected Load (KW)',
  contract_demand_kva: 'Contract Demand (KVA)',
  demand_75pct_kva: '75% of Con. Demand (KVA)',
  feeder_voltage_kv: 'Feeder Voltage (KV)',
  tariff: 'Tariff',
  date_of_connection: 'Date of Connection',
  billed_demand_kva: 'Billed Demand (KVA)',
  billed_pf: 'Billed P.F.',
  demand_charges: 'Demand Charges',
  wheeling_charge: 'Wheeling Charge',
  energy_charges: 'Energy Charges',
  tod_tariff_ec: 'TOD Tariff EC',
  fac: 'FAC',
  electricity_duty: 'Electricity Duty',
  bulk_consumption_rebate: 'Bulk Consumption Rebate',
  incremental_consumption_rebate: 'Incremental Consumption Rebate',
  charges_for_excess_demand: 'Charges For Excess Demand',
  total_current_bill: 'TOTAL CURRENT BILL',
  total_bill_amount_rounded: 'Total Bill Amount (Rounded) Rs.',
  billed_demand_rate_rskva: 'Billed Demand Rate (Rs./kVA)',
  wheeling_rate_rsu: 'Wheeling Rate (Rs./U)',
  fac_rate_psu: 'FAC Rate (Ps./U)',
  tax_on_sale_rate_psu: 'Tax on Sale Rate (Ps./U)',
  total_consumption_units: 'Total Consumption (Units)',
  total_consumption_rate_per_units: 'Total Consumption Rate (Rs./Unit)'
};

const END_UNITS = {
  billed_demand_rate_rskva: 'Rs./kVA',
  wheeling_rate_rsu: 'Rs./U',
  fac_rate_psu: 'Ps./U',
  tax_on_sale_rate_psu: 'Ps./U',
  // recorder_max_demand: "KVA",
  total_consumption_rate_per_units: 'Rs./Unit'
};

const EMPTY = FIELDS.reduce((o, k) => ((o[k] = ''), o), {});

/* --------------------------- Sections / Step labels ----------------------- */

const SECTIONS = [
  {
    key: 's1',
    title: 'Consumer & Connection Details',
    fields: ['consumer_number', 'consumer_name', 'bill_month', 'date_of_connection', 'tariff', 'feeder_voltage_kv']
  },
  {
    key: 's2',
    title: 'Load & Demand Parameters',
    fields: [
      'sanctioned_load_kw',
      'connected_load_kw',
      'contract_demand_kva',
      'demand_75pct_kva',
      'recorder_max_demand',
      'billed_demand_kva'
    ]
  },
  {
    key: 's3',
    title: 'Power Factor & Efficiency',
    fields: ['assessed_pf', 'billed_pf']
  },
  {
    key: 's4',
    title: 'Energy & Charges',
    fields: ['total_consumption_units', 'demand_charges', 'energy_charges', 'tod_tariff_ec', 'wheeling_charge', 'fac', 'electricity_duty']
  },
  {
    key: 's5',
    title: 'Rates & Factors',
    fields: ['billed_demand_rate_rskva', 'total_consumption_rate_per_units', 'wheeling_rate_rsu', 'fac_rate_psu', 'tax_on_sale_rate_psu']
  },
  {
    key: 's6',
    title: 'Incentives & Penalties',
    fields: ['bulk_consumption_rebate', 'incremental_consumption_rebate', 'charges_for_excess_demand']
  },
  {
    key: 's7',
    title: 'Final Bill Summary',
    fields: ['total_current_bill', 'total_bill_amount_rounded']
  },
  { key: 'preview', title: 'Preview', fields: [] }
];

/* --------------------------- Helpers / formatting ------------------------- */

const MONEY_KEYS = new Set([
  'demand_charges',
  'wheeling_charge',
  'energy_charges',
  'tod_tariff_ec',
  'fac',
  'electricity_duty',
  'bulk_consumption_rebate',
  'incremental_consumption_rebate',
  'charges_for_excess_demand',
  'total_current_bill',
  'total_bill_amount_rounded'
]);

const fmt = (v) => {
  const s = String(v || '').replace(/,/g, '');
  if (!s || isNaN(Number(s))) return v || '';
  const [i, d] = s.split('.');
  const x = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return d ? `${x}.${d}` : x;
};

const formatValue = (key, val) => {
  const s = String(val ?? '').trim();
  if (!s) return '—';
  if (MONEY_KEYS.has(key)) return `₹ ${fmt(s)}`;
  if (key === 'total_consumption_units') return fmt(s);
  if (key === 'assessed_pf' || key === 'billed_pf') {
    const f = parseFloat(s);
    return isNaN(f) ? s : f.toFixed(2);
  }
  return END_UNITS[key] ? `${s} ${END_UNITS[key]}` : s;
};

const below20 = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen'
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const twoDigits = (n) => (n < 20 ? below20[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${below20[n % 10]}` : ''}`);

function numberToIndianWords(numLike) {
  const s = String(numLike ?? '').replace(/[, ]/g, '');
  if (!s || isNaN(Number(s))) return '';
  const [i, d] = s.split('.');
  const n = parseInt(i, 10);
  if (n === 0) return 'Zero Rupees only';
  const parts = [];
  const h = n % 1000;
  let r = Math.floor(n / 1000);
  const th = r % 100;
  r = Math.floor(r / 100);
  const lk = r % 100;
  r = Math.floor(r / 100);
  const cr = r;
  if (cr) parts.push(`${twoDigits(cr)} Crore`);
  if (lk) parts.push(`${twoDigits(lk)} Lakh`);
  if (th) parts.push(`${twoDigits(th)} Thousand`);
  if (h) {
    const H = Math.floor(h / 100),
      last = h % 100;
    if (H) parts.push(`${below20[H]} Hundred${last ? ` and ${twoDigits(last)}` : ''}`);
    else if (last) parts.push(twoDigits(last));
  }
  const paisa = Math.round(parseFloat('0.' + (d || '0')) * 100);
  const paisaWords = paisa ? `${twoDigits(paisa)} Paise` : '';
  return `${parts.join(' ')} Rupees${paisaWords ? ' and ' + paisaWords : ''} only`;
}

/* ------------------------------- Small cards ------------------------------ */

function StatCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value || '—'}
      </Typography>
    </Paper>
  );
}

function SectionCard({ title, fields, formData, onClickLabel }) {
  const missing = fields.filter((k) => !String(formData[k] ?? '').trim());
  const allOk = missing.length === 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        {allOk ? <CheckCircleIcon fontSize="small" color="success" /> : <ErrorOutlineIcon fontSize="small" color="warning" />}
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Chip
          size="small"
          label={`${fields.length - missing.length}/${fields.length} filled`}
          color={allOk ? 'success' : 'warning'}
          sx={{ ml: 'auto' }}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(240px, 340px) 1fr' },
          rowGap: 1,
          columnGap: 2
        }}
      >
        {fields.map((k) => (
          <React.Fragment key={k}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                cursor: 'pointer'
              }}
              onClick={() => onClickLabel?.(k)}
              title="Jump to field"
            >
              {LABELS[k]}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: String(formData[k] ?? '').trim() ? 'text.primary' : 'text.disabled',
                wordBreak: 'break-word'
              }}
            >
              {formatValue(k, formData[k])}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
}

/* ------------------------------- Field row -------------------------------- */

function FieldRow({ id, label, value, onChange, error, endAdornment, note }) {
  return (
    <Box
      id={id}
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        gap: 2,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        '&:hover': { backgroundColor: 'action.hover' },
        flexDirection: { xs: 'column', sm: 'row' }
      }}
    >
      <Typography
        variant="body2"
        sx={{
          minWidth: { xs: '100%', sm: 340 },
          pr: { sm: 2 },
          fontWeight: 600,
          color: 'text.secondary',
          pt: { sm: 0.5 }
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Tooltip title={error ? 'Not found in uploaded file(s)' : ''} sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            size="small"
            value={value}
            onChange={onChange}
            error={error}
            helperText={error ? 'Missing' : undefined}
            FormHelperTextProps={{ sx: { m: 0 } }}
            inputProps={{ style: { fontWeight: 500 } }}
            InputProps={
              endAdornment
                ? {
                    endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>
                  }
                : undefined
            }
          />
        </Tooltip>
        {note ? (
          <Typography variant="caption" sx={{ mt: 0.75, color: 'text.secondary', display: 'block' }}>
            {note}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

/* -------------------------------- Component -------------------------------- */

export default function BillWizard() {
  const [formData, setFormData] = useState(EMPTY);

  // NEW: board & autofill toggle
  const [board, setBoard] = useState('');
  const [autoFill, setAutoFill] = useState(true);

  const [source, setSource] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [usedFiles, setUsedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [boardIssue, setBoardIssue] = useState(null); // { message, files, severity }
  const [acknowledge, setAcknowledge] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const filesInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const lastFilesRef = useRef(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
      folderInputRef.current.setAttribute('multiple', '');
    }
  }, []);

  const missingAll = useMemo(() => FIELDS.filter((k) => !String(formData[k] ?? '').trim()), [formData]);

  const sectionMissing = (idx) => (SECTIONS[idx].fields || []).filter((k) => !String(formData[k] ?? '').trim());

  const canSubmit = acknowledge && missingAll.length === 0;
  const canGoNext = activeStep < SECTIONS.length - 1 ? sectionMissing(activeStep).length === 0 : true;

  const handleChange = (k) => (e) => {
    const v = e.target.value;
    if (k === 'assessed_pf') {
      if (v === '') return setFormData((d) => ({ ...d, assessed_pf: '' }));
      const f = Math.max(0, Math.min(1, parseFloat(v)));
      return setFormData((d) => ({
        ...d,
        assessed_pf: isNaN(f) ? '' : String(f)
      }));
    }
    setFormData((d) => ({ ...d, [k]: v }));
  };

  /* ---------- jump to missing helpers ---------- */
  const gotoField = (key) => {
    const idx = SECTIONS.findIndex((s) => (s.fields || []).includes(key));
    if (idx >= 0) setActiveStep(idx);
    setTimeout(() => {
      const el = document.getElementById(`row-${key}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };
  const gotoFirstMissingGlobal = () => {
    if (missingAll.length) gotoField(missingAll[0]);
  };
  const gotoFirstMissingInStep = () => {
    const list = sectionMissing(activeStep);
    if (list.length) gotoField(list[0]);
  };

  /* ------------------------- helpers to clear inputs ------------------------ */
  const clearFileInputs = () => {
    if (filesInputRef.current) filesInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
    lastFilesRef.current = null;
    setUsedFiles([]);
  };
  const clearBoardAndFiles = () => {
    setBoard('');
    clearFileInputs();
  };

  /* ------------------------- upload / folder logic ------------------------- */

  const pickFiles = () => filesInputRef.current?.click();
  const pickFolder = () => folderInputRef.current?.click();

  const fetchJSON = async (input, init) => {
    const res = await fetch(input, init);
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) {
      const err = new Error(data?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMsg('');
    setBoardIssue(null);
    lastFilesRef.current = fileList;

    // Require a board before uploading
    if (!board) {
      setBoardIssue({
        message: 'Please select a State Board / DISCOM before uploading files.',
        files: Array.from(fileList).map((f) => f.name),
        severity: 'warning'
      });
      clearFileInputs();
      return;
    }

    // Quick client-side mismatch check from filenames
    const mismatches = checkBoardMismatch(fileList, board);
    if (mismatches.length > 0) {
      setBoardIssue({
        message: `Board mismatch: selected '${board}' but file(s) look like ${[...new Set(mismatches.map((m) => m.guessed))].join(
          ', '
        )}. Please re-select both board and files.`,
        files: mismatches.map((m) => m.name),
        severity: 'error'
      });
      clearBoardAndFiles();
      return;
    }

    if (!autoFill) {
      setUsedFiles(Array.from(fileList).map((f) => f.name));
      return;
    }

    await sendUploadToAPI(fileList, board);
  };

  const sendUploadToAPI = async (fileList, boardValue) => {
    if (!fileList || fileList.length === 0) return;

    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append('files', f));
    fd.append('source', 'upload');
    fd.append('board', boardValue || '');

    setLoading(true);
    setErrorMsg('');
    setUsedFiles([]);

    try {
      const json = await fetchJSON(`${ELECTRICITY_BILL_API}/api/autofill`, {
        method: 'POST',
        body: fd
      });

      if (json?.ok && json.fields) {
        setFormData((prev) => ({ ...prev, ...json.fields }));
        setUsedFiles(json.used_files || []);

        // If backend echoes detected board and it differs, treat as mismatch
        const detected = json.detected_board || json.board || null;
        if (detected && boardValue && detected !== boardValue && boardValue !== 'Others') {
          setBoardIssue({
            message: `Board mismatch: selected '${boardValue}' but backend detected '${detected}'. Please re-select both board and files.`,
            files: json.used_files || [],
            severity: 'error'
          });
          clearBoardAndFiles();
          return;
        }

        setBoardIssue(null);
      } else {
        setErrorMsg(json?.error || 'Failed to parse files.');
      }
    } catch (e) {
      // Backend-enforced mismatch (HTTP 422) → clear both board and files
      if (e?.status === 422 && e?.data?.detected_board) {
        setBoardIssue({
          message: e?.data?.error || 'Board mismatch detected by backend. Please re-select both board and files.',
          files: e?.data?.used_files || [],
          severity: 'error'
        });
        clearBoardAndFiles();
        return;
      }
      setErrorMsg(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const { files } = e.dataTransfer || {};
      if (files && files.length) handleFiles(files);
    },
    [autoFill, board]
  );

  const resetAll = () => {
    setFormData(EMPTY);
    setUsedFiles([]);
    setErrorMsg('');
    setBoardIssue(null);
    setAcknowledge(false);
    setActiveStep(0);
    clearBoardAndFiles();
  };

  /* ------------------------------- UI blocks ------------------------------ */

  const AutoFillBlock = (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        background: 'background.paper'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* First row: Discom dropdown + Auto Fill toggle */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="board-label">State Board / DISCOM</InputLabel>
            <Select
              labelId="board-label"
              value={board}
              label="State Board / DISCOM"
              onChange={(e) => setBoard(e.target.value)}
              disabled={loading}
            >
              {DISCOMS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel control={<Switch checked={autoFill} onChange={(_, v) => setAutoFill(v)} />} label="Auto Fill" />
        </Stack>

        <RadioGroup row value={source} onChange={(e) => setSource(e.target.value)}>
          <FormControlLabel value="upload" control={<Radio />} label="Upload folder/files (default)" />
        </RadioGroup>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
        {source === 'upload' ? (
          <>
            <Button variant="contained" onClick={pickFiles} disabled={loading}>
              {autoFill ? 'Pick Files' : 'Pick Files (no autofill)'}
            </Button>
            <Button variant="outlined" onClick={pickFolder} disabled={loading}>
              {autoFill ? 'Pick Folder' : 'Pick Folder (no autofill)'}
            </Button>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Accepted: .pdf,.jpg, .jpeg
            </Typography>
            <input
              ref={filesInputRef}
              type="file"
              accept=".pdf, .jpg, .jpeg"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={folderInputRef}
              type="file"
              accept=".pdf, .jpg, .jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        ) : (
          <Alert severity="info">Currently, only "Upload folder/files" source is supported.</Alert>
        )}
      </Stack>

      {!autoFill && (
        <Alert sx={{ mt: 1 }} severity="info">
          Auto Fill is <b>OFF</b>. Uploads will not be parsed — you can fill fields manually and turn Auto Fill back on anytime.
        </Alert>
      )}

      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Parsing files…</Typography>
        </Stack>
      )}
      {!!errorMsg && (
        <Alert sx={{ mt: 1 }} severity="error">
          {errorMsg}
        </Alert>
      )}
      {boardIssue && (
        <Alert sx={{ mt: 1 }} severity={boardIssue.severity || 'error'}>
          {boardIssue.message}
          {boardIssue.files?.length ? (
            <ul style={{ margin: '6px 0 0 18px' }}>
              {boardIssue.files.map((n) => (
                <li key={n}>
                  <code>{n}</code>
                </li>
              ))}
            </ul>
          ) : null}
        </Alert>
      )}
      {usedFiles.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ mr: 1, mt: '4px' }}>
            Used file(s):
          </Typography>
          {usedFiles.map((f) => (
            <Chip key={f} size="small" label={f} />
          ))}
        </Stack>
      )}
    </Box>
  );

  const wordsForTotal = numberToIndianWords(formData.total_current_bill || '');
  const wordsForRounded = numberToIndianWords(formData.total_bill_amount_rounded || '');

  const renderSection = (sectionIdx) => {
    const sec = SECTIONS[sectionIdx];

    if (sec.key === 'preview') {
      return (
        <Box sx={{ mt: 2 }}>
          {missingAll.length > 0 && (
            <Alert
              severity="warning"
              sx={{ mb: 2, alignItems: 'center' }}
              action={
                <Tooltip title="Go to the first missing field">
                  <IconButton color="inherit" size="small" onClick={gotoFirstMissingGlobal}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              Missing fields: {missingAll.map((k) => LABELS[k]).join(', ')}
            </Alert>
          )}

          {/* Quick KPIs */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 1.5,
              mb: 2
            }}
          >
            <StatCard
              label={LABELS.total_consumption_units}
              value={formatValue('total_consumption_units', formData.total_consumption_units)}
            />
            <StatCard label={LABELS.energy_charges} value={formatValue('energy_charges', formData.energy_charges)} />
            <StatCard label={LABELS.total_current_bill} value={formatValue('total_current_bill', formData.total_current_bill)} />
            <StatCard
              label={LABELS.total_bill_amount_rounded}
              value={formatValue('total_bill_amount_rounded', formData.total_bill_amount_rounded)}
            />
          </Box>

          {/* Sectioned details with quick jump */}
          {SECTIONS.filter((s) => s.key !== 'preview').map((s) => (
            <SectionCard key={s.key} title={s.title} fields={s.fields} formData={formData} onClickLabel={gotoField} />
          ))}

          {/* Words */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Amounts in words
            </Typography>
            <Typography variant="body2">
              <b>{LABELS.total_current_bill}:</b> {wordsForTotal || '—'}
            </Typography>
            <Typography variant="body2">
              <b>{LABELS.total_bill_amount_rounded}:</b> {wordsForRounded || '—'}
            </Typography>
          </Paper>

          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Checkbox checked={acknowledge} onChange={(e) => setAcknowledge(e.target.checked)} />}
            label="I reviewed, re-verified, and confirm all entries are correct."
          />
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        {sec.fields.map((k) => (
          <FieldRow
            key={k}
            id={`row-${k}`}
            label={LABELS[k]}
            value={formData[k] ?? ''}
            onChange={handleChange(k)}
            error={!String(formData[k] ?? '').trim()}
            endAdornment={END_UNITS[k]}
            note={
              k === 'total_current_bill' && wordsForTotal
                ? wordsForTotal
                : k === 'total_bill_amount_rounded' && wordsForRounded
                  ? wordsForRounded
                  : undefined
            }
          />
        ))}
      </Box>
    );
  };

  const sectionIsDone = (i) => (SECTIONS[i].fields || []).every((k) => String(formData[k] ?? '').trim());

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Electricity Bill Extraction
        </Typography>

        {AutoFillBlock}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'background.paper',
            pt: 1,
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Stepper alternativeLabel nonLinear activeStep={activeStep} sx={{ px: 1 }}>
            {SECTIONS.map((s, i) => (
              <Step key={s.key} completed={sectionIsDone(i)}>
                <StepButton color="inherit" onClick={() => setActiveStep(i)}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {s.title}
                  </Typography>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: 2 }} />

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip color={missingAll.length ? 'warning' : 'success'} label={`Filled ${FIELDS.length - missingAll.length}/${FIELDS.length}`} />
          {missingAll.length > 0 && (
            <Tooltip title="Go to the first missing field (any section)">
              <IconButton size="small" onClick={gotoFirstMissingGlobal}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>
          {SECTIONS[activeStep].title}
        </Typography>
        {renderSection(activeStep)}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}>
            Back
          </Button>

          {activeStep < SECTIONS.length - 1 ? (
            <>
              <Button variant="contained" disabled={!canGoNext} onClick={() => setActiveStep((s) => s + 1)}>
                {activeStep === SECTIONS.length - 2 ? 'Go to Preview' : 'Next'}
              </Button>
              {sectionMissing(activeStep).length > 0 && (
                <Tooltip title="Go to the first missing field in this section">
                  <IconButton size="small" onClick={gotoFirstMissingInStep}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled={!canSubmit}
              onClick={() => {
                window.alert('Submitted successfully');
                console.log('SUBMIT', { board, autoFill, formData, usedFiles });
              }}
            >
              Submit
            </Button>
          )}

          <Button variant="text" onClick={resetAll}>
            Clear
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
