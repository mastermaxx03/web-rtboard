import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Button, CircularProgress, Modal } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getMccFormSteps } from './index';
import * as mccCalc from './mccCalculations';

import RangeSelectorField from '../components/RangeSelectorField';
import ButtonGroupField from '../components/ButtonGroupField';
import TextInputField from '../components/TextInputField';
import { DisplayField, FileField } from '../components/OtherFields';
import DateField from '../components/DateField';
import DateTimeField from '../components/DateTimeField';
import ComboInputField from './ComboInputField.jsx';

import { transformDataForBackend } from '../../dataTransformer.jsx';
import { allTiers } from '/src/config/powerFactorTiers.jsx';
import { findTierByLevel } from '/src/utils/calculator';

import CompactStepper, { defaultMccStepIcons } from './CompactStepper';
import ValueWithUnitField from './ValueWithUnitField';

import ThresholdsBlock from './blocks/ThresholdsBlock.jsx';
import ImbalanceBlock from './blocks/ImbalanceBlock.jsx';
import FrequencyBlock from './blocks/FrequencyBlock.jsx';
import CurrentImbalanceBlock from './blocks/CurrentImbalanceBlock.jsx';
import PowerBalanceBlock from './blocks/PowerBalanceBlock.jsx';

import DropdownField from './components/DropdownField';
import PFTableField from './components/PFTableField';
import PFThresholds from './blocks/PFThresholds';
import FormTypeHeader from '../components/FormTypeHeader';
import PhoneNumberField from '../components/PhoneNumberField.jsx';
import MccFormPreview from './MccFormPreview.jsx';
/* ⭐ NEW: import the same acknowledge button used on LT/HT */
import ButtonAckField from '../components/ButtonAckField';

/* ---------------- Backend base & helpers (same pattern as main page) ---------------- */
const API_BASE = 'http://3.111.188.152:9006/api/v1';

async function fetchPolicyByName(name) {
  try {
    const res = await fetch(`${API_BASE}/policy/${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('fetchPolicyByName error:', e);
    return null;
  }
}

async function upsertPolicyByName(name, payload) {
  return fetch(`${API_BASE}/policy/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function createPolicy(payload) {
  return fetch(`${API_BASE}/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function flattenPolicyToForm(policyObj) {
  if (!policyObj || typeof policyObj !== 'object') return null;
  const src = policyObj.jsonObj && typeof policyObj.jsonObj === 'object' ? policyObj.jsonObj : {};
  const flat = {};
  const order = Array.isArray(src.__order) ? src.__order : Object.keys(src);

  order.forEach((k) => {
    if (k === '__order') return;
    const v = src[k];
    if (v && typeof v === 'object') {
      if ('value' in v) {
        flat[k] = v.value;
      } else {
        flat[k] = v; // ranges / misc objects
      }
    } else {
      flat[k] = v;
    }
  });
  return flat;
}
/* ----------------------------------------------------------------------------------- */

const fieldComponentMap = {
  'button-group': ButtonGroupField,
  textarea: TextInputField,
  text: TextInputField,
  number: TextInputField,
  file: FileField,
  display: DisplayField,
  'range-selector': RangeSelectorField,
  date: DateField,
  datetime: DateTimeField,
  'combo-input': ComboInputField,
  'value-with-unit': ValueWithUnitField,
  dropdown: DropdownField,
  threshold: PFThresholds,
  'phone-number': PhoneNumberField
};

const validationLibrary = {
  required: (v) => v !== null && v !== '' && v !== undefined,
  range: (value, limits) => {
    if (!limits) return false;
    if (!value) return true;
    const n = parseFloat(value);
    if (isNaN(n)) return false;
    return n >= limits.min && n <= limits.max;
  }
};

/**
 * Accepts an optional `deviceId` prop from parent.
 * Also reads from:
 *  - query string: ?did=...&type=MCC
 *  - path param: /some-route/:deviceId (if you have such a route)
 */
const MccDevicePropertiesPage = ({ deviceId: deviceIdProp }) => {
  const { deviceId: deviceIdFromPath } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deviceId = deviceIdProp || searchParams.get('did') || deviceIdFromPath || '';

  const typeParam = (searchParams.get('type') || '').trim().toUpperCase(); // MCC | LT | HT

  const [activeStep, setActiveStep] = useState(0);
  const [formSteps, setFormSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPfModalOpen, setIsPfModalOpen] = useState(false);

  const [validatedSteps, setValidatedSteps] = useState({});
  const [isStepValidated, setIsStepValidated] = useState(false);

  // Prevent mouse-wheel from changing number inputs
  useEffect(() => {
    const stopWheelOnNumber = (e) => {
      const focused = document.activeElement;
      if (
        focused &&
        focused.tagName === 'INPUT' &&
        focused.type === 'number' &&
        (e.composedPath ? e.composedPath().includes(focused) : true)
      ) {
        focused.blur();
      }
    };

    document.addEventListener('wheel', stopWheelOnNumber, { passive: true });
    return () => document.removeEventListener('wheel', stopWheelOnNumber);
  }, []);

  // Jump to top on step change
  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    el.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeStep]);

  /**
   * Load steps + defaults + prefill from backend by DID.
   * If ?type=MCC is provided, we render MCC regardless of S3 matching.
   */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Always build MCC steps
        const steps = getMccFormSteps(() => setIsPfModalOpen(true));
        setFormSteps(steps);

        // Seed defaults from step definitions
        const initialValues = {};
        steps.forEach((s) =>
          s.fields.forEach((f) => {
            if (f.defaultValue !== undefined) initialValues[f.id] = f.defaultValue;
          })
        );

        // Optional: try to pull node from S3 if we have a deviceId (non-blocking, but we can hydrate defaults)
        let node = null;
        if (deviceId) {
          try {
            const res = await fetch('https://iot-poc-001.s3.ap-south-1.amazonaws.com/hierarchyData6.json');
            const data = await res.json();
            node = data?.nodes?.find((n) => n.data.deviceId === deviceId) || null;
          } catch {
            // Non-fatal; we still render MCC with defaults
          }
        }

        // Derived init from defaults
        const derived = mccCalc.initMccDerived(initialValues);

        // Base seed
        const seed = {
          ...initialValues,
          ...derived,
          device_id: deviceId || initialValues.device_id // keep deviceId in payload if needed
        };

        // Try to prefill from backend by name = deviceId
        let merged = seed;
        if (deviceId) {
          const previousRaw = await fetchPolicyByName(deviceId);
          if (previousRaw) {
            const flat = flattenPolicyToForm(previousRaw) || {};
            merged = { ...seed, ...flat };
          }
        }

        // Recompute derived after merge to keep dependent display fields correct
        const derivedAfterMerge = mccCalc.initMccDerived(merged);

        setFormData({
          ...merged,
          ...derivedAfterMerge
        });
        setValidatedSteps({});
        setActiveStep(0);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load MCC form.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [deviceId, typeParam]);

  // PF tiers (display only)
  useEffect(() => {
    const level = parseFloat(formData.pf_target);
    const tier = findTierByLevel(level, allTiers);
    const rateDisplay = tier ? `${tier.rate}% ${tier.type}` : 'Invalid Level';
    const rangeDisplay = tier ? `${tier.min} to ${tier.max}` : 'N/A';

    if (formData.pf_rate_display !== rateDisplay || formData.pf_range_display !== rangeDisplay) {
      setFormData((prev) => ({ ...prev, pf_rate_display: rateDisplay, pf_range_display: rangeDisplay }));
    }
  }, [formData.pf_target, formData.pf_rate_display, formData.pf_range_display]);

  // Invalidate step on edits
  useEffect(() => {
    setIsStepValidated(false);
    setValidatedSteps((prev) => ({ ...prev, [activeStep]: false }));
  }, [formData, activeStep]);

  const handleBack = () => setActiveStep((s) => s - 1);

  const canGoToStep = (targetIdx) => {
    if (targetIdx <= activeStep) return true;
    for (let i = 0; i < targetIdx; i++) if (!validatedSteps[i]) return false;
    return true;
  };
  const handleStepClick = (idx) =>
    canGoToStep(idx) ? setActiveStep(idx) : toast.error('Please validate previous step(s) before proceeding.');

  const handleInputChange = useCallback(
    (fieldId, value) => {
      setFormData((prev) => {
        const next = { ...prev, [fieldId]: value };
        mccCalc.applyMccAfterChange(fieldId, next);
        return next;
      });

      if (errors[fieldId]) {
        setErrors((prevErrors) => {
          const e = { ...prevErrors };
          delete e[fieldId];
          return e;
        });
      }
    },
    [errors]
  );

  const handleReset = () => {
    const currentStepFields = formSteps[activeStep]?.fields;
    if (!currentStepFields) return;

    const updates = {};
    currentStepFields.forEach((f) => {
      if (f.defaultValue !== undefined) updates[f.id] = f.defaultValue;
    });

    Object.assign(updates, mccCalc.resetPatchForMccStep(currentStepFields));
    setFormData((prev) => ({ ...prev, ...updates }));
    setValidatedSteps((prev) => ({ ...prev, [activeStep]: false }));
  };

  const validateCurrentStep = () => {
    const fields = formSteps[activeStep].fields;
    const newErrors = {};
    let ok = true;

    for (const f of fields) {
      const value = formData[f.id];
      if (f.required && !validationLibrary.required(value)) {
        newErrors[f.id] = `${f.label || f.id} is required.`;
        ok = false;
      }
      if (ok && f.rules) {
        for (const rule of f.rules) {
          if (rule.type === 'range' && !validationLibrary.range(value, rule.limits)) {
            newErrors[f.id] = rule.message;
            ok = false;
            break;
          }
        }
      }
    }

    // Power step validation
    const isPowerStep = fields.some((f) => f.id === 'total_rated_power_kw');
    if (isPowerStep) {
      const total = Number(formData.total_rated_power_kw);
      const r = Number(formData.r_phase_rated_power);
      const y = Number(formData.y_phase_rated_power);
      const b = Number(formData.b_phase_rated_power);
      const ratio = Number(formData.power_balance_ratio_pct);

      if (
        formData.load_distribution_mode === 'unbalanced' &&
        Number.isFinite(total) &&
        Number.isFinite(r) &&
        Number.isFinite(y) &&
        Number.isFinite(b)
      ) {
        const sum = r + y + b;
        const tol = Math.max(0.001 * total, 0.05);
        if (Math.abs(total - sum) > tol) {
          ok = false;
          newErrors.r_phase_rated_power = `Sum of phases (${sum.toFixed(3)} kW) must equal Total (${total.toFixed(
            3
          )} kW). Difference exceeds tolerance.`;
        }
      }

      if (Number.isFinite(ratio) && ratio > 110) {
        ok = false;
        newErrors.r_phase_rated_power = `Sum of phases exceeds 110% of Total (ratio: ${ratio.toFixed(1)}%).`;
      }
    }

    setErrors(newErrors);
    setIsStepValidated(ok);
    setValidatedSteps((prev) => ({ ...prev, [activeStep]: ok }));
    return ok;
  };

  const saveCurrentDraft = async () => {
    // Remove display-only/transient fields before transform + send
    const clean = (() => {
      const tmp = { ...formData };
      const {
        ll_acceptable_display,
        ll_warning_display,
        ll_critical_display,
        ln_acceptable_display,
        ln_warning_display,
        ln_critical_display,
        acceptable_range_Vdisplay,
        warning_threshold_Vdisplay,
        critical_threshold_Vdisplay,
        pf_rate_display,
        pf_range_display,
        machine_power_kw_display,
        current_imbalance_warning_display,
        current_imbalance_critical_display,
        mpcb_ir_auto_current,
        warning_threshold_freq_display,
        critical_threshold_freq_display,
        power_sum_kw,
        power_balance_ratio_pct,
        power_balance_band,
        ci_acc_display,
        ci_warn_display,
        ci_crit_display,
        pf_acc_display,
        pf_warn_display,
        pf_crit_display,
        ...rest
      } = tmp;
      return rest;
    })();

    const payload = transformDataForBackend ? transformDataForBackend(clean, deviceId) : clean;

    setIsSubmitting(true);
    try {
      // Preferred: upsert by name (name = deviceId)
      let res = await upsertPolicyByName(deviceId, payload);

      // Fallback to POST if PUT-by-name isn't supported
      if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 501)) {
        res = await createPolicy(payload);
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Save failed');
      }

      await res.json();
      toast.success('Draft saved successfully');
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Failed to Save Draft. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = async () => (validateCurrentStep() ? saveCurrentDraft() : false);
  const handleNextClick = async () => {
    const ok = await handleSaveDraftClick();
    if (ok) setActiveStep((s) => s + 1);
  };
  const handleSubmitClick = async () => {
    const ok = await handleSaveDraftClick();
    if (ok) toast.success('FORM SUBMITTED SUCCESSFULLY!');
    navigate('/canvas2');
  };

  const SHORTS = ['Info', 'Input', 'Current', 'Power', 'Energy', 'Power Factor', 'THD', 'Audit', 'General', 'Preview'];
  const stepMeta = useMemo(
    () => formSteps.map((s, i) => ({ label: s.label, shortLabel: SHORTS[i] ?? s.label, icon: defaultMccStepIcons[i] })),
    [formSteps]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderField = (field) => {
    if (field.type === 'hidden') return null;

    // Preview step renderer
    if (field.type === 'preview') {
      const previewSections = formSteps.slice(0, -1);
      return <MccFormPreview sections={previewSections} values={formData} />;
    }

    if (field.type === 'pf-thresholds') {
      return <PFThresholds values={formData} onChange={(k, v) => handleInputChange(k, v)} />;
    }

    if (field.type === 'table') {
      const schemeKey = (field.externalSchemeFieldId && formData[field.externalSchemeFieldId]) || field.defaultScheme || 'msedcl_2025';

      return (
        <PFTableField
          field={field}
          value={formData[field.id]}
          error={errors[field.id]}
          onChange={handleInputChange}
          externalSchemeKey={schemeKey}
        />
      );
    }

    if (field.type === 'header') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: 'primary.main',
              borderBottom: '1px solid #e0e0e0',
              pb: 0.5,
              flexGrow: 1
            }}
          >
            {field.label}
          </Typography>
          {field.renderAccessory && field.renderAccessory()}
        </Box>
      );
    }

    if (field.type === 'power-balance-block') {
      return <PowerBalanceBlock values={formData} />;
    }

    if (field.type === 'thresholds-block') {
      const cfg = field.config || {};
      return (
        <ThresholdsBlock
          title={cfg.title}
          fieldPrefix={cfg.fieldPrefix}
          unit={cfg.unit}
          presets={cfg.presets}
          values={formData}
          onChange={(k, v) => handleInputChange(k, v)}
        />
      );
    }

    if (field.type === 'imbalance-block') {
      const cfg = field.config || {};
      return (
        <ImbalanceBlock
          title={cfg.title}
          fieldPrefix={cfg.fieldPrefix || 'vi'}
          values={formData}
          onChange={(k, v) => handleInputChange(k, v)}
        />
      );
    }

    if (field.type === 'current-imbalance-block') {
      const cfg = field.config || {};
      return (
        <CurrentImbalanceBlock
          title={cfg.title || 'Current Imbalance (%)'}
          fieldPrefix={cfg.fieldPrefix || 'ci'}
          values={formData}
          onChange={(k, v) => handleInputChange(k, v)}
        />
      );
    }

    if (field.type === 'frequency-block') {
      const cfg = field.config || {};
      return (
        <FrequencyBlock
          title={cfg.title}
          fieldId={field.id || 'nominal_frequency'}
          presets={cfg.presets || [50.0, 60.0]}
          step={cfg.step || 0.1}
          values={formData}
          onChange={(k, v) => handleInputChange(k, v)}
        />
      );
    }

    // BALANCED: read-only; UNBALANCED: editable
    if (['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'].includes(field.id)) {
      const isUnbalanced = formData.load_distribution_mode === 'unbalanced';
      if (!isUnbalanced) {
        return (
          <DisplayField
            field={{ ...field, type: 'display' }}
            value={formData[field.id] == null || formData[field.id] === '' ? '—' : `${Number(formData[field.id]).toFixed(3)} kW`}
            error={undefined}
            onChange={undefined}
          />
        );
      }
      const Component = fieldComponentMap[field.type];
      return <Component field={field} value={formData[field.id] ?? ''} error={errors[field.id]} onChange={handleInputChange} />;
    }

    const Component = fieldComponentMap[field.type];
    if (!Component) return null;
    return <Component field={field} value={formData[field.id] ?? ''} error={errors[field.id]} onChange={handleInputChange} />;
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <FormTypeHeader type="MCC" deviceId={deviceId} sx={{ mb: 3 }} />

      <CompactStepper steps={stepMeta} activeStep={activeStep} onStepClick={handleStepClick} />

      <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {(formSteps[activeStep]?.fields || []).map((field) => (
            <Grid key={field.id || field.label} item xs={12}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      </Box>

      {Object.keys(errors).length > 0 && (
        <Box sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
          <Typography color="error" variant="body2" sx={{ fontWeight: 'medium' }}>
            Please complete all mandatory fields for validation.
          </Typography>
        </Box>
      )}

      {isStepValidated && Object.keys(errors).length === 0 && (
        <Box
          sx={{ mt: 2, mb: 1, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'success.main' }}
        >
          <CheckCircleIcon sx={{ mr: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Validation Complete
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSaveDraftClick} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Draft'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {activeStep > 0 && (
            <Button color="inherit" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button onClick={validateCurrentStep}>Validate</Button>

          {activeStep < formSteps.length - 1 ? (
            <Button variant="contained" onClick={handleNextClick} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            /* ⭐ Same Acknowledge & Submit UX as LT/HT */
            <ButtonAckField
              field={{
                id: 'ack_submit',
                label: 'Acknowledge & Submit',
                variant: 'contained',
                color: 'primary',
                dialogTitle: 'Acknowledgement of Standards & Alert Behaviour',
                dialogContent: `By submitting, you acknowledge:
• The alert behaviour configuration selected above (Warning, Critical ≥2 payloads, Auto-reset).
• The applicable standards & regulations listed:
  - IS 8623 (LT switchgear assemblies)
  - IS/IEC 60947 (Low-voltage switchgear)
  - IS 732:2019 (Wiring code)
  - IEC 61439 (Panel design & ratings)
  - Local Utility Board Regulations (as applicable)`,
                requires: [{ field: 'ack_alert_points', equals: 'yes' }]
              }}
              value={formData?.ack_submit}
              onChange={(id, val) => {
                setFormData((prev) => ({ ...prev, [id]: val }));
                if (val === true) handleSubmitClick();
              }}
              disabled={isSubmitting}
            />
          )}
        </Box>
      </Box>

      {/* PF tiers reference modal */}
      <Modal open={isPfModalOpen} onClose={() => setIsPfModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h6">Power Factor Tiers Reference</Typography>
          <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
            {allTiers.map((tier) => (
              <Box key={tier.level} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 1 }}>
                <Typography variant="body2">
                  Level: <strong>{tier.level.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2">
                  ({tier.min} - {tier.max})
                </Typography>
                <Typography
                  color={tier.type === 'Incentive' ? 'success.main' : tier.type === 'Penalty' ? 'error.main' : 'primary.main'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {tier.rate}% {tier.type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default MccDevicePropertiesPage;
