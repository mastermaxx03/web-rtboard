import React, { useCallback, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';

import FrequencyBlock from './Blocks/FrequencyBlock';
import ThresholdsBlock from './Blocks/ThresholdsBlock';
import ImbalanceBlock from './Blocks/ImbalanceBlock';
import CurrentImbalanceBlock from './Blocks/CurrentImbalanceBlock';
import PowerBalanceBlock from './Blocks/PowerBalanceBlock';

import RangeSelectorField from '../components/RangeSelectorField';
import ButtonGroupField from '../components/ButtonGroupField';
import TextInputField from '../components/TextInputField';
import { DisplayField, FileField } from '../components/OtherFields';
import DateField from '../components/DateField';
import DateTimeField from '../components/DateTimeField';
import ComboInputField from '../components/ComboInputField';
import RangeInputField from '../components/RangeInputFields';
import DynamicListField from '../components/DynamicListField';
import OutgoingRatingsField from '../components/OutgoingRatingsField';
import PanelOutgoingSupply from '../components/PanelOutgoingSupply';
import ButtonAckField from '../components/ButtonAckField';
import PhoneNumberField from '../components/PhoneNumberField';
import PFTableField from '../components/PFTableField';
import DropdownField from '../components/DropdownField';
import PFThresholds from '../components/PFThresholds';

import { applyLtChange } from './ltCalculations';
import FormPreview from './FormPreview';
const clamp = (val, min, max) => Math.min(Math.max(Number(val) || 0, min), max);

// component map
const map = {
  'button-group': ButtonGroupField,
  textarea: TextInputField,
  text: TextInputField,
  number: TextInputField,
  placeholder: TextInputField,
  file: FileField,
  threshold: PFThresholds,
  dropdown: DropdownField,
  'dynamic-list': DynamicListField,
  display: DisplayField,
  date: DateField,
  datetime: DateTimeField,
  'combo-input': ComboInputField,
  'range-input': RangeInputField,
  'dynamic-object-list': DynamicListField,
  'outgoing-ratings': OutgoingRatingsField,
  'panel-outgoing-supply': PanelOutgoingSupply,
  'button-ack': ButtonAckField,
  'phone-number': PhoneNumberField,
  'table': PFTableField,
  'current-imbalance': CurrentImbalanceBlock,
  'power-balance-block': PowerBalanceBlock,
  'frequency-block': FrequencyBlock,
  'thresholds-block': ThresholdsBlock,
  'imbalance-block': ImbalanceBlock,
  'range-selector': RangeSelectorField
};

/* ---------- Ir(A) helpers ---------- */
const calcIrAmpsFrom = (fd) => {
  const In = Number(fd?.cb_rated_current);
  const IrMul = Number(fd?.cb_ir_setting);
  if (Number.isFinite(In) && Number.isFinite(IrMul) && In > 0 && IrMul > 0) {
    return Number((In * IrMul).toFixed(2));
  }
  return '';
};

const getIrAmps = (fd) => {
  const ir = Number(fd?.cb_long_time_current);
  if (Number.isFinite(ir) && ir > 0) return ir;
  const computed = calcIrAmpsFrom(fd);
  return Number.isFinite(computed) && computed > 0 ? computed : undefined;
};
// ---- render helper for PF tables (incentive/penalty) ----
const renderPfTable = (field) => {
  const schemeFieldId = field.externalSchemeFieldId; // e.g., 'pf_slab_scheme'
  const selectedScheme = schemeFieldId ? formData[schemeFieldId] : undefined;

  return (
    <PFTableField
      key={`${field.id}-${selectedScheme ?? 'none'}`} // re-render when scheme changes
      field={{ ...field, selectedScheme }} // pass selected scheme down
      value={Array.isArray(formData[field.id]) ? formData[field.id] : undefined}
      error={errors[field.id]}
      onChange={(id, rows) => setFormData((prev) => ({ ...prev, [id]: rows }))}
    />
  );
};

const render = (field) => {
  if (!field || field.type === 'hidden') return null;

  if (field.type === 'header') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main', borderBottom: '1px solid #e0e0e0', pb: 1, flexGrow: 1 }}
        >
          {field.label}
        </Typography>
        {field.renderAccessory && field.renderAccessory()}
      </Box>
    );
  }

  // PF slab tables — use the helper so they track the shared dropdown
  if (field.type === 'table') {
    return renderPfTable(field);
  }
};

/* ---------- Selected caption for button-groups ---------- */
const renderSelectedButtonInfo = (value, irAmps) => {
  if (!value) return null;
  const [rawL, rawH] = String(value).split('-');
  const pLow = Number(rawL);
  const pHigh = rawH != null ? Number(rawH) : pLow;

  const pctText = rawH != null ? `${pLow}–${pHigh}% of I\u1D63` : `${pLow}% of I\u1D63`;

  let ampsText = '';
  if (Number.isFinite(irAmps)) {
    const lo = (irAmps * (pLow / 100)).toFixed(2);
    const hi = (irAmps * (pHigh / 100)).toFixed(2);
    ampsText = rawH != null ? ` (≈ ${lo}–${hi} A)` : ` (≈ ${lo} A)`;
  }

  return (
    <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
      Selected: {pctText}
      {ampsText}
    </Typography>
  );
};

const shouldShowSelectedFor = (field) =>
  field?.showSelected === true || field?.id === 'cb_warning_threshold' || field?.id === 'cb_critical_threshold';

export default function LtFields({ fields = [], formData, setFormData, errors = {}, setErrors }) {
  // local UI state for LT % controls
  const [llAcceptConfig, setLlAcceptConfig] = useState({ mode: 'default', percent: 10 });
  const [llWarnConfig, setLlWarnConfig] = useState({ mode: 'default', percent: 12 });
  const [llCritConfig, setLlCritConfig] = useState({ mode: 'default', percent: 17 });
  const [lnAcceptConfig, setLnAcceptConfig] = useState({ mode: 'default', percent: 10 });
  const [lnWarnConfig, setLnWarnConfig] = useState({ mode: 'default', percent: 12 });
  const [lnCritConfig, setLnCritConfig] = useState({ mode: 'default', percent: 17 });

  const clearError = useCallback(
    (id) => {
      if (!errors[id]) return;
      setErrors?.((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    },
    [errors, setErrors]
  );

  // compute Ir (long-time/continuous) here too so captions always have up-to-date Ir(A)
  const handleChange = useCallback(
    (id, val) => {
      setFormData((prev) => {
        const next = { ...prev, [id]: val };
        if (id === 'cb_rated_current' || id === 'cb_ir_setting') {
          next.cb_long_time_current = calcIrAmpsFrom(next);
        }
        applyLtChange(id, next);
        return next;
      });
      clearError(id);
    },
    [setFormData, clearError]
  );

  const setLtPercent = useCallback(
    (id, percent) => {
      setFormData((prev) => {
        const next = { ...prev, [id]: percent };
        applyLtChange(id, next);
        return next;
      });
      clearError(id);
    },
    [setFormData, clearError]
  );

  const render = (field) => {
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
          {field.renderAccessory && field.renderAccessory()}
        </Box>
      );
    }

    // inside LtFields render()

    if (field.type === 'table' && field.id === 'pf_incentive_table') {
      const schemeFieldId = field.externalSchemeFieldId; // 'pf_slab_scheme'
      const selectedScheme = schemeFieldId ? formData[schemeFieldId] : undefined; // this is a string from your DropdownField
      const schemeRows = Array.isArray(field.schemes)
        ? field.schemes.find((s) => s.key === selectedScheme)?.rows || field.rows || []
        : field.rows || [];
      const controlledRows = Array.isArray(formData[field.id]) ? formData[field.id] : undefined;

      return (
        <PFTableField
          key={`${field.id}-${selectedScheme ?? 'default'}`}
          field={field}
          value={controlledRows ?? schemeRows}
          error={errors[field.id]}
          onChange={handleChange}
          externalSchemeKey={selectedScheme}
        />
      );
    }

    if (field.type === 'table' && field.id === 'pf_penalty_table') {
      const schemeFieldId = field.externalSchemeFieldId; // 'pf_slab_scheme'
      const selectedScheme = schemeFieldId ? formData[schemeFieldId] : undefined;
      const schemeRows = Array.isArray(field.schemes)
        ? field.schemes.find((s) => s.key === selectedScheme)?.rows || field.rows || []
        : field.rows || [];
      const controlledRows = Array.isArray(formData[field.id]) ? formData[field.id] : undefined;

      return (
        <PFTableField
          key={`${field.id}-${selectedScheme ?? 'default'}`}
          field={field}
          value={controlledRows ?? schemeRows}
          error={errors[field.id]}
          onChange={handleChange}
          externalSchemeKey={selectedScheme}
        />
      );
    }

    // Power Balance block (Section 4 tile-style summary)
    if (field.type === 'power-balance-block') {
      const cfg = field.config || {};
      return <PowerBalanceBlock title={cfg.title || '3PH Power Balance (Total vs R+Y+B)'} values={formData} />;
    }

    // custom blocks
    if (field.type === 'current-imbalance' || field.type === 'current-imbalance-block') {
      const cfg = field.config || {};
      return (
        <CurrentImbalanceBlock
          title={cfg.title ?? 'Current Imbalance (%)'}
          values={formData}
          onChange={handleChange}
          sliderMin={cfg.sliderMin ?? 5}
          sliderMax={cfg.sliderMax ?? 25}
          sliderStep={cfg.sliderStep ?? 0.5}
          buttonLabel={cfg.buttonLabel ?? 'Up to 10%'}
          defaultAcceptable={cfg.defaultAcceptable ?? 10}
          defaultWarning={cfg.defaultWarning ?? 10}
          defaultCritical={cfg.defaultCritical ?? 20}
        />
      );
    }

    if (field.type === 'frequency-block') {
      const cfg = field.config || {};
      return (
        <FrequencyBlock
          title={cfg.title ?? 'Frequency'}
          fieldId={field.id}
          presets={cfg.presets ?? [50.0, 60.0]}
          step={cfg.step ?? 0.1}
          values={formData}
          onChange={handleChange}
        />
      );
    }

    if (field.type === 'thresholds-block') {
      const cfg = field.config || {};
      return (
        <ThresholdsBlock
          title={cfg.title ?? '3PH Voltage Thresholds'}
          fieldPrefix={cfg.fieldPrefix ?? 'll'}
          unit={cfg.unit ?? 'V'}
          presets={cfg.presets ?? [400, 415, 433]}
          values={formData}
          onChange={handleChange}
        />
      );
    }

    if (field.type === 'imbalance-block') {
      const cfg = field.config || {};
      return (
        <ImbalanceBlock
          title={cfg.title ?? 'Phase Imbalance (applies to L-L & L-N)'}
          fieldPrefix={cfg.fieldPrefix ?? 'vi'}
          values={formData}
          onChange={handleChange}
        />
      );
    }

    // Balanced vs Unbalanced rendering for phase power fields
    if (['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'].includes(field.id)) {
      const isUnbalanced = formData.load_distribution_mode === 'unbalanced';
      if (!isUnbalanced) {
        const raw = formData[field.id];
        const text = raw === '' || raw == null ? '—' : `${Number(raw).toFixed(3)} kW`;
        return <DisplayField field={{ ...field, type: 'display' }} value={text} />;
      }
      const Component = map[field.type];
      return <Component field={field} value={formData[field.id] ?? ''} error={errors[field.id]} onChange={handleChange} />;
    }

    // percent range selectors
    if (field.type === 'range-selector') {
      let cfg;
      if (field.id === 'll_acceptable_range') {
        cfg = {
          config: llAcceptConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 10 : llAcceptConfig.percent;
            setLlAcceptConfig({ mode, percent: pct });
            setLtPercent('ll_acceptable_range', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLlAcceptConfig({ mode: 'custom', percent: p });
            setLtPercent('ll_acceptable_range', p);
          }
        };
      } else if (field.id === 'll_warning_thresholds') {
        cfg = {
          config: llWarnConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 12 : llWarnConfig.percent;
            setLlWarnConfig({ mode, percent: pct });
            setLtPercent('ll_warning_thresholds', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLlWarnConfig({ mode: 'custom', percent: p });
            setLtPercent('ll_warning_thresholds', p);
          }
        };
      } else if (field.id === 'll_critical_thresholds') {
        cfg = {
          config: llCritConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 17 : llCritConfig.percent;
            setLlCritConfig({ mode, percent: pct });
            setLtPercent('ll_critical_thresholds', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLlCritConfig({ mode: 'custom', percent: p });
            setLtPercent('ll_critical_thresholds', p);
          }
        };
      } else if (field.id === 'ln_acceptable_range') {
        cfg = {
          config: lnAcceptConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 10 : lnAcceptConfig.percent;
            setLnAcceptConfig({ mode, percent: pct });
            setLtPercent('ln_acceptable_range', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLnAcceptConfig({ mode: 'custom', percent: p });
            setLtPercent('ln_acceptable_range', p);
          }
        };
      } else if (field.id === 'ln_warning_thresholds') {
        cfg = {
          config: lnWarnConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 12 : lnWarnConfig.percent;
            setLnWarnConfig({ mode, percent: pct });
            setLtPercent('ln_warning_thresholds', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLnWarnConfig({ mode: 'custom', percent: p });
            setLtPercent('ln_warning_thresholds', p);
          }
        };
      } else if (field.id === 'ln_critical_thresholds') {
        cfg = {
          config: lnCritConfig,
          onModeChange: (mode) => {
            const pct = mode === 'default' ? 17 : lnCritConfig.percent;
            setLnCritConfig({ mode, percent: pct });
            setLtPercent('ln_critical_thresholds', pct);
          },
          onPercentChange: (e, min, max) => {
            const p = clamp(e.target.value, min, max);
            setLnCritConfig({ mode: 'custom', percent: p });
            setLtPercent('ln_critical_thresholds', p);
          }
        };
      } else {
        cfg = { config: { mode: 'default', percent: 0 }, onModeChange: () => {}, onPercentChange: () => {} };
      }

      return <RangeSelectorField field={field} calculatedValue={formData[field.displayFieldId]} {...cfg} />;
    }

    // special array field
    if (field.type === 'outgoing-ratings') {
      const count = Number(formData.number_of_outgoings) || 0;
      const arr = formData.outgoing_busbar_ratings || [];
      const errorMap = typeof errors[field.id] === 'object' ? errors[field.id] : {};
      return (
        <OutgoingRatingsField
          label={field.label}
          count={count}
          value={arr}
          errorMap={errorMap}
          onChange={(newArr) => setFormData((prev) => ({ ...prev, outgoing_busbar_ratings: newArr }))}
        />
      );
    }

    // generic fallback (with “Selected …” caption for button groups)
    const Cmp = map[field.type];
    if (!Cmp) return null;

    if (field.type === 'button-group') {
      const value = formData[field.id] ?? '';
      const irAmps = getIrAmps(formData);

      return (
        <Cmp
          field={field}
          value={value}
          error={errors[field.id]}
          onChange={handleChange}
          below={shouldShowSelectedFor(field) ? renderSelectedButtonInfo(value, irAmps) : null}
        />
      );
    }

    return <Cmp field={field} value={formData[field.id] ?? ''} error={errors[field.id]} onChange={handleChange} />;
  };

  return (
    <Grid container spacing={3}>
      {fields.map((f) => (
        <Grid item xs={12} key={f.id || f.label}>
          {render(f)}
        </Grid>
      ))}
    </Grid>
  );
}
