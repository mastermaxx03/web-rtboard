import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // *** use query params
import { Box, Paper, Typography, Grid, Button, CircularProgress, Modal } from '@mui/material';
import Stack from '@mui/material/Stack'; // *** you use <Stack/> in OutgoingsPreview
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CompactStepper, { defaultLtStepIcons } from './forms/lt-form/CompactStepper';
import HtCompactStepper, { defaultHtStepIcons } from './forms/ht-form/HtCompactStepper';

import FormTypeHeader from './forms/components/FormTypeHeader';

import { getHtFormSteps } from './forms/ht-form';
import { getLtFormSteps } from './forms/lt-form';
import { transformDataForBackend } from './dataTransformer';

import DynamicListField from './forms/components/DynamicListField';
import RangeSelectorField from './forms/components/RangeSelectorField';
import ButtonGroupField from './forms/components/ButtonGroupField';
import TextInputField from './forms/components/TextInputField';
import { DisplayField, FileField } from './forms/components/OtherFields';
import DateField from './forms/components/DateField';
import DateTimeField from './forms/components/DateTimeField';
import ComboInputField from './forms/components/ComboInputField';
import RangeInputField from './forms/components/RangeInputFields';
import OutgoingRatingsField from './forms/components/OutgoingRatingsField';
import PanelOutgoingSupply from './forms/components/PanelOutgoingSupply';
import ButtonAckField from './forms/components/ButtonAckField';
import PhoneNumberField from './forms/components/PhoneNumberField';
import PFTableField from './forms/components/PFTableField';
import DropdownField from './forms/components/DropdownField';
import LtFields from './forms/lt-form/LtFields';
import HtFields from './forms/ht-form/HtFields';

import { allTiers } from '/src/config/powerFactorTiers.jsx';
import { findTierByLevel } from '/src/utils/calculator';
import { seedLtDefaults, resetLtStep, validateLtPowerStep } from './forms/lt-form/ltCalculations';
import { seedHtDefaults, resetHtStep, validateHtPowerStep } from './forms/ht-form/htCalculations';

// Dedicated MCC page (option A)
import MccDevicePropertiesPage from './forms/mcc-form/MccDevicePropertiesPage';

import LtFormPreview from './forms/lt-form/FormPreview';
import HtFormPreview from './forms/ht-form/HtFormPreview';
import { getMccFormSteps } from './forms/mcc-form';

// *** Backend base (fixing the colons)
const API_BASE = 'http://3.111.188.152:9006/api/v1';

// ---------- helpers ----------
const calculateAcceptableRange = (nominalVoltage, percent) => {
  const nominal = parseInt(nominalVoltage, 10);
  if (isNaN(nominal) || !percent) return { display: 'N/A', lower: null, upper: null };
  const deviation = nominal * (percent / 100);
  const lower = parseFloat((nominal - deviation).toFixed(2));
  const upper = parseFloat((nominal + deviation).toFixed(2));
  return { display: `${lower} kV to ${upper} kV`, lower, upper };
};

const calculateWarningRange = (nominalVoltage, percent) => {
  const nominal = parseInt(nominalVoltage, 10);
  if (isNaN(nominal) || !percent) return { display: 'N/A', lower: null, upper: null };
  const deviation = nominal * (percent / 100);
  const lower = parseFloat((nominal - deviation).toFixed(2));
  const upper = parseFloat((nominal + deviation).toFixed(2));
  return { display: `${lower} kV to ${upper} kV`, lower, upper };
};

const calculateCriticalRange = (nominalVoltage, percent) => {
  const nominal = parseInt(nominalVoltage, 10);
  if (isNaN(nominal) || !percent) return { display: 'N/A', lower: null, upper: null };
  const deviation = nominal * (percent / 100);
  const lower = parseFloat((nominal - deviation).toFixed(2));
  const upper = parseFloat((nominal + deviation).toFixed(2));
  return { display: `${lower} kV to ${upper} kV`, lower, upper };
};

export const calculateFrequencyThresholds = (nominalFrequency) => {
  const nominal = parseFloat(nominalFrequency);
  if (isNaN(nominal))
    return {
      warning_threshold_freq_display: 'N/A',
      critical_threshold_freq_display: 'N/A',
      warning_freq_lower: null,
      warning_freq_upper: null,
      critical_freq_lower: null,
      critical_freq_upper: null
    };

  const warningDeviation = nominal * 0.01;
  const warningLow = (nominal - warningDeviation).toFixed(1);
  const warningHigh = (nominal + warningDeviation).toFixed(1);

  const criticalDeviation = nominal * 0.03;
  const criticalLow = (nominal - criticalDeviation).toFixed(1);
  const criticalHigh = (nominal + criticalDeviation).toFixed(1);

  return {
    warning_threshold_freq_display: `${warningLow} Hz to ${warningHigh} Hz`,
    critical_threshold_freq_display: `${criticalLow} Hz to ${criticalHigh} Hz`,
    warning_freq_lower: parseFloat(warningLow),
    warning_freq_upper: parseFloat(warningHigh),
    critical_freq_lower: parseFloat(criticalLow),
    critical_freq_upper: parseFloat(criticalHigh)
  };
};

const parseNumericValueFromString = (str) => {
  if (typeof str !== 'string') return null;
  const match = str.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
};

// ---------- validation helpers ----------
const _isEmpty = (v) => v === undefined || v === null || v === '';
const _toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
};

const validationLibrary = {
  number: (v) => (_isEmpty(v) ? true : Number.isFinite(_toNum(v))),
  integer: (v) => (_isEmpty(v) ? true : Number.isInteger(_toNum(v))),
  min: (v, min) => (_isEmpty(v) ? true : _toNum(v) >= Number(min)),
  max: (v, max) => (_isEmpty(v) ? true : _toNum(v) <= Number(max)),
  inRange: (v, range) => {
    if (_isEmpty(v)) return true;
    const [lo, hi] = Array.isArray(range) ? range : [range?.min, range?.max];
    const n = _toNum(v);
    return Number.isFinite(n) && n >= Number(lo) && n <= Number(hi);
  },
  pattern: (v, pat) => {
    if (_isEmpty(v) || !pat) return true;
    const re = pat instanceof RegExp ? pat : new RegExp(pat);
    return re.test(String(v));
  },
  lengthMin: (v, n) => (_isEmpty(v) ? true : String(v).length >= Number(n)),
  lengthMax: (v, n) => (_isEmpty(v) ? true : String(v).length <= Number(n))
};

// ---------- field registry (generic HT/LT only) ----------
const fieldComponentMap = {
  'button-group': ButtonGroupField,
  textarea: TextInputField,
  text: TextInputField,
  number: TextInputField,
  placeholder: TextInputField,
  file: FileField,
  dropdown: DropdownField,
  'dynamic-list': DynamicListField,
  display: DisplayField,
  'range-selector': RangeSelectorField,
  date: DateField,
  datetime: DateTimeField,
  'combo-input': ComboInputField,
  'range-input': RangeInputField,
  'dynamic-object-list': DynamicListField,
  'outgoing-ratings': OutgoingRatingsField,
  'panel-outgoing-supply': PanelOutgoingSupply,
  'button-ack': ButtonAckField,
  'phone-number': PhoneNumberField,
  table: PFTableField
};

// ---------- API helpers (GET/PUT by name, POST fallback) ----------
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
    method: 'PUT', // change to PATCH if your API expects it
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

// in DevicePropertiesPage.jsx (or wherever flattenPolicyToForm is declared)
function flattenPolicyToForm(policyObj) {
  if (!policyObj || typeof policyObj !== 'object') return null;
  const src = policyObj.jsonObj && typeof policyObj.jsonObj === 'object' ? policyObj.jsonObj : {};
  const flat = {};
  const order = Array.isArray(src.__order) ? src.__order : Object.keys(src);

  order.forEach((k) => {
    if (k === '__order') return; // skip the helper key
    const v = src[k];
    if (v && typeof v === 'object') {
      if ('value' in v && Object.keys(v).length === 1) {
        flat[k] = v.value;
      } else if ('value' in v) {
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

// ---------- Main ----------
const DevicePropertiesPage = () => {
  // *** read query string: ?did=...&type=LT|HT|MCC (case-insensitive)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('did') || searchParams.get('deviceId') || '';
  const typeParam = (searchParams.get('type') || '').trim().toUpperCase();

  const [activeStep, setActiveStep] = useState(0);
  const [formSteps, setFormSteps] = useState([]);
  const [formData, setFormData] = useState({
    section1Fields: '',
    section2Fields: '',
    section3Fields: '',
    section4Fields: '',
    section5Fields: '',
    section6Fields: '',
    section7Fields: '',
    section8Fields: '',
    section9Fields: '',
    section10Fields: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [acceptableRangeConfig, setAcceptableRangeConfig] = useState({ mode: 'default', percent: 5 });
  const [warningRangeConfig, setWarningRangeConfig] = useState({ mode: 'default', percent: 10 });
  const [criticalRangeConfig, setCriticalRangeConfig] = useState({ mode: 'default', percent: 10 });
  const [acceptableRangeVIConfig, setAcceptableRangeVIConfig] = useState({ mode: 'default', percent: 2 });
  const [warningRangeVIConfig, setWarningRangeVIConfig] = useState({ mode: 'default', percent: 2 });
  const [criticalRangeVIConfig, setCriticalRangeVIConfig] = useState({ mode: 'default', percent: 3 });

  const [initialData, setInitialData] = useState({});
  const [formError, setFormError] = useState('');
  const [isStepValidated, setIsStepValidated] = useState(false);
  const [isStepSaved, setIsStepSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPfModalOpen, setIsPfModalOpen] = useState(false);
  const [isLT, setIsLT] = useState(false);
  const [isMCC, setIsMCC] = useState(false);

  // If you already manage validated steps elsewhere, keep that.
  // Creating a safe default here avoids reference errors in canGoToStep.
  const [validatedSteps] = useState([]);

  // *** decide form type from query param first
  useEffect(() => {
    if (typeParam === 'LT') setIsLT(true);
    if (typeParam === 'MCC') setIsMCC(true);
    if (typeParam === 'HT') {
      setIsLT(false);
      setIsMCC(false);
    }
  }, [typeParam]);

  const handleChange = (section, value) => {
    setFormData((prev) => ({ ...prev, [section]: value }));
  };

  const renderField = (field) => {
    if (!field || field.type === 'hidden') return null;

    if (field.type === 'header') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: 'primary.main',
              borderBottom: '1px solid #e0e0e0',
              pb: 1,
              flexGrow: 1
            }}
          >
            {field.label}
          </Typography>
        </Box>
      );
    }

    const Component = fieldComponentMap[field.type];
    if (!Component) {
      console.warn(`No component found for field type: ${field.type}`);
      return null;
    }
    const value = formData[field.id] ?? '';
    return <Component field={field} value={value} error={errors[field.id]} onChange={handleInputChange} />;
  };

  const getFormConfigForPropertyType = (propertyTypeOrKind) => {
    // Accept "4"/"5" or "LT"/"HT"
    const key = String(propertyTypeOrKind).toUpperCase();
    switch (key) {
      // case '5':
      case 'HT':
        return getHtFormSteps(() => setIsPfModalOpen(true));
      // case '4':
      case 'LT':
        return getLtFormSteps(() => setIsPfModalOpen(true));
      // NOTE: No '1' here; MCC has its own page.
      case 'MCC':
        return getMccFormSteps(() => setIsPfModalOpen(true));
      default:
        return [{ label: 'Configuration Missing', fields: [] }];
    }
  };

  // Jump to top on every step change
  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    el.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeStep]);

  // *** Initial load: steps + defaults + prefill
  useEffect(() => {
    const loadFormForDevice = async () => {
      if (!deviceId) {
        toast.error('Missing device id (did) in URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // If query-string type is provided, trust it to select HT/LT/MCC
        let useMcc = typeParam === 'MCC';
        let steps = [];

        if (!useMcc) {
          // HT or LT from query param
          if (typeParam === 'HT' || typeParam === 'LT') {
            steps = getFormConfigForPropertyType(typeParam);
            setIsLT(typeParam === 'LT');
          } else {
            // Fallback: detect from S3 (propertyType: 4=LT, 5=HT, 1=MCC)
            const response = await fetch('https://iot-poc-001.s3.ap-south-1.amazonaws.com/hierarchyData6.json');
            const diagramData = await response.json();
            const currentNode = diagramData.nodes.find((n) => String(n?.data?.deviceId) === String(deviceId));
            if (!currentNode) {
              setFormSteps([{ label: 'Error', fields: [] }]);
              toast.error('Device not found in hierarchy.');
              setIsLoading(false);
              return;
            }
            const propertyType = String(currentNode?.data?.propertyType);
            if (propertyType === '1') {
              useMcc = true;
            } else {
              steps = getFormConfigForPropertyType(propertyType);
              setIsLT(propertyType === '4');
            }
          }
        }

        if (useMcc) {
          setIsMCC(true);
          setIsLoading(false);
          return;
        }

        // normalize special type ids
        steps.forEach((step) => {
          step.fields = step.fields.map((f) => (f.id === 'outgoing_busbar_ratings' ? { ...f, type: 'outgoing-ratings' } : f));
        });
        setFormSteps(steps);

        // collect default values from steps
        const initialValues = {};
        steps.forEach((step) => {
          step.fields.forEach((field) => {
            if (field.defaultValue !== undefined) {
              initialValues[field.id] = field.defaultValue;
            }
          });
        });
        setInitialData(initialValues);

        // seed defaults by form
        let seeded;
        if (isLT || typeParam === 'LT') {
          const ltSeed = seedLtDefaults(initialValues);
          seeded = { ...initialValues, ...ltSeed };
        } else {
          const htSeed = seedHtDefaults(initialValues);
          const initialAcceptable = calculateAcceptableRange(initialValues.nominal_ht_voltage, 5);
          const initialWarning = calculateWarningRange(initialValues.nominal_ht_voltage, 10);
          const initialCritical = calculateCriticalRange(initialValues.nominal_ht_voltage, 10);
          const initialFreqThresholds = calculateFrequencyThresholds(initialValues.nominal_frequency);
          const initialAcceptableVImbalance = `≤ 2%`;
          const initialWarningVImbalance = `> 2%`;
          const initialCriticalVImbalance = `> 3%`;
          seeded = {
            ...initialValues,
            ...htSeed,
            acceptable_range_lower: initialAcceptable.lower,
            acceptable_range_upper: initialAcceptable.upper,
            acceptable_range_display: initialAcceptable.display,
            warning_threshold_display: initialWarning.display,
            warning_threshold_lower: initialWarning.lower,
            warning_threshold_upper: initialWarning.upper,
            critical_threshold_display: initialCritical.display,
            critical_threshold_lower: initialCritical.lower,
            critical_threshold_upper: initialCritical.upper,
            ...initialFreqThresholds,
            acceptable_range_Vdisplay: initialAcceptableVImbalance,
            warning_threshold_Vdisplay: initialWarningVImbalance,
            critical_threshold_Vdisplay: initialCriticalVImbalance
          };
          setAcceptableRangeConfig({ mode: 'default', percent: 5 });
          setWarningRangeConfig({ mode: 'default', percent: 10 });
          setCriticalRangeConfig({ mode: 'default', percent: 10 });
          setAcceptableRangeVIConfig({ mode: 'default', percent: 2 });
          setWarningRangeVIConfig({ mode: 'default', percent: 2 });
          setCriticalRangeVIConfig({ mode: 'default', percent: 3 });
        }

        // try to prefill from backend by name = did
        const previousRaw = await fetchPolicyByName(deviceId);
        if (previousRaw) {
          const flat = flattenPolicyToForm(previousRaw) || {};
          const merged = mergeBackendOntoForm(seeded, flat);
          setFormData(merged);
        } else {
          setFormData(seeded);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load device/form.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormForDevice();
  }, [deviceId, typeParam, isLT]);

  // PF tiers
  useEffect(() => {
    const pfLevel = parseFloat(formData.pf_target);
    const tier = findTierByLevel(pfLevel, allTiers);
    let newRateDisplay = 'Invalid Level';
    let newRangeDisplay = 'N/A';
    if (tier) {
      newRateDisplay = `${tier.rate}% ${tier.type}`;
      newRangeDisplay = `${tier.min} to ${tier.max}`;
    }
    if (formData.pf_rate_display !== newRateDisplay || formData.pf_range_display !== newRangeDisplay) {
      setFormData((prevData) => ({
        ...prevData,
        pf_rate_display: newRateDisplay,
        pf_range_display: newRangeDisplay
      }));
    }
  }, [formData.pf_target, formData.pf_rate_display, formData.pf_range_display]);

  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const handleInputChange = useCallback(
    (fieldId, value) => {
      setFormData((prevData) => {
        const newData = { ...prevData, [fieldId]: value };

        // Power thresholds live calc
        const phaseFields = ['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'];
        if (phaseFields.includes(fieldId)) {
          const r = parseFloat(newData.r_phase_rated_power) || 0;
          const y = parseFloat(newData.y_phase_rated_power) || 0;
          const b = parseFloat(newData.b_phase_rated_power) || 0;
          const total = r + y + b;
          newData.total_rated_power_display = total;

          if (total > 0) {
            const lowerBound = total;
            const upperBound = total * 1.1;

            newData.power_threshold_acceptable_display = `≤ ${lowerBound.toFixed(2)} KVA`;
            newData.power_threshold_warning_display = `${lowerBound.toFixed(2)} KVA to ${upperBound.toFixed(2)} KVA`;
            newData.power_threshold_critical_display = `> ${upperBound.toFixed(2)} KVA`;

            newData.power_threshold_acceptable_upper = lowerBound;
            newData.power_threshold_warning_lower = lowerBound;
            newData.power_threshold_warning_upper = upperBound;
            newData.power_threshold_critical_lower = upperBound;
          } else {
            newData.power_threshold_acceptable_display = 'N/A';
            newData.power_threshold_warning_display = 'N/A';
            newData.power_threshold_critical_display = 'N/A';
          }
        }

        // CB (In × Ir) → Long-Time / Continuous
        if (fieldId === 'cb_rated_current' || fieldId === 'cb_ir_setting') {
          const In = parseFloat(newData.cb_rated_current);
          const IrMul = parseFloat(newData.cb_ir_setting);
          newData.cb_long_time_current = Number.isFinite(In) && Number.isFinite(IrMul) ? (In * IrMul).toFixed(2) : '';
        }

        // HT-only live calcs (when not LT)
        if (!isLT) {
          if (fieldId === 'nominal_ht_voltage') {
            const acceptableResult = calculateAcceptableRange(value, acceptableRangeConfig.percent);
            const warningResult = calculateWarningRange(value, warningRangeConfig.percent);
            const criticalResult = calculateCriticalRange(value, criticalRangeConfig.percent);

            newData.acceptable_range_display = acceptableResult.display;
            newData.acceptable_range_lower = acceptableResult.lower;
            newData.acceptable_range_upper = acceptableResult.upper;

            newData.warning_threshold_display = warningResult.display;
            newData.warning_threshold_lower = warningResult.lower;
            newData.warning_threshold_upper = warningResult.upper;

            newData.critical_threshold_display = criticalResult.display;
            newData.critical_threshold_lower = criticalResult.lower;
            newData.critical_threshold_upper = criticalResult.upper;
          } else if (fieldId === 'nominal_frequency') {
            const newFrequencyThresholds = calculateFrequencyThresholds(value);
            return { ...newData, ...newFrequencyThresholds };
          }
        }

        // duplicated guards
        if (fieldId === 'nominal_ht_voltage') {
          const acceptableResult = calculateAcceptableRange(value, acceptableRangeConfig.percent);
          const warningResult = calculateWarningRange(value, warningRangeConfig.percent);
          const criticalResult = calculateCriticalRange(value, criticalRangeConfig.percent);

          newData.acceptable_range_display = acceptableResult.display;
          newData.acceptable_range_lower = acceptableResult.lower;
          newData.acceptable_range_upper = acceptableResult.upper;
          newData.warning_threshold_display = warningResult.display;
          newData.warning_threshold_lower = warningResult.lower;
          newData.warning_threshold_upper = warningResult.upper;
          newData.critical_threshold_display = criticalResult.display;
          newData.critical_threshold_lower = criticalResult.lower;
          newData.critical_threshold_upper = criticalResult.upper;
        } else if (fieldId === 'nominal_frequency') {
          const newFrequencyThresholds = calculateFrequencyThresholds(value);
          return { ...newData, ...newFrequencyThresholds };
        }

        return newData;
      });

      if (errors[fieldId]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    },
    [errors, isLT, acceptableRangeConfig, warningRangeConfig, criticalRangeConfig]
  );

  // ----- HT handlers for range-selector controls -----
  const recomputeHtVoltageRanges = useCallback((percentAccept, percentWarn, percentCrit) => {
    setFormData((prev) => {
      const v = prev.nominal_ht_voltage;
      const acc = calculateAcceptableRange(v, percentAccept);
      const warn = calculateWarningRange(v, percentWarn);
      const crit = calculateCriticalRange(v, percentCrit);
      return {
        ...prev,
        acceptable_range_display: acc.display,
        acceptable_range_lower: acc.lower,
        acceptable_range_upper: acc.upper,
        warning_threshold_display: warn.display,
        warning_threshold_lower: warn.lower,
        warning_threshold_upper: warn.upper,
        critical_threshold_display: crit.display,
        critical_threshold_lower: crit.lower,
        critical_threshold_upper: crit.upper
      };
    });
  }, []);

  const handleAcceptableRangeModeChange = (mode) => {
    setAcceptableRangeConfig((prev) => {
      const pct = mode === 'default' ? 5 : prev.percent;
      recomputeHtVoltageRanges(pct, warningRangeConfig.percent, criticalRangeConfig.percent);
      return { ...prev, mode, percent: pct };
    });
  };
  const handleAcceptablePercentInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setAcceptableRangeConfig({ mode: 'custom', percent: pct });
    recomputeHtVoltageRanges(pct, warningRangeConfig.percent, criticalRangeConfig.percent);
  };

  const handleWarningRangeModeChange = (mode) => {
    setWarningRangeConfig((prev) => {
      const pct = mode === 'default' ? 10 : prev.percent;
      recomputeHtVoltageRanges(acceptableRangeConfig.percent, pct, criticalRangeConfig.percent);
      return { ...prev, mode, percent: pct };
    });
  };
  const handleWarningPercentInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setWarningRangeConfig({ mode: 'custom', percent: pct });
    recomputeHtVoltageRanges(acceptableRangeConfig.percent, pct, criticalRangeConfig.percent);
  };

  const handleCriticalRangeModeChange = (mode) => {
    setCriticalRangeConfig((prev) => {
      const pct = mode === 'default' ? 10 : prev.percent;
      recomputeHtVoltageRanges(acceptableRangeConfig.percent, warningRangeConfig.percent, pct);
      return { ...prev, mode, percent: pct };
    });
  };
  const handleCriticalPercentInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setCriticalRangeConfig({ mode: 'custom', percent: pct });
    recomputeHtVoltageRanges(acceptableRangeConfig.percent, warningRangeConfig.percent, pct);
  };

  // HT – Voltage imbalance % displays
  const handleAcceptableRangeVIModeChange = (mode) => {
    setAcceptableRangeVIConfig((prev) => {
      const pct = mode === 'default' ? 2 : prev.percent;
      setFormData((fd) => ({ ...fd, acceptable_range_Vdisplay: `≤ ${pct}%` }));
      return { mode, percent: pct };
    });
  };
  const handleAcceptableRangeVIInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setAcceptableRangeVIConfig({ mode: 'custom', percent: pct });
    setFormData((fd) => ({ ...fd, acceptable_range_Vdisplay: `≤ ${pct}%` }));
  };

  const handleWarningRangeVIModeChange = (mode) => {
    setWarningRangeVIConfig((prev) => {
      const pct = mode === 'default' ? 2 : prev.percent;
      setFormData((fd) => ({ ...fd, warning_threshold_Vdisplay: `> ${pct}%` }));
      return { mode, percent: pct };
    });
  };
  const handleWarningRangeVIInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setWarningRangeVIConfig({ mode: 'custom', percent: pct });
    setFormData((fd) => ({ ...fd, warning_threshold_Vdisplay: `> ${pct}%` }));
  };

  const handleCriticalRangeVIModeChange = (mode) => {
    setCriticalRangeVIConfig((prev) => {
      const pct = mode === 'default' ? 3 : prev.percent;
      setFormData((fd) => ({ ...fd, critical_threshold_Vdisplay: `> ${pct}%` }));
      return { mode, percent: pct };
    });
  };
  const handleCriticalRangeVIInputChange = (e, min = 0, max = 100) => {
    const pct = Math.min(Math.max(parseFloat(e.target.value) || 0, min), max);
    setCriticalRangeVIConfig({ mode: 'custom', percent: pct });
    setFormData((fd) => ({ ...fd, critical_threshold_Vdisplay: `> ${pct}%` }));
  };

  // ----- Reset -----
  const handleReset = () => {
    const currentStepFields = formSteps[activeStep]?.fields;
    if (!currentStepFields) {
      console.error('Could not find fields for the current step.');
      return;
    }

    const updates = {};
    currentStepFields.forEach((field) => {
      if (field.defaultValue !== undefined) updates[field.id] = field.defaultValue;
    });

    if (isLT) {
      const ltReset = resetLtStep(currentStepFields);
      Object.assign(updates, ltReset);
      const ltSeed = seedLtDefaults({ ...initialData, ...updates });
      Object.assign(updates, ltSeed);
    } else {
      const htReset = resetHtStep(currentStepFields);
      Object.assign(updates, htReset);
      const htSeed = seedHtDefaults({ ...initialData, ...updates });
      Object.assign(updates, htSeed);
      if (Object.prototype.hasOwnProperty.call(updates, 'nominal_frequency')) {
        Object.assign(updates, calculateFrequencyThresholds(updates.nominal_frequency));
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'nominal_ht_voltage')) {
        const acc = calculateAcceptableRange(updates.nominal_ht_voltage, 5);
        const warn = calculateWarningRange(updates.nominal_ht_voltage, 10);
        const crit = calculateCriticalRange(updates.nominal_ht_voltage, 10);
        updates.acceptable_range_display = acc.display;
        updates.warning_threshold_display = warn.display;
        updates.critical_threshold_display = crit.display;

        setAcceptableRangeConfig({ mode: 'default', percent: 5 });
        setWarningRangeConfig({ mode: 'default', percent: 10 });
        setCriticalRangeConfig({ mode: 'default', percent: 10 });
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'acceptable_range_voltage')) {
        setAcceptableRangeVIConfig({ mode: 'default', percent: 2 });
        setWarningRangeVIConfig({ mode: 'default', percent: 2 });
        setCriticalRangeVIConfig({ mode: 'default', percent: 3 });
      }
    }

    setFormData((prevData) => ({ ...prevData, ...updates }));
    console.log(`Successfully reset Section ${activeStep + 1}`);
  };

  // *** Simple "backend -> form" merge (kept)
  const mergeBackendOntoForm = useCallback((prevForm, backendObj) => {
    if (!backendObj || typeof backendObj !== 'object') return prevForm;
    const merged = { ...prevForm, ...backendObj };

    if (merged.nominal_ht_voltage) {
      const acc = calculateAcceptableRange(merged.nominal_ht_voltage, 5);
      const warn = calculateWarningRange(merged.nominal_ht_voltage, 10);
      const crit = calculateCriticalRange(merged.nominal_ht_voltage, 10);
      merged.acceptable_range_display = acc.display;
      merged.acceptable_range_lower = acc.lower;
      merged.acceptable_range_upper = acc.upper;
      merged.warning_threshold_display = warn.display;
      merged.warning_threshold_lower = warn.lower;
      merged.warning_threshold_upper = warn.upper;
      merged.critical_threshold_display = crit.display;
      merged.critical_threshold_lower = crit.lower;
      merged.critical_threshold_upper = crit.upper;
    }
    if (merged.nominal_frequency) {
      Object.assign(merged, calculateFrequencyThresholds(merged.nominal_frequency));
    }
    return merged;
  }, []);

  // *** Prepare payload (you already had this)
  const prepareDataForBackend = (data) => {
    let cleanData = { ...data, deviceId }; // *** ensure deviceId goes up
    if (cleanData.nominal_frequency) {
      cleanData.nominal_frequency = parseFloat(cleanData.nominal_frequency);
    }
    cleanData.acceptable_v_imbalance_percent = parseNumericValueFromString(cleanData.acceptable_range_Vdisplay);
    cleanData.warning_v_imbalance_percent = parseNumericValueFromString(cleanData.warning_threshold_Vdisplay);
    cleanData.critical_v_imbalance_percent = parseNumericValueFromString(cleanData.critical_threshold_Vdisplay);

    const {
      acceptable_range_display,
      warning_threshold_display,
      critical_threshold_display,
      acceptable_range_Vdisplay,
      warning_threshold_Vdisplay,
      critical_threshold_Vdisplay,
      warning_threshold_freq_display,
      critical_threshold_freq_display,
      ...finalPayload
    } = cleanData;

    return finalPayload;
  };

  // *** Save to backend (PUT /policy/:name with POST fallback)
  const saveCurrentDraft = async () => {
    const payload = transformDataForBackend ? transformDataForBackend(formData, deviceId) : prepareDataForBackend(formData);

    setIsSubmitting(true);
    try {
      // Preferred: upsert by name (name = did)
      let res = await upsertPolicyByName(deviceId, payload);

      // If server doesn't support PUT-by-name, fallback to POST create
      if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 501)) {
        res = await createPolicy(payload);
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Save failed');
      }

      const data = await res.json();
      console.log('Draft save response:', data);
      toast.success('Draft saved successfully');
      setIsStepSaved(true);
      return true;
    } catch (error) {
      console.error('Error saving draft: ', error);
      toast.error('Failed to Save Draft. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = () => {
    const currentFormFields = formSteps[activeStep]?.fields || [];
    const newErrors = {};
    let isStepValid = true;
    const skipTypes = new Set(['header', 'hidden', 'display']);

    for (const field of currentFormFields) {
      if (!field?.id || skipTypes.has(field.type)) continue;

      if (field.type === 'range-selector') {
        const lowerId = field.lowerBoundFieldId;
        const upperId = field.upperBoundFieldId;
        const lower = lowerId ? formData[lowerId] : undefined;
        const upper = upperId ? formData[upperId] : undefined;
        if (field.required && (lower == null || upper == null)) {
          newErrors[field.id] = `${field.label} is required.`;
          isStepValid = false;
        }
        continue;
      }

      if (field.type === 'outgoing-ratings') {
        const count = parseInt(formData.number_of_outgoings, 10) || 0;
        const arr = formData.outgoing_busbar_ratings || [];
        if (field.required && count > 0) {
          const localErrors = {};
          for (let i = 0; i < count; i++) {
            const v = arr[i];
            if (v === '' || v === undefined || v === null) {
              localErrors[i] = 'Required';
              isStepValid = false;
            } else if (Number.isNaN(Number(v))) {
              localErrors[i] = 'Enter a valid number';
              isStepValid = false;
            } else if (Number(v) < 0) {
              localErrors[i] = 'Must be ≥ 0';
              isStepValid = false;
            } else if (Number(v) > 10000) {
              localErrors[i] = 'Must be ≤ 10000';
              isStepValid = false;
            }
          }
          if (Object.keys(localErrors).length) {
            newErrors[field.id] = localErrors;
          }
        }
        continue;
      }

      // --- SPECIAL: (no-op in validation)
      if (field.type === 'panel-outgoing-supply') {
        continue;
      }

      const value = field.id === 'cb_ir_setting' ? (formData.cb_ir_setting_decimal ?? formData[field.id]) : formData[field.id];

      if (field.required && (value == null || value === '' || (typeof value === 'object' && Object.keys(value).length === 0))) {
        newErrors[field.id] = `${field.label} is required.`;
        isStepValid = false;
        continue;
      }

      if (field.rules) {
        for (const rule of field.rules) {
          const validator = validationLibrary[rule.type];
          if (!validator) continue;

          const arg = Object.prototype.hasOwnProperty.call(rule, 'pattern') ? rule.pattern : rule.limits;

          if (!validator(value, arg)) {
            newErrors[field.id] = rule.message;
            isStepValid = false;
            break;
          }
        }
      }
    }

    if (isLT) {
      const { ok: powerOk, newErrors: powerErr } = validateLtPowerStep(currentFormFields, formData);
      if (!powerOk) {
        Object.assign(newErrors, powerErr);
        isStepValid = false;
      }
    } else {
      const { ok: powerOk, newErrors: powerErr } = validateHtPowerStep(currentFormFields, formData);
      if (!powerOk) {
        Object.assign(newErrors, powerErr);
        isStepValid = false;
      }
    }

    setErrors(newErrors);
    setIsStepValidated(isStepValid);
    return isStepValid;
  };

  const handleValidateClick = () => validateCurrentStep();

  const handleSaveDraftClick = async () => {
    const isValidationOk = validateCurrentStep();
    if (!isValidationOk) return false;
    return await saveCurrentDraft();
  };

  const handleNextClick = async () => {
    const isSaveSuccessful = await handleSaveDraftClick();
    if (isSaveSuccessful) setActiveStep((prev) => prev + 1);
  };

  const handleSubmitClick = async () => {
    const isSaveSuccessful = await handleSaveDraftClick();
    if (isSaveSuccessful) {
      toast.success('FORM SUBMITTED SUCCESSFULLY!');
      navigate('/canvas2'); // redirect to devices list (or wherever)
    }
  };

  const canGoToStep = (targetIdx) => {
    if (targetIdx <= activeStep) return true;
    for (let i = 0; i < targetIdx; i++) if (!validatedSteps[i]) return false;
    return true;
  };

  const handleStepClick = (idx) =>
    canGoToStep(idx) ? setActiveStep(idx) : toast.error('Please validate previous step(s) before proceeding.');

  // --- Build step metadata for the stepper (must be BEFORE any early returns) ---
  const steps = formSteps.map((step) => step.label);
  const DEFAULT_LT_SHORTS = [
    'Info',
    'Input',
    'Current',
    'Power',
    'Energy',
    'Power Factor',
    'THD',
    'Audit Info',
    'General',
    'Acknowledge',
    'Preview'
  ];
  const DEFAULT_HT_SHORTS = [
    'Info',
    'Input',
    'Current',
    'Power',
    'Energy',
    'Power Factor',
    'THD',
    'Audit Info',
    'General',
    'Acknowledge',
    'Preview'
  ];
  const stepMeta = useMemo(() => {
    const ICONS = isLT ? defaultLtStepIcons : defaultHtStepIcons;
    const SHORTS = isLT ? DEFAULT_LT_SHORTS : DEFAULT_HT_SHORTS;
    return (formSteps || []).map((s, i) => ({
      label: s.label,
      shortLabel: s.shortLabel || SHORTS[i] || s.label,
      icon: ICONS[i % ICONS.length]
    }));
  }, [formSteps, isLT]);

  // *** Option A flags ***
  const lastStepIndex = Math.max(0, formSteps.length - 1);
  const onPreview = activeStep === lastStepIndex;

  // Loading
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Short-circuit to the dedicated MCC page
  if (isMCC) {
    return <MccDevicePropertiesPage />; // reads deviceId via query param inside if needed
  }

  function percentRangeText(value, irAmps) {
    if (!value) return '';
    const [rawL, rawH] = String(value).split('-');
    const pLow = Number(rawL);
    const pHigh = rawH != null ? Number(rawH) : pLow;

    const pct = rawH != null ? `${pLow}–${pHigh}% of Iᵣ` : `${pLow}% of Iᵣ`;
    if (!Number.isFinite(irAmps) || irAmps <= 0) return pct;

    const loA = (irAmps * (pLow / 100)).toFixed(2);
    const hiA = (irAmps * (pHigh / 100)).toFixed(2);
    return rawH != null ? `${pct} (≈ ${loA}–${hiA} A)` : `${pct} (≈ ${loA} A)`;
  }

  function fileName(v) {
    if (v?.name) return v.name;
    if (typeof v === 'string') return v;
    return '';
  }

  function OutgoingsPreview({ payload }) {
    const count = Number(payload?.outgoing_count) || 0;
    const list = Array.isArray(payload?.outgoings) ? payload.outgoings : [];

    if (count <= 0 || list.length === 0) return null;

    return (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Panel Outgoing Supply Monitoring — {count} feeder{count > 1 ? 's' : ''}
        </Typography>

        <Stack spacing={1.5}>
          {list.map((row, i) => {
            const irAmps = Number(row?.cb_ir_long_time);
            return (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  OUTGOING {i + 1}
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Outgoing Busbar CT Primary
                    </Typography>
                    <Typography variant="body2">
                      {row?.ct_primary ?? '—'}
                      {row?.ct_primary ? ' A' : ''}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Breaker Type
                    </Typography>
                    <Typography variant="body2">{row?.breaker_type || '—'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      CB Details (Make & Model No)
                    </Typography>
                    <Typography variant="body2">{row?.cb_make_model || '—'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      CB Nameplate/Datasheet
                    </Typography>
                    <Typography variant="body2">{fileName(row?.cb_nameplate_file) || '—'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Circuit Breaker – Iₙ (Rated Current)
                    </Typography>
                    <Typography variant="body2">
                      {row?.cb_in ?? '—'}
                      {row?.cb_in ? ' A' : ''}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Iᵣ Setting (@ × Iₙ)
                    </Typography>
                    <Typography variant="body2">
                      {row?.cb_ir_setting ?? '—'}
                      {row?.cb_ir_setting ? ' × In' : ''}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Iᵣ (Long-Time/Continuous)
                    </Typography>
                    <Typography variant="body2">
                      {row?.cb_ir_long_time ?? '—'}
                      {row?.cb_ir_long_time ? ' A' : ''}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Default Warning Threshold
                    </Typography>
                    <Typography variant="body2">{percentRangeText(row?.warning, irAmps) || '—'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Default Critical Threshold
                    </Typography>
                    <Typography variant="body2">{percentRangeText(row?.critical, irAmps) || '—'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <FormTypeHeader type={isMCC ? 'MCC' : isLT ? 'LT' : 'HT'} deviceId={deviceId} sx={{ mb: 3 }} />

      {isLT ? (
        <CompactStepper className="no-print" steps={stepMeta} activeStep={activeStep} onStepClick={handleStepClick} />
      ) : (
        <HtCompactStepper className="no-print" steps={stepMeta} activeStep={activeStep} onStepClick={handleStepClick} />
      )}

      {/* ---------- BODY: steps 1..10 render forms; step 11 renders preview ---------- */}
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
        {onPreview ? (
          // PREVIEW (LT vs HT)
          <Box className="print-area">
            {isLT ? (
              <LtFormPreview
                sections={formSteps.slice(0, lastStepIndex).map((s) => ({ title: s.shortLabel || s.label, fields: s.fields }))}
                values={formData}
                hideEmpty
                onEdit={(i) => (canGoToStep(i) ? setActiveStep(i) : toast.error('Please validate previous step(s) before proceeding.'))}
                header={{ title: 'Device Properties', subtitle: `Device ID: ${deviceId}` }}
              />
            ) : (
              <HtFormPreview
                sections={formSteps.slice(0, lastStepIndex).map((s) => ({ title: s.shortLabel || s.label, fields: s.fields }))}
                values={formData}
                hideEmpty
                onEdit={(i) => (canGoToStep(i) ? setActiveStep(i) : toast.error('Please validate previous step(s) before proceeding.'))}
                header={{ title: 'Device Properties', subtitle: `Device ID: ${deviceId}` }}
              />
            )}
          </Box>
        ) : isLT ? (
          // LT FORM
          <LtFields
            fields={formSteps[activeStep]?.fields || []}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        ) : (
          // HT / OTHER FORM
          <HtFields
            fields={formSteps[activeStep]?.fields || []}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        )}
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

      {/* ---------- FOOTER BUTTONS ---------- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleReset} disabled={onPreview}>
            Reset
          </Button>
          <Button onClick={handleSaveDraftClick} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Draft'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          )}
          {activeStep > 0 && (
            <Button color="inherit" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button onClick={handleValidateClick} disabled={onPreview}>
            Validate
          </Button>

          {activeStep < formSteps.length - 1 ? (
            <Button variant="contained" onClick={handleNextClick} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
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
          <Typography variant="h6" component="h2">
            Power Factor Tiers Reference
          </Typography>
          <Typography sx={{ mt: 2 }}>The user enters a "PF Target Level" to see the resulting rate.</Typography>
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

export default DevicePropertiesPage;
