// src/views/plant-info/PlantInfoPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Button, CircularProgress, Divider } from '@mui/material';
import { toast } from 'react-toastify';

import CompactStepper from './CompactStepper';
import { getPlantInfoSteps } from './index';
import { validateField } from './utils/validation';
import { transformPlantInfoForBackend } from './utils/transformer';

// field components
import TextInputField from './components/TextInputField';
import DropdownField from './components/DropdownField';
import PhoneNumberField from './components/PhoneNumberField';
import EmailField from './components/EmailField';
import UrlField from './components/UrlField';
import DateField from './components/DateField';
import RepeaterList from './components/RepeaterList';
import AddressPackage from './components/AddressPackage';
import ButtonGroupField from './components/ButtonGroupField';
// NEW
import BillingDayField from './components/BillingDayField';

// blocks
import ShiftBlock from './blocks/ShiftBlock';
import ToDZonesBlock from './blocks/ToDZonesBlock';

// 👇 NEW: Preview component
import PlantInfoPreviewView from './PlantInfoPreviewView';

// step icons
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';

// map types → renderer
const fieldMap = {
  text: TextInputField,
  textarea: TextInputField,
  number: TextInputField,
  dropdown: DropdownField,
  phone: PhoneNumberField,
  email: EmailField,
  url: UrlField,
  date: DateField,
  'repeater-list': RepeaterList,
  'address-package': AddressPackage,
  'button-group': ButtonGroupField,
  'shift-block': ShiftBlock,
  'tod-zones-block': ToDZonesBlock,
  'billing-day': BillingDayField,
  preview: () => null, // handled specially
  header: () => null
};

export default function PlantInfoPage() {
  const { plantId } = useParams(); // optional

  const [steps, setSteps] = useState([]);
  const [active, setActive] = useState(0);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = getPlantInfoSteps();
    setSteps(s);

    const init = {};
    s.forEach((sec) =>
      sec.fields.forEach((f) => {
        if (f.defaultValue !== undefined) init[f.id] = f.defaultValue;
      })
    );
    setData(init);
    setErrors({});
    setValidated({});
    setActive(0);
    setLoading(false);
  }, []);

  // stepper labels + icons
  const SHORTS = ['Company', 'Billing & Ops', 'Preview'];
  const ICONS = [<BusinessIcon />, <ReceiptLongIcon />, <VisibilityIcon />];
  const stepMeta = useMemo(
    () =>
      steps.map((s, i) => ({
        label: s.label,
        shortLabel: SHORTS[i] || s.label,
        icon: ICONS[i]
      })),
    [steps]
  );

  const setValue = useCallback((id, value) => {
    setData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const canGoTo = (target) => {
    if (target <= active) return true;
    for (let i = 0; i < target; i++) if (!validated[i]) return false;
    return true;
  };

  const validateStep = (idx = active) => {
    const fields = steps[idx]?.fields || [];
    const newErrs = {};
    fields.forEach((f) => {
      if (f.type === 'header' || f.type === 'preview') return; // skip preview
      if (f.dependsOn) {
        const { field, equals } = f.dependsOn;
        if (data[field] !== equals) return;
      }
      const msg = validateField(f, data[f.id]);
      if (msg) newErrs[f.id] = msg;
    });
    setErrors(newErrs);
    const ok = Object.keys(newErrs).length === 0;
    setValidated((prev) => ({ ...prev, [idx]: ok }));
    return ok;
  };

  const saveDraft = async () => {
    const payload = transformPlantInfoForBackend(data, plantId);
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_POLICY}/api/v1/plant-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(res.statusText);
      await res.json().catch(() => ({}));
      toast.success('Draft saved');
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Failed to save draft');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    saveDraft(); // fire & forget
    setActive((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    const ok = await saveDraft();
    if (ok) toast.success('Plant Info submitted!');
  };

  const renderField = (f) => {
    if (f.type === 'header') {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'primary.main',
              fontWeight: 900,
              mb: 0.5
            }}
          >
            {f.label}
          </Typography>
          <Box
            sx={{
              height: 2,
              width: '100%',
              backgroundColor: 'divider',
              opacity: 0.7,
              borderRadius: 2
            }}
          />
        </Box>
      );
    }

    if (f.type === 'preview') {
      const previewSections = steps.slice(0, -1);
      return <PlantInfoPreviewView sections={previewSections} values={data} />;
    }

    if (f.dependsOn) {
      const { field, equals } = f.dependsOn;
      if (data[field] !== equals) return null;
    }

    const Cmp = fieldMap[f.type];
    if (!Cmp) return null;
    return <Cmp field={f} value={data[f.id]} error={errors[f.id]} onChange={setValue} />;
  };

  if (loading) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 900,
          letterSpacing: 0.3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        Plant Info
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <CompactStepper
        steps={stepMeta}
        activeStep={active}
        onStepClick={(i) => (canGoTo(i) ? setActive(i) : toast.error('Validate previous step(s)'))}
      />

      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={2}>
          {(steps[active]?.fields || []).map((f) => (
            <Grid item xs={12} key={f.id || f.label}>
              {renderField(f)}
            </Grid>
          ))}
        </Grid>
      </Box>

      {Object.keys(errors).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error" variant="body2">
            Please fix the highlighted fields.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setData({});
              setErrors({});
              setValidated({});
              toast.info('Form cleared');
            }}
          >
            Reset
          </Button>
          <Button onClick={saveDraft} disabled={submitting}>
            {submitting ? <CircularProgress size={22} /> : 'Save Draft'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {active > 0 && (
            <Button onClick={() => setActive((s) => s - 1)} color="inherit">
              Back
            </Button>
          )}
          <Button onClick={validateStep}>Validate</Button>
          {active < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={submitting}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
              Submit
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
