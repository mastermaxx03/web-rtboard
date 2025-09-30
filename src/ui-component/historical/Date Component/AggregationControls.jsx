// src/components/AggregationControls.jsx
import React from 'react';

/* ---------- Minimal custom select with rounded popup & smooth scrolling ---------- */
function CustomSelect({
  value,
  onChange,
  options,
  disabled = false,
  ariaLabel,
  getLabel = (v) => String(v),
  style = {},
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const wrapRef = React.useRef(null);
  const listRef = React.useRef(null);

  const toggle = () => {
    if (!disabled) setOpen((s) => !s);
  };
  const close = () => setOpen(false);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current || !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    const onResize = () => close();

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onKeyDown = (e) => {
    if (disabled) return;

    // Open with keyboard
    if (
      !open &&
      (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')
    ) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const chosen = options[activeIndex];
      if (chosen) {
        if (onChange) onChange(chosen.value);
        close();
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      close();
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  // Keep scroll inside list (prevents page from scrolling)
  const onListWheel = (e) => {
    const el = listRef.current;
    if (!el) return;

    const atTop = el.scrollTop === 0;
    const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += e.deltaY;
    }
  };

  const WRAP = (isDisabled) => ({
    position: 'relative',
    display: 'grid',
    alignItems: 'center',
    borderRadius: 10,
    border: `1px solid ${isDisabled ? '#E5E7EB' : '#CBD5E1'}`,
    background: isDisabled ? '#F9FAFB' : '#FFFFFF',
    transition: 'box-shadow 120ms ease, border-color 120ms ease, background 120ms ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    ...style,
  });

  const BTN = (isDisabled) => ({
    width: '100%',
    padding: '10px 38px 10px 12px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: isDisabled ? '#94A3B8' : '#111827',
    fontSize: 14,
    lineHeight: 1.2,
    textAlign: 'left',
  });

  const CHEVRON = {
    pointerEvents: 'none',
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
    width: 16,
    height: 16,
    opacity: 0.7,
    transition: 'transform 120ms ease',
  };

  const LIST = {
    position: 'absolute',
    left: -1,
    right: -1,
    top: 'calc(100% + 6px)',
    zIndex: 50,
    maxHeight: 220,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: 10, // rounded popup panel
    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
  };

  const OPT = (active, selected) => ({
    padding: '10px 12px',
    fontSize: 14,
    color: '#111827',
    background: active ? '#F3F4F6' : '#ffffff',
    fontWeight: selected ? 600 : 400,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  });

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div
      ref={wrapRef}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      tabIndex={0}
      style={WRAP(disabled)}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <div style={BTN(disabled)}>{getLabel(selectedOpt?.value)}</div>

      <svg viewBox="0 0 24 24" style={CHEVRON} aria-hidden="true">
        <path
          d="M6 9l6 6 6-6"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {open && (
        <div ref={listRef} role="listbox" style={LIST} onWheel={onListWheel}>
          {options.map((o, i) => {
            const selected = o.value === value;
            const active = i === activeIndex;
            return (
              <div
                key={String(o.value)}
                role="option"
                aria-selected={selected}
                data-active={active ? 'true' : 'false'}
                style={OPT(active, selected)}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (onChange) onChange(o.value);
                  close();
                }}
              >
                <span>{getLabel(o.value)}</span>
                {selected && (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------- Controls with requested interval options -------------------- */
export default function AggregationControls({
  aggregation = 'avg',
  interval = 15, // minutes
  onAggregationChange,
  onIntervalChange,
  disabled = false,
}) {
  const CARD = {
    display: 'grid',
    gap: 14,
    padding: 12,
    width: 260,
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  };

  const FIELD = { display: 'grid', gap: 6 };
  const LABEL = { fontSize: 12, color: '#374151', fontWeight: 700, letterSpacing: 0.2 };

  const SECTION_TITLE = {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    margin: '2px 0 2px',
    borderTop: '1px solid #F3F4F6',
    paddingTop: 8,
  };

  const aggOptions = [{ value: 'avg' }, { value: 'min' }, { value: 'max' }, { value: 'sum' }];
  const aggLabel = (v) => ({ avg: 'Average', min: 'Minimum', max: 'Maximum', sum: 'Sum' }[v] || v);

  // Intervals (values are in MINUTES)
  const intOptions = [
    { value: 15 },     // 15 min
    { value: 30 },     // 30 min
    { value: 60 },     // 1 hr
    { value: 240 },    // 4 hr
    { value: 480 },    // 8 hr
    { value: 1440 },   // 24 hr
    { value: 10080 },  // 7 days
  ];
  const intLabel = (v) => {
    if (v < 60) return `${v} min`;
    if (v % 1440 === 0) return `${v / 1440} ${v === 1440 ? 'day' : 'days'}`;
    return `${v / 60} hr`;
  };

  return (
    <div style={CARD} aria-disabled={disabled}>
      {/* Aggregation */}
      <div style={FIELD}>
        <label style={LABEL}>Aggregation</label>
        <CustomSelect
          value={aggregation}
          onChange={onAggregationChange}
          options={aggOptions}
          getLabel={aggLabel}
          ariaLabel="Aggregation"
          disabled={disabled}
        />
      </div>

      {/* Divider title */}
      <div style={SECTION_TITLE}>Grouping interval</div>

      {/* Grouping interval */}
      <div style={FIELD}>
        <CustomSelect
          value={interval}
          onChange={(val) => {
            if (onIntervalChange) onIntervalChange(Number(val));
          }}
          options={intOptions}
          getLabel={intLabel}
          ariaLabel="Grouping interval"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
