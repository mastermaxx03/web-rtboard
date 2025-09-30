// ../Date Component/Date6.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  Stack,
  Typography,
  Grid,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

/* ---------------- Utilities ---------------- */
const pad2 = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

function rangeWithShift(selStartYMD, selEndYMD, shiftKey, shifts) {
  const s = new Date(selStartYMD);
  const e = new Date(selEndYMD || selStartYMD);

  if (shiftKey === "ALL") {
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  const cfg = shifts?.[shiftKey] || { start: "00:00", end: "23:59" };
  const [sh, sm] = cfg.start.split(":").map(Number);
  const [eh, em] = cfg.end.split(":").map(Number);
  const overnight = eh * 60 + em <= sh * 60 + sm;

  const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), sh, sm, 0, 0);
  const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), eh, em, 0, 0);
  if (overnight) end.setDate(end.getDate() + 1);
  return { start, end };
}

function makePresetRange(key, now, shifts) {
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "currentDaySoFar") return { start: today0, end: now, label: "Current Day – so far" };
  if (key === "currentWeekSoFar") {
    const dow = today0.getDay();
    const start = new Date(today0);
    start.setDate(today0.getDate() - dow);
    return { start, end: now, label: "Current Week – so far" };
  }
  if (key === "currentMonthSoFar")
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now, label: "Current Month – so far" };
  if (key === "currentQuarterSoFar") {
    const m = Math.floor(now.getMonth() / 3) * 3;
    return { start: new Date(now.getFullYear(), m, 1), end: now, label: "Current Quarter – so far" };
  }
  if (key === "currentShiftSoFar") {
    const toMin = (hhmm) => {
      const [h, m] = (hhmm || "00:00").split(":").map(Number);
      return h * 60 + m;
    };
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const order = ["A", "B", "C"];
    const segs = order.flatMap((k) => {
      const s = toMin(shifts?.[k]?.start);
      const e = toMin(shifts?.[k]?.end);
      if (e <= s) return [{ k, s, e: 1440 }, { k, s: 0, e }];
      return [{ k, s, e }];
    });
    const hit = segs.find((t) => nowMin >= t.s && nowMin < t.e)?.k || "A";
    const { start } = rangeWithShift(ymd(today0), ymd(today0), hit, shifts);
    return { start, end: now, label: `Current Shift – so far (${hit})` };
  }
  return null;
}

/* ---------------- Calendar ---------------- */
function MonthCard({ base, selStart, selEnd, hoverKey, onPick, onHover }) {
  const m0 = startOfMonth(base);
  const firstDow = m0.getDay();
  const gridStart = new Date(m0);
  gridStart.setDate(m0.getDate() - firstDow);

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const key = ymd(d);
    const inMonth = d.getMonth() === base.getMonth();

    const s = selStart;
    const e = selEnd || selStart;

    const preview =
      s && !selEnd && hoverKey
        ? new Date(key) >= new Date(Math.min(new Date(s), new Date(hoverKey))) &&
          new Date(key) <= new Date(Math.max(new Date(s), new Date(hoverKey)))
        : false;

    const isStart = s && key === s;
    const isEnd = e && key === e && !!selEnd;
    const inSel =
      (s && selEnd && new Date(key) >= new Date(s) && new Date(key) <= new Date(e)) || preview;

    return { d, key, inMonth, isStart, isEnd, inSel, preview };
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "#fff",
      }}
    >
      <Typography sx={{ fontWeight: 900, textAlign: "center", mb: 1, letterSpacing: 0.2 }}>
        {base.toLocaleString(undefined, { month: "long" })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5, mb: 0.5, color: "text.secondary", fontSize: 12 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <Box key={d} sx={{ width: 40, textAlign: "center" }}>
            {d}
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.6 }}>
        {cells.map((c) => {
          const edge = c.isStart || c.isEnd;
          const bg = c.inSel
            ? c.preview
              ? "rgba(59,130,246,0.12)"
              : "rgba(59,130,246,0.18)"
            : "transparent";
          return (
            <Box
              key={c.key}
              onClick={() => onPick(c.key)}
              onMouseEnter={() => onHover?.(c.key)}
              onMouseLeave={() => onHover?.("")}
              sx={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                cursor: "pointer",
                fontWeight: edge ? 900 : 600,
                bgcolor: edge ? "primary.main" : bg,
                color: edge ? "#fff" : c.inMonth ? "text.primary" : "text.disabled",
                border: c.inSel && !edge ? "1px dashed rgba(59,130,246,0.35)" : "1px solid rgba(2,6,23,0.06)",
                transition: "all 120ms",
                "&:hover": { transform: "translateY(-1px)" },
              }}
            >
              {c.d.getDate()}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

/* ---------------- Main (Click → Popover Panel) ---------------- */
export default function Date6({
  value,
  onChange,
  maxSpanDays = 93,
  defaultAggregation = "Average",
  triggerLabel = "Date Range",
  sx,
}) {
  // shifts (simple local)
  const STORAGE_KEY = "shift_settings_v1";
  const DEFAULT_SHIFTS = {
    A: { key: "A", start: "06:00", end: "14:00", label: "A" },
    B: { key: "B", start: "14:00", end: "22:00", label: "B" },
    C: { key: "C", start: "22:00", end: "06:00", label: "C" },
  };
  const [shifts] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_SHIFTS; }
    catch { return DEFAULT_SHIFTS; }
  });

  // open/anchor
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  // core state
  const now = new Date();
  const [mode, setMode] = useState(value?.preset?.startsWith("last_") ? "realtime" : "history");
  const [viewMonth, setViewMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selStart, setSelStart] = useState(value?.start ? ymd(new Date(value.start)) : "");
  const [selEnd, setSelEnd] = useState(value?.end ? ymd(new Date(value.end)) : "");
  const [hoverKey, setHoverKey] = useState("");
  const [shiftSel, setShiftSel] = useState(value?.shift ?? "ALL");
  const [agg, setAgg] = useState(value?.aggregation ?? defaultAggregation);
  const [rtw, setRtw] = useState("1 day");

  const display =
    value?.start && value?.end
      ? `${new Date(value.start).toLocaleDateString("en-GB")} – ${new Date(value.end).toLocaleDateString("en-GB")}`
      : "Preset: Current Week – so far";

  const pick = (k) => {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(k);
      setSelEnd("");
    } else {
      if (new Date(k) < new Date(selStart)) {
        setSelEnd(selStart);
        setSelStart(k);
      } else {
        setSelEnd(k);
      }
    }
  };

  const selectedDaysCount = useMemo(() => {
    if (!selStart) return 0;
    const e = selEnd || selStart;
    return Math.abs(Math.floor((new Date(e) - new Date(selStart)) / (24 * 3600 * 1000))) + 1;
  }, [selStart, selEnd]);

  const applyHistory = () => {
    if (selStart) {
      const endY = selEnd || selStart;
      const s = new Date(selStart);
      const e = new Date(endY);
      const days = Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
      const eFinal = days > maxSpanDays ? new Date(s.getTime() + (maxSpanDays - 1) * 24 * 3600 * 1000) : e;
      const { start, end } = rangeWithShift(ymd(s), ymd(eFinal), shiftSel, shifts);
      onChange?.({ start: start.toISOString(), end: end.toISOString(), shift: shiftSel, preset: "", aggregation: agg });
    } else {
      const pr = makePresetRange("currentWeekSoFar", new Date(), shifts);
      onChange?.({ start: pr.start.toISOString(), end: pr.end.toISOString(), shift: shiftSel, preset: "currentWeekSoFar", aggregation: agg });
    }
    handleClose();
  };

  const applyRealtime = () => {
    const map = { "2 hours": 2, "6 hours": 6, "12 hours": 12, "1 day": 24, "7 days": 168, "30 days": 720 };
    const hours = map[rtw] ?? 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    onChange?.({ start: start.toISOString(), end: end.toISOString(), shift: "ALL", preset: `last_${hours}h`, aggregation: agg });
    handleClose();
  };

  const clearAll = () => {
    setSelStart("");
    setSelEnd("");
    setHoverKey("");
    setShiftSel("ALL");
  };

  return (
    <Box sx={{ ...sx }}>
      {/* Trigger pill */}
      <Button
        onClick={handleOpen}
        startIcon={<CalendarMonthIcon />}
        variant="outlined"
        sx={{
          borderRadius: 999,
          px: 1.5,
          py: 0.5,
          textTransform: "none",
          fontWeight: 800,
          boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
        }}
        title="Pick date range"
      >
        {display}
      </Button>

      {/* Popover Panel */}
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 1000,
            maxWidth: "min(98vw, 1060px)",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(59,130,246,0.2)",
            boxShadow: "0 40px 80px rgba(2,6,23,0.25)",
            bgcolor: "#fff",
          },
        }}
      >
        {/* Ribbon header */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.2), rgba(16,185,129,0.18) 55%, rgba(139,92,246,0.18))",
            borderBottom: "1px solid rgba(59,130,246,0.28)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 900 }}>Date Range</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={mode === "history" ? "contained" : "outlined"}
                onClick={() => setMode("history")}
              >
                History
              </Button>
              <Button
                size="small"
                variant={mode === "realtime" ? "contained" : "outlined"}
                onClick={() => setMode("realtime")}
              >
                Realtime
              </Button>
            </Stack>
            <Typography sx={{ fontWeight: 800 }}>
              {mode === "history"
                ? `${selStart ? new Date(selStart).toLocaleDateString("en-GB") : "—"} – ${
                    selEnd ? new Date(selEnd).toLocaleDateString("en-GB") : selStart ? new Date(selStart).toLocaleDateString("en-GB") : "—"
                  } • Shift ${shiftSel} • Agg ${agg}${
                    selectedDaysCount ? ` • ${selectedDaysCount} day${selectedDaysCount > 1 ? "s" : ""}` : ""
                  }`
                : `Window: ${rtw} • Agg: ${agg}`}
            </Typography>
          </Stack>
        </Box>

        {/* Body */}
        <Grid container sx={{ minHeight: 420 }}>
          {/* Left rail */}
          <Grid
            item
            xs={12}
            md={3.5}
            sx={{
              p: 1.25,
              borderRight: { md: "1px solid" },
              borderColor: "grey.200",
              background:
                "linear-gradient(180deg, rgba(248,250,252,0.8), rgba(255,255,255,0.7))",
            }}
          >
            <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Quick picks</Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              <List dense disablePadding>
                {[
                  { k: "Current Week – so far", do: () => {
                    const pr = makePresetRange("currentWeekSoFar", new Date(), shifts);
                    setSelStart(ymd(pr.start)); setSelEnd(ymd(pr.end));
                  }},
                  { k: "Today", do: () => { const d = new Date(); const y = ymd(d); setSelStart(y); setSelEnd(y); } },
                  { k: "Yesterday", do: () => { const d = new Date(); d.setDate(d.getDate() - 1); const y = ymd(d); setSelStart(y); setSelEnd(y); } },
                  { k: "Last 7 days", do: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 6); setSelStart(ymd(s)); setSelEnd(ymd(e)); } },
                  { k: "Last 30 days", do: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 29); setSelStart(ymd(s)); setSelEnd(ymd(e)); } },
                ].map((item) => (
                  <ListItemButton key={item.k} onClick={item.do} sx={{ "&:not(:last-of-type)": { borderBottom: "1px dashed rgba(2,6,23,0.06)" } }}>
                    <ListItemText primary={item.k} primaryTypographyProps={{ fontWeight: 700 }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            <Divider sx={{ my: 1.25 }} />

            <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Shift</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {["A", "B", "C", "ALL"].map((k) => (
                <Chip
                  key={k}
                  label={k}
                  clickable
                  onClick={() => setShiftSel(k)}
                  color={shiftSel === k ? "primary" : "default"}
                  variant={shiftSel === k ? "filled" : "outlined"}
                  sx={{ borderRadius: 999, fontWeight: 900 }}
                />
              ))}
            </Stack>
          </Grid>

          {/* Center calendars */}
          <Grid item xs={12} md={5} sx={{ p: 1.25 }}>
            <Paper
              elevation={0}
              sx={{
                px: 1,
                py: 0.75,
                mb: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "#fff",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton size="small" onClick={() => setViewMonth((vm) => new Date(vm.getFullYear() - 1, vm.getMonth(), 1))}>
                    <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setViewMonth((vm) => addMonths(vm, -1))}>
                    <NavigateBeforeIcon fontSize="inherit" />
                  </IconButton>
                </Stack>

                <Typography sx={{ fontWeight: 900 }}>Pick days</Typography>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton size="small" onClick={() => setViewMonth((vm) => addMonths(vm, +1))}>
                    <NavigateNextIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setViewMonth((vm) => new Date(vm.getFullYear() + 1, vm.getMonth(), 1))}>
                    <KeyboardDoubleArrowRightIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>

            <Stack spacing={1.25}>
              <MonthCard
                base={viewMonth}
                selStart={selStart}
                selEnd={selEnd}
                hoverKey={hoverKey}
                onPick={pick}
                onHover={setHoverKey}
              />
              <MonthCard
                base={addMonths(viewMonth, 1)}
                selStart={selStart}
                selEnd={selEnd}
                hoverKey={hoverKey}
                onPick={pick}
                onHover={setHoverKey}
              />
            </Stack>
          </Grid>

          {/* Right rail (aggregation / realtime) */}
          <Grid
            item
            xs={12}
            md={3.5}
            sx={{
              p: 1.25,
              borderLeft: { md: "1px solid" },
              borderColor: "grey.200",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,250,252,0.86))",
            }}
          >
            {mode === "history" ? (
              <>
                <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Aggregation</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {["Average", "Min", "Max", "Sum"].map((lab) => (
                    <Chip
                      key={lab}
                      label={lab}
                      onClick={() => setAgg(lab)}
                      color={agg === lab ? "primary" : "default"}
                      variant={agg === lab ? "filled" : "outlined"}
                      sx={{ borderRadius: 999, fontWeight: 900 }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Selected:{" "}
                  <strong>
                    {selStart ? new Date(selStart).toLocaleDateString("en-GB") : "—"} –{" "}
                    {selEnd ? new Date(selEnd).toLocaleDateString("en-GB") : selStart ? new Date(selStart).toLocaleDateString("en-GB") : "—"}
                  </strong>
                  {selectedDaysCount ? ` • ${selectedDaysCount} day${selectedDaysCount > 1 ? "s" : ""}` : ""}
                </Typography>
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Realtime window</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {["2 hours", "6 hours", "12 hours", "1 day", "7 days", "30 days"].map((w) => (
                    <Chip
                      key={w}
                      label={w}
                      onClick={() => setRtw(w)}
                      color={rtw === w ? "primary" : "default"}
                      variant={rtw === w ? "filled" : "outlined"}
                      sx={{ borderRadius: 999, fontWeight: 900 }}
                    />
                  ))}
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Aggregation</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {["Average", "Min", "Max", "Sum"].map((lab) => (
                    <Chip
                      key={lab}
                      label={lab}
                      onClick={() => setAgg(lab)}
                      color={agg === lab ? "primary" : "default"}
                      variant={agg === lab ? "filled" : "outlined"}
                      sx={{ borderRadius: 999, fontWeight: 900 }}
                    />
                  ))}
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Window: <strong>{rtw}</strong>
                </Typography>
              </>
            )}
          </Grid>
        </Grid>

        {/* Action bar */}
        <Divider />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 1.25, gap: 1 }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {display} • Shift {shiftSel} • Agg {agg}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" onClick={clearAll}>Clear</Button>
            <Button variant="outlined" onClick={() => { setMode("history"); applyHistory(); }} startIcon={<CalendarMonthIcon />}>
              Apply (History)
            </Button>
            <Button variant="contained" onClick={() => { setMode("realtime"); applyRealtime(); }} startIcon={<CalendarMonthIcon />}>
              Apply (Realtime)
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </Box>
  );
}
